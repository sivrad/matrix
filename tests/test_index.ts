import { Matrix, MatrixBaseType, Collection, Source } from '../src';

const pprint = (obj: unknown) => console.log(JSON.stringify(obj, null, 4));

const col = new Collection('test', 'sdfs', 'sdfsdf', 'sdfsdf', [
    MatrixBaseType,
]);

new Matrix([col], {
    primary: new Source(),
});

MatrixBaseType.get('23').then((r) => {
    console.log(r);
});

// console.log();

// console.log(col);
// console.log(mtx);
