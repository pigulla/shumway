import {
    ApiWrapperError,
    ApiWrapperInvalidResponseError,
    ApiWrapperRemoteError,
    ApiWrapperTimeoutError,
} from './api-wrapper-error'
import { ApiWrapper } from './api-wrapper.use-case'
import { DeviceEntity, DeviceNotFoundError } from './domain'
import {
    HTTPError,
    type HttpClient,
    Logger,
    TimeoutError,
    type Validator,
    ValidatorError,
} from './external'

type ConsoleMock = jest.Mocked<Console>

function mockConsole(): ConsoleMock {
    return {
        info: jest.fn(),
    } as Partial<ConsoleMock> as ConsoleMock
}

describe('ApiWrapper', () => {
    const deviceId = '47110815'
    let apiWrapper: ApiWrapper
    let console: ConsoleMock
    let httpClient: jest.Mocked<HttpClient>
    let validator: jest.Mocked<Validator>

    beforeEach(() => {
        console = mockConsole()
        httpClient = { request: jest.fn() }
        validator = { validate: jest.fn() }

        apiWrapper = new ApiWrapper(httpClient, validator, console)

        validator.validate.mockImplementation(value => value)
        httpClient.request.mockResolvedValue({
            result: { deviceId, deviceName: 'Der Gerät' },
        })
    })

    it('should return the result', async () => {
        await expect(apiWrapper.getDevice(deviceId)).resolves.toEqual(
            new DeviceEntity({ id: deviceId, name: 'Der Gerät' }),
        )
        expect(console.info).not.toHaveBeenCalled()
    })

    it('should map a TimeoutError', async () => {
        httpClient.request.mockRejectedValue(new TimeoutError())

        await expect(apiWrapper.getDevice(deviceId)).rejects.toThrow(ApiWrapperTimeoutError)
        expect(console.info).toHaveBeenCalledTimes(1)
    })

    it('should map a HTTPError with status 404', async () => {
        httpClient.request.mockRejectedValue(new HTTPError(404))

        await expect(apiWrapper.getDevice(deviceId)).rejects.toThrow(
            new DeviceNotFoundError(deviceId),
        )
        expect(console.info).toHaveBeenCalledTimes(1)
    })

    it('should map a HTTPError with status 500', async () => {
        httpClient.request.mockRejectedValue(new HTTPError(500))

        await expect(apiWrapper.getDevice(deviceId)).rejects.toThrow(ApiWrapperRemoteError)
        expect(console.info).toHaveBeenCalledTimes(1)
    })

    it('should map a ValidatorError', async () => {
        validator.validate.mockImplementation(() => {
            throw new ValidatorError()
        })

        await expect(apiWrapper.getDevice(deviceId)).rejects.toThrow(ApiWrapperInvalidResponseError)
        expect(console.info).toHaveBeenCalledTimes(1)
    })

    it('should map other errors', async () => {
        const error = new SyntaxError()
        httpClient.request.mockRejectedValue(error)

        await expect(apiWrapper.getDevice(deviceId)).rejects.toThrow(new ApiWrapperError(error))
        expect(console.info).toHaveBeenCalledTimes(1)
    })
})
