import { success } from '../common/util';
import { SchemaLintingError } from './error';
import { lint } from './lint';

const run = async () => {
    try {
        await lint();
        success('Linted all types.');
    } catch (e) {
        if (e instanceof SchemaLintingError) {
            console.error(`${e.toString()}`);
            process.exit(1);
        } else {
            console.error('UNKNOWN ERROR. PLEASE REPORT.');
            throw e;
        }
    }
};

run();
