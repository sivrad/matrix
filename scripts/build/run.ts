// Script to build the package.
import { build } from './build';
import { MatrixScriptError } from '../common/error';
import { success, error } from '../common/util';

const run = async () => {
    try {
        await build();
        success('Library Built');
    } catch (e) {
        if (e instanceof MatrixScriptError) {
            error(e);
        } else {
            throw e;
        }
    }
};

run();
