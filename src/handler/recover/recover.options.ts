import type { Promisable } from 'type-fest'

import type { HandlerAction } from '../../handler-action.enum'
import type { CallbackErrorAction } from '../callback-error-action.enum'
import type { BaseOptions } from '../handler'

export type RecoverCallback<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    ReturnValue,
> = (this: Self, error: Trigger, ...parameters: Arguments) => Promisable<ReturnValue>

export interface RecoverOptions<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    ReturnValue,
> extends BaseOptions<Arguments, Self, Trigger> {
    action: HandlerAction.RECOVER
    callback: RecoverCallback<Arguments, Self, Trigger, ReturnValue>
    onCallbackError?: CallbackErrorAction
    continueOnCallbackError?: boolean
}
