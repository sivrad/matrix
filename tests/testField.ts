import { Field } from '../src';
import { deepStrictEqual, ok, strictEqual } from 'assert';
import { FieldValueNotFound } from '../src/core/errors';
import { FieldStatic } from '../src/core/fieldStatic';

describe('Field', () => {
    const mkField = () =>
        new Field('foo', {
            current: '1625954158',
            values: {
                '1625954158': {
                    value: 'bar',
                },
            },
        });
    it('Correct field information', () => {
        const field = mkField();

        strictEqual(field.getName(), 'foo');
        deepStrictEqual(field.getUpdatedAt(), new Date(1625954158 * 1000));
        strictEqual(field.isDefined(), true);
        strictEqual(field.isStatic(), false);
    });

    it('Correct current data', () => {
        const field = mkField();

        deepStrictEqual(field.getCurrentData(), {
            value: 'bar',
        });
        strictEqual(field.getCurrentValue(), 'bar');
    });

    it('Sets & retrive data at a time', () => {
        const field = mkField();
        field.setDataAt('1625954756', 'baz');
        const resp = field.getDataAt('1625954756');
        strictEqual(resp.value, 'baz');
    });

    it('Retrive data from a non-existant time', () => {
        const field = mkField();
        let error;
        try {
            field.getDataAt('-1');
        } catch (e) {
            error = e;
        }
        ok(error, `'getDataAt' did not throw an error of a missing time.`);
        ok(
            error instanceof FieldValueNotFound,
            `An 'FieldValueNotFound' was not thrown with 'getDataAt'`,
        );
        strictEqual(error.name, 'FieldValueNotFound');
        strictEqual(
            error.message,
            `A value for field 'foo' at time '-1' was not found.`,
        );
    });

    it('Set values for the entire field', () => {
        const field = mkField();
        field.setValues({
            '1625954756': {
                value: 'hi',
            },
            '1625954997': {
                value: 'hello',
            },
        });
        deepStrictEqual(field.getDataAt('1625954756'), { value: 'hi' });
        deepStrictEqual(field.getDataAt('1625954997'), { value: 'hello' });
    });

    it('Set the current data', () => {
        const field = mkField();
        field.setCurrentData('1625954756', 'baz');
        deepStrictEqual(field.getCurrentData(), {
            value: 'baz',
        });
        field.setCurrent('1625954997');
        deepStrictEqual(field.getUpdatedAt(), new Date(1625954997 * 1000));
    });

    it('Serializes correctly', () => {
        const field = mkField();

        deepStrictEqual(field.serialize(), {
            current: '1625954158',
            values: {
                '1625954158': {
                    value: 'bar',
                },
            },
        });
    });
});

describe('Static Field', () => {
    it("Return true for 'isStatic'", () => {
        const field = new FieldStatic('foo', 'bar');
        strictEqual(field.isStatic(), true);
    });
});
