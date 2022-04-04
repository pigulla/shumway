import type { executeHandler } from './execute-handler'

export type ExecuteHandlerMock = jest.Mock<
    ReturnType<typeof executeHandler>,
    Parameters<typeof executeHandler>
>
