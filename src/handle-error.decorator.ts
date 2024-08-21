import type { AsyncFunction, AsyncReturnType } from 'type-fest/source/async-return-type'

import { debug } from './debug'
import type { Handler } from './handler'
import { runErrorHandlers } from './run-error-handlers'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function HandleError<Method extends AsyncFunction = AsyncFunction, Self extends object = {}>(
    ...handlers: Handler<Parameters<Method>, Self, Error, AsyncReturnType<Method>>[]
): MethodDecorator {
    return function mapError(target, propertyKey, descriptor) {
        const wrappedFunction = descriptor.value as unknown as (
            ...parameters: Parameters<Method>
        ) => Promise<ReturnType<Method>>

        async function wrapper(
            this: Self,
            ...parameters: Parameters<Method>
        ): Promise<ReturnType<Method>> {
            const dbg = debug.extend(`${this.constructor.name}.${wrappedFunction.name}`)

            try {
                dbg('executing function')
                const result = (await wrappedFunction.apply(this, parameters)) as ReturnType<Method>
                dbg('executed function without errors')
                return result
            } catch (error) {
                dbg('function threw %s', (error as Error).name)
                const context = { self: this, parameters, error: error as Error }
                return await runErrorHandlers(context, handlers, dbg)
            }
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-param-reassign
        descriptor.value = wrapper
    }
}
