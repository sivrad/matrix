import { FaunaDBDriver, Matrix } from '../src';

const driver = new FaunaDBDriver('');
const mtx = new Matrix(driver);

console.log(mtx.getType('std.Thing'));

// console.log(col);
// console.log(mtx);
