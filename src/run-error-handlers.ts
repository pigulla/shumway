import type { IDebugger } from 'debug'

import { Iteration, executeHandler } from './execute-handler'
import type { Handler } from './handler'

export async function runErrorHandlers<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    ReturnValue,
>(
    context: { self: Self; parameters: Arguments; error: Trigger },
    handlers: Handler<Arguments, Self, Error, ReturnValue>[],
    parentDebugger: IDebugger,
): Promise<ReturnValue> {
    let error: Error = context.error

    parentDebugger('executing %d handler(s)', handlers.length)

    Loop: for (const [index, handler] of handlers.entries()) {
        const debug = parentDebugger.extend(`handler:${index}`)

        debug(`executing '%s' handler`, handler.action)
        const result = await executeHandler(handler, { ...context, error }, debug)

        switch (result.iteration) {
            case Iteration.CONTINUE: {
                error = result.error
                continue
            }
            case Iteration.BREAK: {
                error = result.error
                break Loop
            }
            case Iteration.RETURN: {
                return result.value
            }
            case Iteration.THROW: {
                throw result.error
            }
            default: {
                throw new RangeError(
                    // @ts-expect-error
                    `Unexpected iteration result type: ${result.iteration as string}`,
                )
            }
        }
    }

    throw error
}
