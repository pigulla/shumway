import type { IDebugger } from 'debug'

import type { ExecutionResult } from '../../execute-handler'
import { Iteration } from '../../execute-handler'
import { handleCallbackError } from '../handle-callback-error'

import { RecoverError } from './recover.error'
import type { RecoverOptions } from './recover.options'

export async function recoverHandler<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    ReturnValue,
>(
    debug: IDebugger,
    context: {
        self: Self
        error: Trigger
        parameters: Arguments
    },
    handler: RecoverOptions<Arguments, Self, Trigger, ReturnValue>,
): Promise<ExecutionResult<ReturnValue>> {
    try {
        const value = await handler.callback.call(
            context.self,
            context.error,
            ...context.parameters,
        )
        debug('recover callback executed successfully')
        return { iteration: Iteration.RETURN, value }
    } catch (callbackError) {
        return handleCallbackError<Arguments, Self, Trigger, ReturnValue>(
            {
                trigger: context.error,
                callbackError: callbackError as Error,
                WrapperClass: RecoverError,
                handler,
            },
            debug,
        )
    }
}
