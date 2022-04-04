jest.mock('./execute-handler')

import { executeHandler, Iteration } from './execute-handler'
import type { BaseOptions, Handler } from './handler'
import type { HandlerAction } from './handler-action.enum'
import type { DebugMock, ExecuteHandlerMock } from './mock'
import { mockDebugger } from './mock'
import { runErrorHandlers } from './run-error-handlers'

const executeHandlerMock = executeHandler as ExecuteHandlerMock

export function mockHandler<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
>(): BaseOptions<Arguments, Self, Trigger> {
    return {
        action: '<mocked>' as HandlerAction,
        predicate: jest.fn(),
    }
}

describe('runErrorHandlers', () => {
    type Self = Object
    type Arguments = [string, number]
    type ReturnValue = string
    type Trigger = Error

    let trigger: Trigger
    let self: Self
    let parameters: Arguments
    let logger: DebugMock
    let context: { self: Self; parameters: Arguments; error: Trigger }

    beforeEach(() => {
        logger = mockDebugger()
        trigger = new Error('Boom!')
        self = {}
        parameters = ['foo', 42]
        context = { self, parameters, error: trigger }
    })

    it('should throw the error if no handlers are given', async () => {
        await expect(runErrorHandlers(context, [], logger)).rejects.toThrow(trigger)
    })

    it('should throw the error thrown by a handler', async () => {
        const error = new Error('Oh noes!')
        const handler = mockHandler()
        const handlers = [handler] as Handler<Arguments, Self, Trigger, ReturnValue>[]

        executeHandlerMock.mockRejectedValueOnce(error)

        await expect(runErrorHandlers(context, handlers, logger)).rejects.toThrow(error)
        expect(executeHandlerMock).toHaveBeenCalledTimes(1)
        expect(executeHandlerMock).toHaveBeenCalledWith(
            handler,
            {
                self,
                parameters,
                error: trigger,
            },
            logger,
        )
    })

    it('should stop calling handlers if one breaks the loop', async () => {
        const firstMappedError = new Error('mapped once')
        const secondMappedError = new Error('mapped twice')
        const handlers = [mockHandler(), mockHandler(), mockHandler()] as Handler<
            Arguments,
            Self,
            Trigger,
            ReturnValue
        >[]

        executeHandlerMock
            .mockResolvedValueOnce({
                iteration: Iteration.CONTINUE,
                error: firstMappedError,
            })
            .mockResolvedValueOnce({
                iteration: Iteration.BREAK,
                error: secondMappedError,
            })
            .mockResolvedValueOnce({
                iteration: Iteration.CONTINUE,
                error: new Error('i do not matter'),
            })

        await expect(runErrorHandlers(context, handlers, logger)).rejects.toThrow(secondMappedError)
        expect(executeHandlerMock).toHaveBeenCalledTimes(2)
        expect(executeHandlerMock).toHaveBeenCalledWith(
            handlers[0],
            {
                self,
                parameters,
                error: trigger,
            },
            logger,
        )
        expect(executeHandlerMock).toHaveBeenCalledWith(
            handlers[1],
            {
                self,
                parameters,
                error: firstMappedError,
            },
            logger,
        )
    })

    it('should keep mapping errors throughout the loop', async () => {
        const firstMappedError = new Error('mapped once')
        const secondMappedError = new Error('mapped twice')
        const thirdMappedError = new Error('mapped thrice')
        const handlers = [mockHandler(), mockHandler(), mockHandler()] as Handler<
            Arguments,
            Self,
            Trigger,
            ReturnValue
        >[]

        executeHandlerMock
            .mockResolvedValueOnce({
                iteration: Iteration.CONTINUE,
                error: firstMappedError,
            })
            .mockResolvedValueOnce({
                iteration: Iteration.CONTINUE,
                error: secondMappedError,
            })
            .mockResolvedValueOnce({
                iteration: Iteration.CONTINUE,
                error: thirdMappedError,
            })

        await expect(runErrorHandlers(context, handlers, logger)).rejects.toThrow(thirdMappedError)
        expect(executeHandlerMock).toHaveBeenCalledTimes(3)
        expect(executeHandlerMock).toHaveBeenCalledWith(
            handlers[0],
            {
                self,
                parameters,
                error: trigger,
            },
            logger,
        )
        expect(executeHandlerMock).toHaveBeenCalledWith(
            handlers[1],
            {
                self,
                parameters,
                error: firstMappedError,
            },
            logger,
        )
        expect(executeHandlerMock).toHaveBeenCalledWith(
            handlers[2],
            {
                self,
                parameters,
                error: secondMappedError,
            },
            logger,
        )
    })

    it('should return the value returned from a handler', async () => {
        const returnValue = 'new return value'
        const handler = mockHandler()
        const handlers = [handler] as Handler<Arguments, Self, Trigger, ReturnValue>[]

        executeHandlerMock.mockResolvedValue({ iteration: Iteration.RETURN, value: returnValue })

        await expect(runErrorHandlers(context, handlers, logger)).resolves.toBe(returnValue)
        expect(executeHandlerMock).toHaveBeenCalledTimes(1)
        expect(executeHandlerMock).toHaveBeenCalledWith(
            handler,
            {
                self,
                parameters,
                error: trigger,
            },
            logger,
        )
    })

    it('should throw the error returned from a handler', async () => {
        const handler = mockHandler()
        const handlers = [handler] as Handler<Arguments, Self, Trigger, ReturnValue>[]
        const error = new Error('Boom!')

        executeHandlerMock.mockResolvedValue({ iteration: Iteration.THROW, error })

        await expect(runErrorHandlers(context, handlers, logger)).rejects.toThrow(error)
        expect(executeHandlerMock).toHaveBeenCalledTimes(1)
        expect(executeHandlerMock).toHaveBeenCalledWith(
            handler,
            {
                self,
                parameters,
                error: trigger,
            },
            logger,
        )
    })

    it('should throw for an unexpected iteration value', async () => {
        const handler = mockHandler()
        const handlers = [handler] as Handler<Arguments, Self, Trigger, ReturnValue>[]

        executeHandlerMock.mockResolvedValue({
            iteration: 'whatevs' as Iteration.RETURN,
            value: 42,
        })

        await expect(runErrorHandlers(context, handlers, logger)).rejects.toThrow(RangeError)
        expect(executeHandlerMock).toHaveBeenCalledTimes(1)
        expect(executeHandlerMock).toHaveBeenCalledWith(
            handler,
            {
                self,
                parameters,
                error: trigger,
            },
            logger,
        )
    })
})
