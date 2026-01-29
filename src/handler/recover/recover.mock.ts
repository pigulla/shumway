import { type Mock, vi } from 'vitest'
import type { recoverHandler } from './recover.handler'
import type { RecoverCallback } from './recover.options'

export type RecoverCallbackMock<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    ReturnValue,
> = Mock<RecoverCallback<Arguments, Self, Trigger, ReturnValue>>

export function mockRecoverCallback<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    ReturnValue,
>(): RecoverCallbackMock<Arguments, Self, Trigger, ReturnValue> {
    return vi.fn() as RecoverCallbackMock<Arguments, Self, Trigger, ReturnValue>
}

export type RecoverMock = Mock<typeof recoverHandler>
