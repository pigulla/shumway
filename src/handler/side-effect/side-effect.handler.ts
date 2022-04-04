import type { IDebugger } from 'debug'

import type { ExecutionResult } from '../../execute-handler'
import { Iteration } from '../../execute-handler'
import { handleCallbackError } from '../handle-callback-error'

import { SideEffectError } from './side-effect.error'
import type { SideEffectOptions } from './side-effect.options'

export async function sideEffectHandler<
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
    handler: SideEffectOptions<Arguments, Self, Trigger>,
): Promise<ExecutionResult<ReturnValue>> {
    try {
        await handler.callback.call(context.self, context.error, ...context.parameters)
        debug('side effect handler executed successfully')
        return { iteration: Iteration.BREAK, error: context.error }
    } catch (callbackError) {
        return handleCallbackError<Arguments, Self, Trigger, ReturnValue>(
            {
                trigger: context.error,
                callbackError: callbackError as Error,
                WrapperClass: SideEffectError,
                handler,
            },
            debug,
        )
    }
}
