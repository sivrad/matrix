/**
 * Field Type.
 *
 * The Type for determining the type of a field.
 * Currently, the way to represent a type is with a 'string'.
 */
export type FieldType = string;

/**
 * Field Data Point Event.
 *
 * The event that caused the field data point to be created.
 * Like hearing from someone or reading something online.
 * Ex: `Event(SaveSource(LearnDeffinition(ScanText(ReadWebsite()))))`.
 */
export type FieldDataPointEvent = string;

/**
 * Field Information.
 *
 * This is used for creating a field in a schema.
 */
export interface FieldInformation {
    name: string;
    type: FieldType;
    label: string;
    description: string;
    defaultValue: unknown;
    flags: string[];
}

/**
 * Field Data.
 *
 * This is used for representing the data of a field.
 */
export interface FieldData<T = unknown> {
    current?: string;
    values: Record<string, FieldDataPoint<T>>;
}

/**
 * Field Data Point.
 *
 * This is used for representing a data point of a field.
 */
export interface FieldDataPoint<T = unknown> {
    value: T;
    event?: FieldDataPointEvent;
}
