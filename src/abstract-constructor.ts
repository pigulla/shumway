export type AbstractConstructor<T, Arguments extends unknown[] = unknown[]> = abstract new (
    ...arguments_: Arguments
) => T
