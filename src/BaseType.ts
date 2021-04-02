export interface Field {
    type: string;
}

/**
 * Base class for the Matrix.
 */
export class MatrixBaseType {
    static classFields: Record<string, Field> = {
        base: {
            type: 'string',
        },
    };

    /**
     * Contructor for a base type.
     * @param {Record<string, unknown>} data Type data.
     */
    constructor(private data: unknown) {}

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
}
