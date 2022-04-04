import { ShumwayError } from '../error'
import type { AnyHandler } from '../handler'

export class PredicateError extends ShumwayError {
    public override name = 'PredicateError'

    public constructor(options: { trigger: Error; cause: Error; handler: AnyHandler }) {
        super('error during predicate callback', options)
    }
}
