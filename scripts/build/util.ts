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
    method.args.map((arg) => `${arg.name}: ${arg.type}`).join(', ');

export const generateJSDoc = (method: Method): string => {
    const argTable =
        method.args.length == 0
            ? []
            : // Create an arg table for the parms.
              method.args.map((arg) => [
                  '     * @param',
                  `{${arg.type}}`,
                  arg.name,
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
