import { Field } from './field';

/**
 * A Static Field.
 */
export class FieldStatic extends Field {
    /**
     * Constructor for the Static Field.
     * @param {string}  name Name of the field.
     * @param {unknown} value Value of the field.
     */
    constructor(name: string, value: unknown) {
        super(name, { current: '', values: { '': { value: value } } });
    }

    /**
     * Return if the field is static or not.
     * @returns {boolean} `true` if static, `false` if not.
     */
    isStatic(): boolean {
        return true;
    }
}
