import { MatrixBaseType } from '../matrixBaseType';
import { MatrixError } from './base';

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
 * When a type does not have a Matrix instance assigned.
 */
export class NoMatrixInstance extends MatrixTypeError {
    /**
     * Constructor for a no matrix instance error.
     * @param {typeof MatrixBaseType} type The type.
     */
    constructor(type: typeof MatrixBaseType) {
        super(
            'NoMatrixInstance',
            `The type ${type.getType()} does not have an assigned Matrix instance.`,
            type,
        );
    }
}

/**
 * A type that was not created used as an instance.
 */
export class Uninstantiated extends MatrixTypeError {
    /**
     * Constructor for an uninstantiated error.
     * @param {typeof MatrixBaseType} type The type.
     */
    constructor(type: typeof MatrixBaseType) {
        super(
            'Uninstantiated',
            `An uninstantiated type '${type.getName()}' was used as an instance`,
            type,
        );
    }
}

/**
 * A type is an instance was tried to made an instance again.
 */
export class AlreadyInstantiated extends MatrixTypeError {
    /**
     * Constructor for an uninstantiated error.
     * @param {MatrixBaseType} instance The instancee.
     */
    constructor(instance: MatrixBaseType) {
        super(
            'AlreadyInstantiated',
            `The instance '${instance.getId()}' is already an instance.`,
            instance.getTypeClass(),
        );
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
