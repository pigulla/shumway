import type { ErrorOptions } from '../../error'
import { ShumwayError } from '../../error'
import { HandlerAction } from '../../handler-action.enum'

export class SideEffectError extends ShumwayError {
    public override name = 'SideEffectError'

    public constructor(options: ErrorOptions) {
        super(`Error during ${HandlerAction.SIDE_EFFECT} callback`, options)
    }
}
