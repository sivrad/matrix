import { AlreadyInstantiated, Uninstantiated } from './error';
import { MatrixBaseType } from './matrixBaseType';

const makeDecorator = (shouldBeInstance = true) => () => {
    return (
        target: MatrixBaseType,
        _: string,
        descriptor: PropertyDescriptor,
    ): PropertyDescriptor => {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: unknown[]) {
            // Throw an error if instance state does not match `shouldBeInstance`.
            if (shouldBeInstance && !target.isInstance())
                throw new Uninstantiated(target.getTypeClass());
            else if (!shouldBeInstance && target.isInstance())
                throw new AlreadyInstantiated(target);

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
};

/**
 * Force a method to be called by an instance.
 * @returns {Function} The decorator.
 */
export const instanceMethod = makeDecorator(true);

/**
 * Force a method to be called by a type.
 * @returns {Function} The decorator.
 */
export const typeMethod = makeDecorator(false);
