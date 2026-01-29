import type { ErrorOptions } from '../error'
import { ShumwayError } from '../error'
import { Iteration } from '../execute-handler'
import { HandlerAction } from '../handler-action.enum'
import type { DebugMock } from '../mock'
import { mockDebugger } from '../mock'

import { CallbackErrorAction } from './callback-error-action.enum'
import { handleCallbackError } from './handle-callback-error'
import type { RecoverOptions } from './recover'

class WrappedError extends ShumwayError {
    public constructor(options: ErrorOptions) {
        super('A wrapped error', options)
    }
}

describe('handleCallbackError', () => {
    let trigger: Error
    let callbackError: Error
    let loggerMock: DebugMock
    // biome-ignore lint/suspicious/noExplicitAny: This is fine.
    let handler: RecoverOptions<any, any, any, any>

    beforeEach(() => {
        trigger = new Error('Boom!')
        callbackError = new Error('Oh noes!')
        loggerMock = mockDebugger()
        handler = {
            action: HandlerAction.RECOVER,
            callback: vi.fn(),
        }
    })

    it('should throw a wrapped error by default', () => {
        expect(
            handleCallbackError(
                {
                    trigger,
                    callbackError,
                    WrapperClass: WrappedError,
                    handler,
                },
                loggerMock,
            ),
        ).toEqual({
            iteration: Iteration.THROW,
            error: new WrappedError({
                trigger,
                cause: callbackError,
                handler,
            }),
        })
    })

    it('should throw a wrapped error', () => {
        handler.onCallbackError = CallbackErrorAction.THROW_WRAPPED

        expect(
            handleCallbackError(
                {
                    trigger,
                    callbackError,
                    WrapperClass: WrappedError,
                    handler,
                },
                loggerMock,
            ),
        ).toEqual({
            iteration: Iteration.THROW,
            error: new WrappedError({
                trigger,
                cause: callbackError,
                handler,
            }),
        })
    })

    it('should throw the callback error', () => {
        handler.onCallbackError = CallbackErrorAction.THROW

        expect(
            handleCallbackError(
                {
                    trigger,
                    callbackError,
                    WrapperClass: WrappedError,
                    handler,
                },
                loggerMock,
            ),
        ).toEqual({
            iteration: Iteration.THROW,
            error: callbackError,
        })
    })

    it('should throw the trigger error', () => {
        handler.onCallbackError = CallbackErrorAction.THROW_TRIGGER

        expect(
            handleCallbackError(
                {
                    trigger,
                    callbackError,
                    WrapperClass: WrappedError,
                    handler,
                },
                loggerMock,
            ),
        ).toEqual({
            iteration: Iteration.THROW,
            error: trigger,
        })
    })

    it('should throw for unexpected error actions', () => {
        handler.onCallbackError = 'whatevs' as CallbackErrorAction

        expect(() =>
            handleCallbackError(
                {
                    trigger,
                    callbackError,
                    WrapperClass: WrappedError,
                    handler,
                },
                loggerMock,
            ),
        ).toThrow(RangeError)
    })
})
