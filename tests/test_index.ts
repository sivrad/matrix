import { JSONDBDriver, Matrix, types } from '../src';

const driver = new JSONDBDriver('tests/test_db.json', { formatFile: true });
new Matrix(driver);

const main = async () => {
    const res = await types.std.Person.getAll();
    console.log(res);

    // const me = new types.std.Person({
    //     surname: 'Koon',
    // });
    // console.log(me.getTypeClass().getStructure());
};

main();
