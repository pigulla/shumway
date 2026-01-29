import { type Mocked, vi } from 'vitest'
import {
    DuplicateSlugError,
    InvalidEntityError,
    Todo,
    TodoNotFoundError,
    UserNotFoundError,
} from './domain'
import { ErrorCode, type PostgresClient, PostgresError, QueryResultError } from './external'
import { Repository } from './repository.use-case'
import { RepositoryError } from './repository-error'

describe('Repository', () => {
    let repository: Repository
    let client: Mocked<PostgresClient>

    beforeEach(() => {
        client = { one: vi.fn() }

        repository = new Repository(client)
    })

    describe('getTodoById', () => {
        it('should return the result', async () => {
            client.one.mockResolvedValue({
                id: 42,
                owner_id: 13,
                slug: 'just-do-it',
                text: 'Buy some Nike shoes',
            })

            await expect(repository.getTodoById(42)).resolves.toEqual(
                new Todo({ id: 42, ownerId: 13, slug: 'just-do-it', text: 'Buy some Nike shoes' }),
            )
        })

        it('should map a QueryResultError', async () => {
            client.one.mockRejectedValue(new QueryResultError())

            await expect(repository.getTodoById(42)).rejects.toThrow(new TodoNotFoundError(42))
        })
    })

    describe('addTodo', () => {
        it('should create a new todo', async () => {
            client.one.mockResolvedValue({ id: 99 })

            await expect(
                repository.createTodo({
                    ownerId: 17,
                    slug: 'forever-faster',
                    text: 'Puma also makes some nice shoes',
                }),
            ).resolves.toEqual(
                new Todo({
                    id: 99,
                    ownerId: 17,
                    slug: 'forever-faster',
                    text: 'Puma also makes some nice shoes',
                }),
            )
        })

        it('should map a foreign key constrain violation', async () => {
            client.one.mockRejectedValue(
                new PostgresError(ErrorCode.FOREIGN_KEY_CONSTRAINT_VIOLATION),
            )

            await expect(
                repository.createTodo({
                    ownerId: 17,
                    slug: 'forever-faster',
                    text: 'Puma also makes some nice shoes',
                }),
            ).rejects.toThrow(new UserNotFoundError(17))
        })

        it('should map a duplicate key error', async () => {
            client.one.mockRejectedValue(new PostgresError(ErrorCode.DUPLICATE_KEY))

            await expect(
                repository.createTodo({
                    ownerId: 17,
                    slug: 'forever-faster',
                    text: 'Puma also makes some nice shoes',
                }),
            ).rejects.toThrow(new DuplicateSlugError('forever-faster'))
        })

        it('should pass through an InvalidEntityError', async () => {
            client.one.mockResolvedValue({ id: 99 })

            await expect(
                repository.createTodo({
                    ownerId: 17,
                    slug: '',
                    text: 'Puma also makes some nice shoes',
                }),
            ).rejects.toThrow(InvalidEntityError)
        })

        it('should map an error', async () => {
            const error = new Error('Boom!')
            client.one.mockRejectedValue(error)

            await expect(
                repository.createTodo({
                    ownerId: 17,
                    slug: 'forever-faster',
                    text: 'Puma also makes some nice shoes',
                }),
            ).rejects.toThrow(new RepositoryError(error))
        })
    })
})
