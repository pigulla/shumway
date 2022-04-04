import type { AnyHandler } from './handler'

export type ErrorOptions = {
    trigger: Error
    cause: Error
    handler: AnyHandler
}

export abstract class ShumwayError extends Error {
    public override name = 'ShumwayError'
    public readonly handler: AnyHandler

    public readonly trigger: Error
    public readonly cause: Error

    protected constructor(message: string, options: ErrorOptions) {
        super(message)

        this.handler = options.handler
        this.cause = options.cause
        this.trigger = options.trigger
    }
}
