import type { passThroughHandler } from './pass-through.handler'

export type PassThroughMock = jest.Mock<
    ReturnType<typeof passThroughHandler>,
    Parameters<typeof passThroughHandler>
>
