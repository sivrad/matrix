import { Field } from '../';
import { MatrixError } from './base';

/**
 * The base error class for an error with a Field.
 */
export class FieldError extends MatrixError {
    /**
     * Constructor for a field error.
     * @param {string} name    The name of the error.
     * @param {string} message The message of the error.
     * @param {Field}  field   The field object.
     */
    constructor(name: string, message: string, public field: Field) {
        super(name, message);
    }
}

/**
 * A value at a certain time was not found for the field.
 */
export class FieldValueNotFound extends FieldError {
    /**
     * Constructor for a field value not found error.
     * @param {Field}  field     The field object.
     * @param {string} timestamp The timestamp for the field.
     */
    constructor(field: Field, timestamp: string) {
        super(
            'FieldValueNotFound',
            `A value for field '${field.getName()}' at time '${timestamp}' was not found.`,
            field,
        );
    }
}

/**
 * No data for a field was found.
 */
export class FieldDataNotFound extends FieldError {
    /**
     * Constructor for a field value not found error.
     * @param {Field}  field The field object.
     */
    constructor(field: Field) {
        super(
            'FieldDataNotFound',
            `No data was found for field '${field.getName()}'.`,
            field,
        );
    }
}

/**
 * In invalid field type error.
 */
export class InvalidFieldType extends FieldError {
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
     * @param {Field}                field The field type that was not matched.
     * @param {unknown}               value     The value trying to be set to the field.
     */
    constructor(field: Field, public value: unknown) {
        super(
            'InvalidFieldType',
            `'${value}' does not match the type '${field.getType()}'.${InvalidFieldType.getAdditionalInformation(
                field.getType(),
            )}`,
            field,
        );
    }
}
