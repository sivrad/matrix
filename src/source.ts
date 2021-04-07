/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { UnsupportedSourceMethod } from './errors';

type SerializedType = Record<string, unknown>;

/**
 * Configure a Source.
 */
export abstract class Source {
    /**
     * Initialize a type.
     * @param {string} _ The type name.
     * @returns {Promise<void>}
     */
    async initializeType(_: string): Promise<void> {
        throw new UnsupportedSourceMethod('initializeType');
    }

    /**
     * Get instances of a type.
     * @param {string} _ The type name.
     * @returns {Promise<T[]>} Instances of the type.
     */
    async getInstances<T extends SerializedType>(_: string): Promise<T[]> {
        throw new UnsupportedSourceMethod('getInstances');
    }

    /**
     * Get a type instance.
     * @param   {string} _  The type name.
     * @param   {string} __ The type Id.
     * @returns {T}         Get the instance data.
     */
    async getInstance<T extends SerializedType>(
        _: string,
        __: string,
    ): Promise<T> {
        throw new UnsupportedSourceMethod('getInstance');
    }

    /**
     * Update an instance's data.
     * @param   {string}     _   The type name.
     * @param   {string}     __  The Id of the type.
     * @param   {T}          ___ The data to update.
     * @returns {Promise<T>}     The updated instance data.
     */
    async updateInstance<T extends SerializedType>(
        _: string,
        __: string,
        ___: T,
    ): Promise<T> {
        throw new UnsupportedSourceMethod('updateInstance');
    }

    /**
     * Create a new instance.
     * @param   {string}          _  The type name.
     * @param   {T}               __ The instance data.
     * @returns {Promise<string>}    The new instance Id.
     */
    async createInstance<T extends SerializedType>(
        _: string,
        __: T,
    ): Promise<string> {
        throw new UnsupportedSourceMethod('createInstance');
    }
}
