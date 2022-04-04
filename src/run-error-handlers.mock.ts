import type { runErrorHandlers } from './run-error-handlers'

export type RunErrorHandlersMock = jest.Mock<
    ReturnType<typeof runErrorHandlers>,
    Parameters<typeof runErrorHandlers>
>
