import type { Debugger } from 'debug'
import { type Mocked, vi } from 'vitest'

export type DebugMock = Mocked<Debugger>

export function mockDebugger(): DebugMock {
    const debug = vi.fn()

    // @ts-expect-error
    debug.extend = vi.fn().mockReturnValue(debug)

    return debug as Partial<DebugMock> as DebugMock
}
