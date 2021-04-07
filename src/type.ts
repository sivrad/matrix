import { Source } from './source';

export interface Field {
    type: string;
    label: string;
    description: string;
    defaultValue: unknown;
    required: boolean;
}

export type SourcesObject = { primary: Source; [k: string]: Source };
