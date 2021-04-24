import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { TYPE_FILES_PATH } from '../common/constants';
import { formatAsLabel, getCollectionTypes } from '../common/util';
import {
    BUILT_IN_TYPES,
    COLLECTION_PACKAGE_PREFIX,
    TEMPLATES_PATH,
    TYPES_DIRECTORY,
} from './constants';
import { Exports, Imports } from './package';
import { InternalType, InternalField } from './type';
import { render } from 'ejs';
import { sanitizeType, generateMethodSignature, generateJSDoc } from './util';

const templates = new Map<string, string>();

const getParentInfo = (parent?: string): [string, string] => {
    // If no parent is given.
    if (!parent) return ['@sivrad/matrix', 'MatrixBaseType'];
    // If no '.'
    if (!parent.includes('.')) return [`.`, parent];
    // Remote package.
    const parentParts = parent.split('.');
    return [COLLECTION_PACKAGE_PREFIX + parentParts[0], parentParts[1]];
};

const isolateFieldTypes = (type: string): string[] => {
    type = type.replace(/ /g, '');
    return type.split('|').map((t) => t.replace(/\[\]/g, ''));
};

const importExternalFieldTypes = (schema: InternalType, imports: Imports) => {
    for (const [, field] of Object.entries(schema.fields)) {
        const types = isolateFieldTypes(field.type).filter(
            (type) => BUILT_IN_TYPES.indexOf(type) == -1 && type != schema.name,
        );
        for (const typeName of types) {
            const typeNameParts = typeName.split('.');
            const [pkg, type] =
                typeNameParts.length == 2
                    ? [
                          COLLECTION_PACKAGE_PREFIX + typeNameParts[0],
                          typeNameParts[1],
                      ]
                    : ['.', typeName];
            imports.add(pkg, type);
        }
    }
};

const getTemplate = (template: string): string => {
    if (!templates.has(template))
        templates.set(
            template,
            readFileSync(TEMPLATES_PATH + template + '.ejs', 'utf-8'),
        );
    return templates.get(template)!;
};

const renderTemplate = (template: string, args: Record<string, unknown>) =>
    render(getTemplate(template), args);

// const generateSchemaInterface = (schema: InternalType) => {
//     if (Object.keys(schema.fields || {}).length == 0) {
//         return `type ${schema.name} = MatrixBaseTypeData`;
//     }
//     return renderTemplate('typeInterface');
// };

const generateTypeClass = (schema: InternalType): string => {
    // Get the package parent info.
    const [packageName, parentName] = getParentInfo(schema.parent);
    // Set the imports.
    const imports = new Imports().add(
        packageName,
        parentName,
        `${parentName}Data`,
    );
    imports.add('@sivrad/matrix', 'Field');
    if (packageName != '@sivrad/matrix')
        imports.add('@sivrad/matrix', 'MatrixBaseType');
    // Import all the external field types.
    importExternalFieldTypes(schema, imports);

    const content = renderTemplate('typeClass', {
        imports,
        schema,
        parentName: parentName,
        sanitizeType,
        generateMethodSignature,
        generateJSDoc,
    });

    console.log(content);

    return content;
};

const getSchema = (schemaPath: string): InternalType => {
    console.log(schemaPath);

    const typeSchema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    const getField = (key: string, field: InternalField): InternalField => {
        return {
            type: field.type,
            label: field.label || formatAsLabel(key),
            description: field.description || 'No description given.',
            defaultValue: field.defaultValue || null,
            required: !Object.keys(field).includes('defaultValue'),
        };
    };
    return {
        name: typeSchema.name as string,
        label: (typeSchema.label as string) || formatAsLabel(typeSchema.name),
        description:
            (typeSchema.description as string) || 'No description given.',
        isAbstract: (typeSchema.isAbstract as boolean) || false,
        parent: typeSchema.parent as string,
        fields: Object.assign(
            {},
            ...Object.keys(typeSchema.fields || {}).map((k) => ({
                [k]: getField(k, typeSchema.fields[k]),
            })),
        ),
    };
};

const createCollectionIndexFile = (
    collectionName: string,
    exports: Exports,
) => {
    const path = `${TYPES_DIRECTORY}${collectionName}/index.ts`;
    const content = exports.toString();
    writeFileSync(path, content);
};

const createCollectionDirectory = (collectionName: string) => {
    const collectionPath = `${TYPES_DIRECTORY}${collectionName}/`;
    if (!existsSync(collectionPath)) mkdirSync(collectionPath);
};

/**
 * Builds a type.
 * @param   {string} collectionName The collection name.
 * @param   {string} path           The path to the type.
 * @returns {string} Returns the type name.
 */
const buildType = (collectionName: string, path: string): string => {
    const schema = getSchema(path);
    const content = generateTypeClass(schema);
    console.log(collectionName, content);

    // writeFileSync(
    //     `${TYPES_DIRECTORY}${collectionName}/${schema.name}.ts`,
    //     content,
    // );
    return schema.name;
};

export const build = async (): Promise<void> => {
    for (const [collectionName, types] of Object.entries(
        getCollectionTypes(),
    )) {
        const exports = new Exports();
        // Create 'collection/'.
        createCollectionDirectory(collectionName);
        for (const type of types) {
            const typeName = buildType(
                collectionName,
                `${TYPE_FILES_PATH}${collectionName}/${type}`,
            );
            exports.add(`./${typeName}`, typeName, `${typeName}Data`);
        }
        // Create 'collection/index.ts'.
        createCollectionIndexFile(collectionName, exports);
    }
};
