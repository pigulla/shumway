jest.mock('../handle-callback-error')

import { Iteration } from '../../execute-handler'
import { HandlerAction } from '../../handler-action.enum'
import { mockDebugger, mockMapCallback } from '../../mock'
import type { DebugMock, HandleCallbackErrorMock, MapCallbackMock } from '../../mock'
import { handleCallbackError } from '../handle-callback-error'

import { MapError } from './map.error'
import { mapHandler } from './map.handler'
import type { MapOptions } from './map.options'

const handleCallbackErrorMock = handleCallbackError as unknown as HandleCallbackErrorMock

describe('mapHandler', () => {
    class ThrownError extends Error {}
    class MappedError extends Error {}
    class Clazz {}

    let context: {
        self: Clazz
        error: ThrownError
        parameters: [string, number]
    }
    let loggerMock: DebugMock
    let handler: MapOptions<[string, number], Clazz, ThrownError, MappedError>
    let callback: MapCallbackMock<[string, number], Clazz, ThrownError, MappedError>

    beforeEach(() => {
        loggerMock = mockDebugger()
        callback = mockMapCallback()
        context = {
            self: new Clazz(),
            error: new ThrownError(),
            parameters: ['foo', 42],
        }
        handler = {
            action: HandlerAction.MAP,
            callback: callback,
        }
    })

    it('should continue with the mapped error', async () => {
        const mappedError = new MappedError()
        callback.mockReturnValue(mappedError)

        handler.continue = true
        await expect(mapHandler(loggerMock, context, handler)).resolves.toEqual({
            iteration: Iteration.CONTINUE,
            error: mappedError,
        })

        expect(callback).toHaveBeenCalledOnce()
        expect(callback).toHaveBeenCalledWith(context.error, 'foo', 42)
        expect(callback.mock.instances[0]).toBe(context.self)
        expect(handleCallbackErrorMock).not.toHaveBeenCalled()
    })

    it('should break with the mapped error', async () => {
        const mappedError = new MappedError()
        callback.mockReturnValue(mappedError)

        await expect(mapHandler(loggerMock, context, handler)).resolves.toEqual({
            iteration: Iteration.BREAK,
            error: mappedError,
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

        await expect(mapHandler(loggerMock, context, handler)).resolves.toEqual(
            handleCallbackErrorResult,
        )

        expect(callback).toHaveBeenCalledOnce()
        expect(callback).toHaveBeenCalledWith(context.error, 'foo', 42)
        expect(callback.mock.instances[0]).toBe(context.self)
        expect(handleCallbackErrorMock).toHaveBeenCalledWith(
            {
                trigger: context.error,
                callbackError,
                WrapperClass: MapError,
                handler,
            },
            loggerMock,
        )
    })
})
