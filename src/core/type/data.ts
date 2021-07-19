import { schema } from '.';
import { FieldData, FieldStructure } from './field';

/**
 * The most basic data representation of a type.
 *
 * This is used for a type constructor.
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

export type ConstructorArguments<
    T extends MatrixBaseTypeData = MatrixBaseTypeData
> = T & {
    $id?: string;
    $skipDataValidation?: boolean;
};

/**
 * Type Structure.
 *
 * This is used for exporting a Type's structure to another media.
 */
export interface TypeStructure extends schema.Type {
    fields: Record<string, FieldStructure>;
}
