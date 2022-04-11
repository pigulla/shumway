import { ShumwayError } from '../error'
import type { AnyHandler } from '../handler'

export class PredicateError extends ShumwayError {
    public override name = 'PredicateError'

    public constructor(options: { trigger: Error; cause: Error; handler: AnyHandler }) {
        super('Error during predicate callback', options)
    }
}
