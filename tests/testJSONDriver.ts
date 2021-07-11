import { JSONDBDriver } from '../src';
import { step } from 'mocha-steps';
import { existsSync, readFileSync, rmSync } from 'fs';
import { deepEqual, deepStrictEqual, ok, strictEqual } from 'assert';
import { InstanceNotFound, UnsupportedSourceMethod } from '../src/core/errors';

const DB_FILE_PATH = 'tests/jsonDriverTestDB.json';

describe('JSON DB Driver', () => {
    let driver: JSONDBDriver;

    step('Creates JSON file on initialization.', () => {
        // Make sure the JSON file doesn't exist.
        if (existsSync(DB_FILE_PATH)) rmSync(DB_FILE_PATH);

        // Create the driver
        driver = new JSONDBDriver(DB_FILE_PATH);

        // Assert JSON file's existance.
        ok(existsSync(DB_FILE_PATH), 'The DB JSON file was not created.');
    });

    step('Handles non-existant instance', async () => {
        const msg = (attr: string) =>
            `The 'InstanceNotFound' error has an invalid '${attr}' attribute.`;
        let error;
        try {
            await driver.getInstance('person', '1234');
        } catch (e) {
            error = e;
        }
        ok(error, "'getInstance' did not throw an error.");
        ok(
            error instanceof InstanceNotFound,
            "An 'InstanceNotFound' was not thrown with 'getInstance'",
        );
        strictEqual(error.name, 'InstanceNotFound', msg('name'));
        strictEqual(error.id, '1234', msg('id'));
        strictEqual(
            error.message,
            "The type 'person' with id '1234' does not exist",
            msg('message'),
        );
    });

    let instanceId: string;

    step('Create new instance', async () => {
        // Save mock instance data.
        const result = await driver.createInstance('person', {
            surname: {
                current: '1625949426',
                values: {
                    '1625949426': {
                        value: 'Smith',
                    },
                },
            },
        });
        instanceId = result.response.$id;
        // Validate request result.
        deepStrictEqual(
            result,
            {
                response: {
                    $id: instanceId,
                    $type: 'person',
                    data: {
                        surname: {
                            current: '1625949426',
                            values: {
                                '1625949426': {
                                    value: 'Smith',
                                },
                            },
                        },
                    },
                },
            },
            "'createInstance' data should return data given.",
        );
        // Validate file contents.
        deepStrictEqual(
            JSON.parse(readFileSync(DB_FILE_PATH, 'utf-8')),
            {
                person: {
                    [instanceId]: {
                        surname: {
                            current: '1625949426',
                            values: {
                                '1625949426': {
                                    value: 'Smith',
                                },
                            },
                        },
                    },
                },
            },
            'Invalid JSON DB file contents.',
        );
    });

    step('Retrieve instance data', async () => {
        const msg = (attr: string) =>
            `Data returned from 'getInstance' has invalid '${attr}'`;
        const response = (await driver.getInstance('person', instanceId))
            .response;
        strictEqual(response.$id, instanceId, msg('$id'));
        strictEqual(response.$type, 'person', msg('$type'));
        deepEqual(
            response.data,
            {
                surname: {
                    current: '1625949426',
                    values: {
                        '1625949426': {
                            value: 'Smith',
                        },
                    },
                },
            },
            msg('data'),
        );
    });

    step('Retrieve all instances of a type', async () => {
        const response = (await driver.getInstances('person')).response,
            keys = Object.keys(response);

        strictEqual(
            keys.length,
            1,
            "There should only be 1 instance of type 'person'",
        );

        strictEqual(
            keys[0],
            instanceId,
            "The ID correct ID for instance of type 'person' does not match.",
        );

        deepStrictEqual(
            response[instanceId],
            {
                $id: instanceId,
                $type: 'person',
                data: {
                    surname: {
                        current: '1625949426',
                        values: {
                            '1625949426': {
                                value: 'Smith',
                            },
                        },
                    },
                },
            },
            "The data returned by 'getInstances' is invalid.",
        );
    });

    step('Retrieve instances for non-existant type', async () => {
        const response = (await driver.getInstances('thing')).response;
        deepStrictEqual(response, {}, `An empty object should be returned.`);
    });

    step('Update an instance data', async () => {
        const response = (
            await driver.updateInstance('person', instanceId, {
                givenName: {
                    current: '1625949426',
                    values: {
                        '1625949426': {
                            value: 'John',
                        },
                    },
                },
            })
        ).response;
        strictEqual(response.$id, instanceId);
        strictEqual(response.$type, 'person');
        deepStrictEqual(response.data, {
            surname: {
                current: '1625949426',
                values: { '1625949426': { value: 'Smith' } },
            },
            givenName: {
                current: '1625949426',
                values: { '1625949426': { value: 'John' } },
            },
        });
    });

    step('Initialize Type is unimplemented', async () => {
        const msg = (attr: string) =>
            `The 'UnsupportedSourceMethod' error has an invalid '${attr}' attribute.`;
        let error;
        try {
            await driver.initializeType('person');
        } catch (e) {
            error = e;
        }
        ok(error, "'initializeType' did not throw an error.");
        ok(
            error instanceof UnsupportedSourceMethod,
            "An 'UnsupportedSourceMethod' was not thrown with 'initializeType'",
        );
        strictEqual(error.name, 'UnsupportedSourceMethod', msg('name'));
        strictEqual(
            error.message,
            "The method 'initializeType' is not supported for the Source.",
        );
    });
});
