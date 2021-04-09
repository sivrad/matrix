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
