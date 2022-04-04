import type { ErrorOptions } from '../../error'
import { ShumwayError } from '../../error'
import { HandlerAction } from '../../handler-action.enum'

export class MapError extends ShumwayError {
    public override name = 'MapError'

    public constructor(options: ErrorOptions) {
        super(`Error during ${HandlerAction.MAP} callback`, options)
    }
}
