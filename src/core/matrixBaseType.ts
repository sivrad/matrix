import { AlreadyInstantiated, NoMatrixInstance, Uninstantiated } from './error';
import { Matrix } from './matrixInstance';
import { Driver } from './driver';
import { Field } from './field';
import {
    MatrixBaseTypeData,
    FieldData,
    SerializedMatrixBaseTypeData,
    ClassInformation,
    schema,
    IncludeID,
    TypeStructure,
    FieldStructure,
} from './type';
import { Values } from './constants';
import { getCurrentTimestamp, mapObject } from './util';
import { FieldManager } from './fieldManager';

/**
 * Base class for the Matrix.
 */
export class MatrixBaseType {
    /**
     * The collection assigned to the type.
     */
    private static matrix?: Matrix;
    /**
     * Field information.
     */
    protected static fields: Record<string, schema.Field> = {};
    /**
     * Field values.
     */
    protected static staticFields: Record<string, unknown> = {};
    /**
     * Information on the class.
     */
    protected static classInformation: ClassInformation;
    /**
     * The field manager.
     */
    private fieldManager: FieldManager;
    /**
     * Id of the type.
     */
    private id: string | null;
    /**
     * UNIX timestamp of last updated in seconds.
     */
    private updatedAt = -1;
    /**
     * UNIX timestamp of when the instance was created in seconds.
     */
    private createdAt = -1;

    /**
     * Contructor for a base type.
     * @param {MatrixBaseTypeData} data Type data.
     */
    constructor(data: IncludeID<MatrixBaseTypeData>) {
        // Set the ID if provided.
        if (Object.keys(data).includes('$id')) this.setId(data.$id as string);
        // Remove the '$id'
        delete data.$id;
        // Create the field manager.
        this.fieldManager = new FieldManager(this);
        // Popualte the fields with the FM.
        this.fieldManager.populate(data);
    }

    /**
     * Set the ID, can only be done once.
     * @param {string} id The id of the type.
     */
    setId(id: string): void {
        if (this.isInstance()) throw new AlreadyInstantiated(this);
        this.id = id;
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
     * Retrive the Id.
     * @returns {string} The Id of the type.
     */
    getId(): string | null {
        return this.id;
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
     * Get all the fields for the type.
     * @function getFields
     * @memberof BaseType
     * @static
     * @returns {Field[]} The type's field.
     */
    static getFields(): Record<string, schema.Field> {
        let parent = this.getParent();
        let allFields: Record<string, schema.Field> = this.fields;
        while (parent != null) {
            const fields = parent.fields;
            allFields = { ...allFields, ...fields };
            parent = Object.getPrototypeOf(parent);
        }
        return allFields;
    }

    /**
     * Get all the static field values.
     * @function getStaticFieldValues
     * @memberof MatrixBaseType
     * @static
     * @returns {Record<string, unknown>} The static fields.
     */
    static getStaticFieldValues(): Record<string, unknown> {
        return this.staticFields;
    }

    /**
     * Return the parent class.
     * @returns {typeof MatrixBaseType | null} The MatrixBaseType class or null if no parent.
     */
    static getParent(): typeof MatrixBaseType | null {
        return Object.getPrototypeOf(this);
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
        if (!this.classInformation) return Values.BASE_TYPE_NAME;
        return this.classInformation.name;
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
     * Get the collection name.
     * @function getCollection
     * @memberof MatrixBaseType
     * @static
     * @example
     * MyType.getCollection() // "std"
     * @returns {string} Name of the collection.
     */
    static getCollection(): string {
        return this.classInformation.collection;
    }

    /**
     * Get a value.
     * @function getField
     * @memberof MatrixBaseType
     * @protected
     * @param   {string}  fieldName The name of the field.
     * @param   {number}  timestamp The timestamp to get.
     * @returns {unknown}           The value of the field.
     */
    getFieldValue<T = unknown>(fieldName: string, timestamp?: number): T {
        return this.fieldManager.getFieldValue(fieldName, timestamp) as T;
    }

    /**
     * Set a value.
     * @function setField
     * @memberof MatrixBaseType
     * @protected
     * @param {string}  fieldName The name of the field.
     * @param {unknown} value     The value of the field.
     */
    setFieldValue(fieldName: string, value: unknown): void {
        this.fieldManager.setFieldValue(fieldName, value, 'INTERNAL');
    }

    /**
     * Return the children classes.
     * @function getChildren
     * @memberof MatrixBaseType
     * @returns {typeof MatrixBaseType[]} The children class.
     * @static
     */
    static getChildren(): typeof MatrixBaseType[] {
        let children = this.getDirectChildren();
        for (const child of children) {
            children = children.concat(child.getChildren());
        }
        return children;
    }

    /**
     * Return the direct children classes.
     * @function getChildren
     * @memberof MatrixBaseType
     * @returns {typeof MatrixBaseType[]} The children class.
     * @static
     */
    static getDirectChildren(): typeof MatrixBaseType[] {
        return this.getMatrix().getChildTypes(this.getType());
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
     * Get the type label.
     * @function getLabel
     * @memberof MatrixBaseType
     * @static
     * @returns {string} Label of the type.
     */
    static getLabel(): string {
        return this.classInformation.label;
    }

    /**
     * Get the type description.
     * @function getDescription
     * @memberof MatrixBaseType
     * @static
     * @returns {string} Description of the type.
     */
    static getDescription(): string {
        return this.classInformation.description;
    }

    /**
     * Get the type icon.
     * @function getIcon
     * @memberof MatrixBaseType
     * @static
     * @returns {string} Icon of the type.
     */
    static getIcon(): string {
        return this.classInformation.icon;
    }

    /**
     * Get the type flags.
     * @function getFlags
     * @memberof MatrixBaseType
     * @static
     * @returns {string[]} Flags of the type.
     */
    static getFlags(): string[] {
        return this.classInformation.flags;
    }

    /**
     * Get the type schema.
     *
     * This can be serialized to JSON and be built.
     * @function getSchema
     * @memberof MatrixBaseType
     * @static
     * @returns {Schema} Schema of the type.
     */
    static getSchema(): schema.Type {
        return {
            name: this.getName(),
            label: this.getLabel(),
            description: this.getDescription(),
            icon: this.getIcon(),
            flags: this.getFlags() as schema.Type['flags'],
            parent: this.getParent()?.getType() || null,
            fieldValues: this.staticFields as schema.Type['fieldValues'],
            fields: this.fields,
        };
    }

    /**
     * Return the structure of the type.
     * @function getStructure
     * @memberof MatrixBaseType
     * @static
     * @returns {Type} Structure of the type.
     */
    static getStructure(): TypeStructure {
        // Create a map of all the fields for each parent.
        const fieldOwners = new Map<string, string>();

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let type: typeof MatrixBaseType | null = this;
        while (type?.fields != null) {
            for (const fieldName of Object.keys(type.fields)) {
                fieldOwners.set(fieldName, type.getType());
            }
            type = type.getParent();
        }
        const schema = this.getSchema();
        // Update the fields to include 'required' and 'owner'.
        schema.fields = mapObject(
            this.getFields(),
            (fieldName, field: FieldStructure) => {
                // field.required = !Object.keys(field).includes('defaultValue');
                field.owner = fieldOwners.get(fieldName);
                return field;
            },
        );
        return schema;
    }

    // /**
    //  * Get the type's source.
    //  * @returns {Driver} The type's source.
    //  */
    // static getDriver(): Driver {
    //     return this.getMatrix().getDriver();
    // }

    // /**
    //  * Create an instance from serialized data.
    //  * @param   {string}                       $id             The ID of the instance.
    //  * @param   {SerializedMatrixBaseTypeData} serializedData The serialized data.
    //  * @returns {T}                                           The new instance.
    //  */
    // static deserialize<T extends MatrixBaseType = MatrixBaseType>(
    //     $id: string,
    //     serializedData: SerializedMatrixBaseTypeData,
    // ): T {
    //     const data: MatrixBaseTypeData = { $id };
    //     for (const [fieldName, field] of Object.entries(serializedData)) {
    //         if (!field.current) continue;
    //         data[fieldName] = field.values[field.current];
    //     }
    //     const instance = new this(data);
    //     for (const [fieldName, field] of Object.entries(serializedData)) {
    //         if (!field.current) continue;
    //         instance
    //             .getFieldObject(fieldName)
    //             .setValues(field.values)
    //             .setCurrent(field.current);
    //     }
    //     return instance as T;
    // }

    // // Type Methods

    // /**
    //  * Get an instance of the type from the ID.
    //  * @param {string} id The ID of the instance.
    //  * @returns {T} The new instance of the type.
    //  */
    // static async get<T extends MatrixBaseType = MatrixBaseType>(
    //     id: string,
    // ): Promise<T> {
    //     const source = this.getDriver(),
    //         type = this.getType(),
    //         response = (await source.getInstance(type, id)).response,
    //         data = response.data;
    //     return this.deserialize<T>(id, data);
    // }

    // /**
    //  * Get all the instances of a type.
    //  * // TODO: Add type caching.
    //  * @param {boolean} includeChildren If instances of child types should be included.
    //  * @returns {T[]} All the new instances.
    //  */
    // static async getAll<T extends MatrixBaseType = MatrixBaseType>(
    //     includeChildren = true,
    // ): Promise<T[]> {
    //     const source = this.getDriver(),
    //         type = this.getType(),
    //         response = (await source.getInstances(type)).response,
    //         instances: T[] = [];
    //     // Add all the child instances if requested.
    //     if (includeChildren) {
    //     }
    //     for (const [id, serializedData] of Object.entries(response)) {
    //         const instance = new this(serializedData.data);
    //         instance.id = id;
    //         instances.push(instance as T);
    //     }
    //     return instances;
    // }

    // /**
    //  * Check if the type class has a field value.
    //  * @param {string} fieldName The name of the field.
    //  * @returns {boolean} True if the type class has the field.
    //  * @private
    //  */
    // private isFieldStatic(fieldName: string): boolean {
    //     return Object.keys(this.getTypeClass()._fieldValues).includes(
    //         fieldName,
    //     );
    // }

    // /**
    //  * Get the static field from its name.
    //  * @param {string} fieldName The name of the field.
    //  * @returns {StaticField} The field.
    //  * @private
    //  */
    // private getStaticField(fieldName: string): FieldStatic {
    //     const fieldValue = this.getTypeClass()._fieldValues[fieldName];
    //     return new FieldStatic(fieldName, fieldValue);
    // }

    // // /**
    // //  * Get a field object from the field name.
    // //  *
    // //  * TODO: remove ones with null values when serializing data to upload.
    // //  * @param {string} fieldName The field name.
    // //  * @returns {Field} The field object.
    // //  */
    // // private getFieldObject(fieldName: string): Field {
    // //     // Verify the field exists.
    // //     this.verifyFieldName(fieldName);
    // //     // Check if the field is static.
    // //     if (this.isFieldStatic(fieldName))
    // //         return this.getStaticField(fieldName);
    // //     // Create a new field if not exists.
    // //     if (!Object.keys(this._fields).includes(fieldName)) {
    // //         const timestamp = Math.floor(
    // //             new Date().getTime() / 1000,
    // //         ).toString();
    // //         console.log('created new field object from getFieldObject');

    // //         this._fields[fieldName] = new Field(fieldName, {
    // //             current: timestamp,
    // //             values: {
    // //                 [timestamp]: {
    // //                     value: null,
    // //                 },
    // //             },
    // //         });
    // //     }
    // //     return this._fields[fieldName];
    // // }

    // // /**
    // //  * Update a field object, NAME IS NOT CHECKED.
    // //  * @param {string}  fieldName The name of the field.
    // //  * @param {unknown} value The value of the field.
    // //  * @param {string}  timestamp The timestamp to update to.
    // //  */
    // // private updateFieldObject(
    // //     fieldName: string,
    // //     value: unknown,
    // //     timestamp: string,
    // // ): void {
    // //     // TODO: add source support
    // //     if (!Object.keys(this._fields).includes(fieldName)) {
    // //         this._fields[fieldName] = new Field(fieldName, {
    // //             current: timestamp,
    // //             // SOURCE #1
    // //             values: {
    // //                 [timestamp]: {
    // //                     value: value, // SOURCE #2
    // //                 },
    // //             },
    // //         });
    // //     } else {
    // //         // this._fields[fieldName].setValueAt(timestamp, );
    // //         // SOURCE #3
    // //         this._fields[fieldName].setCurrentData(timestamp, value);
    // //     }
    // // }

    // // /**
    // //  * Update the Fields from a data object.
    // //  * @param {MatrixBaseTypeData} data The data to update.
    // //  */
    // // private updateData(data: MatrixBaseTypeData): void {
    // //     const fieldNames = Object.keys(data);
    // //     const timestamp = Math.floor(new Date().getTime() / 1000).toString();
    // //     for (const fieldName of fieldNames) {
    // //         const value = data[fieldName];
    // //         this.updateFieldObject(fieldName, value, timestamp);
    // //     }
    // // }
    // // /**
    // //  * Populate the type's fields.
    // //  * @function populateFields
    // //  * @memberof MatrixBaseType
    // //  * @private
    // //  * @param {Record<string, unknown>} data The data to populate.
    // //  */
    // // private populateFields(data: MatrixBaseTypeData) {
    // //     const dataKeys = Object.keys(data),
    // //         dataValues = Object.values(data),
    // //         populatedFields: Record<string, unknown> = {};
    // //     for (const fieldName of this._typeFieldKeys) {
    // //         // Get the field and if the field was provided.
    // //         const field = this._typeFields[fieldName],
    // //             isFieldProvided = dataKeys.includes(fieldName),
    // //             fieldProvided = isFieldProvided
    // //                 ? dataValues[dataKeys.indexOf(fieldName)]
    // //                 : null;
    // //         if (typeof field != 'object') continue;

    // //         // If it is required & not provided, throw an error.
    // //         if (!isFieldProvided && field.required)
    // //             throw new MissingField(this.getTypeClass(), fieldName);

    // //         // If it was provided, verify the type.
    // //         // if (isFieldProvided) this.verifyType(field.type, fieldProvided);

    // //         // Add the value to the fields.
    // //         populatedFields[fieldName] = isFieldProvided
    // //             ? fieldProvided
    // //             : field.defaultValue;

    // //         // Remove the field from the data.
    // //         // @ts-ignore
    // //         if (isFieldProvided) delete data[fieldName];
    // //     }

    // //     // Check for remaining data.
    // //     const remainingKeys = Object.keys(data);
    // //     if (remainingKeys.length != 0)
    // //         throw new InvalidField(this.getTypeClass(), remainingKeys[0]);
    // //     // Set the data to the populated fields.
    // //     this.updateData(populatedFields);
    // // }

    // /**
    //  * Verify a field name.
    //  * @function verifyFieldName
    //  * @memberof MatrixBaseType
    //  * @private
    //  * @param   {string} fieldName The name of the field.
    //  * @returns {number}           The index of the field.
    //  */
    // private verifyFieldName(fieldName: string): number {
    //     const fieldIndex = this._typeFieldKeys.indexOf(fieldName);
    //     if (fieldIndex == -1) throw new Error(`${fieldName} does not exist`);
    //     return fieldIndex;
    // }

    // /**
    //  * Verify a value against a type.
    //  * @function verifyType
    //  * @memberof MatrixBaseType
    //  * @private
    //  * @param {string}  type  The type.
    //  * @param {unknown} value Value to test.
    //  * @returns {boolean} Should only return `true`, if not valid, throw error.
    //  */
    // // verifyType(type: string, value: unknown): boolean {
    // //     // The internal types
    // //     const internalTypes = ['string', 'boolean', 'number', 'null'];
    // //     // Remove whitespace.
    // //     type = type.replace(/ /g, '');
    // //     // Split union.
    // //     if (type.includes('|'))
    // //         if (
    // //             type
    // //                 .split('|')
    // //                 .some((unionType) => this.verifyType(unionType, value))
    // //         )
    // //             return true;
    // //     // Test against each union type.
    // //     // Check for internal types.
    // //     if (internalTypes.includes(type) && typeof value == type) return true;

    // //     // Get the type.
    // //     if (!type.includes('.'))
    // //         type = `${this.getTypeClass()
    // //             .getCollection()
    // //             .getIdentifier()}.${type}`;
    // //     try {
    // //         const typeClass = this.getMatrix().getType(type);
    // //         if (value instanceof typeClass) return;
    // //     } catch (e) {
    // //         console.log(e);
    // //     }
    // //     throw new InvalidFieldType(type, value);
    // // }

    // /**
    //  * Verify a field name and field type.
    //  * @function verifyFieldAndType
    //  * @memberof MatrixBaseType
    //  * @private
    //  * @param {string}  fieldName The field name.
    //  * @param {unknown} _     Value to test.
    //  */
    // private verifyFieldAndType(fieldName: string, _: unknown): void {
    //     this.verifyFieldName(fieldName);
    //     // this.verifyType(Object.values(this.fields)[index].type, value);
    // }

    // /**
    //  * Update the lastUpdated value to the current time.
    //  */
    // private resetLastUpdated(): void {
    //     this.updatedAt = Math.floor(new Date().getTime() / 1000);
    // }

    // /**
    //  * Get the last updated time.
    //  * @returns {Date} A date object.
    //  */
    // getUpdatedAt(): Date {
    //     return new Date(this.updatedAt * 1000);
    // }

    // /**
    //  * Return the serialized data.
    //  * @returns {MatrixBaseTypeData} The serialized data.
    //  */
    // getSerializedData(): Record<string, FieldData> {
    //     const data: Record<string, FieldData> = {};
    //     for (const [fieldName, field] of Object.entries(this.getFields())) {
    //         if (field.isDefined()) data[fieldName] = field.serialize();
    //     }
    //     return data;
    // }

    // /**
    //  * Get the reference of an instance.
    //  * @function getReference
    //  * @memberof MatrixBaseType
    //  * @example
    //  * MyType.getReference() // "myCollection.MyType@00000420"
    //  * @returns {string} The instance reference string.
    //  */
    // getReference(): string {
    //     if (!this.isInstance()) throw new Uninstantiated(this.getTypeClass());
    //     return `${this.getTypeClass().getType()}@${this.getId()}`;
    // }

    // /**
    //  * Serialize the type.
    //  * @param {boolean} asRefrence If it should be serializeed as a reference.
    //  * @returns {IncludeMetaData | string} The serialized type, unless used as a ref.
    //  */
    // serialize<T extends MatrixBaseTypeData = MatrixBaseTypeData>(
    //     asRefrence = false,
    // ): SerializedData<T> | string {
    //     if (asRefrence && this.isInstance()) return this.getReference();
    //     return {
    //         // Use get serialized Data
    //         data: mapObject(this.getSerializedData(), (_, value: unknown) => {
    //             return value instanceof MatrixBaseType
    //                 ? value.serialize(true)
    //                 : value;
    //         }),
    //         $id: this.getId()!,
    //         $type: this.getTypeClass().getType(),
    //     } as SerializedData<T>;
    // }

    // // /**
    // //  * Sync local and remote data.
    // //  * @function getData
    // //  * @memberof MatrixBaseType
    // //  * @async
    // //  * @returns {Promise<void>}
    // //  */
    // // // @instanceOnly()
    // // async syncData(): Promise<this> {
    // //     if (!this.isInstance()) throw new Uninstantiated(this.getTypeClass());
    // //     const source = this.getSource(),
    // //         type = this.getTypeClass().getType(),
    // //         id = this.getId()!,
    // //         response = (await source.getInstance(type, id)).response,
    // //         remoteData = response.data,
    // //         localData = this.getSerializedData(),
    // //         remoteFieldNames = Object.keys(remoteData),
    // //         localFieldNames = Object.keys(localData);
    // //     console.log('remote');
    // //     console.log(remoteData);
    // //     console.log('local');
    // //     console.log(localData);

    // //     // Update remote with local values.
    // //     // TODO: look for each timestamp AS WELL as the current
    // //     // If key not in remote, add it and update it
    // //     const newData: Record<string, FieldData> = {};
    // //     for (const [fieldName, field] of Object.entries(localData)) {
    // //         if (
    // //             !remoteFieldNames.includes(fieldName) ||
    // //             parseInt(remoteData[fieldName].current) <
    // //                 parseInt(field.current)
    // //         ) {
    // //             // Update the remote value.
    // //             newData[fieldName] = field;
    // //         }
    // //     }
    // //     if (newData != {}) await source.updateInstance(type, id, newData);
    // //     // Update local with remote values.
    // //     for (const [fieldName, field] of Object.entries(remoteData)) {
    // //         if (
    // //             !localFieldNames.includes(fieldName) ||
    // //             parseInt(remoteData[fieldName].current) >
    // //                 parseInt(field.current)
    // //         ) {
    // //             // Update the local value.
    // //             this._fields[fieldName] = new Field(fieldName, field);
    // //             // this.setField(fieldName, field);
    // //         }
    // //     }

    // //     // Determine if incomming data is old.
    // //     // if (response.data.$updatedAt > this.getUpdatedAt().getTime() / 1000) {
    // //     //     // The data is new and replace local data.
    // //     //     const remoteData = removeMetadata(response.data);
    // //     //     for (const [key, value] of Object.entries(remoteData)) {
    // //     //         this.setField(key, value);
    // //     //     }
    // //     //     // TODO: getUpdatedAt can be set after synced data is updated and each setField can change that time.
    // //     // } else {
    // //     //     // The data is old and instance needs to be updated.
    // //     //     const data = this.getSerializedData();
    // //     //     await source.updateInstance(type, id, data);
    // //     // }
    // //     return this;
    // // }

    // /**
    //  * Turn the type into an instance.
    //  * @function createInstance
    //  * @memberof MatrixBaseType
    //  * @async
    //  * @returns {Promise<MatrixBaseType>} The instance with the Id.
    //  */
    // async createInstance(): Promise<this> {
    //     if (this.isInstance()) throw new AlreadyInstantiated(this);
    //     const response = (
    //         await this.getSource().createInstance(
    //             this.getTypeClass().getType(),
    //             this.getSerializedData(),
    //         )
    //     ).response;
    //     this.id = response.id;
    //     return this;
    // }

    // END
}
