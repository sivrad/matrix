import { FieldDataNotFound, FieldValueNotFound } from './error';
import { FieldData, FieldDataPoint, FieldType, schema } from './type';

/**
 * A field object.
 */
export class Field {
    private defaultValue: unknown;
    private description: string;
    private flags: string[];
    private label: string;
    private name: string;
    private type: FieldType;
    private value: FieldData = {
        values: {},
    };

    /**
     * Constructor for a field.
     * @param {string} name The name of the field.
     * @param {Field}  data The field schema.
     */
    constructor(name: string, data: schema.Field) {
        this.name = name;
        this.type = data.type;
    }

    /**
     * Get the default value of the field.
     * @function getDefaultValue
     * @memberof Field
     * @returns {unknown} The default value of the field.
     */
    getDefaultValue(): unknown {
        return this.defaultValue;
    }

    /**
     * Get the description of the field.
     * @function getDescription
     * @memberof Field
     * @returns {string} The description of the field.
     */
    getDescription(): string {
        return this.description;
    }

    /**
     * Get the flags of the field.
     * @function getFlags
     * @memberof Field
     * @returns {string[]} The flags of the field.
     */
    getFlags(): string[] {
        return this.flags;
    }

    /**
     * Get the label of the field.
     * @function getLabel
     * @memberof Field
     * @returns {string} The label of the field.
     */
    getLabel(): string {
        return this.label;
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
     * Get the type of the field.
     * @function getType
     * @memberof Field
     * @returns {FieldType} The type of the field.
     */
    getType(): FieldType {
        return this.type;
    }

    /**
     * Verify the existance of a flag.
     * @function hasFlag
     * @memberof Field
     * @param {string} flag The flag to check for.
     * @returns {boolean} Returns `true` if the field has the flag.
     */
    hasFlag(flag: string): boolean {
        return this.flags.includes(flag);
    }

    /**
     * If the value is defined.
     * @function isDefined
     * @memberof Field
     * @returns {boolean} Returns `true` if it is defined.
     */
    isDefined(): boolean {
        return this.value != undefined;
    }

    /**
     * Serialize the field.
     * @function serialize
     * @memberof Field
     * @returns {FieldData} The field object.
     */
    serialize(): schema.Field {
        return {
            defaultValue: this.getDefaultValue() as schema.Field['defaultValue'],
            description: this.getDescription(),
            flags: this.getFlags() as schema.Field['flags'],
            label: this.getLabel(),
            type: this.getType(),
        };
    }

    /**
     * Set data at a timestamp.
     * @function setDataAt
     * @memberof Field
     * @param {string}  timestamp The timestamp to set to.
     * @param {unknown} value     The value to set to.
     */
    setDataAt(timestamp: string, value: unknown): void {
        this.value.values[timestamp] = {
            value: value,
        };
    }

    /**
     * Set the values for the field.
     * @param   {Record<string, FieldObjectValue>} values The Values to set.
     * @returns {this}                                    The field instance.
     */
    setValues(values: Record<string, FieldDataPoint>): this {
        this.value.values = values;
        return this;
    }

    /**
     * Set the current value for the field.
     * @param   {string} current The current value key.
     * @returns {this}           The field instance.
     */
    setCurrent(current: string): this {
        this.value.current = current;
        return this;
    }

    /**
     * Set the current data.
     * @function setCurrentData
     * @memberof Field
     * @param {string}  timestamp The timestamp to set to.
     * @param {unknown} value     The value of the data.
     */
    setCurrentData(timestamp: string, value: unknown): void {
        this.value.current = timestamp;
        this.setDataAt(timestamp, value);
    }

    /**
     * Get data at a timestamp.
     * @function getDataAt
     * @memberof Field
     * @param   {string | number} timestamp The timestamp as a string or number.
     * @returns {FieldObjectValue} The object data at the time.
     */
    getDataAt(timestamp: string | number): FieldDataPoint {
        timestamp = timestamp.toString();
        if (Object.keys(this.value.values).indexOf(timestamp) == -1)
            throw new FieldValueNotFound(this, timestamp);
        return this.value.values[timestamp];
    }

    /**
     * Get the current data of the field.
     * @function getCurrentValue
     * @memberof Field
     * @returns {FieldObjectValue} The current data of the field.
     */
    getCurrentData(): FieldDataPoint {
        if (this.value.current == undefined) throw new FieldDataNotFound(this);
        return this.value.values[this.value.current];
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
        if (this.value.current == undefined) throw new FieldDataNotFound(this);
        return new Date(parseInt(this.value.current) * 1000);
    }

    /**
     * Return if the field is static or not.
     * @returns {boolean} `true` if static, `false` if not.
     */
    isStatic(): boolean {
        return false;
    }
}
