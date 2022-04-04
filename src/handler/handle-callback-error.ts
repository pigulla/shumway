import type { IDebugger } from 'debug'
import type { Class } from 'type-fest'

import type { ShumwayError } from '../error'
import { Iteration } from '../execute-handler'

import { CallbackErrorAction } from './callback-error-action.enum'
import type { Handler } from './handler'

export function handleCallbackError<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    ReturnValue,
>(
    {
        trigger,
        callbackError,
        WrapperClass,
        handler,
    }: {
        trigger: Error
        callbackError: Error
        WrapperClass: Class<ShumwayError>
        handler: Handler<Arguments, Self, Trigger, ReturnValue>
    },
    debug: IDebugger,
): { iteration: Iteration.THROW | Iteration.BREAK | Iteration.CONTINUE; error: Error } {
    debug('%s handler threw an error: %s', handler.action, callbackError.message)
    const callbackErrorAction =
        'callbackErrorAction' in handler
            ? handler.callbackErrorAction
            : CallbackErrorAction.THROW_WRAPPED

    switch (callbackErrorAction) {
        case CallbackErrorAction.THROW_WRAPPED: {
            debug(
                'error action is set to %s, throwing a %s instead',
                callbackErrorAction,
                WrapperClass.name,
            )
            return {
                iteration: Iteration.THROW,
                error: new WrapperClass({
                    trigger,
                    cause: callbackError,
                    handler,
                }),
            }
        }
        case CallbackErrorAction.THROW: {
            debug(
                'error action is set to %s, throwing the error from the callback',
                callbackErrorAction,
            )
            return {
                iteration: Iteration.THROW,
                error: callbackError,
            }
        }
        case CallbackErrorAction.THROW_TRIGGER: {
            debug(
                'error action is set to %s, throwing the trigger error',
                callbackErrorAction,
                WrapperClass.name,
            )
            return {
                iteration: Iteration.THROW,
                error: trigger,
            }
        }
        default:
            throw new RangeError(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `Unexpected action for callback error handling: ${callbackErrorAction}`,
            )
    }
}
