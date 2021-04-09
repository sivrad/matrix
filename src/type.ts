import { Source } from './source';

export interface Field {
    type: string;
    label: string;
    description: string;
    defaultValue: unknown;
    required: boolean;
}

export type SourcesObject = { primary: Source; [k: string]: Source };

export interface SerializedMatrixBaseType extends Record<string, unknown> {
    $id?: string;
}

export interface SerializedType extends SerializedMatrixBaseType {
    $type: string;
    $updatedAt: number;
}

export interface SourceResponce {
    meta?: {
        updatedAt?: number;
    };
    data?: SerializedMatrixBaseType;
}
