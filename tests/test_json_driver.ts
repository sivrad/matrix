import { JSONDBDriver } from '../src';
import { step } from 'mocha-steps';
import { existsSync, rmSync } from 'fs';
import { ok } from 'assert';

const DB_FILE_PATH = 'tests/json_driver_test_db.json';

describe('JSON DB Driver', () => {
    let driver: JSONDBDriver;
    step('Driver creates JSON file.', () => {
        // Make sure the JSON file doesn't exist.
        if (existsSync(DB_FILE_PATH)) rmSync(DB_FILE_PATH);

        // Create the driver
        driver = new JSONDBDriver(DB_FILE_PATH);

        // Assert JSON file's existance.
        ok(existsSync(DB_FILE_PATH), 'The DB JSON file was not created.');
    });
    step('Driver handles non-existant instance', async () => {
        driver.getInstance('Person', '1234');
    });
});
