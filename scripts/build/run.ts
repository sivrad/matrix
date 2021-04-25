// Script to build the package.
import { build } from './build';
import { MatrixScriptError } from '../common/error';
import { error } from '../common/util';
import * as ora from 'ora';

const run = async () => {
    const loader = ora('Building Library').start();
    try {
        await build();
        loader.succeed('Library Built');
    } catch (e) {
        loader.fail('Build Failed');
        if (e instanceof MatrixScriptError) {
            error(e);
        } else {
            throw e;
        }
    }
};

run();
