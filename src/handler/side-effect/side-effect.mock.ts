import type { sideEffectHandler } from './side-effect.handler'
import type { SideEffectCallback } from './side-effect.options'

export type SideEffectCallbackMock<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
> = jest.Mock<
    ReturnType<SideEffectCallback<Arguments, Self, Trigger>>,
    Parameters<SideEffectCallback<Arguments, Self, Trigger>>
>

export function mockSideEffectCallback<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
>(): SideEffectCallbackMock<Arguments, Self, Trigger> {
    return jest.fn() as SideEffectCallbackMock<Arguments, Self, Trigger>
}

export type SideEffectMock = jest.Mock<
    ReturnType<typeof sideEffectHandler>,
    Parameters<typeof sideEffectHandler>
>
