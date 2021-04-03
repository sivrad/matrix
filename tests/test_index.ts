import { Matrix, MatrixBaseType, Collection } from '../src';
const col = new Collection('test', 'sdfs', 'sdfsdf', 'sdfsdf', [
    MatrixBaseType,
]);

new Matrix([col]);

const i = new MatrixBaseType({
    // @ts-ignore
    $id: 234324,
});

console.log(i.getId());

// console.log(col);
// console.log(mtx);
