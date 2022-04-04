import type { tapHandler } from './tap.handler'
import type { TapCallback } from './tap.options'

export type TapCallbackMock<Arguments extends unknown[], Self, Trigger extends Error> = jest.Mock<
    ReturnType<TapCallback<Arguments, Self, Trigger>>,
    Parameters<TapCallback<Arguments, Self, Trigger>>
>

export function mockTapCallback<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
>(): TapCallbackMock<Arguments, Self, Trigger> {
    return jest.fn() as TapCallbackMock<Arguments, Self, Trigger>
}

export type TapMock = jest.Mock<ReturnType<typeof tapHandler>, Parameters<typeof tapHandler>>
