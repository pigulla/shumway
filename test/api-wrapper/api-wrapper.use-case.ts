import { HttpClient, HTTPError, TimeoutError, Validator, ValidatorError } from './external'
import {
    ApiWrapperError,
    ApiWrapperInvalidResponseError,
    ApiWrapperRemoteError,
    ApiWrapperTimeoutError,
} from './api-wrapper-error'
import { HandleError, HandlerAction } from '../../src'
import { DeviceEntity, DeviceNotFoundError } from './domain'

export class ApiWrapper {
    private readonly httpClient: HttpClient
    private readonly validator: Validator
    private readonly logger: Console

    public constructor(httpClient: HttpClient, validator: Validator, logger: Console) {
        this.httpClient = httpClient
        this.validator = validator
        this.logger = logger
    }

    // This doesn't really improve things much if this is the only place you need this logic. But in
    // a real application we would probably want the same (or similar) error handling for quite a
    // few methods.
    @HandleError<ApiWrapper['getDevice'], ApiWrapper>(
        {
            action: HandlerAction.TAP,
            // Note that we can't use an arrow function here because we need the proper context.
            callback(error, id) {
                this.logger.info(`[getDevice] failed for device id ${id}: ${error.message}`)
            },
        },
        {
            // Farther up the call stack, this would be mapped to a 504 Gateway Timeout.
            action: HandlerAction.MAP,
            scope: () => TimeoutError,
            callback: error => new ApiWrapperTimeoutError(error),
        },
        {
            // Farther up the call stack, this would be mapped to a 404 Not Found.
            action: HandlerAction.MAP,
            scope: () => HTTPError,
            predicate: error => (error as HTTPError).statusCode === 404,
            callback: (_error, id) => new DeviceNotFoundError(id),
        },
        {
            // Farther up the call stack, this would be mapped to a 400 Bad Request or
            // 502 Bad Gateway, depending on the error from upstream.
            action: HandlerAction.MAP,
            scope: () => HTTPError,
            callback: error => new ApiWrapperRemoteError(error as HTTPError),
        },
        {
            // Farther up the call stack, this would be mapped to a 502 Bad Gateway.
            action: HandlerAction.MAP,
            scope: () => ValidatorError,
            callback: error => new ApiWrapperInvalidResponseError(error as ValidatorError),
        },
        {
            // Farther up the call stack, this would be mapped to a 500 Internal Server Error.
            action: HandlerAction.MAP,
            callback: error => new ApiWrapperError(error),
        },
    )
    public async getDevice(id: string): Promise<DeviceEntity> {
        type Response = { result: { deviceId: string; deviceName: string } }

        const response = await this.httpClient.request<Response>(
            'http://external.api.local/devices',
            {
                deviceId: id,
            },
        )
        const { deviceId, deviceName } = this.validator.validate(response).result

        return new DeviceEntity({ id: deviceId, name: deviceName })
    }
}
