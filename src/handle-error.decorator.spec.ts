jest.mock('./run-error-handlers')
jest.mock('./debug', () => {
    return { debug: jest.fn() }
})

import { debug } from './debug'
import { HandleError } from './handle-error.decorator'
import type { RunErrorHandlersMock } from './mock'
import { runErrorHandlers } from './run-error-handlers'

const runErrorHandlersMock = runErrorHandlers as RunErrorHandlersMock

describe('HandleError', () => {
    class Class {
        @HandleError()
        public async raise(error: Error): Promise<never> {
            throw error
        }

        @HandleError()
        public async method(): Promise<string> {
            return 'all good'
        }
    }

    let instance: Class

    beforeEach(() => {
        const mockDebug = debug as unknown as jest.Mock
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        mockDebug.extend = jest.fn().mockReturnValue(mockDebug)

        instance = new Class()
    })

    it('should not run error handlers if no error was thrown', async () => {
        await expect(instance.method()).resolves.toBe('all good')
        expect(runErrorHandlersMock).not.toHaveBeenCalled()
    })

    it('should run error handlers if an error was thrown', async () => {
        const error = new Error('Boom!')
        runErrorHandlersMock.mockResolvedValue('return value')

        await expect(instance.raise(error)).resolves.toBe('return value')
        expect(runErrorHandlersMock).toHaveBeenCalledWith(
            {
                self: instance,
                parameters: [error],
                error,
            },
            [],
            debug,
        )
    })
})
