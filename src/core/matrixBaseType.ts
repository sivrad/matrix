import {
    AlreadyInstantiated,
    InvalidField,
    MissingField,
    NoMatrixInstance,
    Uninstantiated,
} from './errors';
import { Field } from './field';
import { Matrix } from './matrixInstance';
import { Driver } from './driver';
import {
    FieldInterface,
    MatrixBaseTypeData,
    FieldObject,
    SerializedMatrixBaseTypeData,
    SerializedData,
    ClassInformation,
} from './type';
import { mapObject } from './util';
import { FieldStatic } from './fieldStatic';

// const instanceOnly = () => (
//     target: MatrixBaseType,
//     key: string,
//     descriptor: PropertyDescriptor,
// ) => {
//     const originalMethod = descriptor.value;
//     descriptor.value = () => {
//         if (!target.isInstance()) {
//             console.log('sdfsdf');
//             throw new Error('Must be an instance to run: ' + key);
//         }
//         return originalMethod();
//     };
//     return descriptor;
// };

/**
 * Base class for the Matrix.
 */
export class MatrixBaseType {
    /**
     * The collection assigned to the type.
     */
    private static matrix?: Matrix;
    /**
     * The class specific fields.
     */
    protected static _classFields: Record<string, FieldInterface> = {};
    /**
     * Field values.
     */
    public static _fieldValues: Record<string, unknown> = {};
    /**
     * Information on the class.
     */
    public static _classInformation: ClassInformation;
    /**
     * The type fields.
     */
    public _fields: Record<string, Field> = {};
    /**
     * IDK used for cache I think.
     */
    public _typeFieldKeys: string[];
    /**
     * Id of the type.
     */
    public _id: string | null;
    /**
     * UNIX timestamp of last updated in SECONDS.
     */
    public _lastUpdated = -1;
    /**
     * The entire classes fields.
     */
    public _typeFields: Record<string, FieldInterface>;

    /**
     * Contructor for a base type.
     * @param {MatrixBaseTypeData} data Type data.
     */
    constructor(data: MatrixBaseTypeData | string) {
        this._typeFields = this.getTypeClass().getFields();
        this._typeFieldKeys = Object.keys(this._typeFields);
        if (typeof data == 'object') this.populateFields(data);
        else this.setId(data);
    }

    /**
     * Get all the fields for the type.
     * @function getFields
     * @memberof BaseType
     * @static
     * @returns {Field[]} The type's field.
     */
    static getFields(): Record<string, FieldInterface> {
        let parentPrototype = Object.getPrototypeOf(this);
        let allFields: Record<string, FieldInterface> = this._classFields;
        while (parentPrototype != null) {
            const fields = parentPrototype._classFields;
            allFields = { ...allFields, ...fields };
            parentPrototype = Object.getPrototypeOf(parentPrototype);
        }
        return allFields;
    }

    /**
     * Set the type's Matrix instance.
     * @function setMatrix
     * @memberof Matrix
     * @private
     * @static
     * @param {Matrix} matrix The matrix instance.
     * @returns {void}
     */
    private static setMatrix(matrix: Matrix): void {
        this.matrix = matrix;
    }

    /**
     * Get the Matrix instance.
     * @function getMatrix
     * @memberof Matrix
     * @static
     * @returns {Matrix} Matrix instance.
     */
    static getMatrix(): Matrix {
        if (this.matrix == null) throw new NoMatrixInstance(this);
        return this.matrix;
    }

    /**
     * Get the collection name.
     * @function getCollection
     * @memberof MatrixBaseType
     * @static
     * @example
     * MyType.getCollection() // "std"
     * @returns {string} Name of the collection.
     */
    static getCollection(): string {
        return this._classInformation.collection;
    }

    /**
     * Get the type name.
     * @function getName
     * @memberof MatrixBaseType
     * @static
     * @example
     * MyType.getName() // "MyType"
     * @returns {string} Name of the type.
     */
    static getName(): string {
        return this._classInformation.name;
    }

    /**
     * Get the type.
     *
     * This is in collection name notation, see example.
     * @function getType
     * @memberof MatrixBaseType
     * @static
     * @example
     * MyType.getType() // "collectionName.MyType"
     * @returns {string} Type of the type.
     */
    static getType(): string {
        return `${this.getCollection()}.${this.getName()}`;
    }

    /**
     * Get the type label.
     * @function getLabel
     * @memberof MatrixBaseType
     * @static
     * @returns {string} Label of the type.
     */
    static getLabel(): string {
        return this._classInformation.label;
    }

    /**
     * Get the type description.
     * @function getDescription
     * @memberof MatrixBaseType
     * @static
     * @returns {string} Description of the type.
     */
    static getDescription(): string {
        return this._classInformation.description;
    }

    /**
     * Get the type icon.
     * @function getIcon
     * @memberof MatrixBaseType
     * @static
     * @returns {string} Icon of the type.
     */
    static getIcon(): string {
        return this._classInformation.icon;
    }

    /**
     * Get the type's source.
     * @returns {Driver} The type's source.
     */
    static getDriver(): Driver {
        return this.getMatrix().getDriver();
    }

    /**
     * Create an instance from serialized data.
     * @param   {string}                       id             The ID of the instance.
     * @param   {SerializedMatrixBaseTypeData} serializedData The serialized data.
     * @returns {T}                                           The new instance.
     */
    static deserialize<T extends MatrixBaseType = MatrixBaseType>(
        id: string,
        serializedData: SerializedMatrixBaseTypeData,
    ): T {
        const data: MatrixBaseTypeData = {};
        for (const [fieldName, field] of Object.entries(serializedData)) {
            data[fieldName] = field.values[field.current];
        }
        const instance = new this(data);
        for (const [fieldName, field] of Object.entries(serializedData)) {
            instance
                .getFieldObject(fieldName)
                .setValues(field.values)
                .setCurrent(field.current);
        }
        instance._id = id;
        return instance as T;
    }

    // Type Methods

    /**
     * Get an instance of the type from the ID.
     * @param {string} id The ID of the instance.
     * @returns {T} The new instance of the type.
     */
    static async get<T extends MatrixBaseType = MatrixBaseType>(
        id: string,
    ): Promise<T> {
        const source = this.getDriver(),
            type = this.getType(),
            response = (await source.getInstance(type, id)).response,
            data = response.data;
        return this.deserialize<T>(id, data);
    }

    /**
     * Get all the instances of a type.
     * // TODO: Add type caching.
     * @returns {T[]} All the new instances.
     */
    static async getAll<T extends MatrixBaseType = MatrixBaseType>(): Promise<
        T[]
    > {
        const source = this.getDriver(),
            type = this.getType(),
            response = (await source.getInstances(type)).response,
            instances: T[] = [];
        for (const [id, serializedData] of Object.entries(response)) {
            const instance = new this(serializedData.data);
            instance._id = id;
            instances.push(instance as T);
        }
        return instances;
    }

    /**
     * Check if the type class has a field value.
     * @param {string} fieldName The name of the field.
     * @returns {boolean} True if the type class has the field.
     * @private
     */
    private isFieldStatic(fieldName: string): boolean {
        return Object.keys(this.getTypeClass()._fieldValues).includes(
            fieldName,
        );
    }

    /**
     * Get the static field from its name.
     * @param {string} fieldName The name of the field.
     * @returns {StaticField} The field.
     * @private
     */
    private getStaticField(fieldName: string): FieldStatic {
        const fieldValue = this.getTypeClass()._fieldValues[fieldName];
        return new FieldStatic(fieldName, fieldValue);
    }

    /**
     * Get a field object from the field name.
     *
     * TODO: remove ones with null values when serializing data to upload.
     * @param {string} fieldName The field name.
     * @returns {Field} The field object.
     */
    private getFieldObject(fieldName: string): Field {
        // Verify the field exists.
        this.verifyFieldName(fieldName);
        // Check if the field is static.
        if (this.isFieldStatic(fieldName))
            return this.getStaticField(fieldName);
        // Create a new field if not exists.
        if (!Object.keys(this._fields).includes(fieldName)) {
            const timestamp = Math.floor(
                new Date().getTime() / 1000,
            ).toString();
            console.log('created new field object from getFieldObject');

            this._fields[fieldName] = new Field(fieldName, {
                current: timestamp,
                values: {
                    [timestamp]: {
                        value: null,
                    },
                },
            });
        }
        return this._fields[fieldName];
    }

    /**
     * Update a field object, NAME IS NOT CHECKED.
     * @param {string}  fieldName The name of the field.
     * @param {unknown} value The value of the field.
     * @param {string}  timestamp The timestamp to update to.
     */
    private updateFieldObject(
        fieldName: string,
        value: unknown,
        timestamp: string,
    ): void {
        // TODO: add source support
        if (!Object.keys(this._fields).includes(fieldName)) {
            this._fields[fieldName] = new Field(fieldName, {
                current: timestamp,
                // SOURCE #1
                values: {
                    [timestamp]: {
                        value: value, // SOURCE #2
                    },
                },
            });
        } else {
            // this._fields[fieldName].setValueAt(timestamp, );
            // SOURCE #3
            this._fields[fieldName].setCurrentData(timestamp, value);
        }
    }

    /**
     * Update the Fields from a data object.
     * @param {MatrixBaseTypeData} data The data to update.
     */
    private updateData(data: MatrixBaseTypeData): void {
        const fieldNames = Object.keys(data);
        const timestamp = Math.floor(new Date().getTime() / 1000).toString();
        for (const fieldName of fieldNames) {
            const value = data[fieldName];
            this.updateFieldObject(fieldName, value, timestamp);
        }
    }
    /**
     * Populate the type's fields.
     * @function populateFields
     * @memberof MatrixBaseType
     * @private
     * @param {Record<string, unknown>} data The data to populate.
     */
    private populateFields(data: MatrixBaseTypeData) {
        const dataKeys = Object.keys(data),
            dataValues = Object.values(data),
            populatedFields: Record<string, unknown> = {};

        for (const fieldName of this._typeFieldKeys) {
            // Get the field and if the field was provided.
            const field = this._typeFields[fieldName],
                isFieldProvided = dataKeys.includes(fieldName),
                fieldProvided = isFieldProvided
                    ? dataValues[dataKeys.indexOf(fieldName)]
                    : null;
            if (typeof field != 'object') continue;

            // If it is required & not provided, throw an error.
            if (!isFieldProvided && field.required)
                throw new MissingField(this.getTypeClass(), fieldName);

            // If it was provided, verify the type.
            // if (isFieldProvided) this.verifyType(field.type, fieldProvided);

            // Add the value to the fields.
            populatedFields[fieldName] = isFieldProvided
                ? fieldProvided
                : field.defaultValue;

            // Remove the field from the data.
            // @ts-ignore
            if (isFieldProvided) delete data[fieldName];
        }

        // Check for remaining data.
        const remainingKeys = Object.keys(data);
        if (remainingKeys.length != 0)
            throw new InvalidField(this.getTypeClass(), remainingKeys[0]);
        // Set the data to the populated fields.
        this.updateData(populatedFields);
    }

    /**
     * Verify a field name.
     * @function verifyFieldName
     * @memberof MatrixBaseType
     * @private
     * @param   {string} fieldName The name of the field.
     * @returns {number}           The index of the field.
     */
    private verifyFieldName(fieldName: string): number {
        const fieldIndex = this._typeFieldKeys.indexOf(fieldName);
        if (fieldIndex == -1) throw new Error(`${fieldName} does not exist`);
        return fieldIndex;
    }

    /**
     * Get the Matrix instance.
     * @function getMatrix
     * @memberof MatrixBaseType
     * @private
     * @returns {Matrix} Matrix instance.
     */
    private getMatrix(): Matrix {
        return this.getTypeClass().getMatrix();
    }

    /**
     * Get the type's source.
     * @returns {Driver} The type's source.
     */
    private getSource(): Driver {
        return this.getTypeClass().getDriver();
    }

    /**
     * Verify a value against a type.
     * @function verifyType
     * @memberof MatrixBaseType
     * @private
     * @param {string}  type  The type.
     * @param {unknown} value Value to test.
     * @returns {boolean} Should only return `true`, if not valid, throw error.
     */
    // verifyType(type: string, value: unknown): boolean {
    //     // The internal types
    //     const internalTypes = ['string', 'boolean', 'number', 'null'];
    //     // Remove whitespace.
    //     type = type.replace(/ /g, '');
    //     // Split union.
    //     if (type.includes('|'))
    //         if (
    //             type
    //                 .split('|')
    //                 .some((unionType) => this.verifyType(unionType, value))
    //         )
    //             return true;
    //     // Test against each union type.
    //     // Check for internal types.
    //     if (internalTypes.includes(type) && typeof value == type) return true;

    //     // Get the type.
    //     if (!type.includes('.'))
    //         type = `${this.getTypeClass()
    //             .getCollection()
    //             .getIdentifier()}.${type}`;
    //     try {
    //         const typeClass = this.getMatrix().getType(type);
    //         if (value instanceof typeClass) return;
    //     } catch (e) {
    //         console.log(e);
    //     }
    //     throw new InvalidFieldType(type, value);
    // }

    /**
     * Verify a field name and field type.
     * @function verifyFieldAndType
     * @memberof MatrixBaseType
     * @private
     * @param {string}  fieldName The field name.
     * @param {unknown} _     Value to test.
     */
    private verifyFieldAndType(fieldName: string, _: unknown): void {
        this.verifyFieldName(fieldName);
        // this.verifyType(Object.values(this.fields)[index].type, value);
    }

    /**
     * Get a value.
     * @function getField
     * @memberof MatrixBaseType
     * @protected
     * @param   {string}  fieldName The name of the field.
     * @returns {unknown}           The value of the field.
     */
    protected getField<T = unknown>(fieldName: string): T {
        // Verify field name.
        this.verifyFieldName(fieldName);
        return this.getFieldObject(fieldName).getCurrentValue() as T;
    }

    /**
     * Set a value.
     * @function setField
     * @memberof MatrixBaseType
     * @protected
     * @param {string}  fieldName The name of the field.
     * @param {unknown} value     The value of the field.
     */
    protected setField(fieldName: string, value: unknown): void {
        // Verify field name & value.
        const timestamp = Math.floor(new Date().getTime() / 1000).toString();
        this.verifyFieldAndType(fieldName, value);
        this.updateFieldObject(fieldName, value, timestamp);
        this.resetLastUpdated();
    }

    /**
     * Update the lastUpdated value to the current time.
     */
    private resetLastUpdated(): void {
        this._lastUpdated = Math.floor(new Date().getTime() / 1000);
    }

    /**
     * Return the type class.
     * @function getTypeClass
     * @memberof MatrixBaseType
     * @returns {MatrixBaseType} Base thing class.
     */
    getTypeClass(): typeof MatrixBaseType {
        return MatrixBaseType;
    }

    /**
     * Retrive the Id.
     * @returns {string} The Id of the type.
     */
    getId(): string | null {
        return this._id;
    }

    /**
     * Set the ID, can only be done once.
     * @param {string} id The id of the type.
     */
    setId(id: string): void {
        if (this.isInstance()) throw new AlreadyInstantiated(this);
        this._id = id;
    }

    /**
     * Get the last updated time.
     * @returns {Date} A date object.
     */
    getUpdatedAt(): Date {
        return new Date(this._lastUpdated * 1000);
    }

    /**
     * Is instance.
     * @function isInstance
     * @memberof MatrixBaseType
     * @returns {boolean} If the type is an instance or not.
     */
    isInstance(): boolean {
        return this.getId() != null;
    }

    /**
     * Return the serialized data.
     * @returns {MatrixBaseTypeData} The serialized data.
     */
    getSerializedData(): Record<string, FieldObject> {
        const data: Record<string, FieldObject> = {};
        for (const [fieldName, field] of Object.entries(this._fields)) {
            if (field.isDefined()) data[fieldName] = field.serialize();
        }
        return data;
    }

    /**
     * Get the reference of an instance.
     * @function getReference
     * @memberof MatrixBaseType
     * @example
     * MyType.getReference() // "myCollection.MyType@00000420"
     * @returns {string} The instance reference string.
     */
    getReference(): string {
        if (!this.isInstance()) throw new Uninstantiated(this.getTypeClass());
        return `${this.getTypeClass().getType()}@${this.getId()}`;
    }

    /**
     * Serialize the type.
     * @param {boolean} asRefrence If it should be serializeed as a reference.
     * @returns {IncludeMetaData | string} The serialized type, unless used as a ref.
     */
    serialize<T extends MatrixBaseTypeData = MatrixBaseTypeData>(
        asRefrence = false,
    ): SerializedData<T> | string {
        if (asRefrence && this.isInstance()) return this.getReference();
        return {
            // Use get serialized Data
            data: mapObject(this.getSerializedData(), (_, value: unknown) => {
                return value instanceof MatrixBaseType
                    ? value.serialize(true)
                    : value;
            }),
            $id: this.getId()!,
            $type: this.getTypeClass().getType(),
        } as SerializedData<T>;
    }

    /**
     * Sync local and remote data.
     * @function getData
     * @memberof MatrixBaseType
     * @async
     * @returns {Promise<void>}
     */
    // @instanceOnly()
    async syncData(): Promise<this> {
        if (!this.isInstance()) throw new Uninstantiated(this.getTypeClass());
        const source = this.getSource(),
            type = this.getTypeClass().getType(),
            id = this.getId()!,
            response = (await source.getInstance(type, id)).response,
            remoteData = response.data,
            localData = this.getSerializedData(),
            remoteFieldNames = Object.keys(remoteData),
            localFieldNames = Object.keys(localData);
        console.log('remote');
        console.log(remoteData);
        console.log('local');
        console.log(localData);

        // Update remote with local values.
        // TODO: look for each timestamp AS WELL as the current
        // If key not in remote, add it and update it
        const newData: Record<string, FieldObject> = {};
        for (const [fieldName, field] of Object.entries(localData)) {
            if (
                !remoteFieldNames.includes(fieldName) ||
                parseInt(remoteData[fieldName].current) <
                    parseInt(field.current)
            ) {
                // Update the remote value.
                newData[fieldName] = field;
            }
        }
        if (newData != {}) await source.updateInstance(type, id, newData);
        // Update local with remote values.
        for (const [fieldName, field] of Object.entries(remoteData)) {
            if (
                !localFieldNames.includes(fieldName) ||
                parseInt(remoteData[fieldName].current) >
                    parseInt(field.current)
            ) {
                // Update the local value.
                this.setField(fieldName, field);
            }
        }

        // Determine if incomming data is old.
        // if (response.data.$updatedAt > this.getUpdatedAt().getTime() / 1000) {
        //     // The data is new and replace local data.
        //     const remoteData = removeMetadata(response.data);
        //     for (const [key, value] of Object.entries(remoteData)) {
        //         this.setField(key, value);
        //     }
        //     // TODO: getUpdatedAt can be set after synced data is updated and each setField can change that time.
        // } else {
        //     // The data is old and instance needs to be updated.
        //     const data = this.getSerializedData();
        //     await source.updateInstance(type, id, data);
        // }
        return this;
    }

    /**
     * Turn the type into an instance.
     * @function createInstance
     * @memberof MatrixBaseType
     * @async
     * @returns {Promise<MatrixBaseType>} The instance with the Id.
     */
    async createInstance(): Promise<this> {
        if (this.isInstance()) throw new AlreadyInstantiated(this);
        const response = (
            await this.getSource().createInstance(
                this.getTypeClass().getType(),
                this.getSerializedData(),
            )
        ).response;
        this._id = response.$id;
        return this;
    }
}
