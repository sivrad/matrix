import { TYPE_FILES_PATH, MATRIX_SCHEMA_TYPE_URL } from '../common/constants';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { DuplicateType, InvalidTypeFormat, TypeNotGiven } from './error';
import { formatAsLabel } from '../common/util';

const createTypesDirectory = (path: string) => {
    if (!existsSync(path)) mkdirSync(path);
};

export const makeType = (args: string[]): string => {
    // Remove first two arguments.
    args.splice(0, 2);
    // Check for the existance of the type name.
    if (args.length == 0) throw new TypeNotGiven();
    // Get the type.
    const type = args[0];
    // Check the format.
    if (!new RegExp(/^[a-z]\S+\.[A-Z]+\S*/).test(type))
        throw new InvalidTypeFormat(type);
    const [collectionName, name] = type.split('.');
    const fileName = `${name}.json`,
        typesDirectory = `./${TYPE_FILES_PATH}/${collectionName}`,
        newTypePath = join(typesDirectory, fileName);
    // Check for duplicates
    if (existsSync(newTypePath)) throw new DuplicateType(name);
    // Create './types/' if not found
    createTypesDirectory(typesDirectory);
    // Create the object.
    const typeObject = {
        $schema: MATRIX_SCHEMA_TYPE_URL,
        name: name,
        label: formatAsLabel(name),
    };
    writeFileSync(newTypePath, JSON.stringify(typeObject, null, 4));
    return type;
};
