import { FieldValueNotFound } from './errors';
import { FieldObject, FieldObjectValue } from './type';

/**
 * A field object.
 */
export class Field {
    /**
     * Constructor for a field.
     * @param {string}      name        The name of the field.
     * @param {FieldObject} fieldObject The serialized field object.
     */
    constructor(private name: string, private fieldObject: FieldObject) {}

    /**
     * If the value is defined.
     * @function isDefined
     * @memberof Field
     * @returns {boolean} Returns `true` if it is defined.
     */
    isDefined(): boolean {
        // @ts-ignore TODO: fix this.
        return this.fieldObject.values[this.fieldObject.current] != {};
    }

    /**
     * Get the name of the field.
     * @function getName
     * @memberof Field
     * @returns {string} The name of the field.
     */
    getName(): string {
        return this.name;
    }

    /**
     * Serialize the field.
     * @function serialize
     * @memberof Field
     * @returns {FieldObject} The field object.
     */
    serialize(): FieldObject {
        return this.fieldObject;
    }

    /**
     * Set data at a timestamp.
     * @function setDataAt
     * @memberof Field
     * @param {string}  timestamp The timestamp to set to.
     * @param {unknown} value     The value to set to.
     */
    setDataAt(timestamp: string, value: unknown): void {
        this.fieldObject.values[timestamp] = {
            value: value,
        };
    }
    /**
     * Set the values for the field.
     * @param {Record<string, FieldObjectValue>} values The Values to set.
     */
    setValues(values: Record<string, FieldObjectValue>): void {
        this.fieldObject.values = values;
    }

    /**
     * Set the current data.
     * @function setCurrentData
     * @memberof Field
     * @param {string}  timestamp The timestamp to set to.
     * @param {unknown} value     The value of the data.
     */
    setCurrentData(timestamp: string, value: unknown): void {
        this.fieldObject.current = timestamp;
        this.setDataAt(timestamp, value);
    }

    /**
     * Get data at a timestamp.
     * @function getDataAt
     * @memberof Field
     * @param   {string | number} timestamp The timestamp as a string or number.
     * @returns {FieldObjectValue} The object data at the time.
     */
    getDataAt(timestamp: string | number): FieldObjectValue {
        timestamp = timestamp.toString();
        if (Object.keys(this.fieldObject.values).indexOf(timestamp) == -1)
            throw new FieldValueNotFound(this, timestamp);
        return this.fieldObject.values[timestamp];
    }

    /**
     * Get the current data of the field.
     * @function getCurrentValue
     * @memberof Field
     * @returns {FieldObjectValue} The current data of the field.
     */
    getCurrentData(): FieldObjectValue {
        return this.fieldObject.values[this.fieldObject.current];
    }

    /**
     * Get the current value of the field.
     * @function getCurrentValue
     * @memberof Field
     * @returns {unknown} The current value of the field.
     */
    getCurrentValue(): unknown {
        return this.getCurrentData().value;
    }

    /**
     * Get the last updated field value.
     * @function getUpdatedAt
     * @memberof Field
     * @returns {Date} The last updated time.
     */
    getUpdatedAt(): Date {
        return new Date(parseInt(this.fieldObject.current) * 1000);
    }
}
