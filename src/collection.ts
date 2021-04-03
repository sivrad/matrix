import { MatrixBaseType } from './matrixBaseType';
import { Matrix } from './Matrix';

/**
 * Class to represent a Matrix collection.
 */
export class Collection {
    private matrix: Matrix;

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
}
