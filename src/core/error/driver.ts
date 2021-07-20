import { MatrixError } from './base';

/**
 * Class to represent a driver error.
 */
export class DriverError extends MatrixError {
    /**
     * Constructor for a Driver Error.
     * @param {string} name    The name of the error.
     * @param {string} message The message of the error.
     */
    constructor(name: string, message: string) {
        super(name, message);
    }
}

/**
 * Class to represent an unsupported driver method.
 */
export class UnsupportedDriverMethod extends DriverError {
    /**
     * Constructor for an unsupported driver method.
     * @param {string}    methodName The method name that is not supported.
     * @param {unknown[]} _          The unused args from the method.
     */
    constructor(methodName: string, ..._: unknown[]) {
        super(
            'UnsupportedDriverMethod',
            `The method '${methodName}' is not supported for the Driver.`,
        );
    }
}

/**
 * Constructor for an unknown driver error.
 */
export class UnknownDriverError extends DriverError {
    /**
     * Constructor for an unknown driver error.
     */
    constructor() {
        super(
            'UnknownError',
            'An unknown error has occured. Please check logs & report.',
        );
    }
}

/**
 * Represent an instance not found.
 */
export class InstanceNotFound extends DriverError {
    /**
     * Constructor for an instance not found error.
     * @param {string} typeName The type name.
     * @param {string} id       The Id of the type.
     */
    constructor(public typeName: string, public id: string) {
        super(
            'InstanceNotFound',
            `The type '${typeName}' with id '${id}' does not exist`,
        );
    }
}
