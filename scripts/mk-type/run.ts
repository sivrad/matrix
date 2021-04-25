import { TypeCreationError } from './error';
import { makeType } from './makeType';
import { success, error } from '../common/util';

const run = () => {
    try {
        success(`Type '${makeType(process.argv)}' was created.`);
    } catch (e) {
        if (e instanceof TypeCreationError) {
            error(e);
        } else {
            throw e;
        }
    }
};

run();
