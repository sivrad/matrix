import { deepStrictEqual } from 'assert';
import * as util from '../src/core/util';

describe('Util functions', () => {
    describe('Map Object', () => {
        it('Map over an object', () => {
            const obj = {
                foo: 2,
                bar: 4,
            };
            const result = util.mapObject(obj, (_, value) => value * 2);
            deepStrictEqual(result, {
                foo: 4,
                bar: 8,
            });
        });
    });
});
