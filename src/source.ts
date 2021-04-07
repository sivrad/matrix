/**
 * Configure a Readonly Source.
 */
export abstract class ReadonlySource {
    abstract initializeType(typeName: string): Promise<void>;

    abstract readTypeData<T extends Record<string, unknown>>(
        typeName: string,
        id: string,
    ): Promise<T>;
}

/**
 * Configure a source.
 */
export abstract class Source extends ReadonlySource {
    abstract writeTypeData<T extends Record<string, unknown>>(
        typeName: string,
        id: string,
        data: T,
    ): Promise<T>;

    abstract createType<T extends Record<string, unknown>>(
        typeName: string,
        data: T,
    ): Promise<string>;
}
