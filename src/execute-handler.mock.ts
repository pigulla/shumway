import type { Mock } from 'vitest'
import type { executeHandler } from './execute-handler'

export type ExecuteHandlerMock = Mock<typeof executeHandler>
