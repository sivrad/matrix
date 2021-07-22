import { Matrix } from '../src';
import { MockDriver } from './testUtil/';
import { deepStrictEqual, ok, strictEqual } from 'assert';
import { TypeNotFound } from '../src/core/error';

const mkMtx = () => {
    const driver = new MockDriver();
    return new Matrix(driver);
};

describe('Matrix Core', async () => {
    it('Get all the types.', () => {
        const mtx = mkMtx();

        const types = mtx.getTypes(),
            keys = Object.keys(types);

        ok(keys.includes('std'));

        deepStrictEqual(
            Object.values(types.std).map((type) => type.getName()),
            ['Entity', 'Organism', 'Organization', 'Person', 'Thing', 'Time'],
        );
    });

    it('Get a type.', () => {
        const mtx = mkMtx();

        const type = mtx.getType('std.Person');
        strictEqual(type.getName(), 'Person');
        strictEqual(type.getType(), 'std.Person');
    });

    it('Get a non-existant type.', () => {
        const mtx = mkMtx();
        let error;
        try {
            mtx.getType('something.Invalid');
        } catch (e) {
            error = e;
        }
        ok(error, `'getType' with an invalid type did not throw an error.`);
        ok(
            error instanceof TypeNotFound,
            `An 'TypeNotFound' was not thrown with 'getType'`,
        );
        strictEqual(error.name, 'TypeNotFound');
        strictEqual(
            error.message,
            `The type 'something.Invalid' was not found.`,
        );
    });

    it('Return the driver', () => {
        const mtx = mkMtx();

        const driver = mtx.getDriver();
        ok(
            driver instanceof MockDriver,
            "The incorrect driver was returned with 'getDriver'",
        );
    });

    // it('Generate a Type Hierarchy', () => {
    //     const mtx = mkMtx();

    //     const tree = mtx.generateTypeHierarchy();
    // });
});
