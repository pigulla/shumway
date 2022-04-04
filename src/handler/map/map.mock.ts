import type { mapHandler } from './map.handler'
import type { MapCallback } from './map.options'

export type MapCallbackMock<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    Mapped extends Error,
> = jest.Mock<
    ReturnType<MapCallback<Arguments, Self, Trigger, Mapped>>,
    Parameters<MapCallback<Arguments, Self, Trigger, Mapped>>
>

export function mockMapCallback<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
    Mapped extends Error,
>(): MapCallbackMock<Arguments, Self, Trigger, Mapped> {
    return jest.fn() as MapCallbackMock<Arguments, Self, Trigger, Mapped>
}

export type MapMock = jest.Mock<ReturnType<typeof mapHandler>, Parameters<typeof mapHandler>>
