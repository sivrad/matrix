import {
    Driver,
    errors as matrixErrors,
    MatrixBaseTypeData,
    SourceInstanceResponse,
    SourceInstancesResponse,
    util,
    InternalData,
    SerializedData,
} from '../..';
import { Client, query as q, errors as faunaDBErrors } from 'faunadb';

export interface FauanDBReferenceResponce {
    ref: {
        '@ref': {
            id: string;
            collection: {
                '@ref': {
                    id: string;
                    collection: {
                        '@ref': {
                            id: 'collections';
                        };
                    };
                };
            };
        };
    };
    ts: number;
    data: Record<string, unknown>;
}

export interface FauanDBReferencesResponse {
    data: FauanDBReferenceResponce[];
}

/**
 * FaunaDB Source.
 */
export class FaunaDBDriver extends Driver {
    private client: Client;

    /**
     * Constructor for a FaunaDB Source.
     * @param {string} apikey The FaunaDB apikey.
     */
    constructor(apikey: string) {
        super();
        this.client = new Client({ secret: apikey });
    }

    /**
     * Get the ID from a response.
     * @param {FauanDBReferenceResponce} response The response.
     * @returns {string} The ID.
     */
    private getIDFromInstanceResponse(
        response: FauanDBReferenceResponce,
    ): string {
        return JSON.parse(JSON.stringify(response)).ref['@ref'].id;
    }

    /**
     * This creates a SerializedData object.
     * @param   {string}                    type     The name of the type.
     * @param   {FauanDBReferenceResponce}  response The FaunaDB response.
     * @param   {string}                    knownID  The ID if known.
     * @returns {SerializedData<T>}                  The serialized data.
     */
    private createSourceInstance<
        T extends MatrixBaseTypeData = MatrixBaseTypeData
    >(
        type: string,
        response: FauanDBReferenceResponce,
        knownID?: string,
    ): SerializedData<T> {
        return {
            $id: knownID || this.getIDFromInstanceResponse(response),
            $type: type,
            data: response.data as InternalData<T>,
        };
    }

    /**
     * Create a source instance response.
     * @param   {string}                    type     The name of the type.
     * @param   {FauanDBReferenceResponce}  response The FaunaDB response.
     * @param   {string}                    knownID  The ID if known.
     * @returns {SourceInstanceResponse<T>}          The source instance response.
     */
    private createSourceInstanceResponse<
        T extends MatrixBaseTypeData = MatrixBaseTypeData
    >(
        type: string,
        response: FauanDBReferenceResponce,
        knownID?: string,
    ): SourceInstanceResponse<T> {
        return {
            response: this.createSourceInstance(type, response, knownID),
        };
    }

    /**
     * Create a source instances response.
     * @param   {string}                                                      type     The name of the type.
     * @param   {FauanDBReferenceResponce}                                    response The FaunaDB response.
     * @returns {SourceInstanceResponse<IncludeMetaData<MatrixBaseTypeData>>}          The source instances response.
     */
    private createSourceInstancesResponse<T extends MatrixBaseTypeData>(
        type: string,
        response: FauanDBReferencesResponse,
    ): SourceInstancesResponse<T> {
        const result: SourceInstancesResponse<T> = {
            response: {},
        };
        for (const instanceData of response.data) {
            const id = this.getIDFromInstanceResponse(instanceData);
            result.response[id] = this.createSourceInstance<T>(
                type,
                instanceData,
                id,
            );
        }
        return result;
    }

    // /**
    //  * Check for the Collection's existance, create if not found.
    //  * @param   {string}                  type The name of the type.
    //  * @returns {Promise<SourceResponce>}      The initialize type response.
    //  */
    // async initializeType(type: string): Promise<unknown> {
    //     const [, typeName] = util.parseType(type);
    //     try {
    //         await this.client.query(q.Collection(typeName));
    //         return {};
    //     } catch (e) {
    //         if (e instanceof faunaDBErrors.NotFound) {
    //             await this.client.query(q.CreateCollection(typeName));
    //             return {};
    //         } else {
    //             throw e;
    //         }
    //     }
    // }

    /**
     * Get all the instances of a type.
     * @param   {string} type The name of the type.
     * @returns {T}           The data.
     */
    async getInstances<T extends MatrixBaseTypeData = MatrixBaseTypeData>(
        type: string,
    ): Promise<SourceInstancesResponse<T>> {
        const [, typeName] = util.parseType(type);
        try {
            const response = await this.client.query<FauanDBReferencesResponse>(
                q.Map(
                    q.Paginate(q.Documents(q.Collection(typeName))),
                    q.Lambda((x) => q.Get(x)),
                ),
            );
            return this.createSourceInstancesResponse<T>(type, response);
        } catch (e) {
            console.log(e);
            throw new matrixErrors.UnknownSourceError();
        }
    }

    /**
     * Read from the database.
     * @param   {string}             type The name of the type.
     * @param   {string}             id   Id of the type.
     * @throws  {InstanceNotFound}        If the Id does not match a type.
     * @throws  {UnknownSourceError}      If there is an unknown error.
     * @returns {Promise<T>}              The data.
     */
    async getInstance<T extends MatrixBaseTypeData = MatrixBaseTypeData>(
        type: string,
        id: string,
    ): Promise<SourceInstanceResponse<T>> {
        const [, typeName] = util.parseType(type);
        try {
            const response = await this.client.query<FauanDBReferenceResponce>(
                q.Get(q.Ref(q.Collection(typeName), id)),
            );
            return this.createSourceInstanceResponse<T>(type, response);
        } catch (e) {
            if (e instanceof faunaDBErrors.NotFound) {
                throw new matrixErrors.InstanceNotFound(type, id);
            } else {
                console.log(e);
                throw new matrixErrors.UnknownSourceError();
            }
        }
    }

    /**
     * Write data to the database.
     * @param   {string}     type The name of the type.
     * @param   {string}     id   Id of the type.
     * @param   {T}          data Data to write to.
     * @returns {Promise<T>}      The updated data.
     */
    async updateInstance<T extends MatrixBaseTypeData = MatrixBaseTypeData>(
        type: string,
        id: string,
        data: T,
    ): Promise<SourceInstanceResponse<T>> {
        const [, typeName] = util.parseType(type);
        try {
            const response = await this.client.query<FauanDBReferenceResponce>(
                q.Update(q.Ref(q.Collection(typeName), id), { data }),
            );
            return this.createSourceInstanceResponse<T>(type, response);
        } catch (e) {
            console.error(e);
            throw new matrixErrors.UnknownSourceError();
        }
    }

    /**
     * Create a type instance.
     * @param   {string} type The type name.
     * @param   {T}      data Data object.
     * @returns {string}      The newly created identifier.
     */
    async createInstance<T extends MatrixBaseTypeData = MatrixBaseTypeData>(
        type: string,
        data: T,
    ): Promise<SourceInstanceResponse<T>> {
        const [, typeName] = util.parseType(type);
        try {
            const response = await this.client.query<FauanDBReferenceResponce>(
                q.Create(q.Collection(typeName), { data }),
            );
            return this.createSourceInstanceResponse<T>(type, response);
        } catch (e) {
            console.error(e);
            throw new matrixErrors.UnknownSourceError();
        }
    }
}
