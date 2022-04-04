import { Iteration } from '../../execute-handler'
import { HandlerAction } from '../../handler-action.enum'
import type { DebugMock } from '../../mock'
import { mockDebugger } from '../../mock'

import { passThroughHandler } from './pass-through.handler'
import type { PassThroughOptions } from './pass-through.options'

describe('passThroughHandlerHandler', () => {
    class ThrownError extends Error {}
    class Clazz {}

    let context: {
        self: Clazz
        error: Error
        parameters: [string, number]
    }
    let loggerMock: DebugMock
    let handler: PassThroughOptions<[string, number], Clazz, ThrownError>

    beforeEach(() => {
        loggerMock = mockDebugger()
        context = {
            self: new Clazz(),
            error: new ThrownError(),
            parameters: ['foo', 42],
        }
        handler = {
            action: HandlerAction.PASS_THROUGH,
        }
    })

    it('should break with the throw the error', async () => {
        await expect(passThroughHandler(loggerMock, context, handler)).resolves.toEqual({
            iteration: Iteration.BREAK,
            error: context.error,
        })
    })
})
