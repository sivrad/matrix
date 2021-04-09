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
export const mapObject = (
    object: Record<string, unknown>,
    func: (key: string, value: unknown) => unknown,
): Record<string, unknown> => {
    const values = Object.values(object);
    Object.keys(object).map((key, index) => {
        object[key] = func(key, values[index]);
    });
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
