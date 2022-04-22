import type { Promisable } from 'type-fest'

import type { HandlerAction } from '../../handler-action.enum'
import type { CallbackErrorAction } from '../callback-error-action.enum'
import type { BaseOptions } from '../handler'

export type MapCallback<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    Mapped extends Error,
> = (this: Self, error: Trigger, ...parameters: Arguments) => Promisable<Mapped>

export interface MapOptions<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    Mapped extends Error,
> extends BaseOptions<Arguments, Self, Trigger> {
    action: HandlerAction.MAP
    callback: MapCallback<Arguments, Self, Trigger, Mapped>
    onCallbackError?: CallbackErrorAction
    continue?: boolean
}
