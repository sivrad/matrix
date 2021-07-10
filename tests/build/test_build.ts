import { build } from '../../scripts/build/build';
import { strict } from 'assert';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { TYPES_DIRECTORY } from '../../scripts/build/constants';
import { step } from 'mocha-steps';

const OUT_PATH = 'tests/build/out/';

const mkdirConditional = (dir: string) =>
    !existsSync(dir) ? mkdirSync(dir) : 0;

const createOutPath = () => {
    mkdirConditional(OUT_PATH);
    mkdirConditional(OUT_PATH + 'src/');
};

const copyFiles = () => {
    copyFileSync('', '');
};

const createTestSource = () => {
    createOutPath();
    copyFiles();
};

describe('Build Script', () => {
    step('Build the library without any errors.', async () => {
        createTestSource();
        await build('./', OUT_PATH);
    });
    step('Verify successful library creation.', () => {
        it('should successfully build the type library', async () => {
            strict.ok(
                existsSync(TYPES_DIRECTORY),
                "The 'types' directory in 'src' was not creates.",
            );
        });
    });
});
