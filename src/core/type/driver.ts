import { MatrixBaseTypeData, SerializeFields } from './data';

/**
 * Driver Instances Response.
 *
 * A driver's response of instances.
 */
export interface DriverInstancesResponse<
    T extends MatrixBaseTypeData = MatrixBaseTypeData
> {
    response: Record<string, SerializeFields<T>>;
}

/**
 * Driver Instance Response.
 *
 * A driver's response of a single instance.
 */
export interface DriverInstanceResponse<
    T extends MatrixBaseTypeData = MatrixBaseTypeData
> {
    response: SerializeFields<T>;
}
