import { ok, strictEqual } from 'assert';
import { MatrixError } from '../../src/core/error';

export const expectError = (
    // eslint-disable-next-line @typescript-eslint/ban-types
    errorClass: Function,
    name: string,
    message: string,
    func: () => void,
): void => {
    let error: MatrixError | null = null;
    try {
        func();
    } catch (e) {
        error = e;
    }
    ok(error, `No error thrown.`);
    ok(
        error instanceof errorClass,
        `Error thrown did not have class of '${name}'.`,
    );
    strictEqual(error.name, name);
    strictEqual(error.message, message);
};
