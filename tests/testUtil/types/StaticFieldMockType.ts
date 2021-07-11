import {
    MatrixBaseType,
    MatrixBaseTypeData,
    FieldInterface,
} from '../../../src/core';

/**
 * Serialized Static Field Mock.
 */

export interface StaticFieldMockData extends MatrixBaseTypeData {
    /**
     * My Foo.
     */
    foo: string;
}

/**
 * Matrix Type Mock Type.
 *
 * A mock type.
 */
export class StaticFieldMockType extends MatrixBaseType {
    static _classFields: Record<string, FieldInterface> = {
        foo: {
            type: 'string',
            label: 'Foo',
            description: 'My foo.',
            defaultValue: null,
            flags: [],
            required: true,
        },
    };
    static _fieldValues: Record<string, unknown> = {};
    static _classInformation = {
        collection: 'tst',
        name: 'StaticFieldMockType',
        label: 'Staticuired Field Mock Type',
        description: 'A mock type.',
        icon: 'URL',
        flags: [],
    };

    /**
     * Constructor for the Mock Type.
     * @param {MockData | string} data Serialized data or instance ID.
     */
    constructor(data: StaticFieldMockData | string) {
        super(data);
    }

    /**
     * Get an instance of the type from the ID.
     * @param   {string} id The ID of the instance.
     * @returns {T}         The new instance of the type.
     */
    static async get<T extends MatrixBaseType = StaticFieldMockType>(
        id: string,
    ): Promise<T> {
        return await super.get<T>(id);
    }

    /**
     * Get all the instances of a type.
     * @returns {T[]}  All the new instances.
     */
    static async getAll<
        T extends MatrixBaseType = StaticFieldMockType
    >(): Promise<T[]> {
        return await super.getAll<T>();
    }

    /**
     * Get the class of the type.
     * @returns {T}  The type class.
     */
    getTypeClass<T = typeof StaticFieldMockType>(): T {
        return (StaticFieldMockType as unknown) as T;
    }

    /**
     * Retrive the Foo field.
     * @returns {string | null}  Result.
     */
    getFoo(): string | null {
        return this.getField<string | null>('foo');
    }

    /**
     * Set the Foo field.
     * @param   {number | null} value The value to set.
     * @returns {void}
     */
    setFoo(value: string | null): void {
        this.setField('foo', value);
    }
}
