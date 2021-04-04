import { Matrix, MatrixBaseType, Collection } from '../src';

const col = new Collection('test', 'sdfs', 'sdfsdf', 'sdfsdf', [
    MatrixBaseType,
]);

const m = new Matrix([col]);

// const i = new MatrixBaseType({});

console.log(m.getCollection('test'));

// console.log(col);
// console.log(mtx);
