export interface Validator {
    validate<T = unknown>(value: T): T
}
