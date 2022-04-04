export class DomainError extends Error {}

export class TodoNotFoundError extends DomainError {
    public override name = 'TodoNotFoundError'
    public readonly id: number

    public constructor(id: number) {
        super()

        this.id = id
    }
}

export class InvalidEntityError extends DomainError {
    public override name = 'InvalidEntityError'
}

export class UserNotFoundError extends DomainError {
    public override name = 'UserNotFoundError'
    public readonly id: number

    public constructor(id: number) {
        super()

        this.id = id
    }
}

export class DuplicateSlugError extends DomainError {
    public override name = 'DuplicateSlugError'
    public readonly slug: string

    public constructor(slug: string) {
        super()

        this.slug = slug
    }
}
