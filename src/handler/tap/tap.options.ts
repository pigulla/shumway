import type { Promisable } from 'type-fest'

import type { HandlerAction } from '../../handler-action.enum'
import type { BaseOptions } from '../handler'

export type TapCallback<Arguments extends unknown[], Self, Trigger extends Error> = (
    this: Self,
    error: Trigger,
    ...parameters: Arguments
) => Promisable<void>

export interface TapOptions<Arguments extends unknown[], Self, Trigger extends Error>
    extends BaseOptions<Arguments, Self, Trigger> {
    action: HandlerAction.TAP
    callback: TapCallback<Arguments, Self, Trigger>
}
