import { FieldData } from './field';

/**
 * The most basic data representation of a type.
 */
export type MatrixBaseTypeData = Record<string, unknown>;

/**
 * The serialized version of the base type data.
 */
export type SerializedMatrixBaseTypeData = SerializeFields<MatrixBaseTypeData>;

/**
 * Represent a type as serialized data.
 *
 * This means that each field is a FieldData object.
 */
export type SerializeFields<
    T extends MatrixBaseTypeData = MatrixBaseTypeData
> = {
    [K in keyof T]: FieldData<T[K]>;
};

/**
 * Serialize Data.
 *
 * This will return data as a serialized version of the data.
 * This includes metadata, such as id and type.
 */
export interface SerializeData<
    T extends MatrixBaseTypeData = MatrixBaseTypeData
> {
    id: string;
    type: string;
    data: SerializeFields<T>;
}
