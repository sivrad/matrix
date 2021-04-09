import { Collection } from './collection';
import {
    AlreadyInstantiated,
    InvalidField,
    // InvalidFieldType,
    MissingField,
    NoAssignedCollection,
    Uninstantiated,
} from './errors';
import { Matrix } from './matrixInstance';
import { Source } from './source';
import { Field, MatrixBaseTypeData, IncludeMetaData } from './type';
import { mapObject } from './util';

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
    public static _collection: Collection | null = null;
    protected static classFields: Record<string, Field> = {
        $id: {
            type: 'string | null',
            label: 'Identifier',
            description: 'Identifier of the type',
            defaultValue: null,
            required: false,
        },
    };
    public static _classInformation = {
        name: 'BaseType',
        label: 'Base Type',
        description: 'The base matrix type',
        icon: '',
    };
    public _data: MatrixBaseTypeData = {};
    public _fieldKeys: string[];
    /**
     * UNIX timestamp of last updated in SECONDS.
     */
    public _lastUpdated = -1;
    public _fields: Record<string, Field>;

    /**
     * Contructor for a base type.
     * @param {MatrixBaseTypeData} data Type data.
     */
    constructor(data: MatrixBaseTypeData) {
        this._fields = this.getTypeClass().getFields();
        this._fieldKeys = Object.keys(this._fields);
        this.populateFields(data);
    }

    /**
     * Get all the fields for the type.
     * @function getFields
     * @memberof BaseType
     * @static
     * @returns {Field[]} The type's field.
     */
    static getFields(): Record<string, Field> {
        let parentPrototype = Object.getPrototypeOf(this);
        let allFields: Record<string, Field> = this.classFields;
        while (parentPrototype != null) {
            const fields = parentPrototype.classFields;
            allFields = { ...allFields, ...fields };
            parentPrototype = Object.getPrototypeOf(parentPrototype);
        }
        return allFields;
    }

    /**
     * Get the type collection.
     * @function getCollection
     * @memberof MatrixBaseType
     * @static
     * @returns {Collection} Collection instance.
     */
    static getCollection(): Collection {
        if (this._collection == null) throw new NoAssignedCollection(this);
        return this._collection;
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
        return `${this.getName()}.${this.getCollection().getIdentifier()}`;
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

        for (const fieldName of this._fieldKeys) {
            // Get the field and if the field was provided.
            const field = this._fields[fieldName],
                isFieldProvided = dataKeys.includes(fieldName),
                fieldProvided = isFieldProvided
                    ? dataValues[dataKeys.indexOf(fieldName)]
                    : null;

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
        this._data = populatedFields;
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
        const fieldIndex = this._fieldKeys.indexOf(fieldName);
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
        return this.getTypeClass().getCollection().getMatrix();
    }

    /**
     * Get the type's source.
     * @returns {Source} The type's source.
     */
    private getSource(): Source {
        return this.getMatrix().getSource('primary');
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
        return this._data[fieldName] as T;
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
        this.verifyFieldAndType(fieldName, value);
        this._data[fieldName] = value;
        this.resetLastUpdated();
    }

    /**
     * Update the lastUpdated value to the current time.
     */
    private resetLastUpdated(): void {
        this._lastUpdated = Math.floor(new Date().getTime() / 1000);
    }

    /**
     * Remove metadata from MetaData object.
     * @function removeMetaData
     * @memberof MatrixBaseType
     * @private
     * @param   {IncludeMetaData<MatrixBaseTypeData>} data Data with metadata.
     * @returns {MatrixBaseTypeData} Data without metadata.
     */
    private removeMetaData(data: IncludeMetaData<MatrixBaseTypeData>) {
        const rawData: MatrixBaseTypeData = {};
        for (const [key, value] of Object.entries(data)) {
            if (key[0] != '$' || key == '$id') {
                rawData[key] = value;
            }
        }
        return rawData;
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
     * Retrive the Id field.
     * @returns {string} Id field.
     */
    getId(): string | null {
        return this.getField<string | null>('$id');
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
    getSerializedData(): MatrixBaseTypeData {
        return this._data;
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
    ): IncludeMetaData<T> | string {
        if (asRefrence) return this.getReference();
        return mapObject(
            {
                ...this._data,
                ...{
                    $type: this.getTypeClass().getType(),
                    $updatedAt: Math.floor(
                        this.getUpdatedAt().getTime() / 1000,
                    ),
                },
            } as IncludeMetaData<T>,
            (_, value: unknown) => {
                return value instanceof MatrixBaseType
                    ? value.serialize(true)
                    : value;
            },
        ) as IncludeMetaData<T>;
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
        const source = this.getSource();
        const response = await source.getInstance(
            this.getTypeClass().getType(),
            this.getId()!,
        );
        console.log(response);
        // Update the local data with remote.
        const remoteData = this.removeMetaData(response.data);
        for (const [key, value] of Object.entries(remoteData)) {
            this.setField(key, value);
        }
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
        const id = await this.getSource().createInstance(
            this.getTypeClass().getType(),
            this.getSerializedData(),
        );
        this.setField('$id', id);
        return this;
    }
}
