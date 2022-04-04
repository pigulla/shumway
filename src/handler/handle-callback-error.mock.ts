import type { handleCallbackError } from './handle-callback-error'

export type HandleCallbackErrorMock = jest.Mock<
    ReturnType<typeof handleCallbackError>,
    Parameters<typeof handleCallbackError>
>
