import type { IDebugger } from 'debug'

import type { Handler } from './handler'
import { PredicateError } from './handler'
import { mapHandler } from './handler/map'
import { passThroughHandler } from './handler/pass-through'
import { recoverHandler } from './handler/recover'
import { sideEffectHandler } from './handler/side-effect'
import { tapHandler } from './handler/tap'
import { HandlerAction } from './handler-action.enum'

export enum Iteration {
    THROW = 'throw',
    CONTINUE = 'continue',
    BREAK = 'break',
    RETURN = 'return',
}

export type ExecutionResult<ReturnValue> =
    | {
          iteration: Iteration.CONTINUE | Iteration.BREAK | Iteration.THROW
          error: Error
      }
    | { iteration: Iteration.RETURN; value: ReturnValue }

export async function executeHandler<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    ReturnValue,
>(
    handler: Handler<Arguments, Self, Trigger, ReturnValue>,
    context: { self: Self; error: Trigger; parameters: Arguments },
    debug: IDebugger,
): Promise<ExecutionResult<ReturnValue>> {
    const nextError: Error = context.error

    if (handler.scope && !(context.error instanceof handler.scope)) {
        debug('skipping handler because its scope did not match')
        return { iteration: Iteration.CONTINUE, error: nextError }
    }

    try {
        if (
            handler.predicate &&
            !(await handler.predicate.call(context.self, context.error, ...context.parameters))
        ) {
            debug('skipping handler because its predicate return false')
            return { iteration: Iteration.CONTINUE, error: nextError }
        }
    } catch (error) {
        return {
            iteration: Iteration.THROW,
            error: new PredicateError({ trigger: context.error, cause: error as Error, handler }),
        }
    }

    switch (handler.action) {
        case HandlerAction.MAP: {
            return mapHandler(debug, context, handler)
        }
        case HandlerAction.RECOVER: {
            return recoverHandler(debug, context, handler)
        }
        case HandlerAction.SIDE_EFFECT: {
            return sideEffectHandler(debug, context, handler)
        }
        case HandlerAction.TAP: {
            return tapHandler(debug, context, handler)
        }
        case HandlerAction.PASS_THROUGH: {
            return passThroughHandler(debug, context, handler)
        }
        default: {
            throw new RangeError(
                // @ts-expect-error
                `Unexpected handler action: ${handler.action as string}`,
            )
        }
    }
}
