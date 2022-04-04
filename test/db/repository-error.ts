export class RepositoryError extends Error {
    public override name = 'RepositoryError'
    public readonly cause: Error

    public constructor(cause: Error) {
        super()

        this.cause = cause
    }
}
