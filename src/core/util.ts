import { InvalidTypeFormat } from './errors';

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