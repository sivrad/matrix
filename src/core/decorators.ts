import { AlreadyInstantiated, Uninstantiated } from './error';
import { MatrixBaseType } from './matrixBaseType';

/**
 * Force a method to be called by an instance.
 * @returns {Function} The decorator.
 */
export const instanceMethod = () => {
    return (
        target: MatrixBaseType,
        _: string,
        descriptor: PropertyDescriptor,
    ): PropertyDescriptor => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: unknown[]) {
            if (!target.isInstance())
                throw new Uninstantiated(target.getTypeClass());
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
};

/**
 * Force a method to be called by a type.
 * @returns {Function} The decorator.
 */
export const typeMethod = () => {
    return (
        target: MatrixBaseType,
        _: string,
        descriptor: PropertyDescriptor,
    ): PropertyDescriptor => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: unknown[]) {
            if (target.isInstance()) throw new AlreadyInstantiated(target);
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
};
