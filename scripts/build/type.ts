import { Type, Field } from '../common/type';

export interface InternalField extends Field {
    required: boolean;
}
export interface InternalType extends Type {
    fields: { [k: string]: InternalField };
}

export interface Method {
    name: string;
    description: string;
    args: Record<
        string,
        {
            type: string;
            description: string;
        }
    >;
    returns: {
        type: string;
        description: string;
    };
    code: string;
    access?: 'public' | 'private' | 'protected';
    isAsync?: boolean;
    isStatic?: boolean;
    generic?: string;
}
