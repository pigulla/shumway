import type { IDebugger } from 'debug'

import type { ExecutionResult } from '../../execute-handler'
import { Iteration } from '../../execute-handler'

import type { PassThroughOptions } from './pass-through.options'

// eslint-disable-next-line @typescript-eslint/require-await
export async function passThroughHandler<
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
    _handler: PassThroughOptions<Arguments, Self, Trigger>,
): Promise<ExecutionResult<ReturnValue>> {
    debug('error is configured to be passed through, re-throwing')
    return { iteration: Iteration.BREAK, error: context.error }
}
