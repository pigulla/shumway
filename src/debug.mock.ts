import type { Debugger } from 'debug'

export type DebugMock = jest.Mocked<Debugger>

export function mockDebugger(): DebugMock {
    const debug = jest.fn()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    debug.extend = jest.fn().mockReturnValue(debug)

    return debug as Partial<DebugMock> as DebugMock
}
