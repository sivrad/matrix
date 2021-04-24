import { SCHEMA_FILES } from './constants';
import {
    TYPE_FILES_PATH,
    MATRIX_SCHEMA_COLLECTION_URL,
    MATRIX_SCHEMA_TYPE_URL,
} from '../common/constants';
import { FileType } from './type';
import axios from 'axios';
import Ajv from 'ajv';
import {
    InvalidJSONSchema,
    FileNotFound,
    InvalidFileFormat,
    InvalidJSONSyntax,
    NoInternetConnection,
} from './error';
import { existsSync, readFileSync } from 'fs';
import { getSyntaxErrorDetails } from './util';
import { getCollectionTypes } from '../common/util';

const ajv = new Ajv({
    allowUnionTypes: true,
});
let jsonSchemas: Record<string, unknown>[] = [];

const getSchemaURL = (type: FileType) =>
    ({
        collection: MATRIX_SCHEMA_COLLECTION_URL,
        type: MATRIX_SCHEMA_TYPE_URL,
    }[type]);

const getJSONSchemas = async () => {
    jsonSchemas = await Promise.all(SCHEMA_FILES.map(getRemoteSchema));
};

const getRemoteSchema = async (type: FileType) => {
    const url = getSchemaURL(type);
    try {
        return (await axios.get(url)).data;
    } catch (e) {
        if (e instanceof Error) {
            if (e.message.includes('getaddrinfo'))
                throw new NoInternetConnection();
            throw e;
        }
    }
};

const getSchema = (type: FileType) => jsonSchemas[SCHEMA_FILES.indexOf(type)];

const getTypeFromFilePath = (filePath: string): FileType => {
    if (filePath.includes('collection.json')) return 'collection';
    if (filePath.includes('.json')) return 'type';
    throw Error(`Unable to determine lint schema from '${filePath}'`);
};

const getFileContent = (filePath: string) => {
    const content = readFileSync(filePath, 'utf-8');
    try {
        return JSON.parse(content);
    } catch (e) {
        if (e instanceof SyntaxError) {
            const [reason, line, column] = getSyntaxErrorDetails(
                e.message,
                content,
            );
            throw new InvalidJSONSyntax(filePath, reason, line, column);
        } else {
            console.error('UNKNOWN ERROR: PLEASE REPORT');
            console.error(e);
            throw e;
        }
    }
};

const lintFile = (filePath: string): void => {
    const type = getTypeFromFilePath(filePath),
        data = getFileContent(filePath),
        schema = getSchema(type),
        validate = ajv.compile(schema);
    if (!validate(data)) throw new InvalidJSONSchema(filePath, validate.errors);
};

const checkFileExistance = (filePath: string) => {
    if (!existsSync(filePath)) throw new FileNotFound(filePath);
};

const checkFileType = (filePath: string) => {
    if (filePath.substr(filePath.length - 5) != '.json')
        throw new InvalidFileFormat(filePath, 'json');
};

const lintFiles = async () => {
    await getJSONSchemas();
    // // Check './types/'
    checkFileExistance(TYPE_FILES_PATH);
    // Get   './types/*'
    const collections = getCollectionTypes();
    // Check & Lint './types/*/*.json';
    for (const [collection, types] of Object.entries(collections)) {
        for (const type of types) {
            const path = `${TYPE_FILES_PATH}${collection}/${type}`;
            checkFileType(path);
            lintFile(path);
        }
    }
};

export const lint = async (): Promise<void> => {
    await lintFiles();
};
