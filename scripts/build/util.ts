import { capitalize, formatTable } from '../common/util';
import { IndexedTypes, InternalField, InternalType, Method } from './type';

/**
 * Parse a type name.
 * @param {string} typeName The type name in 'collectionName.TypeName' format.
 * @example
 * parseType("std.Time") // ["std", "Time"]
 * @returns {[string, string]} The collection name and type name.
 */
export const parseType = (typeName: string): [string, string] => {
    const typeParts = typeName.split('.');
    if (typeParts.length != 2) throw new Error(typeName);
    return typeParts as [string, string];
};

export const formatAsClassName = (name: string): string =>
    name
        .split('-')
        .map((str) => capitalize(str))
        .join('');

export const sanitizeType = (type: string): string =>
    type.includes('.') ? type.split('.')[1] : type;

export const generateMethodSignature = (method: Method): string =>
    Object.entries(method.args)
        .map(([argName, arg]) => `${argName}: ${arg.type}`)
        .join(', ');

export const generateJSDoc = (method: Method): string => {
    const args = Object.entries(method.args),
        argTable =
            args.length == 0
                ? []
                : // Create an arg table for the parms.
                  args.map(([argName, arg]) => [
                      '     * @param',
                      `{${arg.type}}`,
                      argName,
                      arg.description,
                  ]);
    // Add the returns to the table.
    argTable.push([
        '     * @returns',
        `{${method.returns.type}}`,
        '',
        method.returns.description,
    ]);
    if (method.depreciated) {
        argTable.push(['     * @deprecated', '', '', method.depreciated]);
    }
    return formatTable(argTable);
};

export const valueToTypescript = (value: unknown): string => {
    // Null value.
    if (value == null) return 'null';
    // String value.
    if (typeof value == 'string') return `'${value}'`;
    // Boolean, number, or undefined value.
    if (['number', 'boolean', 'undefined'].includes(typeof value))
        return `${value}`;
    // Unknown value.
    console.log(value);
    throw Error(`valueToTypescript: unknown type ${value}`);
};

export const flagsToArray = (array: string[]): string =>
    `[ ${array.map((item) => `'${item}'`).join(', ')} ]`;

export const hasFlag = (
    object: InternalType | InternalField,
    flag: string,
): boolean => object.flags.indexOf(flag as any) != -1;

export const canSetField = (field: InternalField): boolean => {
    if (hasFlag(field, 'readonly')) return false;
    return true;
};

export const getType = (
    types: IndexedTypes,
    typePath: string,
): InternalType => {
    const [collectionName, typeName] = parseType(typePath);
    return types[collectionName][typeName];
};

/**
 * This function returns the type schema if it contains a field.
 * @param   {IndexedTypes} types      All the types in the set.
 * @param   {string}       collection The collection name.
 * @param   {string}       type       The type.
 * @param   {string}       fieldName  The field name.
 * @returns {InternalType}            The type with the field.
 */
export const getTypeWithField = (
    types: IndexedTypes,
    collection: string,
    type: InternalType,
    fieldName: string,
): InternalType => {
    if (type.parent == null)
        throw Error('no schema with field: ' + fieldName + ' was found.');
    if (Object.keys(type.fields).indexOf(fieldName) != -1) return type;
    const typePath = type.parent.includes('.')
        ? type.parent
        : `${collection}.${type.parent}`;
    return getTypeWithField(
        types,
        collection,
        getType(types, typePath),
        fieldName,
    );
};

/**
 * Remove all the names of the args with "_"s.
 * @param {string[]} args The args.
 * @returns {string[]} The args with "_".
 */
export const stripArgsNames = (
    args: Record<string, { type: string; description: string }>,
): Record<string, { type: string; description: string }> => {
    const newArgs: Record<string, { type: string; description: string }> = {};
    let index = 1;
    for (const arg of Object.values(args)) {
        const newArgName = Array(index + 1).join('_');
        newArgs[newArgName] = arg;
        index++;
    }
    return newArgs;
};
