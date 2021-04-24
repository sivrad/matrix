import { Type, Field } from '../common/type';

export interface InternalField extends Field {
    required: boolean;
}
export interface InternalType extends Type {
    fields: { [k: string]: InternalField };
}
