// Mapping an error that we defined and threw ourselves in the first place is rather pointless. But
// in a real project this would typically be defined inside a library, like HTTPError from the
// got package (https://github.com/sindresorhus/got).

export class HttpClientError extends Error {
    public override name = 'HttpClientError'
}

export class HTTPError extends HttpClientError {
    public override name = 'HTTPError'
    public readonly statusCode: number

    public constructor(statusCode: number) {
        super()

        this.statusCode = statusCode
    }
}

export class TimeoutError extends HttpClientError {
    public override name = 'TimeoutError'
}
