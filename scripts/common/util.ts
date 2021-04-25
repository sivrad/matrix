import { readdirSync } from 'fs';
import { TYPE_FILES_PATH } from './constants';
import { Data } from './type';
import { MatrixScriptError } from './error';
import * as colors from 'colors';

export const getRootOptions = (options: Data): any => {
    while (
        !!options.name && // Name is defined
        typeof options.name == 'function' && // Name is a function
        options.name() != 'matrix'
    ) {
        options = options.parent as Data;
    }
    return options;
};

export const getDirectory = (cmd: unknown): string =>
    getRootOptions(cmd as Data)._optionValues.dir || './';

export const capitalize = (text: string): string =>
    text[0].toUpperCase() + text.substr(1, text.length);

export const formatAsLabel = (text: string): string =>
    text.split('-').map(capitalize).join(' ');

export const getCollectionTypes = (): Record<string, string[]> => {
    const result: Record<string, string[]> = {};
    for (const collection of readdirSync(`./${TYPE_FILES_PATH}`)) {
        result[collection] = readdirSync(`./${TYPE_FILES_PATH}${collection}`);
    }
    return result;
};

/**
 * Ok this is a little overkill but it has to be perfect.
 * @param {string[][]} table The table.
 * @returns {string} The formatted table.
 */
export const formatTable = (table: string[][]): string => {
    if (table.length == 0) throw Error('Table must be filled.');
    const rowLength = table[0].length;
    let formattedTable = '';
    const maxWidths: number[] = new Array(rowLength).fill(-1);
    // Create a list of the max lengths for each column.
    for (let rowCounter = 0; rowCounter < table.length; rowCounter++) {
        const row = table[rowCounter];
        for (
            let columnCounter = 0;
            columnCounter < row.length;
            columnCounter++
        ) {
            const text = row[columnCounter];

            if (text.length > maxWidths[columnCounter])
                maxWidths[columnCounter] = text.length;
        }
    }
    for (let rowCounter = 0; rowCounter < table.length; rowCounter++) {
        const row = table[rowCounter];
        for (
            let columnCounter = 0;
            columnCounter < row.length;
            columnCounter++
        ) {
            const text = row[columnCounter];
            formattedTable += `${text}${' '.repeat(
                maxWidths[columnCounter] - text.length,
            )} `;
        }
        if (rowCounter != table.length - 1) formattedTable += '\n';
    }
    return formattedTable;
};

export const log = (
    type: 'success' | 'error',
    header: string,
    message: string,
): void => {
    const func = type == 'success' ? console.log : console.error,
        colorFunc = type == 'success' ? colors.green : colors.red,
        headerCharacter = type == 'success' ? '✔' : '✘';
    func(
        colorFunc(`${colors.bold(`${headerCharacter} ${header}`)}\n${message}`),
    );
};

export const success = (message: string): void =>
    log('success', 'Success', message);

export const error = (error: MatrixScriptError): void =>
    log('error', error.name, error.message);
