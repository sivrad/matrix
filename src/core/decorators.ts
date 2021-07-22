// import 'reflect-metadata';
import { AlreadyInstantiated, Uninstantiated } from './error';
import { MatrixBaseType } from './matrixBaseType';

/**
 * Enforce that the method being called is an instance.
 * @returns {MethodDecorator} The method decorator.
 */
export function instanceMethod(): MethodDecorator {
    return (
        _: unknown,
        __: string | symbol,
        descriptor: PropertyDescriptor,
    ) => {
        const method = descriptor.value;
        descriptor.value = function (this: MatrixBaseType, ...args: unknown[]) {
            if (!this.isInstance()) {
                throw new Uninstantiated(this.getTypeClass());
            }
            // Call the original method
            return method.apply(this, args);
        };
    };
}

/**
 * Enforce that the method being called is not an instance.
 * @returns {MethodDecorator} The method decorator.
 */
export function nonInstanceMethod(): MethodDecorator {
    return (
        _: unknown,
        __: string | symbol,
        descriptor: PropertyDescriptor,
    ) => {
        const method = descriptor.value;
        descriptor.value = function (this: MatrixBaseType, ...args: unknown[]) {
            if (this.isInstance()) {
                throw new AlreadyInstantiated(this);
            }
            // Call the original method
            return method.apply(this, args);
        };
    };
}
