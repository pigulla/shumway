import { Iteration } from '../../execute-handler'
import { HandlerAction } from '../../handler-action.enum'
import { mockDebugger, mockTapCallback } from '../../mock'
import type { DebugMock, TapCallbackMock } from '../../mock'

import { tapHandler } from './tap.handler'
import type { TapOptions } from './tap.options'

describe('tapHandler', () => {
    class ThrownError extends Error {}
    class Clazz {}

    let context: {
        self: Clazz
        error: Error
        parameters: [string, number]
    }
    let loggerMock: DebugMock
    let handler: TapOptions<[string, number], Clazz, ThrownError>
    let callback: TapCallbackMock<[string, number], Clazz, ThrownError>

    beforeEach(() => {
        loggerMock = mockDebugger()
        callback = mockTapCallback()
        context = {
            self: new Clazz(),
            error: new ThrownError(),
            parameters: ['foo', 42],
        }
        handler = {
            action: HandlerAction.TAP,
            callback,
        }
    })

    it('should continue with the triggering error', async () => {
        await expect(tapHandler(loggerMock, context, handler)).resolves.toEqual({
            iteration: Iteration.CONTINUE,
            error: context.error,
        })

        expect(callback).toHaveBeenCalledOnce()
        expect(callback).toHaveBeenCalledWith(context.error, 'foo', 42)
        expect(callback.mock.instances[0]).toBe(context.self)
    })

    it('should continue with the triggering error when the callback throws', async () => {
        callback.mockRejectedValue(new Error('Boom!'))

        await expect(tapHandler(loggerMock, context, handler)).resolves.toEqual({
            iteration: Iteration.CONTINUE,
            error: context.error,
        })

        expect(callback).toHaveBeenCalledOnce()
        expect(callback).toHaveBeenCalledWith(context.error, 'foo', 42)
        expect(callback.mock.instances[0]).toBe(context.self)
    })
})
