import { FieldDataNotFound } from './error';
import {
    FieldData,
    FieldDataPoint,
    FieldDataPointEvent,
    FieldStructure,
    FieldType,
    schema,
} from './type';
import { Flags, Values } from './constants';
import { getCurrentTimestamp } from './util';

/**
 * A field object.
 */
export class Field {
    private defaultValue: unknown;
    private description: string;
    private example: unknown;
    private flags: string[];
    private label: string;
    private staticValue: unknown;
    private type: FieldType;
    private value: FieldData = {
        values: {},
    };

    /**
     * Constructor for a field.
     * @param {string} name The name of the field.
     * @param {Field}  data The field schema.
     */
    constructor(private name: string, data: FieldStructure) {
        this.defaultValue = data.defaultValue;
        this.description = data.description;
        this.example = data.example;
        this.flags = data.flags;
        this.label = data.label;
        this.staticValue = data.staticValue;
        this.type = data.type;
        // Set the value if static.
        if (this.isStatic())
            this.setValue(
                this.getStaticValue(),
                Values.SKIP_WRITE_ACCESS_CHECK,
            );
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
     * Get the example of the field.
     * @function getExample
     * @memberof Field
     * @returns {unknown} The example of the field.
     */
    getExample(): unknown {
        return this.example;
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
     * Get the static value of the field.
     * @function getStaticValue
     * @memberof Field
     * @returns {unknown} The static value of the field.
     */
    getStaticValue(): unknown {
        return this.staticValue;
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
        return !!this.staticValue;
    }

    /**
     * Returns if the field is required or not.
     * @function isRequired
     * @memberof Field
     * @returns {boolean} `true` if required, `false` if not.
     */
    isRequired(): boolean {
        return (
            this.defaultValue == null &&
            !this.type.includes('null') &&
            !this.isStatic()
        );
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
        return this.value.current != undefined;
    }

    /**
     * Get the structure of the field.
     * @function getStructure
     * @memberof Field
     * @returns {FieldData} The field object.
     */
    getStructure(): schema.Field {
        return {
            defaultValue: this.getDefaultValue() as schema.Field['defaultValue'],
            description: this.getDescription(),
            flags: this.getFlags() as schema.Field['flags'],
            label: this.getLabel(),
            type: this.getType(),
            example: this.getExample() as schema.Field['example'],
        };
    }

    /**
     * Serialize the field.
     * @returns {FieldData} The field's value.
     */
    public serialize(): FieldData | undefined {
        if (this.isStatic()) return;
        if (!this.isDefined()) return;
        return this.value;
    }

    /**
     * Set the value.
     * @function setValue
     * @memberof Field
     * @private
     * @param   {unknown}             value The value to set to.
     * @param   {FieldDataPointEvent} event (Optional) The event for the field.
     * @returns {number}                  The timestamp the value was set to.
     */
    public setValue(value: unknown, event?: FieldDataPointEvent): number {
        return this.setValueAt(getCurrentTimestamp(), value, event);
    }

    /**
     * Set the value of the field.
     * @function setValueAt
     * @memberof Field
     * @private
     * @param   {number}              timestamp A UNIX timestamp in seconds.
     * @param   {unknown}             value     The value to set to.
     * @param   {FieldDataPointEvent} event     (Optional) The event for the field.
     * @returns {number}                        The timestamp the value was set to.
     */
    setValueAt(
        timestamp: number,
        value: unknown,
        event?: FieldDataPointEvent,
    ): number {
        // Check if the value can be set.
        if (event != Values.SKIP_WRITE_ACCESS_CHECK)
            this.verifyFieldModifiability();
        // Check if the current value should be updated.
        if (!this.value.current || timestamp > parseInt(this.value.current))
            this.value.current = timestamp.toString();
        // Set the value at the time.
        this.value.values[timestamp.toString()] = {
            value,
            event,
        };
        return timestamp;
    }

    /**
     * Verify that the field is modifiability.
     * @function verifyFieldModifiability
     * @memberof Field
     * @private
     */
    private verifyFieldModifiability(): void {
        if (this.isStatic()) throw new Error('FIELD IS STATIC');
        if (this.hasFlag(Flags.READONLY)) throw new Error('FIELD IS READONLY');
    }

    /**
     * Get a data point in the field.
     * @function getDataPoint
     * @memberof Field
     * @param {number} timestamp (Optional) The timestamp to get the field value of.
     * @returns {FieldDataPoint} The data point for the field.
     */
    getDataPoint(timestamp?: number): FieldDataPoint {
        if (!this.isDefined()) throw Error('FIELD NOT DEFINED');
        if (!timestamp) timestamp = parseInt(this.value.current as string);
        return this.value.values[timestamp.toString()];
    }

    /**
     * Set the field data.
     * @function setData
     * @memberof Field
     * @param {FieldData} fieldData The field data.
     */
    public setData(fieldData: FieldData): void {
        this.value.current = fieldData.current;
        this.value.values = { ...fieldData.values, ...this.value.values };
    }
}
