import { Collection } from './collection';
import { CollectionNotFound } from './errors';
import { MatrixBaseType } from './matrixBaseType';

/**
 * Matrix instance.
 */
export class Matrix {
    private collectionsMap = new Map<string, Collection>();

    /**
     * Contructor for a Matrix instance.
     * @param {Collection[]} collections List of the collections.
     */
    constructor(public collections: Collection[]) {
        // Set the matrix instance for each collection.
        for (const collection of collections) {
            collection.setMatrix(this);
            this.collectionsMap.set(collection.getIdentifier(), collection);
        }
    }

    /**
     * Get a collection.
     * @param {string} collectionIdentifier The identifier of the collection.
     * @returns {Collection} The collection identifier.
     */
    getCollection(collectionIdentifier: string): Collection {
        const collection = this.collectionsMap.get(collectionIdentifier);
        if (!collection) throw new CollectionNotFound(collectionIdentifier);
        return collection;
    }

    /**
     * Get a type.
     * @param {string} typeName The name of the type.
     * @returns {typeof MatrixBaseType} The type class.
     */
    getType(typeName: string): typeof MatrixBaseType {
        const [collectionIdentifier, type] = typeName.split('.');
        const collection = this.getCollection(collectionIdentifier);
        return collection.getType(type);
    }
}
