// import { Collection } from './collection';
// import { CollectionNotFound } from './errors';
import { MatrixBaseType } from './matrixBaseType';
import { Driver } from './driver';

/**
 * Matrix instance.
 */
export class Matrix {
    private static types = new Map<string, typeof MatrixBaseType>();

    /**
     * Contructor for a Matrix instance.
     * @param {Driver} databaseAPI     List of the sources.
     */
    constructor(private databaseAPI: Driver) {
        // Set the matrix instance for each collection.
        // for (const collection of _collections) {
        //     collection.setMatrix(this);
        //     this._collectionsMap.set(collection.getIdentifier(), collection);
        // }
    }

    /**
     * Add a type.
     * @param {MatrixBaseType} type The type to add.
     */
    private static addType(type: typeof MatrixBaseType): void {
        this.types.set(type.getName(), type);
    }

    /**
     * Get a collection.
     * @param {string} collectionIdentifier The identifier of the collection.
     * @returns {Collection} The collection identifier.
     */
    // getCollection(collectionIdentifier: string): Collection {
    //     const collection = this._collectionsMap.get(collectionIdentifier);
    //     if (!collection) throw new CollectionNotFound(collectionIdentifier);
    //     return collection;
    // }

    /**
     * Get the driver.
     * @returns {Driver} The source instance.
     */
    getDriver(): Driver {
        return this.databaseAPI;
    }

    /**
     * Get a type.
     * @param {string} typeName The name of the type.
     * @returns {typeof MatrixBaseType} The type class.
     */
    // getType<T extends typeof MatrixBaseType>(typeName: string): T {
    //     const [collectionIdentifier, type] = typeName.split('.');
    //     const collection = this.getCollection(collectionIdentifier);
    //     return collection.getType(type) as T;
    // }
}
