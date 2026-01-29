import type { Mock } from 'vitest'
import type { passThroughHandler } from './pass-through.handler'

export type PassThroughMock = Mock<typeof passThroughHandler>
