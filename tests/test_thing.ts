import { types } from '../src/';
import { strictEqual, deepStrictEqual } from 'assert';

describe('Thing Type', () => {
    const Thing = types.std.Thing;

    it('Has correct type information', () => {
        const msg = (attr: string) => `'Thing' Type has incorrect '${attr}'`;

        strictEqual(Thing.getName(), 'Thing', msg('name'));
        strictEqual(Thing.getLabel(), 'Thing', msg('label'));
        strictEqual(
            Thing.getDescription(),
            'Any thing than can exist.',
            msg('description'),
        );
        strictEqual(
            Thing.getIcon(),
            'https://static.thenounproject.com/png/6887-200.png',
            msg('icon'),
        );
    });

    it('Has correct fields', () => {
        const msg = (fieldName: string) =>
            `'start' Field has incorrect '${fieldName}'`;
        // Number of fields.
        const fields = Thing.getFields(),
            fieldNames = Object.keys(fields);

        strictEqual(fieldNames.length, 1, 'Number of fields is incorrect.');
        // Field name.
        const fieldName = fieldNames[0];

        strictEqual(fieldName, 'start', "No 'start' field.");
        // Field data.
        const field = fields[fieldName];

        strictEqual(field.label, 'Start', msg('label'));
        strictEqual(
            field.description,
            'The time when the thing started.',
            msg('description'),
        );
        strictEqual(field.type, 'Time | null', msg('type'));
        strictEqual(field.defaultValue, null, msg('defaultValue'));
        deepStrictEqual(field.flags, [], msg('flags'));
        strictEqual(field.required, false, msg('required'));
    });
});
