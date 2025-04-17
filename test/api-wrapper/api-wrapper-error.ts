import type { HTTPError, TimeoutError, ValidatorError } from './external'

export class ApiWrapperError<T extends Error = Error> extends Error {
    public readonly cause: T

    public constructor(cause: T) {
        // In a real application, we would obviously want to be a tad more specific ;)
        super('An error occurred')

        this.cause = cause
    }
}

export class ApiWrapperRemoteError extends ApiWrapperError<HTTPError> {}

export class ApiWrapperTimeoutError extends ApiWrapperError<TimeoutError> {}

export class ApiWrapperInvalidResponseError extends ApiWrapperError<ValidatorError> {}
