import { compile } from 'json-schema-to-typescript';
import { JSONSchema4 } from 'json-schema';
import { readFileSync, writeFileSync } from 'fs';
import * as ora from 'ora';

const SCHEMA_PATH = 'schema.json';

const getSchema = async (): Promise<JSONSchema4> => {
    return JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
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
    const type = await compile(removeOptional(await getSchema()), 'Type');
    writeFileSync('./scripts/common/generatedTypes.ts', `${type}`);
    writeFileSync('./src/core/type/generatedTypes.ts', `${type}`);
    orb.succeed('Generated Types');
};

makeType();
