export interface Field {
    type: string;
    description: string;
    defaultValue?: unknown;
}

/**
 * Base class for the Matrix.
 */
export class MatrixBaseType {
    static classFields: Record<string, Field> = {
        id: {
            type: 'string',
            description: 'Identifier of the type',
            defaultValue: null,
        },
    };
    private fieldKeys: string[];

    /**
     * Contructor for a base type.
     * @param {Record<string, unknown>} data Type data.
     */
    constructor(private data: Record<string, unknown>) {
        this.fieldKeys = Object.keys(this.getTypeClass().getFields());
    }

    /**
     * Return the type class.
     * @returns {MatrixBaseType} Base thing class.
     */
    protected getTypeClass(): typeof MatrixBaseType {
        return MatrixBaseType;
    }

    /**wor
     * Get all the fields for the type.
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
     * Get a value.
     * @param {string} fieldName The name of the field.
     * @returns {unknown} The value of the field.
     */
    protected getField<T = unknown>(fieldName: string): T {
        // Verify valid field name.
        if (this.fieldKeys.indexOf(fieldName) == -1)
            throw new Error(`${fieldName} does not exist`);
        return this.data[fieldName] as T;
    }

    /**
     * Set a value.
     * @param {string}  fieldName The name of the field.
     * @param {unknown} value     The value of the field.
     */
    protected setField(fieldName: string, value: unknown): void {
        this.data[fieldName] = value;
    }
}
