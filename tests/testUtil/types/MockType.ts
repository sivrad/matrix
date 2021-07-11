import {
    MatrixBaseType,
    MatrixBaseTypeData,
    FieldInterface,
} from '../../../src/core';

/**
 * Serialized Mock Type.
 */

export interface MockData extends MatrixBaseTypeData {
    /**
     * My Foo.
     */
    foo?: string | null;
}

/**
 * Matrix Type Mock Type.
 *
 * A mock type.
 */
export class MockType extends MatrixBaseType {
    static _classFields: Record<string, FieldInterface> = {
        foo: {
            type: 'string | null',
            label: 'Foo',
            description: 'My foo.',
            defaultValue: null,
            flags: [],
            required: false,
        },
    };
    static _fieldValues: Record<string, unknown> = {};
    static _classInformation = {
        collection: 'tst',
        name: 'MockType',
        label: 'Mock Type',
        description: 'A mock type.',
        icon: 'URL',
        flags: [],
    };

    /**
     * Constructor for the Mock Type.
     * @param {MockData | string} data Serialized data or instance ID.
     */
    constructor(data: MockData | string) {
        super(data);
    }

    /**
     * Get an instance of the type from the ID.
     * @param   {string} id The ID of the instance.
     * @returns {T}         The new instance of the type.
     */
    static async get<T extends MatrixBaseType = MockType>(
        id: string,
    ): Promise<T> {
        return await super.get<T>(id);
    }

    /**
     * Get all the instances of a type.
     * @returns {T[]}  All the new instances.
     */
    static async getAll<T extends MatrixBaseType = MockType>(): Promise<T[]> {
        return await super.getAll<T>();
    }

    /**
     * Get the class of the type.
     * @returns {T}  The type class.
     */
    getTypeClass<T = typeof MockType>(): T {
        return (MockType as unknown) as T;
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
