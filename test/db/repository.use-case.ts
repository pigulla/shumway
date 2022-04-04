import { ErrorCode, PostgresClient, PostgresError, QueryResultError } from './external'
import {
    DuplicateSlugError,
    InvalidEntityError,
    Todo,
    TodoNotFoundError,
    UserNotFoundError,
} from './domain'
import { HandleError, HandlerAction } from '../../src'
import { RepositoryError } from './repository-error'

type TodoRow = {
    id: number
    owner_id: number
    slug: string
    text: string
}

export class Repository {
    private readonly client: PostgresClient

    public constructor(client: PostgresClient) {
        this.client = client
    }

    @HandleError<Repository['getTodoById']>({
        action: HandlerAction.MAP,
        scope: QueryResultError,
        callback: (_, id) => new TodoNotFoundError(id),
    })
    public async getTodoById(id: number): Promise<Todo> {
        const row = await this.client.one<TodoRow>('SELECT * FROM users WHERE id = ?', id)

        return new Todo({ ...row, ownerId: row.owner_id })
    }

    @HandleError<Repository['createTodo']>(
        {
            action: HandlerAction.MAP,
            scope: PostgresError,
            predicate: error =>
                (error as PostgresError).code === ErrorCode.FOREIGN_KEY_CONSTRAINT_VIOLATION,
            callback: (_, { ownerId }) => new UserNotFoundError(ownerId),
        },
        {
            action: HandlerAction.MAP,
            scope: PostgresError,
            predicate: error => (error as PostgresError).code === ErrorCode.DUPLICATE_KEY,
            callback: (_, { slug }) => new DuplicateSlugError(slug),
        },
        {
            action: HandlerAction.PASS_THROUGH,
            scope: InvalidEntityError,
        },
        {
            action: HandlerAction.MAP,
            callback: error => new RepositoryError(error),
        },
    )
    public async createTodo(data: { ownerId: number; slug: string; text: string }): Promise<Todo> {
        const { id } = await this.client.one<{ id: number }>(
            `INSERT INTO todos (owner_id, slug, text) VALUES (?, ?, ?) RETURNING id`,
            data.ownerId,
            data.slug,
            data.text,
        )

        // For simplicity, let's assume that the caller has executed this inside a transaction which
        // gets aborted if an InvalidEntityError is thrown here.
        return new Todo({ id, ...data })
    }
}
