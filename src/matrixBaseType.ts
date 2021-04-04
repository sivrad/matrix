import { Collection } from './collection';
import {
    InvalidField,
    InvalidFieldType,
    MissingField,
    NoAssignedCollection,
} from './errors';
import { Matrix } from './Matrix';
import { Field } from './type';

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

export interface SerializedMatrixBaseType {
    $id?: string;
}

/**
 * Base class for the Matrix.
 */
export class MatrixBaseType {
    private static collection: Collection | null = null;
    protected static classFields: Record<string, Field> = {
        $id: {
            type: 'string | null',
            label: 'Identifier',
            description: 'Identifier of the type',
            defaultValue: null,
            required: false,
        },
    };
    protected static classInformation = {
        name: 'BaseType',
        label: 'Base Type',
        description: 'The base matrix type',
        icon: '',
    };
    private data: SerializedMatrixBaseType = {};
    private fieldKeys: string[];
    private fields: Record<string, Field>;

    /**
     * Contructor for a base type.
     * @param {SerializedMatrixBaseType} data Type data.
     */
    constructor(data: SerializedMatrixBaseType) {
        this.fields = this.getTypeClass().getFields();
        this.fieldKeys = Object.keys(this.fields);
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
        if (this.collection == null) throw new NoAssignedCollection(this);
        return this.collection;
    }

    /**
     * Get the type name.
     * @function getName
     * @memberof MatrixBaseType
     * @static
     * @returns {string} Name of the type.
     */
    static getName(): string {
        return this.classInformation.name;
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
     * Populate the type's fields.
     * @function populateFields
     * @memberof MatrixBaseType
     * @private
     * @param {Record<string, unknown>} data The data to populate.
     */
    private populateFields(data: SerializedMatrixBaseType) {
        const dataKeys = Object.keys(data),
            dataValues = Object.values(data),
            populatedFields: Record<string, unknown> = {};

        for (const fieldName of this.fieldKeys) {
            // Get the field and if the field was provided.
            const field = this.fields[fieldName],
                isFieldProvided = dataKeys.includes(fieldName),
                fieldProvided = isFieldProvided
                    ? dataValues[dataKeys.indexOf(fieldName)]
                    : null;

            // If it is required & not provided, throw an error.
            if (!isFieldProvided && field.required)
                throw new MissingField(this.getTypeClass(), fieldName);

            // If it was provided, verify the type.
            if (isFieldProvided) this.verifyType(field.type, fieldProvided);

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
        this.data = populatedFields;
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
        const fieldIndex = this.fieldKeys.indexOf(fieldName);
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
     * Verify a value against a type.
     * @function verifyType
     * @memberof MatrixBaseType
     * @private
     * @param {string}  type  The type.
     * @param {unknown} value Value to test.
     */
    private verifyType(type: string, value: unknown): void {
        // The internal types
        const internalTypes = ['string', 'boolean', 'number', 'null'];
        // Remove whitespace.
        type = type.replace(/ /g, '');
        // Split union.
        const unionTypes = type.split('|');
        // Test against each union type.
        for (let unionType of unionTypes) {
            // Check for internal types.
            if (internalTypes.includes(unionType) && typeof value == unionType)
                return;

            // Get the type.
            if (!unionType.includes('.'))
                unionType = `${this.getTypeClass()
                    .getCollection()
                    .getIdentifier()}.${unionType}`;
            const type = this.getMatrix().getType(unionType);
            if (value instanceof type) return;
        }
        throw new InvalidFieldType(type, value);
    }

    /**
     * Verify a field name and field type.
     * @function verifyFieldAndType
     * @memberof MatrixBaseType
     * @private
     * @param {string}  fieldName The field name.
     * @param {unknown} value     Value to test.
     */
    private verifyFieldAndType(fieldName: string, value: unknown): void {
        const index = this.verifyFieldName(fieldName);
        this.verifyType(Object.values(this.fields)[index].type, value);
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
        // @ts-expect-error This will work because the name has been verified.
        return this.data[fieldName] as T;
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
        // @ts-expect-error This will work because the name & type has been verified.
        this.data[fieldName] = value;
    }

    /**
     * Return the type class.
     * @function getTypeClass
     * @memberof MatrixBaseType
     * @protected
     * @returns {MatrixBaseType} Base thing class.
     */
    protected getTypeClass(): typeof MatrixBaseType {
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
     * Is instance.
     * @function isInstance
     * @memberof MatrixBaseType
     * @returns {boolean} If the type is an instance or not.
     */
    isInstance(): boolean {
        return this.getId() != null;
    }

    /**
     * Sync local and remote data.
     * @function getData
     * @memberof MatrixBaseType
     * @async
     * @returns {Promise<void>}
     */
    // @instanceOnly()
    async syncData(): Promise<void> {
        console.log('Syncing data...');
    }
}
