import { MatrixBaseType } from '..';

/**
 * A Tree Node.
 *
 * This is used for generating a tree structure for types heiarchy.
 */
export interface TreeNode {
    type: typeof MatrixBaseType;
    children: TreeNode[];
}
