import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import {
    BUILT_IN_TYPES,
    ENABLED_METHODS,
    TEMPLATES_PATH,
    TYPES_DIRECTORY,
} from './constants';
import { Exports, Imports } from './package';
import { InternalType, InternalField, Method, IndexedTypes } from './type';
import { render } from 'ejs';
import {
    sanitizeType,
    generateMethodSignature,
    generateJSDoc,
    formatAsClassName,
    valueToTypescript,
    flagsToArray,
    canSetField,
    getTypeWithField,
    stripArgsNames,
} from './util';
import { indexTypes } from '../common/util';

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

const generateSetterMethod = (
    fieldName: string,
    field: InternalField,
): Method => {
    const classNameFormat = formatAsClassName(fieldName),
        sanizizedType = sanitizeType(field.type);
    return {
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
    };
};

const generateFieldMethods = (
    _: InternalType,
    fieldName: string,
    field: InternalField,
): Method[] => {
    const classNameFormat = formatAsClassName(fieldName),
        sanizizedType = sanitizeType(field.type),
        methods = [
            // Getter method.
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

    // Return if you can set the field.
    if (!canSetField(field)) return methods;

    // Add Setter method.
    methods.push(generateSetterMethod(fieldName, field));

    return methods;
};
const getTypeMethods = (
    types: IndexedTypes,
    collection: string,
    schema: InternalType,
): Method[] => {
    let methods: Method[] = [];
    if (ENABLED_METHODS.GET)
        // `get` method.
        methods.push({
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
        });
    if (ENABLED_METHODS.GET_ALL)
        methods.push(
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
        );
    if (ENABLED_METHODS.GET_TYPE_CLASS)
        methods.push(
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
        );
    // All the getters and setters associated with the fields.
    if (ENABLED_METHODS.FIELDS) {
        for (const [fieldName, field] of Object.entries(schema.fields)) {
            if (typeof field != 'object') continue;
            const fieldMethods = generateFieldMethods(schema, fieldName, field);
            methods = methods.concat(fieldMethods);
        }
    }
    if (ENABLED_METHODS.PROTECTED_FIELDS) {
        for (const fieldName of Object.keys(schema.fieldValues)) {
            methods.push(
                generateProtectedField(
                    schema,
                    getTypeWithField(types, collection, schema, fieldName),
                    fieldName,
                ),
            );
        }
    }
    return methods;
};

const generateProtectedField = (
    type: InternalType,
    fieldOwnerType: InternalType,
    fieldName: string,
): Method => {
    const setter = generateSetterMethod(
        fieldName,
        fieldOwnerType.fields[fieldName],
    );
    return {
        name: 'set' + formatAsClassName(fieldName),
        description: 'Private due to overwritten value.',
        args: stripArgsNames(setter.args),
        returns: {
            type: setter.returns.type,
            description: '',
        },
        code: 'throw new Error("You can not overwrite the overwritten.")',
        depreciated: `The field \`${fieldName}\` is statically set to \`${type.fieldValues[fieldName]}\` by type \`${fieldOwnerType.name}\`.`,
    };
};

const generateTypeClass = (
    types: IndexedTypes,
    collectionName: string,
    schema: InternalType,
): string => {
    // Get the package parent info.
    const [packageName, parentName] = getParentInfo(schema.parent || undefined);
    // Set the imports.
    const imports = new Imports().add(
        packageName,
        parentName,
        `${parentName}Data`,
    );
    imports.add(coreImport, 'schema');
    if (packageName != coreImport) imports.add(coreImport, 'MatrixBaseType');
    // Import all the external field types.
    importExternalFieldTypes(schema, imports);
    // Get all the methods
    const methods = getTypeMethods(types, collectionName, schema);

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
        flagsToArray,
    });
    return content;
};

const createTypesIndexFile = (outDirectory: string, exports: Exports) => {
    const path = `${outDirectory}${TYPES_DIRECTORY}index.ts`;
    const content = exports.toString();
    writeFileSync(path, content);
};

const createCollectionIndexFile = (
    outDirectory: string,
    collectionName: string,
    exports: Exports,
) => {
    const path = `${outDirectory}${TYPES_DIRECTORY}${collectionName}/index.ts`;
    const content = exports.toString();
    writeFileSync(path, content);
};

const createTypesDirectory = (outDirectory: string) => {
    const buildingTypeDirectory = outDirectory + TYPES_DIRECTORY;
    if (!existsSync(buildingTypeDirectory)) mkdirSync(buildingTypeDirectory);
};

const createCollectionDirectory = (
    outDirectory: string,
    collectionName: string,
) => {
    const collectionPath = `${outDirectory}${TYPES_DIRECTORY}${collectionName}/`;
    if (!existsSync(collectionPath)) mkdirSync(collectionPath);
};

const buildType = (
    types: IndexedTypes,
    outDirectory: string,
    collectionName: string,
    type: InternalType,
): string => {
    const content = generateTypeClass(types, collectionName, type);
    writeFileSync(
        `${outDirectory}${TYPES_DIRECTORY}${collectionName}/${type.name}.ts`,
        content,
    );
    return type.name;
};

export const build = async (
    inDirectory = '',
    outDirectory = '',
): Promise<void> => {
    // Set the 'outDirectory' with value of 'inDirectory' if not set.
    if (inDirectory && !outDirectory) outDirectory = inDirectory;
    // Index the types.
    const allTypes = indexTypes(inDirectory);
    // Create './src/types/'.
    createTypesDirectory(outDirectory);
    const typeExports = new Exports();
    for (const [collectionName, types] of Object.entries(allTypes)) {
        // Export all from the collection.
        typeExports.set(`./${collectionName}`, '*', collectionName);
        const collectionExports = new Exports();
        // Create './src/types/collection/'.
        createCollectionDirectory(outDirectory, collectionName);
        for (const type of Object.values(types)) {
            const typeName = buildType(
                allTypes,
                outDirectory,
                collectionName,
                type,
            );
            collectionExports.add(`./${typeName}`, typeName, `${typeName}Data`);
        }
        // Create './src/types/collection/index.ts'.
        createCollectionIndexFile(
            outDirectory,
            collectionName,
            collectionExports,
        );
    }
    // Create './src/types/index.ts'.
    createTypesIndexFile(outDirectory, typeExports);
};
