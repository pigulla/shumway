import type { ErrorOptions } from '../../error'
import { ShumwayError } from '../../error'
import { HandlerAction } from '../../handler-action.enum'

export class RecoverError extends ShumwayError {
    public override name = 'RecoverError'

    public constructor(options: ErrorOptions) {
        super(`Error during ${HandlerAction.RECOVER} callback`, options)
    }
}
