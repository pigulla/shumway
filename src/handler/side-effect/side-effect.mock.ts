import { type Mock, vi } from 'vitest'
import type { sideEffectHandler } from './side-effect.handler'
import type { SideEffectCallback } from './side-effect.options'

export type SideEffectCallbackMock<Arguments extends unknown[], Self, Trigger extends Error> = Mock<
    SideEffectCallback<Arguments, Self, Trigger>
>

export function mockSideEffectCallback<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
>(): SideEffectCallbackMock<Arguments, Self, Trigger> {
    return vi.fn() as SideEffectCallbackMock<Arguments, Self, Trigger>
}

export type SideEffectMock = Mock<typeof sideEffectHandler>
