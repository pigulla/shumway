import { JsonObject } from 'type-fest'

export interface PostgresClient {
    one<T extends JsonObject>(query: string, ...values: Array<string | number>): Promise<T>
}
