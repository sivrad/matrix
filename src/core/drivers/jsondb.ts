import { Driver } from '../driver';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import {
    SerializeFields,
    MatrixBaseTypeData,
    SerializeData,
    DriverInstanceResponse,
    DriverInstancesResponse,
    util,
} from '..';
import { errors as matrixErrors } from '../../';

interface JSONDBDriverOptions {
    formatFile?: boolean;
}

/**
 * A Simple JSON File Driver.
 */
export class JSONDBDriver extends Driver {
    private data: Record<
        // Type
        string,
        Record<
            // ID
            string,
            // Instance data
            SerializeFields
        >
    > = {};

    /**
     * Constructor for a JSON File Driver.
     * @param {string}              filePath The path to the file to use.
     * @param {JSONDBDriverOptions} options  Driver options.
     */
    constructor(
        private filePath: string,
        private options: JSONDBDriverOptions = {},
    ) {
        super();
        this.read();
    }

    /**
     * Save the file contents.
     * @function save
     * @memberof JSONDBDriver
     * @private
     */
    private save(): void {
        const savedData = this.options.formatFile
            ? JSON.stringify(this.data, null, 4)
            : JSON.stringify(this.data);
        writeFileSync(this.filePath, savedData);
    }

    /**
     * Read the file contents and set the data.
     * @function read
     * @memberof JSONDBDriver
     * @private
     */
    private read(): void {
        this.ensureFileExists();
        this.data = JSON.parse(readFileSync(this.filePath, 'utf8'));
    }

    /**
     * Ensure the existance of the JSON file.
     * @function ensureFileExists
     * @memberof JSONDBDriver
     * @private
     */
    private ensureFileExists(): void {
        if (!existsSync(this.filePath)) this.save();
    }

    /**
     * Return if the file contains a type or not.
     * @function hasType
     * @memberof JSONDBDriver
     * @param {string} type The name of the type.
     * @returns {boolean} If the file contains the type or not.
     * @private
     */
    private hasType(type: string): boolean {
        return Object.keys(this.data).indexOf(type) != -1;
    }

    /**
     * Return if the file contains an instance or not.
     * @function hasInstance
     * @memberof JSONDBDriver
     * @param {string} type The name of the type.
     * @param {string} id   The identifier.
     * @returns {boolean} If the file contains the instance or not.
     * @private
     */
    private hasInstance(type: string, id: string): boolean {
        return (
            this.hasType(type) && Object.keys(this.data[type]).indexOf(id) != -1
        );
    }

    /**
     * Read from the database.
     * @param   {string}             type The name of the type.
     * @param   {string}             id   Id of the type.
     * @throws  {InstanceNotFound}        If the Id does not match a type.
     * @throws  {UnknownDriverError}      If there is an unknown error.
     * @returns {Promise<T>}              The data.
     */
    async getInstance<T extends MatrixBaseTypeData = MatrixBaseTypeData>(
        type: string,
        id: string,
    ): Promise<DriverInstanceResponse<T>> {
        // Check if the instance is in the file.
        if (!this.hasInstance(type, id))
            throw new matrixErrors.InstanceNotFound(type, id);
        return {
            response: {
                id: id,
                type: type,
                data: this.data[type][id] as SerializeFields<T>,
            },
        };
    }

    /**
     * Get all the instances of a type.
     * @param   {string} type The name of the type.
     * @returns {T}           The data.
     */
    async getInstances<T extends MatrixBaseTypeData = MatrixBaseTypeData>(
        type: string,
    ): Promise<DriverInstancesResponse<T>> {
        if (!this.hasType(type)) return { response: {} };
        const instances: Record<string, SerializeData<T>> = {};
        for (const [id, data] of Object.entries(this.data[type])) {
            instances[id] = {
                id: id,
                type: type,
                data: data as SerializeFields<T>,
            };
        }
        return {
            response: instances,
        };
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
    ): Promise<DriverInstanceResponse<T>> {
        const id = util.generateId();
        if (!this.hasType(type)) this.data[type] = {};
        this.data[type][id] = data as SerializeFields;
        this.save();
        return {
            response: {
                id: id,
                type: type,
                data: data as SerializeFields<T>,
            },
        };
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
    ): Promise<DriverInstanceResponse<T>> {
        this.data[type][id] = { ...this.data[type][id], ...data };
        this.save();
        return {
            response: {
                id: id,
                type: type,
                data: this.data[type][id] as SerializeFields<T>,
            },
        };
    }
}
