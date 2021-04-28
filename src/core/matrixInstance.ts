import { MatrixBaseType } from './matrixBaseType';
import { Driver } from './driver';
import { TypeNotFound } from './errors';
import { MatrixClassArray } from './type';

/**
 * Matrix instance.
 */
export class Matrix {
    private static types = new Map<string, typeof MatrixBaseType>();

    /**
     * Contructor for a Matrix instance.
     * @param {Driver} driver The driver instance.
     */
    constructor(private driver: Driver) {}

    /**
     * Add a type.
     * @param {MatrixBaseType} type The type to add.
     */
    private static addType(type: typeof MatrixBaseType): void {
        this.types.set(type.getType(), type);
    }

    /**
     * Get the driver.
     * @returns {Driver} The source instance.
     */
    getDriver(): Driver {
        return this.driver;
    }

    /**
     * Get a type.
     * @param {string} typeName The name of the type.
     * @returns {typeof MatrixBaseType} The type class.
     */
    getType<T extends typeof MatrixBaseType>(typeName: string): T {
        const typeClass = Matrix.types.get(typeName);
        if (!typeClass) throw new TypeNotFound(typeName);
        return typeClass as T;
    }

    /**
     * Return all the types.
     * @returns {MatrixClassArray} All the type classes.
     */
    getTypes(): Record<string, MatrixClassArray> {
        const allTypes: Record<string, MatrixClassArray> = {};
        for (const typeClass of Matrix.types.values()) {
            const collection = typeClass.getCollection();
            if (!allTypes[collection]) allTypes[collection] = [];
            allTypes[collection].push(typeClass);
        }
        return allTypes;
    }
}
