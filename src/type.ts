import { Source } from './source';

export interface Field {
    type: string;
    label: string;
    description: string;
    defaultValue: unknown;
    required: boolean;
}

export type SourcesObject = { primary: Source; [k: string]: Source };

/**
 * Includes the base types.
 */
export type MatrixBaseTypeData = Record<string, unknown>;

export type SerializedMatrixBaseTypeData = InternalData<MatrixBaseTypeData>;

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
 * Includes Metadata.
 */
export type IncludeMetaData<T extends MatrixBaseTypeData> = T & {
    $type: string;
    $updatedAt: number;
};

// All the source responses
export interface SourceResponce {
    meta?: {
        loadTime: number;
    };
    data?: Record<string, unknown>;
}

export interface SourceInstancesResponse<
    T extends MatrixBaseTypeData = MatrixBaseTypeData
> extends SourceResponce {
    data: Record<string, IncludeMetaData<InternalData<T>>>;
}

export interface SourceInstanceResponse<
    T extends MatrixBaseTypeData = MatrixBaseTypeData
> extends SourceResponce {
    data: IncludeMetaData<InternalData<T>>;
}
