import { Collection } from './collection';

/**
 * Matrix instance.
 */
export class Matrix {
    /**
     * Contructor for a Matrix instance.
     * @param {Collection[]} collections List of the collections.
     */
    constructor(public collections: Collection[]) {
        // Set the matrix instance for each collection.
        this.collections.map((collection) => collection.setMatrix(this));
    }
}
