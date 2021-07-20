import { InvalidTypeFormat } from './error';
import { FieldData } from './type';

/**
 * Map over an object.
 * @param   {Record<string, unknown>}                  object The initial object.
 * @param   {(key: string, value: unknown) => unknown} func   The function to map with.
 * @example
 * mapObject(
 *     { "foo": "bar" },
 *     (k, v) => v.toUpperCase()
 * ); // { "foo": "BAR" }
 * @returns {Record<string, unknown>}                         The maped over object.
 */
export const mapObject = <InputType = unknown, OutputType = unknown>(
    object: Record<string, InputType>,
    func: (key: string, value: InputType) => OutputType,
): Record<string, OutputType> => {
    const values = Object.values(object);
    Object.keys(object).map((key, index) => {
        // @ts-expect-error They have different types because it is a map.
        object[key] = func(key, values[index]);
    });
    // @ts-expect-error They have different types because it is a map.
    return object;
};

/**
 * Parse a type name.
 * @param {string} typeName The type name in 'collectionName.TypeName' format.
 * @example
 * parseType("std.Time") // ["std", "Time"]
 * @returns {[string, string]} The collection name and type name.
 */
export const parseType = (typeName: string): [string, string] => {
    const typeParts = typeName.split('.');
    if (typeParts.length != 2) throw new InvalidTypeFormat(typeName);
    return typeParts as [string, string];
};

/**
 * Generate a random ID.
 * @param {number} length The length of the ID (defaults to 4).
 * @returns {string} The random ID.
 */
export const generateId = (length = 4): string =>
    Math.random().toString().substr(2, length);

/**
 * Return the current timestamp in seconds.
 * @returns {number} The current timestamp in seconds.
 */
export const getCurrentTimestamp = (): number =>
    Math.floor(new Date().getTime() / 1000);

export const verifyValueType = (expectedType: string, value: unknown): void => {
    const unionTypes = expectedType.split('|').map((type) => type.trim());
    for (const type of unionTypes) {
        if (typeof value == type) return;
    }
    console.error(`INVALID TYPE: '${value}' is not type '${expectedType}'`);
};

export const getOldestDataPointTimestamp = (dataPoint: FieldData): number => {
    return Math.min(...Object.keys(dataPoint.values).map(parseInt));
};

export const removeDuplicateData = (
    targetReference: Record<string, FieldData>,
    sourceData: Record<string, FieldData>,
): Record<string, FieldData> => {
    const targetData: Record<string, FieldData> = Object.assign(
        {},
        targetReference,
    );
    // console.log('target: ');
    // console.log(targetData);
    // console.log('source: ');
    // console.log(sourceData);

    for (const [fieldName, fieldData] of Object.entries(sourceData)) {
        if (!Object.keys(targetData).includes(fieldName)) {
            delete targetData[fieldName];
        } else {
            for (const [timestamp] of Object.entries(fieldData.values)) {
                if (!Object.keys(targetData).includes(timestamp)) {
                    delete targetData[fieldName].values[timestamp];
                }
            }
        }
    }
    return targetData;
};

// /**
//  * Remove each 'required' property from a record of FieldInterface objects.
//  * @param {Record<string, FieldInterface>} fields The record of fields.
//  * @returns {Record<string, FieldInterface>} The record of fields without 'required' properties.
//  */
// export const removeRequiredProperties = (
//     fields: Record<string, FieldInterface>,
// ): Type['fields'] =>
//     mapObject(fields, (_, field) => {
//         delete field['required'];
//         return field;
//     }) as Type['fields'];

// /**
//  * Remove metadata from MetaData object.
//  * @function removeMetaData
//  * @memberof MatrixBaseType
//  * @private
//  * @param   {IncludeMetaData<MatrixBaseTypeData>} data Data with metadata.
//  * @returns {MatrixBaseTypeData} Data without metadata.
//  */
// export const removeMetadata = (
//     data: IncludeMetaData<InternalData<MatrixBaseTypeData>>,
// ): InternalData<MatrixBaseTypeData> => {
//     const rawData: InternalData<MatrixBaseTypeData> = {};
//     for (const [key, value] of Object.entries(data)) {
//         if (key[0] != '$') {
//             rawData[key] = value;
//         }
//     }
//     return rawData;
// };
