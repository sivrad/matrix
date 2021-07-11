import { Driver } from '../src';
import { step } from 'mocha-steps';
import { ok, strictEqual } from 'assert';
import { UnsupportedSourceMethod } from '../src/core/errors';

/**
 * Child Driver is used for testing the 'Driver' class.
 */
class ChildDriver extends Driver {}

describe('Base Driver', async () => {
    let driver: ChildDriver;
    step('Create a child class for the base driver', () => {
        driver = new ChildDriver();
    });
    step(
        'All methods should return Unsupported Driver Method Errors',
        async () => {
            const msg = (method: string) =>
                `'Driver' method '${method}' does not throw an 'UnsupporterDriverError'.`;

            const expectError = async (name: string, fn: () => any) => {
                let error;
                try {
                    await fn();
                } catch (e) {
                    error = e;
                }
                ok(error, `'${name}' did not throw an error.`);
                ok(
                    error instanceof UnsupportedSourceMethod,
                    `An 'UnsupportedSourceMethod' was not thrown with '${name}'`,
                );
                strictEqual(error.name, 'UnsupportedSourceMethod', msg('name'));
                strictEqual(
                    error.message,
                    `The method '${name}' is not supported for the Source.`,
                );
            };

            await expectError('createInstance', async () => {
                await driver.createInstance('', {});
            });
            await expectError('getInstance', async () => {
                await driver.getInstance('', '');
            });
            await expectError('getInstances', async () => {
                await driver.getInstances('');
            });
            await expectError('updateInstance', async () => {
                await driver.updateInstance('', '', {});
            });
            await expectError('initializeType', async () => {
                await driver.initializeType('');
            });
        },
    );
});
