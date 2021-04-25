/**
 * The base class for a Matrix script error.
 */
export abstract class MatrixScriptError extends Error {
    /**
     * Constructor for a Matrix Script error.
     * @param {string} name    Name of the error.
     * @param {string} message Message of the error.
     */
    constructor(public name: string, public message: string) {
        super(`${name}: ${message}`);
    }
}
