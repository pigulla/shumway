import type { Predicate } from './handler'

export type PredicateMock<Arguments extends unknown[], Self, Trigger extends Error> = jest.Mock<
    ReturnType<Predicate<Arguments, Self, Trigger>>,
    Parameters<Predicate<Arguments, Self, Trigger>>
>

export function mockPredicate<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
>(): PredicateMock<Arguments, Self, Trigger> {
    return jest.fn() as PredicateMock<Arguments, Self, Trigger>
}
