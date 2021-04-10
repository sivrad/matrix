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
export interface MatrixBaseTypeData extends Record<string, unknown> {
    $id?: string;
}

/**
 * I have no idea how field sources (get a better name like citation idk) are going to work.
 * This might have to be an event.
 * Like hearing from someone or reading something online.
 * Ex: `Event(SaveSource(LearnDeffinition(ScanText(ReadWebsite()))))`.
 */
export interface FieldSource {
    name: string;
}

export interface FieldObjectValue {
    value: unknown;
    source?: string;
}

export interface FieldObject {
    current: string;
    sources?: {
        [k: string]: FieldSource;
    };
    values: {
        [k: string]: FieldObjectValue;
    };
}

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
    data: Record<string, IncludeMetaData<T>>;
}

export interface SourceInstanceResponse<
    T extends MatrixBaseTypeData = MatrixBaseTypeData
> extends SourceResponce {
    data: IncludeMetaData<T>;
}
