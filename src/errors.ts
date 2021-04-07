import { Collection } from './collection';
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
 * Class to represent a source error.
 */
export class SourceError extends MatrixError {
    /**
     * Constructor for a Source Error.
     * @param {string} name    The name of the error.
     * @param {string} message The message of the error.
     */
    constructor(name: string, message: string) {
        super(name, message);
    }
}

/**
 * Class to represent an unsupported source method.
 */
export class UnsupportedSourceMethod extends SourceError {
    /**
     * Constructor for an unsupported source method.
     * @param {string} methodName The method name that is not supported.
     */
    constructor(methodName: string) {
        super(
            'UnsupportedSourceMethod',
            `The method '${methodName}' is not supported for the Source.`,
        );
    }
}

/**
 * Constructor for an unknown source error.
 */
export class UnknownSourceError extends SourceError {
    /**
     * Constructor for an unknown source error.
     */
    constructor() {
        super(
            'UnknownError',
            'An unknown error has occured. Please check logs & report.',
        );
    }
}

/**
 * Represent an instance not found.
 */
export class InstanceNotFound extends SourceError {
    /**
     * Constructor for an instance not found error.
     * @param {string} typeName The type name.
     * @param {string} id       The Id of the type.
     */
    constructor(public typeName: string, public id: string) {
        super(
            'InstanceNotFound',
            `The type '${typeName}' with id '${id}' does not exist`,
        );
    }
}

/**
 * A collection not found error.
 */
export class CollectionNotFound extends MatrixError {
    /**
     * Constructor for a collection not found error.
     * @param {string} collectionIdentifier The collection identifier that was not found.
     */
    constructor(public collectionIdentifier: string) {
        super(
            'CollectionNotFound',
            `The collection '${collectionIdentifier}' was not found.`,
        );
    }
}

/**
 * A source not found error.
 */
export class SourceNotFound extends MatrixError {
    /**
     * Constructor for a source not found error.
     * @param {string} sourceIdentifier The source identifier that was not found.
     */
    constructor(public sourceIdentifier: string) {
        super(
            'SourceNotFound',
            `The source '${sourceIdentifier}' was not found.`,
        );
    }
}

/**
 * Class to represent a Matrix collection error.
 */
export class MatrixCollectionError extends MatrixError {
    /**
     * Constructor for a Matrix collection error.
     * @param {string} name       Name of the error.
     * @param {string} message    Message of the error.
     * @param {string} collection The collection instance with the error.
     */
    constructor(name: string, message: string, public collection: Collection) {
        super(name, message);
    }
}

/**
 * A Type not found in a collection error.
 */
export class TypeNotFound extends MatrixCollectionError {
    /**
     * Constructor for a type not found error.
     * @param {Collection} collection The collection instance.
     * @param {string}     typeName   The name of the type.
     */
    constructor(collection: Collection, public typeName: string) {
        super(
            'TypeNotFound',
            `The type '${typeName}' was not found in collection '${collection.getIdentifier()}'`,
            collection,
        );
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
    // This will show a message if a type is mistyped.
    private static internalTypesTypos = {
        string: ['str'],
        boolean: ['bool'],
        number: ['numb', 'int', 'float'],
        null: ['none'],
    };

    /**
     * Display a message if a type is a typo.
     * @param   {string} type The given type.
     * @returns {string} The additional information message.
     */
    private static getAdditionalInformation(type: string): string {
        for (const [valid, invalids] of Object.entries(
            InvalidFieldType.internalTypesTypos,
        )) {
            if (invalids.includes(type))
                return `\nUse '${valid}', rather than '${type}'`;
        }
        return '';
    }

    /**
     * Constructor for an invalid field type.
     * @param {string}                fieldType The field type that was not matched.
     * @param {unknown}               value     The value trying to be set to the field.
     */
    constructor(public fieldType: string, public value: unknown) {
        super(
            'InvalidFieldType',
            `'${value}' does not match the type '${fieldType}'.${InvalidFieldType.getAdditionalInformation(
                fieldType,
            )}`,
        );
    }
}
