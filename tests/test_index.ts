import { JSONDBDriver, Matrix, types } from '../src';

const driver = new JSONDBDriver('tests/test_db.json', { formatFile: true });
new Matrix(driver);

const main = async () => {
    const me = new types.std.Person({
        surname: 'Koon',
    });
    console.log(me.getSpecies());

    // time.setMinTimestamp(32423);
    // await time.syncData();

    // console.log(col);
    // console.log(mtx);
};

main();
