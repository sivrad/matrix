import { compile } from 'json-schema-to-typescript';
import axios from 'axios';
import { JSONSchema4 } from 'json-schema';
import { writeFileSync } from 'fs';

const SCHEMA_URL =
    'https://raw.githubusercontent.com/sivrad/matrix-schema/main/';

const getSchema = async (type: 'type' | 'collection'): Promise<JSONSchema4> => {
    return (await axios.get(`${SCHEMA_URL}${type}.json`)).data;
};

const removeOptional = (schema: any): JSONSchema4 => {
    schema.required = Object.keys(schema.properties || {}).filter(
        (key) => key != '$schema',
    );
    if (schema.definitions == undefined) return schema;
    Object.keys(schema.definitions).map((key) => {
        schema.definitions[key] = removeOptional(schema.definitions[key]);
    });
    return schema;
};

const makeType = async () => {
    console.log('Making types...');
    const type = await compile(removeOptional(await getSchema('type')), 'Type');
    const collection = await compile(
        removeOptional(await getSchema('collection')),
        'Collection',
    );
    writeFileSync('./src/generated_types.ts', `${type}\n${collection}`);
};

makeType();
