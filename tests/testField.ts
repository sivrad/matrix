import { deepStrictEqual, strictEqual } from 'assert';
import { Field, FieldData } from '../src';
import { expectError } from './testUtil/';
import { FieldDataNotFound } from '../src/core/error';

const mkField = () =>
    new Field('foo', {
        defaultValue: null,
        description: 'My foo.',
        example: 'example foo',
        flags: [],
        label: 'Foo',
        type: 'string | null',
    });

const mkFieldWithValue = (value: FieldData): Field => {
    const field = mkField();
    injectValue(field, value);
    return field;
};

const injectValue = (field: Field, value: FieldData): void => {
    // @ts-expect-error This hack will set our value.
    field.value = value;
};

const extractValue = (field: Field): FieldData => {
    // @ts-expect-error This hack will get us our value.
    return field.value;
};

describe('Field', () => {
    it('Correct field information', () => {
        const field = mkField();

        strictEqual(field.getName(), 'foo');
        strictEqual(field.getLabel(), 'Foo');
        strictEqual(field.getDescription(), 'My foo.');
        strictEqual(field.getExample(), 'example foo');
        strictEqual(field.getDefaultValue(), null);
        strictEqual(field.getType(), 'string | null');
        deepStrictEqual(field.getFlags(), []);
    });

    it('Correct empty field infromation', () => {
        const field = mkField();

        deepStrictEqual(extractValue(field), {
            values: {},
        });
    });

    it('Set current field value', () => {
        const field = mkField();

        field.setValue('bar', 'MY_EVENT');
        const value = extractValue(field);

        deepStrictEqual(value, {
            current: value.current as string,
            values: {
                [value.current as string]: {
                    value: 'bar',
                    event: 'MY_EVENT',
                },
            },
        });
    });

    it('Get data points', () => {
        const field = mkFieldWithValue({
            current: '1625954756',
            values: {
                '1625954756': {
                    value: 'barz',
                    event: 'EVENTO',
                },
            },
        });

        deepStrictEqual(field.getDataPoint(1625954756), {
            value: 'barz',
            event: 'EVENTO',
        });
    });

    it("Get 'lastUpdated' from empty field", () => {
        const field = mkField();

        expectError(
            FieldDataNotFound,
            'FieldDataNotFound',
            "No data was found for field 'foo'.",
            () => {
                field.getUpdatedAt();
            },
        );
    });
});

//     it('Correct current data', () => {
//         const field = mkField();

//         deepStrictEqual(field.getCurrentData(), {
//             value: 'bar',
//         });
//         strictEqual(field.getCurrentValue(), 'bar');
//     });

//     it('Sets & retrive data at a time', () => {
//         const field = mkField();
//         field.setDataAt('1625954756', 'baz');
//         const resp = field.getDataAt('1625954756');
//         strictEqual(resp.value, 'baz');
//     });

//     it('Retrive data from a non-existant time', () => {
//         const field = mkField();
//         let error;
//         try {
//             field.getDataAt('-1');
//         } catch (e) {
//             error = e;
//         }
//         ok(error, `'getDataAt' did not throw an error of a missing time.`);
//         ok(
//             error instanceof FieldValueNotFound,
//             `An 'FieldValueNotFound' was not thrown with 'getDataAt'`,
//         );
//         strictEqual(error.name, 'FieldValueNotFound');
//         strictEqual(
//             error.message,
//             `A value for field 'foo' at time '-1' was not found.`,
//         );
//     });

//     it('Set values for the entire field', () => {
//         const field = mkField();
//         field.setValues({
//             '1625954756': {
//                 value: 'hi',
//             },
//             '1625954997': {
//                 value: 'hello',
//             },
//         });
//         deepStrictEqual(field.getDataAt('1625954756'), { value: 'hi' });
//         deepStrictEqual(field.getDataAt('1625954997'), { value: 'hello' });
//     });

//     it('Set the current data', () => {
//         const field = mkField();
//         field.setCurrentData('1625954756', 'baz');
//         deepStrictEqual(field.getCurrentData(), {
//             value: 'baz',
//         });
//         field.setCurrent('1625954997');
//         deepStrictEqual(field.getUpdatedAt(), new Date(1625954997 * 1000));
//     });

//     it('Serializes correctly', () => {
//         const field = mkField();

//         deepStrictEqual(field.serialize(), {
//             current: '1625954158',
//             values: {
//                 '1625954158': {
//                     value: 'bar',
//                 },
//             },
//         });
//     });
// });

// describe('Static Field', () => {
//     it("Return true for 'isStatic'", () => {
//         const field = new FieldStatic('foo', 'bar');
//         strictEqual(field.isStatic(), true);
//     });
// });
