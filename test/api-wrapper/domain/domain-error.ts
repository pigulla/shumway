export class DomainError extends Error {}

export class DomainEntityNotFoundError extends DomainError {
    public readonly id: string

    public constructor(id: string) {
        super()

        this.id = id
    }
}

export class DeviceNotFoundError extends DomainEntityNotFoundError {}
