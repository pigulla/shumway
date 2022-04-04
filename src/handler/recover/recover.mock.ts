import type { recoverHandler } from './recover.handler'
import type { RecoverCallback } from './recover.options'

export type RecoverCallbackMock<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    ReturnValue,
> = jest.Mock<
    ReturnType<RecoverCallback<Arguments, Self, Trigger, ReturnValue>>,
    Parameters<RecoverCallback<Arguments, Self, Trigger, ReturnValue>>
>

export function mockRecoverCallback<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    ReturnValue,
>(): RecoverCallbackMock<Arguments, Self, Trigger, ReturnValue> {
    return jest.fn() as RecoverCallbackMock<Arguments, Self, Trigger, ReturnValue>
}

export type RecoverMock = jest.Mock<
    ReturnType<typeof recoverHandler>,
    Parameters<typeof recoverHandler>
>
