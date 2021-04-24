import { MatrixBaseType } from './matrixBaseType';
import { Matrix } from './matrixInstance';
import { TypeNotFound } from './errors';

/**
 * Class to represent a Matrix collection.
 */
export class Collection {
    public _matrix: Matrix;
    public _typeMap = new Map<string, typeof MatrixBaseType>();
    public _initializedTypes = new Set<string>();

    /**
     * Constructor for a collection.
     * @param {string}                  _identifier  Identifier of the collection.
     * @param {string}                  _label       Label of the collection.
     * @param {string}                  _description Description of the collection.
     * @param {string}                  _icon        Icon of the collection.
     * @param {typeof MatrixBaseType[]} _types       Types in the collection.
     */
    constructor(
        public _identifier: string,
        public _label: string,
        public _description: string,
        public _icon: string,
        public _types: typeof MatrixBaseType[],
    ) {
        for (const type of this._types) {
            type._collection = this;
            this._typeMap.set(type.getName(), type);
        }
    }

    /**
     * Get the collection's identifier.
     * @returns {string} The collection identifier.
     */
    getIdentifier(): string {
        return this._identifier;
    }

    /**
     * Get the collection's label.
     * @returns {string} The collection label.
     */
    getLabel(): string {
        return this._label;
    }

    /**
     * Get the collection's description.
     * @returns {string} The collection description.
     */
    getDescription(): string {
        return this._description;
    }

    /**
     * Get the collection's icon.
     * @returns {string} The collection icon.
     */
    getIcon(): string {
        return this._icon;
    }

    /**
     * Get the Matrix instance.
     * @returns {Matrix} Matrix instance.
     */
    getMatrix(): Matrix {
        return this._matrix;
    }

    /**
     * Set the matrix instance.
     * @param {Matrix} matrix Matrix instance.
     */
    setMatrix(matrix: Matrix): void {
        this._matrix = matrix;
    }

    /**
     * Get a type.
     * @param {string} typeName Name of the type.
     * @returns {typeof MatrixBaseType} The type.
     */
    getType(typeName: string): typeof MatrixBaseType {
        const type = this._typeMap.get(typeName);
        if (!type) throw new TypeNotFound(this, typeName);
        return type;
    }
}
