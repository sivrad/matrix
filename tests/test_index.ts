import { FaunaDBDriver, Matrix } from '../src';

const driver = new FaunaDBDriver('');
const mtx = new Matrix(driver);

console.log(mtx.getTypes());

// console.log(col);
// console.log(mtx);
