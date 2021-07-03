import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { TYPE_FILES_PATH } from '../common/constants';
import { formatAsLabel, getCollectionTypes } from '../common/util';
import { BUILT_IN_TYPES, TEMPLATES_PATH, TYPES_DIRECTORY } from './constants';
import { Exports, Imports } from './package';
import { InternalType, InternalField, Method } from './type';
import { render } from 'ejs';
import {
    sanitizeType,
    generateMethodSignature,
    generateJSDoc,
    formatAsClassName,
    valueToTypescript,
} from './util';

const templates = new Map<string, string>();
const coreImport = '../../core';

const getParentInfo = (parent?: string): [string, string] => {
    // If no parent is given.
    if (!parent) return [coreImport, 'MatrixBaseType'];
    // If no '.'
    if (!parent.includes('.')) return [`./${parent}`, parent];
    // Remote package.
    const parentParts = parent.split('.');
    return ['../' + parentParts[0], parentParts[1]];
};

const isolateFieldTypes = (type: string): string[] => {
    type = type.replace(/ /g, '');
    return type.split('|').map((t) => t.replace(/\[\]/g, ''));
};

const importExternalFieldTypes = (schema: InternalType, imports: Imports) => {
    for (const [, field] of Object.entries(schema.fields)) {
        if (typeof field != 'object') continue;
        const types = isolateFieldTypes(field.type).filter(
            (type) => BUILT_IN_TYPES.indexOf(type) == -1 && type != schema.name,
        );
        for (const typeName of types) {
            const typeNameParts = typeName.split('.');
            const [pkg, type] =
                typeNameParts.length == 2
                    ? [`../${typeNameParts[0]}`, typeNameParts[1]]
                    : [`./${typeName}`, typeName];
            imports.add(pkg, type);
        }
    }
};

const getTemplate = (template: string): string => {
    if (!templates.has(template))
        templates.set(
            template,
            readFileSync(`${TEMPLATES_PATH}${template}.ejs`, 'utf-8'),
        );
    return templates.get(template)!;
};

const renderTemplate = (template: string, args: Record<string, unknown>) =>
    render(getTemplate(template), args);

const generateFieldMethods = (
    _: InternalType,
    fieldName: string,
    field: InternalField,
): Method[] => {
    const classNameFormat = formatAsClassName(fieldName),
        sanizizedType = sanitizeType(field.type),
        methods = [
            // Getter
            {
                name: `get${classNameFormat}`,
                description: `Retrive the ${field.label} field.`,
                args: {},
                returns: {
                    type: sanizizedType,
                    description: field.description,
                },
                code: `return this.getField<${sanizizedType}>('${fieldName}');`,
            },
        ];
    // Check if you can set the field.
    methods.push({
        name: `set${classNameFormat}`,
        description: `Set the ${field.label} field.`,
        args: {
            value: {
                type: sanizizedType,
                description: 'The value to set.',
            },
        },
        returns: {
            type: 'void',
            description: '',
        },
        code: `this.setField('${fieldName}', value);`,
    });
    return methods;
};
const getTypeMethods = (schema: InternalType): Method[] => {
    let methods: Method[] = [
        // `get` method.
        {
            name: 'get',
            description: 'Get an instance of the type from the ID.',
            args: {
                id: {
                    type: 'string',
                    description: 'The ID of the instance.',
                },
            },
            returns: {
                type: 'T',
                description: 'The new instance of the type.',
            },
            code: 'return await super.get<T>(id);',
            isStatic: true,
            isAsync: true,
            generic: `T extends MatrixBaseType = ${schema.name}`,
        },
        // `getAll` method.
        {
            name: 'getAll',
            description: 'Get all the instances of a type.',
            args: {},
            returns: {
                type: 'T[]',
                description: 'All the new instances.',
            },
            code: 'return await super.getAll<T>();',
            isStatic: true,
            isAsync: true,
            generic: `T extends MatrixBaseType = ${schema.name}`,
        },
        // `getTypeClass` method.
        {
            name: 'getTypeClass',
            description: 'Get the class of the type.',
            args: {},
            returns: {
                type: 'T',
                description: 'The type class.',
            },
            code: `return (${schema.name} as unknown) as T;`,
            generic: `T = typeof ${schema.name}`,
        },
        // All the getters and setters associated with the fields.
    ];
    for (const [fieldName, field] of Object.entries(schema.fields)) {
        if (typeof field != 'object') continue;
        const fieldMethods = generateFieldMethods(schema, fieldName, field);
        methods = methods.concat(fieldMethods);
    }
    return methods;
};

const generateTypeClass = (
    collectionName: string,
    schema: InternalType,
): string => {
    // Get the package parent info.
    const [packageName, parentName] = getParentInfo(schema.parent);
    // Set the imports.
    const imports = new Imports().add(
        packageName,
        parentName,
        `${parentName}Data`,
    );
    imports.add(coreImport, 'FieldInterface');
    if (packageName != coreImport) imports.add(coreImport, 'MatrixBaseType');
    // Import all the external field types.
    importExternalFieldTypes(schema, imports);
    // Get all the methods
    const methods = getTypeMethods(schema);

    const content = renderTemplate('typeClass', {
        imports,
        collectionName,
        schema,
        parentName,
        methods,
        sanitizeType,
        generateMethodSignature,
        generateJSDoc,
        valueToTypescript,
    });
    return content;
};

const getSchema = (schemaPath: string): InternalType => {
    const typeSchema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    const getField = (key: string, field: InternalField): InternalField => {
        return typeof field == 'object'
            ? {
                  type: field.type,
                  label: field.label || formatAsLabel(key),
                  description: field.description || 'No description given.',
                  defaultValue: field.defaultValue || null,
                  required: !Object.keys(field).includes('defaultValue'),
              }
            : field;
    };
    return {
        name: typeSchema.name as string,
        label: (typeSchema.label as string) || formatAsLabel(typeSchema.name),
        description:
            (typeSchema.description as string) || 'No description given.',
        isAbstract: (typeSchema.isAbstract as boolean) || false,
        parent: typeSchema.parent as string,
        icon: (typeSchema.icon as string) || '',
        fields: Object.assign(
            {},
            ...Object.keys(typeSchema.fields || {}).map((k) => ({
                [k]: getField(k, typeSchema.fields[k]),
            })),
        ),
        fieldValues: typeSchema.fieldValues || {},
    };
};

const createTypesIndexFile = (exports: Exports) => {
    const path = `${TYPES_DIRECTORY}index.ts`;
    const content = exports.toString();
    writeFileSync(path, content);
};

const createCollectionIndexFile = (
    collectionName: string,
    exports: Exports,
) => {
    const path = `${TYPES_DIRECTORY}${collectionName}/index.ts`;
    const content = exports.toString();
    writeFileSync(path, content);
};

const createTypesDirectory = () => {
    if (!existsSync(TYPES_DIRECTORY)) mkdirSync(TYPES_DIRECTORY);
};

const createCollectionDirectory = (collectionName: string) => {
    const collectionPath = `${TYPES_DIRECTORY}${collectionName}/`;
    if (!existsSync(collectionPath)) mkdirSync(collectionPath);
};

const buildType = (collectionName: string, path: string): string => {
    const schema = getSchema(path);
    const content = generateTypeClass(collectionName, schema);
    writeFileSync(
        `${TYPES_DIRECTORY}${collectionName}/${schema.name}.ts`,
        content,
    );
    return schema.name;
};

export const build = async (): Promise<void> => {
    // Create './src/types/'.
    createTypesDirectory();
    const typeExports = new Exports();
    for (const [collectionName, types] of Object.entries(
        getCollectionTypes(),
    )) {
        // Export all from the collection.
        typeExports.set(`./${collectionName}`, '*', collectionName);
        const collectionExports = new Exports();
        // Create './src/types/collection/'.
        createCollectionDirectory(collectionName);
        for (const type of types) {
            const typeName = buildType(
                collectionName,
                `${TYPE_FILES_PATH}${collectionName}/${type}`,
            );
            collectionExports.add(`./${typeName}`, typeName, `${typeName}Data`);
        }
        // Create './src/types/collection/index.ts'.
        createCollectionIndexFile(collectionName, collectionExports);
    }
    // Create './src/types/index.ts'.
    createTypesIndexFile(typeExports);
};
