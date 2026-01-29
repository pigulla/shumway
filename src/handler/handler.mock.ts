import { type Mock, vi } from 'vitest'
import type { Predicate } from './handler'

export type PredicateMock<Arguments extends unknown[], Self, Trigger extends Error> = Mock<
    Predicate<Arguments, Self, Trigger>
>

export function mockPredicate<
    Arguments extends unknown[],
    Self,
    Trigger extends Error,
>(): PredicateMock<Arguments, Self, Trigger> {
    return vi.fn() as PredicateMock<Arguments, Self, Trigger>
}
