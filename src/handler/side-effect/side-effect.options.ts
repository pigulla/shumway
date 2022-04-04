import type { Promisable } from 'type-fest'

import type { HandlerAction } from '../../handler-action.enum'
import type { CallbackErrorAction } from '../callback-error-action.enum'
import type { BaseOptions } from '../handler'

export type SideEffectCallback<Arguments extends unknown[], Self, Trigger extends Error> = (
    this: Self,
    error: Trigger,
    ...parameters: Arguments
) => Promisable<void>

export interface SideEffectOptions<Arguments extends unknown[], Self, Trigger extends Error>
    extends BaseOptions<Arguments, Self, Trigger> {
    action: HandlerAction.SIDE_EFFECT
    callback: SideEffectCallback<Arguments, Self, Trigger>
    callbackErrorAction?: CallbackErrorAction
    continueOnCallbackError?: boolean
}
