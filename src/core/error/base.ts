/**
 * Class to represent a Matrix Type error.
 */
export class MatrixError extends Error {
    /**
     * Contructor for a Matrix Type error.
     * @param {string} name    Name of the error.
     * @param {string} message Message of the error.
     */
    constructor(public name: string, public message: string) {
        super(`${name}: ${message}`);
    }
}

/**
 * An invalid type format.
 */
export class InvalidTypeFormat extends MatrixError {
    /**
     * Constructor for an invalid type format.
     * @param {string} typeName The type name.
     */
    constructor(typeName: string) {
        super(
            'InvalidTypeFormat',
            `The type '${typeName}' must be in 'collectionName.TypeName' format`,
        );
    }
}

/**
 * A Type not found error.
 */
export class TypeNotFound extends MatrixError {
    /**
     * Constructor for a type not found error.
     * @param {string}     typeName   The name of the type.
     */
    constructor(public typeName: string) {
        super('TypeNotFound', `The type '${typeName}' was not found.`);
    }
}
