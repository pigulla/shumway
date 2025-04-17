import type { Debugger } from 'debug'

export type DebugMock = jest.Mocked<Debugger>

export function mockDebugger(): DebugMock {
    const debug = jest.fn()

    // @ts-expect-error
    debug.extend = jest.fn().mockReturnValue(debug)

    return debug as Partial<DebugMock> as DebugMock
}
