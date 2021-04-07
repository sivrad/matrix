import { Collection } from './collection';
import { CollectionNotFound, SourceNotFound } from './errors';
import { MatrixBaseType } from './matrixBaseType';
import { ReadonlySource } from './source';
import { SourcesObject } from './type';

/**
 * Matrix instance.
 */
export class Matrix {
    private collectionsMap = new Map<string, Collection>();

    /**
     * Contructor for a Matrix instance.
     * @param {Collection[]}  collections List of the collections.
     * @param {SourcesObject} sources     List of the sources.
     */
    constructor(
        public collections: Collection[],
        private sources: SourcesObject,
    ) {
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
     * Get a source instance.
     * @param {string} identifier Source identifier.
     * @returns {Source} The source instance.
     */
    getSource(identifier: string): ReadonlySource {
        const source = this.sources[identifier];
        if (!source) throw new SourceNotFound(identifier);
        return source;
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
