jest.mock('./../handle-callback-error')

import { Iteration } from '../../execute-handler'
import { HandlerAction } from '../../handler-action.enum'
import type { DebugMock, RecoverCallbackMock, HandleCallbackErrorMock } from '../../mock'
import { mockDebugger, mockRecoverCallback } from '../../mock'
import { handleCallbackError } from '../handle-callback-error'

import { RecoverError } from './recover.error'
import { recoverHandler } from './recover.handler'
import type { RecoverOptions } from './recover.options'

const handleCallbackErrorMock = handleCallbackError as unknown as HandleCallbackErrorMock

describe('recoverHandler', () => {
    class ThrownError extends Error {}
    class Clazz {}

    let context: {
        self: Clazz
        error: Error
        parameters: [string, number]
    }
    let loggerMock: DebugMock
    let handler: RecoverOptions<[string, number], Clazz, ThrownError, string>
    let callback: RecoverCallbackMock<[string, number], Clazz, ThrownError, string>

    beforeEach(() => {
        loggerMock = mockDebugger()
        callback = mockRecoverCallback()
        context = {
            self: new Clazz(),
            error: new ThrownError(),
            parameters: ['foo', 42],
        }
        handler = {
            action: HandlerAction.RECOVER,
            callback,
        }
    })

    it('should return the replacement value', async () => {
        callback.mockReturnValue('bar')

        await expect(recoverHandler(loggerMock, context, handler)).resolves.toEqual({
            iteration: Iteration.RETURN,
            value: 'bar',
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

        await expect(recoverHandler(loggerMock, context, handler)).resolves.toEqual(
            handleCallbackErrorResult,
        )

        expect(callback).toHaveBeenCalledOnce()
        expect(callback).toHaveBeenCalledWith(context.error, 'foo', 42)
        expect(callback.mock.instances[0]).toBe(context.self)
        expect(handleCallbackErrorMock).toHaveBeenCalledWith(
            {
                trigger: context.error,
                callbackError,
                WrapperClass: RecoverError,
                handler,
            },
            loggerMock,
        )
    })
})
