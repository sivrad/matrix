import { MatrixBaseType } from './matrixBaseType';

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
 * Class to represent a Matrix Type error.
 */
export class MatrixTypeError extends MatrixError {
    /**
     * Contructor for a Matrix Type Error.
     * @param {string}                name    Name of the error.
     * @param {string}                message Name of the error.
     * @param {typeof MatrixBaseType} type    The type with the error.
     */
    constructor(
        name: string,
        message: string,
        public type: typeof MatrixBaseType,
    ) {
        super(name, message);
    }
}
/**
 * A type without an assigned collection.
 */
export class NoAssignedCollection extends MatrixTypeError {
    /**
     * Contructor for a no assigned collection.
     * @param {typeof MatrixBaseType} type The class with no collection.
     */
    constructor(type: typeof MatrixBaseType) {
        super(
            'NoAssignedCollection',
            `The type '${type.getName()}' has no assigned collection.`,
            type,
        );
    }
}

/**
 * A field was no provided.
 */
export class MissingField extends MatrixTypeError {
    /**
     * Constructor for a missing field error.
     * @param {typeof MatrixBaseType} type             The type that the field was missing from.
     * @param {string}                missingFieldName The field that was missing.
     */
    constructor(type: typeof MatrixBaseType, public missingFieldName: string) {
        super(
            'MissingField',
            `The field '${missingFieldName}' was not provided for type '${type.getName()}'`,
            type,
        );
    }
}

/**
 * An invalid field for a type.
 */
export class InvalidField extends MatrixTypeError {
    /**
     * Contructor for an invalid field error.
     * @param {typeof MatrixBaseType} type             The type that does not have the field.
     * @param {string}                invalidFieldName The field that is invalid.
     */
    constructor(type: typeof MatrixBaseType, public invalidFieldName: string) {
        super(
            'InvalidField',
            `The field '${invalidFieldName}' is not valid for type '${type.getName()}'`,
            type,
        );
    }
}

/**
 * In invalid field type error.
 */
export class InvalidFieldType extends MatrixError {
    /**
     * Constructor for an invalid field type.
     * @param {string}                fieldType The field type that was not matched.
     * @param {unknown}               value     The value trying to be set to the field.
     */
    constructor(public fieldType: string, public value: unknown) {
        super(
            'InvalidFieldType',
            `'${value}' does not match the type '${fieldType}`,
        );
    }
}
