import { MatrixScriptError } from '../common/error';

/**
 * Class to represent a build error.
 */
export class BuildError extends MatrixScriptError {
    /**
     * Contructor for a build error.
     * @param {string} name    Name of the error.
     * @param {string} message Message of the error.
     */
    constructor(name: string, message: string) {
        super(name, message);
    }
}
