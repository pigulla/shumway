import type { IDebugger } from 'debug'

import type { ExecutionResult } from '../../execute-handler'
import { Iteration } from '../../execute-handler'

import type { TapOptions } from './tap.options'

export async function tapHandler<
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
    handler: TapOptions<Arguments, Self, Trigger>,
): Promise<ExecutionResult<ReturnValue>> {
    try {
        await handler.callback.call(context.self, context.error, ...context.parameters)
        debug('tap callback executed successfully')
        return { iteration: Iteration.CONTINUE, error: context.error }
    } catch (callbackError) {
        debug('tap callback threw an error: %s', (callbackError as Error).message)
        return { iteration: Iteration.CONTINUE, error: context.error }
    }
}
