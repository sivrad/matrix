import { MatrixBaseType, MatrixBaseTypeData, schema } from '../../../src/core';

/**
 * Serialized Mock Type.
 */

export interface MockTypeData extends MatrixBaseTypeData {
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
    protected static fields: Record<string, schema.Field> = {
        foo: {
            type: 'string | null',
            label: 'Foo',
            description: 'My foo.',
            defaultValue: null,
            flags: [],
            example: null,
        },
    };
    static _fieldValues: Record<string, unknown> = {};
    protected static classInformation = {
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
    constructor(data: MockTypeData) {
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
        return this.getFieldValue<string | null>('foo');
    }

    /**
     * Set the Foo field.
     * @param   {number | null} value The value to set.
     * @returns {void}
     */
    setFoo(value: string | null): void {
        this.setFieldValue('foo', value);
    }
}
