import { MatrixScriptError } from '../common/error';

/**
 * Class to represent a type creation error.
 */
export class TypeCreationError extends MatrixScriptError {
    /**
     * Contructor for a type creation error.
     * @param {string} name    Name of the error.
     * @param {string} message Message of the error.
     */
    constructor(name: string, message: string) {
        super(name, message);
    }
}

/**
 * The type name was not given.
 */
export class TypeNotGiven extends TypeCreationError {
    /**
     * Constructor for a type not given error.
     */
    constructor() {
        super('TypeNotGiven', 'The type was not given.');
    }
}

/**
 * An invalid type name format.
 */
export class InvalidTypeFormat extends TypeCreationError {
    /**
     * Constructor for an invalid type format.
     * @param {string} type The invalid type format.
     */
    constructor(public type: string) {
        super(
            'InvalidTypeFormat',
            `The type '${type}' is not in the format 'collection.Type'`,
        );
    }
}

/**
 * Class to represent a duplicate type error.
 */
export class DuplicateType extends TypeCreationError {
    /**
     * Constructor for a duplicate type.
     * @param {string} typeName The name of the type.
     */
    constructor(public typeName: string) {
        super(
            'DuplicateType',
            `A type with the name '${typeName}' already exists`,
        );
    }
}
