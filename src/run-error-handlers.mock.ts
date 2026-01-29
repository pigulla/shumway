import type { Mock } from 'vitest'
import type { runErrorHandlers } from './run-error-handlers'

export type RunErrorHandlersMock = Mock<typeof runErrorHandlers>
