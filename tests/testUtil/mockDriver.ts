import {
    Driver,
    InternalData,
    MatrixBaseTypeData,
    SourceInstanceResponse,
    util,
} from '../../src';

/**
 * The Mock Driver for tests.
 */
export class MockDriver extends Driver {
    data: Record<
        // Type
        string,
        Record<
            // ID
            string,
            // Instance data
            InternalData
        >
    > = {};

    /**
     * Fail the test if the type is wrong.
     * @param {string} type The type.
     */
    private failNoTest(type: string) {
        if (type != 'tst.MockType')
            throw Error(type + ' IS UNKNOWN TYPE FOR MOCK DRIVER');
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
        const id = util.generateId();
        return {
            response: {
                $id: id,
                $type: type,
                data: data as InternalData<T>,
            },
        };
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
        this.failNoTest(type);
        switch (id) {
            case '1':
                return {
                    response: {
                        $id: '1',
                        $type: 'MockType',
                        data: ({
                            foo: {
                                current: '1',
                                values: {
                                    '1': {
                                        value: 'bar',
                                    },
                                },
                            },
                        } as unknown) as InternalData<T>,
                    },
                };
            case '2':
                return {
                    response: {
                        $id: '2',
                        $type: 'MockType',
                        data: {} as InternalData<T>,
                    },
                };

            default:
                throw Error(id + ' IS UNKNOWN ID FOR MOCK DRIVER');
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
        this.failNoTest(type);
        if (!Object.keys(this.data).includes(type)) this.data[type] = {};
        this.data[type][id] = { ...this.data[type][id], ...data };
        return {
            response: {
                $id: id,
                $type: type,
                data: data as InternalData<T>,
            },
        };
    }
}
