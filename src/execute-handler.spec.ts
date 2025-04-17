jest.mock('./handler/recover/recover.handler')
jest.mock('./handler/pass-through/pass-through.handler')
jest.mock('./handler/side-effect/side-effect.handler')
jest.mock('./handler/recover/recover.handler')
jest.mock('./handler/tap/tap.handler')
jest.mock('./handler/map/map.handler')

import type { ExecutionResult } from './execute-handler'
import { Iteration, executeHandler } from './execute-handler'
import { PredicateError } from './handler'
import { HandlerAction } from './handler-action.enum'
import { mapHandler } from './handler/map'
import { passThroughHandler } from './handler/pass-through'
import { recoverHandler } from './handler/recover'
import { sideEffectHandler } from './handler/side-effect'
import type { TapOptions } from './handler/tap'
import { tapHandler } from './handler/tap'
import { mockDebugger } from './mock'
import type {
    DebugMock,
    MapMock,
    PassThroughMock,
    RecoverMock,
    SideEffectMock,
    TapMock,
} from './mock'

const tapMock: TapMock = tapHandler as TapMock
const mapMock: MapMock = mapHandler as MapMock
const passThroughMock: PassThroughMock = passThroughHandler as PassThroughMock
const sideEffectMock: SideEffectMock = sideEffectHandler as SideEffectMock
const recoverMock: RecoverMock = recoverHandler as RecoverMock

describe('executeHandler', () => {
    type Arguments = [string, number]
    type Self = Record<string, unknown>
    type ReturnValue = number
    type Trigger = Error

    let error: Trigger
    let self: Self
    let parameters: Arguments
    let context: { self: Self; error: Trigger; parameters: Arguments }
    let loggerMock: DebugMock
    let executionResult: ExecutionResult<ReturnValue>

    beforeEach(() => {
        self = {}
        error = new Error('Boom!')
        parameters = ['foo', 42]
        context = { self, error, parameters }
        loggerMock = mockDebugger()
        executionResult = {
            iteration: Iteration.RETURN,
            value: 42,
        }
    })

    describe('when no handler is actually invoked', () => {
        let handlerMock: TapOptions<Arguments, Self, Trigger>

        class NamelessScopeError extends Error {}
        class ScopeError extends Error {}

        beforeEach(() => {
            handlerMock = {
                action: HandlerAction.TAP,
                callback: jest.fn(),
            }
        })

        afterEach(() => {
            expect(tapMock).not.toHaveBeenCalled()
        })

        it('should continue if the scope does not match', async () => {
            handlerMock.scope = ScopeError

            await expect(executeHandler(handlerMock, context, loggerMock)).resolves.toEqual<
                ExecutionResult<ReturnValue>
            >({ iteration: Iteration.CONTINUE, error })
        })

        it('should continue if a nameless scope does not match', async () => {
            handlerMock.scope = NamelessScopeError

            await expect(executeHandler(handlerMock, context, loggerMock)).resolves.toEqual<
                ExecutionResult<ReturnValue>
            >({ iteration: Iteration.CONTINUE, error })
        })

        it('should continue if the predicate does not match', async () => {
            const predicateMock = jest.fn().mockReturnValue(false)
            handlerMock.predicate = predicateMock

            await expect(executeHandler(handlerMock, context, loggerMock)).resolves.toEqual<
                ExecutionResult<ReturnValue>
            >({ iteration: Iteration.CONTINUE, error })
            expect(predicateMock).toHaveBeenCalledTimes(1)
            expect(predicateMock).toHaveBeenCalledWith(error, 'foo', 42)
            expect(predicateMock.mock.instances[0]).toBe(self)
        })

        it('should throw if the action is invalid', async () => {
            handlerMock.action = 'oops' as HandlerAction.TAP

            await expect(executeHandler(handlerMock, context, loggerMock)).rejects.toThrow(
                RangeError,
            )
        })

        it('should throw if the predicate callback throws', async () => {
            const predicateError = new Error('Boom!')
            handlerMock.predicate = jest.fn().mockRejectedValue(predicateError)

            await expect(executeHandler(handlerMock, context, loggerMock)).resolves.toEqual({
                iteration: Iteration.THROW,
                error: new PredicateError({
                    trigger: context.error,
                    handler: handlerMock,
                    cause: predicateError,
                }),
            })
        })
    })

    it(`should call the 'map' handler`, async () => {
        const handlerMock = {
            action: HandlerAction.MAP,
            callback: jest.fn(),
        }
        mapMock.mockResolvedValue(executionResult)

        await expect(executeHandler(handlerMock, context, loggerMock)).resolves.toEqual(
            executionResult,
        )
        expect(mapMock).toHaveBeenCalledWith(loggerMock, context, handlerMock)
    })

    it(`should call the 'recover' handler`, async () => {
        const handlerMock = {
            action: HandlerAction.RECOVER,
            callback: jest.fn(),
        }
        recoverMock.mockResolvedValue(executionResult)

        await expect(executeHandler(handlerMock, context, loggerMock)).resolves.toEqual(
            executionResult,
        )
        expect(recoverMock).toHaveBeenCalledWith(loggerMock, context, handlerMock)
    })

    it(`should call the 'tap' handler`, async () => {
        const handlerMock = {
            action: HandlerAction.TAP,
            callback: jest.fn(),
        }
        tapMock.mockResolvedValue(executionResult)

        await expect(executeHandler(handlerMock, context, loggerMock)).resolves.toEqual(
            executionResult,
        )
        expect(tapMock).toHaveBeenCalledWith(loggerMock, context, handlerMock)
    })

    it(`should call the 'sideEffect' handler`, async () => {
        const handlerMock = {
            action: HandlerAction.SIDE_EFFECT,
            callback: jest.fn(),
        }
        sideEffectMock.mockResolvedValue(executionResult)

        await expect(executeHandler(handlerMock, context, loggerMock)).resolves.toEqual(
            executionResult,
        )
        expect(sideEffectMock).toHaveBeenCalledWith(loggerMock, context, handlerMock)
    })

    it(`should call the 'passThrough' handler`, async () => {
        const handlerMock = {
            action: HandlerAction.PASS_THROUGH,
            callback: jest.fn(),
        }
        passThroughMock.mockResolvedValue(executionResult)

        await expect(executeHandler(handlerMock, context, loggerMock)).resolves.toEqual(
            executionResult,
        )
        expect(passThroughMock).toHaveBeenCalledWith(loggerMock, context, handlerMock)
    })
})
