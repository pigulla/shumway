import type { IDebugger } from 'debug'

import type { ExecutionResult } from '../../execute-handler'
import { Iteration } from '../../execute-handler'
import { handleCallbackError } from '../handle-callback-error'

import { MapError } from './map.error'
import type { MapOptions } from './map.options'

export async function mapHandler<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    Mapped extends Error,
    ReturnValue,
>(
    debug: IDebugger,
    context: {
        self: Self
        error: Trigger
        parameters: Arguments
    },
    handler: MapOptions<Arguments, Self, Trigger, Mapped>,
): Promise<ExecutionResult<ReturnValue>> {
    try {
        const mappedError = await handler.callback.call(
            context.self,
            context.error,
            ...context.parameters,
        )
        debug('error successfully mapped from %s to %s', context.error.name, mappedError.name)
        if (handler.continue) {
            debug(`'continue' is set, proceeding with remaining handlers`)
            return { iteration: Iteration.CONTINUE, error: mappedError }
        }
        debug(`'continue' is not set, skipping remaining handlers`)
        return { iteration: Iteration.BREAK, error: mappedError }
    } catch (callbackError) {
        return handleCallbackError<Arguments, Self, Trigger, ReturnValue>(
            {
                trigger: context.error,
                callbackError: callbackError as Error,
                WrapperClass: MapError,
                handler,
            },
            debug,
        )
    }
}
