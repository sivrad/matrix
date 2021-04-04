import { MatrixBaseType } from './matrixBaseType';
import { Matrix } from './Matrix';

/**
 * Class to represent a Matrix collection.
 */
export class Collection {
    private matrix: Matrix;
    private typeMap = new Map<string, typeof MatrixBaseType>();

    /**
     * Constructor for a collection.
     * @param {string}                  identifier  Identifier of the collection.
     * @param {string}                  label       Label of the collection.
     * @param {string}                  description Description of the collection.
     * @param {string}                  image       Image of the collection.
     * @param {typeof MatrixBaseType[]} types       Image of the collection.
     */
    constructor(
        public identifier: string,
        public label: string,
        public description: string,
        public image: string,
        public types: typeof MatrixBaseType[],
    ) {
        for (const type of this.types) {
            // @ts-expect-error This sets the type's collection as well as keeps that property private.
            type.collection = this;
            this.typeMap.set(type.getName(), type);
        }
    }

    /**
     * Get the Matrix instance.
     * @returns {Matrix} Matrix instance.
     */
    getMatrix(): Matrix {
        return this.matrix;
    }

    /**
     * Set the matrix instance.
     * @param {Matrix} matrix Matrix instance.
     */
    setMatrix(matrix: Matrix): void {
        this.matrix = matrix;
    }

    /**
     * Get a type.
     * @param {string} typeName Name of the type.
     * @returns {typeof MatrixBaseType} The type.
     */
    getType(typeName: string): typeof MatrixBaseType {
        const type = this.typeMap.get(typeName);
        if (!type) throw new Error('type not found!!! MAKE INTO OWN ERROR');
        return type;
    }
}
