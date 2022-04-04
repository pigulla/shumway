import type { HandlerAction } from '../../handler-action.enum'
import type { BaseOptions } from '../handler'

export interface PassThroughOptions<Arguments extends unknown[], Self, Trigger extends Error>
    extends BaseOptions<Arguments, Self, Trigger> {
    action: HandlerAction.PASS_THROUGH
}
