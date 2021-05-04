import { capitalize, formatTable } from '../common/util';
import { Method } from './type';

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
    return formatTable(argTable);
};

export const valueToTypescript = (value: unknown): string => {
    if (typeof value == 'string') {
        return `'${value}'`;
    } else if (['number', 'boolean', 'undefined'].includes(typeof value)) {
        return `${value}`;
    } else {
        console.log(value);
        throw Error(`valueToTypescript: unknown type ${value}`);
    }
};
