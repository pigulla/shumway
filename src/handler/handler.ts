import type { Class, Promisable } from 'type-fest'

import type { HandlerAction } from '../handler-action.enum'

import type { MapOptions } from './map'
import type { PassThroughOptions } from './pass-through'
import type { RecoverOptions } from './recover'
import type { SideEffectOptions } from './side-effect'
import type { TapOptions } from './tap'

export type Predicate<Arguments extends unknown[], Self, Trigger extends Error> = (
    this: Self,
    error: Trigger,
    ...parameters: Arguments
) => Promisable<boolean>

export interface BaseOptions<Arguments extends unknown[], Self, Trigger extends Error> {
    action: HandlerAction
    scope?: (error: Error) => Promisable<boolean | Class<Error>>
    predicate?: Predicate<Arguments, Self, Trigger> | undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyHandler = BaseOptions<any, any, any>

export type Handler<Arguments extends unknown[], Self, Trigger extends Error, ReturnValue> =
    | MapOptions<Arguments, Self, Trigger, Error>
    | RecoverOptions<Arguments, Self, Trigger, ReturnValue>
    | SideEffectOptions<Arguments, Self, Trigger>
    | TapOptions<Arguments, Self, Trigger>
    | PassThroughOptions<Arguments, Self, Trigger>
