import { deepStrictEqual, ok, strictEqual } from 'assert';
import { Matrix, MatrixBaseType, SerializeData } from '../src';
import {
    AlreadyInstantiated,
    InvalidFields,
    MissingFields,
    NoMatrixInstance,
    Uninstantiated,
} from '../src/core/error';
import {
    expectError,
    MockDriver,
    MockType,
    MockTypeChild,
    MockTypeGrandchild,
    MockTypeFieldRequired,
} from './testUtil/';

describe('Matrix Base Type', () => {
    // Class tests.

    it('Has correct class information.', () => {
        strictEqual(MockType.getName(), 'MockType');
        strictEqual(MockType.getLabel(), 'Mock Type');
        strictEqual(MockType.getDescription(), 'A mock type.');
        strictEqual(MockType.getIcon(), 'URL');
        strictEqual(MockType.getCollection(), 'tst');
        deepStrictEqual(MockType.getFlags(), []);
    });

    it('Has correct fields.', () => {
        // Number of fields.
        const fields = MockType.getFields(),
            fieldNames = Object.keys(fields);

        strictEqual(fieldNames.length, 1, 'Number of fields is incorrect.');
        // Field name.
        const fieldName = fieldNames[0];

        strictEqual(fieldName, 'foo', "No 'foo' field.");
        // Field data.
        const field = fields[fieldName];

        strictEqual(field.label, 'Foo');
        strictEqual(field.description, 'My foo.');
        strictEqual(field.type, 'string | null');
        strictEqual(field.defaultValue, null);
        deepStrictEqual(field.flags, []);
    });

    it('Return the parent class.', () => {
        deepStrictEqual(MockType.getParent(), MatrixBaseType);
    });

    it('Return the Matrix Instance with no instance', async () => {
        await expectError(
            NoMatrixInstance,
            'NoMatrixInstance',
            "The type 'tst.MockType' does not have an assigned Matrix instance.",
            async () => {
                MockType.getMatrix();
            },
        );
    });

    it('Return Matrix Instance', () => {
        // @ts-expect-error This is private.
        Matrix.addType(MockType);
        const mtx = new Matrix(new MockDriver());
        deepStrictEqual(MockType.getMatrix(), mtx);
    });

    it('Return the schema', () => {
        deepStrictEqual(MockType.getSchema(), {
            name: 'MockType',
            label: 'Mock Type',
            description: 'A mock type.',
            icon: 'URL',
            flags: [],
            parent: 'mtx.Base',
            fieldValues: {},
            fields: {
                foo: {
                    defaultValue: null,
                    description: 'My foo.',
                    example: null,
                    flags: [],
                    label: 'Foo',
                    type: 'string | null',
                },
            },
        });
    });

    it('Return the structure', () => {
        const struct = MockType.getStructure();
        deepStrictEqual(struct, {
            name: 'MockType',
            label: 'Mock Type',
            description: 'A mock type.',
            icon: 'URL',
            flags: [],
            parent: 'mtx.Base',
            fieldValues: {},
            fields: {
                foo: {
                    defaultValue: null,
                    description: 'My foo.',
                    example: null,
                    flags: [],
                    label: 'Foo',
                    type: 'string | null',
                    owner: 'tst.MockType',
                },
            },
        });
    });

    it('Return children types.', () => {
        // @ts-expect-error This is private.
        Matrix.addType(MockTypeChild), Matrix.addType(MockTypeGrandchild);
        const children = MockType.getChildren();
        strictEqual(children.length, 2);
        strictEqual(children[0].getType(), 'tst.MockTypeChild');
        strictEqual(children[1].getType(), 'tst.MockTypeGrandchild');
    });

    it('Return direct children types.', () => {
        const directChildren = MockType.getDirectChildren();
        strictEqual(directChildren.length, 1);
        strictEqual(directChildren[0].getType(), 'tst.MockTypeChild');
    });

    it('Get the Type Driver', () => {
        deepStrictEqual(MockType.getDriver(), new MockDriver());
    });

    it('Get the MatrixBaseType class', () => {
        deepStrictEqual(new MatrixBaseType({}).getTypeClass(), MatrixBaseType);
    });

    it('Deserialize', () => {
        const data = {
            foo: {
                current: '1',
                values: {
                    '1': {
                        value: 'bar',
                    },
                },
            },
        };
        const instance = MockType.deserialize<MockType>('MY_ID', data);
        strictEqual(instance.getId(), 'MY_ID');
        strictEqual(instance.getFoo(), 'bar');
    });

    // Instance tests.

    it('Create instance with ID', () => {
        const instance = new MockType({ $id: 'MY_ID' });
        strictEqual(instance.getId(), 'MY_ID');
    });

    it('Has correct instance variables', () => {
        const instance = new MockType({});

        strictEqual(instance.getId(), undefined);
    });

    it('Handle invalid field', async () => {
        await expectError(
            InvalidFields,
            'InvalidFields',
            "The fields 'baz' are not valid for type 'MockType'",
            async () => {
                new MockType({
                    baz: '',
                });
            },
        );
    });

    it('Handle Missing Field', async () => {
        await expectError(
            MissingFields,
            'MissingFields',
            "The fields 'foo' were not provided for type 'MockTypeFieldRequired'",
            async () => {
                new MockTypeFieldRequired({});
            },
        );
    });

    it('Getter methods work', () => {
        const instance = new MockType({ $id: 'MY_ID' });
        strictEqual(instance.getId(), 'MY_ID');
        // deepStrictEqual(instance.getUpdatedAt(), new Date(-1 * 1000));
        strictEqual(instance.getReference(), 'tst.MockType@MY_ID');
    });

    it('Get the type class from instance', () => {
        const instance = new MockType({ $id: '' });
        deepStrictEqual(instance.getTypeClass(), MockType);
    });

    it('Set the ID', () => {
        const instance = new MockType({});
        strictEqual(instance.getId(), undefined);
        instance.setId('MY_ID');
        strictEqual(instance.getId(), 'MY_ID');
    });

    it('Set the ID of an instance', () => {
        const instance = new MockType({ $id: 'MY_ID' });
        let error;
        try {
            instance.setId('MY_ID');
        } catch (e) {
            error = e;
        }
        ok(error, "'setId' did not throw an error.");
        ok(
            error instanceof AlreadyInstantiated,
            "An 'AlreadyInstantiated' was not thrown with 'setId'",
        );
        strictEqual(error.name, 'AlreadyInstantiated');
        strictEqual(
            error.message,
            "The instance 'MY_ID' is already an instance.",
        );
    });

    it('Set field value', () => {
        const instance = new MockType({
            foo: 'bar',
        });
        instance.setFoo('baz');
        strictEqual(instance.getFoo(), 'baz');
    });

    // it('Get field value when none-set', () => {
    //     const instance = MockType.deserialize<MockType>('', {});
    //     strictEqual(instance.getFoo(), null);
    // });

    it('Is instance works', () => {
        strictEqual(new MockType({}).isInstance(), false);
        strictEqual(new MockType({ $id: 'MY_ID' }).isInstance(), true);
        const type = new MockType({});
        strictEqual(type.isInstance(), false);
        type.setId('MY_ID');
        strictEqual(type.isInstance(), true);
    });

    // it('Get the serialized data', () => {
    //     const instance = new MockType({ foo: 'bar' });
    //     const data = instance.serialize();
    //     deepStrictEqual(data, {
    //         foo: {
    //             current: data.foo.current,
    //             values: {
    //                 [data.foo.current]: {
    //                     value: 'bar',
    //                 },
    //             },
    //         },
    //     });
    // });

    it('Serialize', () => {
        const instance = new MockType({
            foo: 'bar',
        });
        const data = instance.serialize() as SerializeData;
        deepStrictEqual(data, {
            id: undefined,
            type: 'tst.MockType',
            data: {
                foo: {
                    current: data.data.foo.current,
                    values: {
                        [data.data.foo.current as string]: {
                            value: 'bar',
                            event: 'INTERNAL',
                        },
                    },
                },
            },
        });
    });

    it('Create an instance', async () => {
        const type = new MockType({
            foo: 'bar',
        });
        const instance = await type.createInstance();

        ok(instance.getId(), 'No ID was given for the instance.');
        strictEqual(instance.getFoo(), 'bar');
    });

    it('Sync Local with Remote Data', async () => {
        const instance = new MockType({ $id: '1' });
        await instance.sync();
        strictEqual(instance.getFoo(), 'bar');
    });

    it('Sync Remote with Local Data', async () => {
        const instance = new MockType({ $id: '2' });
        instance.setFoo('baz');
        await instance.sync();
        const driver = instance.getTypeClass().getDriver() as MockDriver;
        const field = driver.data['tst.MockType']['2'].foo;
        strictEqual(field.values[field.current as string].value, 'baz');
    });

    it('Sync on type throws error', async () => {
        const instance = new MockType({});
        await expectError(
            Uninstantiated,
            'Uninstantiated',
            "An uninstantiated type 'MockType' was used as an instance",
            async () => {
                await instance.sync();
            },
        );
    });

    // it('Return the data of an instance with constructor', () => {
    //     const instance = new MockType({
    //         foo: 'bar',
    //     });
    //     const data = instance.getData() as InstanceData;
    //     deepStrictEqual(data, {
    //         id: undefined,
    //         type: 'tst.MockType',
    //         data: {
    //             foo: {
    //                 current: data.data.foo.current,
    //                 values: {
    //                     [data.data.foo.current as string]: {
    //                         value: 'bar',
    //                         event: 'INTERNAL',
    //                     },
    //                 },
    //             },
    //         },
    //         updatedAt: parseInt(data.data.foo.current as string),
    //         createdAt: parseInt(data.data.foo.current as string),
    //     });
    // });
});
