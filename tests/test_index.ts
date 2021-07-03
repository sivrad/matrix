import { FaunaDBDriver, Matrix, types } from '../src';

const driver = new FaunaDBDriver('');
new Matrix(driver);

console.log(new types.space.Rocket('234').syncData());

// console.log(col);
// console.log(mtx);
