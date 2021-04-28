import { Driver } from './driver';
import { MatrixBaseType } from './matrixBaseType';

export interface Field {
    type: string;
    label: string;
    description: string;
    defaultValue: unknown;
    required: boolean;
}

export type SourcesObject = { primary: Driver; [k: string]: Driver };

/**
 * Includes the base types.
 */
export type MatrixBaseTypeData = Record<string, unknown>;

export type SerializedMatrixBaseTypeData = InternalData<MatrixBaseTypeData>;

export type MatrixClassArray = typeof MatrixBaseType[];

export interface ClassInformation {
    collection: string;
    name: string;
    label: string;
    description: string;
    icon: string;
}

/**
 * I have no idea how field sources (get a better name like citation idk) are going to work.
 * This might have to be an event.
 * Like hearing from someone or reading something online.
 * Ex: `Event(SaveSource(LearnDeffinition(ScanText(ReadWebsite()))))`.
 */
export interface FieldObjectValue<T = unknown> {
    value: T;
    event?: string;
}

export interface FieldObject<T = unknown> {
    current: string;
    values: {
        [k: string]: FieldObjectValue<T>;
    };
}

export type InternalData<T extends MatrixBaseTypeData = MatrixBaseTypeData> = {
    [K in keyof T]: FieldObject<T[K]>;
};

/**
 * Includes the metadata.
 */
export interface SerializedData<
    T extends MatrixBaseTypeData = MatrixBaseTypeData
> {
    $id: string;
    $type: string;
    data: InternalData<T>;
}

// The source responses.

export interface SourceInstancesResponse<
    T extends MatrixBaseTypeData = MatrixBaseTypeData
> {
    response: Record<string, SerializedData<T>>;
}

export interface SourceInstanceResponse<
    T extends MatrixBaseTypeData = MatrixBaseTypeData
> {
    response: SerializedData<T>;
}
