import { compile } from 'json-schema-to-typescript';
import axios from 'axios';
import { JSONSchema4 } from 'json-schema';
import { writeFileSync } from 'fs';
import * as ora from 'ora';

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
    const orb = ora('Generating Types').start();
    const type = await compile(removeOptional(await getSchema('type')), 'Type');
    writeFileSync('./scripts/common/generated_types.ts', `${type}`);
    orb.succeed('Generated Types');
};

makeType();
