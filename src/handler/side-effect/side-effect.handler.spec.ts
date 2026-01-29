vi.mock('./../handle-callback-error')

import { Iteration } from '../../execute-handler'
import { HandlerAction } from '../../handler-action.enum'
import type { DebugMock, HandleCallbackErrorMock, SideEffectCallbackMock } from '../../mock'
import { mockDebugger, mockSideEffectCallback } from '../../mock'
import { handleCallbackError } from '../handle-callback-error'

import { SideEffectError } from './side-effect.error'
import { sideEffectHandler } from './side-effect.handler'
import type { SideEffectOptions } from './side-effect.options'

const handleCallbackErrorMock = handleCallbackError as unknown as HandleCallbackErrorMock

describe('sideEffectHandler', () => {
    class ThrownError extends Error {}
    class Clazz {}

    let context: {
        self: Clazz
        error: Error
        parameters: [string, number]
    }
    let loggerMock: DebugMock
    let handler: SideEffectOptions<[string, number], Clazz, ThrownError>
    let callback: SideEffectCallbackMock<[string, number], Clazz, ThrownError>

    beforeEach(() => {
        loggerMock = mockDebugger()
        callback = mockSideEffectCallback()
        context = {
            self: new Clazz(),
            error: new ThrownError(),
            parameters: ['foo', 42],
        }
        handler = {
            action: HandlerAction.SIDE_EFFECT,
            callback,
        }
    })

    it('should break with the triggering error', async () => {
        await expect(sideEffectHandler(loggerMock, context, handler)).resolves.toEqual({
            iteration: Iteration.BREAK,
            error: context.error,
        })

        expect(callback).toHaveBeenCalledOnce()
        expect(callback).toHaveBeenCalledWith(context.error, 'foo', 42)
        expect(callback.mock.instances[0]).toBe(context.self)
        expect(handleCallbackErrorMock).not.toHaveBeenCalled()
    })

    it('should delegate to handleCallbackErrorMock', async () => {
        const callbackError = new Error('Boom!')
        const handleCallbackErrorResult: ReturnType<typeof handleCallbackError> = {
            iteration: Iteration.THROW,
            error: callbackError,
        }
        callback.mockRejectedValue(callbackError)
        handleCallbackErrorMock.mockReturnValue(handleCallbackErrorResult)

        await expect(sideEffectHandler(loggerMock, context, handler)).resolves.toEqual(
            handleCallbackErrorResult,
        )

        expect(callback).toHaveBeenCalledOnce()
        expect(callback).toHaveBeenCalledWith(context.error, 'foo', 42)
        expect(callback.mock.instances[0]).toBe(context.self)
        expect(handleCallbackErrorMock).toHaveBeenCalledWith(
            {
                trigger: context.error,
                callbackError,
                WrapperClass: SideEffectError,
                handler,
            },
            loggerMock,
        )
    })
})
