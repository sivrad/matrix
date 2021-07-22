import { deepStrictEqual, strictEqual } from 'assert';
import { Time } from '../src/types/std';

const mkTime = () =>
    new Time({
        timestamp: 1626014073,
    });

describe('Type: std.Time', () => {
    // it('Has correct class information', () => {
    //     const time = mkTime();
    //     strictEqual(time._id, undefined);
    //     strictEqual(time._lastUpdated, -1);
    //     deepStrictEqual(time._typeFields, {
    //         maxTimestamp: {
    //             defaultValue: null,
    //             description: 'The maximum time.',
    //             flags: [],
    //             label: 'Maximum Timestamp',
    //             required: false,
    //             type: 'number | null',
    //         },
    //         minTimestamp: {
    //             defaultValue: null,
    //             description: 'The minimum time.',
    //             flags: [],
    //             label: 'Minimum Timestamp',
    //             required: false,
    //             type: 'number | null',
    //         },
    //         precision: {
    //             defaultValue: null,
    //             description: 'Precision in seconds.',
    //             flags: [],
    //             label: 'Precision',
    //             required: false,
    //             type: 'number | null',
    //         },
    //         timestamp: {
    //             defaultValue: null,
    //             description: 'The UNIX timestamp.',
    //             flags: [],
    //             label: 'Timestamp',
    //             required: false,
    //             type: 'number | null',
    //         },
    //     });
    // });
    // it("Has correct '_fields'", () => {
    //     const time = mkTime();
    //     const fields = time._fields;
    //     deepStrictEqual(Object.keys(fields), [
    //         'timestamp',
    //         'precision',
    //         'minTimestamp',
    //         'maxTimestamp',
    //     ]);
    // });
});
