import { MockType, MockTypeData } from './MockType';
import { MatrixBaseType, schema } from '../../../src/core';

/**
 * Serialized Req Field Mock.
 */

export interface MockTypeChildData extends MockTypeData {
    /**
     * My Foo.
     */
    foo2?: string;
}

/**
 * Matrix Type Mock Type.
 *
 * A mock type.
 */
export class MockTypeChild extends MockType {
    protected static fields: Record<string, schema.Field> = {
        foo: {
            type: 'string',
            label: 'Foo',
            description: 'My foo.',
            defaultValue: null,
            flags: [],
            example: null,
        },
    };
    static classInformation = {
        collection: 'tst',
        name: 'MockTypeChild',
        label: 'The child mock type',
        description: 'A child mock type.',
        icon: 'URL',
        flags: [],
    };

    /**
     * Constructor for the Mock Type.
     * @param {MockData} data Serialized data or instance ID.
     */
    constructor(data: MockTypeChildData) {
        super(data);
    }

    /**
     * Get an instance of the type from the ID.
     * @param   {string} id The ID of the instance.
     * @returns {T}         The new instance of the type.
     */
    static async get<T extends MatrixBaseType = MockTypeChild>(
        id: string,
    ): Promise<T> {
        return await super.get<T>(id);
    }

    /**
     * Get all the instances of a type.
     * @returns {T[]}  All the new instances.
     */
    static async getAll<T extends MatrixBaseType = MockTypeChild>(): Promise<
        T[]
    > {
        return await super.getAll<T>();
    }

    /**
     * Get the class of the type.
     * @returns {T}  The type class.
     */
    getTypeClass<T = typeof MockTypeChild>(): T {
        return (MockTypeChild as unknown) as T;
    }
}
