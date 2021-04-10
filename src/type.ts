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
