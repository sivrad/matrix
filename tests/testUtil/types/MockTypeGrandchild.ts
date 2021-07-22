import { MatrixBaseType, schema } from '../../../src/core';
import { MockTypeChild, MockTypeChildData } from './MockTypeChild';

/**
 * Serialized Req Field Mock.
 */

export interface MockTypeGrandchildData extends MockTypeChildData {
    /**
     * My Foo.
     */
    foo3?: string;
}

/**
 * Matrix Type Mock Type.
 *
 * A mock type.
 */
export class MockTypeGrandchild extends MockTypeChild {
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
        name: 'MockTypeGrandchild',
        label: 'The Grandchild mock type',
        description: 'A Grandchild mock type.',
        icon: 'URL',
        flags: [],
    };

    /**
     * Constructor for the Mock Type.
     * @param {MockData} data Serialized data or instance ID.
     */
    constructor(data: MockTypeGrandchildData) {
        super(data);
    }

    /**
     * Get an instance of the type from the ID.
     * @param   {string} id The ID of the instance.
     * @returns {T}         The new instance of the type.
     */
    static async get<T extends MatrixBaseType = MockTypeGrandchild>(
        id: string,
    ): Promise<T> {
        return await super.get<T>(id);
    }

    /**
     * Get all the instances of a type.
     * @returns {T[]}  All the new instances.
     */
    static async getAll<
        T extends MatrixBaseType = MockTypeGrandchild
    >(): Promise<T[]> {
        return await super.getAll<T>();
    }

    /**
     * Get the class of the type.
     * @returns {T}  The type class.
     */
    getTypeClass<T = typeof MockTypeGrandchild>(): T {
        return (MockTypeGrandchild as unknown) as T;
    }
}
