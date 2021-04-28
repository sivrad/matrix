import { Matrix } from './core';
import * as types from './types';

// This adds the type to the Matrix class.
for (const type of Object.values(types)) {
    // @ts-expect-error This is internal code.
    Matrix.addType(type);
}
// Export the core classes.
export * from './core';
// Export all the types.
export * from './types';
