// Mapping an error that we defined and threw ourselves in the first place is rather pointless. But
// in a real project this would typically be defined inside a library - this example is based on
// the pg-promise package (https://github.com/vitaly-t/pg-promise).

export enum ErrorCode {
    DUPLICATE_KEY = '23505',
    FOREIGN_KEY_CONSTRAINT_VIOLATION = '23503',
    CHECK_CONSTRAINT_VIOLATION = '23514',
    INTEGRITY_CONSTRAINT_VIOLATION = '23000',
}

export class QueryResultError extends Error {
    public override name = 'QueryResultError'
}

export class PostgresError extends Error {
    public override name = 'PostgresError'
    public readonly code: ErrorCode

    public constructor(errorCode: ErrorCode) {
        super()

        this.code = errorCode
    }
}
