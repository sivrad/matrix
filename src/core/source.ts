/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { UnsupportedSourceMethod } from './errors';
import {
    MatrixBaseTypeData,
    SourceInstanceResponse,
    SourceInstancesResponse,
} from './type';

/**
 * Configure a Source.
 */
export class Source {
    /**
     * Initialize a type.
     * @param {string} typeName The type name.
     * @returns {Promise<void>}
     */
    async initializeType(typeName: string): Promise<unknown> {
        throw new UnsupportedSourceMethod('initializeType', typeName);
    }

    /**
     * Get instances of a type.
     * @param {string} typeName The type name.
     * @returns {Promise<T[]>} Instances of the type.
     */
    async getInstances<T extends MatrixBaseTypeData = MatrixBaseTypeData>(
        typeName: string,
    ): Promise<SourceInstancesResponse<T>> {
        throw new UnsupportedSourceMethod('getInstances', typeName);
    }

    /**
     * Get a type instance.
     * @param   {string} typeName  The type name.
     * @param   {string} id The type Id.
     * @returns {T}         Get the instance data.
     */
    async getInstance<T extends MatrixBaseTypeData = MatrixBaseTypeData>(
        typeName: string,
        id: string,
    ): Promise<SourceInstanceResponse<T>> {
        throw new UnsupportedSourceMethod('getInstance', typeName, id);
    }

    /**
     * Update an instance's data.
     * @param   {string}     typeName   The type name.
     * @param   {string}     id  The Id of the type.
     * @param   {T}          data The data to update.
     * @returns {Promise<T>}     The updated instance data.
     */
    async updateInstance<T extends MatrixBaseTypeData = MatrixBaseTypeData>(
        typeName: string,
        id: string,
        data: T,
    ): Promise<SourceInstanceResponse<T>> {
        throw new UnsupportedSourceMethod('updateInstance', typeName, id, data);
    }

    /**
     * Create a new instance.
     * @param   {string}          typeName  The type name.
     * @param   {T}               data The instance data.
     * @returns {Promise<string>}    The new instance Id.
     */
    async createInstance<T extends MatrixBaseTypeData = MatrixBaseTypeData>(
        typeName: string,
        data: T,
    ): Promise<SourceInstanceResponse<T>> {
        throw new UnsupportedSourceMethod('createInstance', typeName, data);
    }
}
