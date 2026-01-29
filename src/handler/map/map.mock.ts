import { type Mock, vi } from 'vitest'
import type { mapHandler } from './map.handler'
import type { MapCallback } from './map.options'

export type MapCallbackMock<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    Mapped extends Error,
> = Mock<MapCallback<Arguments, Self, Trigger, Mapped>>

export function mockMapCallback<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    Mapped extends Error,
>(): MapCallbackMock<Arguments, Self, Trigger, Mapped> {
    return vi.fn() as MapCallbackMock<Arguments, Self, Trigger, Mapped>
}

export type MapMock = Mock<typeof mapHandler>
