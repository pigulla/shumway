import { type Mock, vi } from 'vitest'
import type { tapHandler } from './tap.handler'
import type { TapCallback } from './tap.options'

export type TapCallbackMock<Arguments extends unknown[], Self, Trigger extends Error> = Mock<
    TapCallback<Arguments, Self, Trigger>
>

export function mockTapCallback<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
>(): TapCallbackMock<Arguments, Self, Trigger> {
    return vi.fn() as TapCallbackMock<Arguments, Self, Trigger>
}

export type TapMock = Mock<typeof tapHandler>
