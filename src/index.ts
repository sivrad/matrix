import { Matrix } from './core';
import * as types from './types';

// This adds the type to the Matrix class.
for (const collection of Object.values(types)) {
    for (const type of Object.values(collection)) {
        // @ts-expect-error This is the only time the 'addType' method is called.
        Matrix.addType(type);
    }
}
// Export the core classes.
export * from './core';
// Export all the types.
export * as types from './types';
