import { MatrixBaseType } from './matrixBaseType';
import { Driver } from './driver';
import { TypeNotFound } from './errors';
import { MatrixClassArray, TreeNode } from './type';
import { Thing } from '../types/std';

/**
 * Matrix instance.
 */
export class Matrix {
    private static types = new Map<string, typeof MatrixBaseType>();
    private static typeRelations = new Map<string, string[]>();

    /**
     * Contructor for a Matrix instance.
     * @param {Driver} driver The driver instance.
     */
    constructor(private driver: Driver) {
        for (const type of Matrix.types.values()) {
            // @ts-expect-error This is the only time 'setMatrix' is called.
            type.setMatrix(this);
        }
    }

    /**
     * Add a type.
     * @param {MatrixBaseType} type The type to add.
     */
    private static addType(type: typeof MatrixBaseType): void {
        this.types.set(type.getType(), type);
        const parent = type.getParent();
        if (!parent) return;
        const parentType = parent.getType();
        if (!this.typeRelations.has(parentType))
            this.typeRelations.set(parentType, []);
        this.typeRelations.get(parentType)?.push(type.getType());
    }

    /**
     * Get the child types of a type.
     * @param {string} type The type to get the children of.
     * @returns {typeof MatrixBaseType[]} The children types.
     */
    getChildTypes(type: string): typeof MatrixBaseType[] {
        const children = Matrix.typeRelations.get(type);
        if (!children) return [];
        return children.map(this.getType);
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

    /**
     * Generate the Matrix Library Type Hierarchy.
     *
     * This returns a Tree Type.
     * @returns {TreeNode} The Root tree node.
     */
    generateTypeHierarchy(): TreeNode {
        const base = Thing;
        const rec = (type: typeof MatrixBaseType): TreeNode => {
            const children: TreeNode[] = [];
            for (const child of type.getDirectChildren()) {
                children.push(rec(child));
            }
            return {
                type,
                children,
            };
        };
        return rec(base);
    }
}
