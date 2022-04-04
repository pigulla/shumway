import { InvalidEntityError } from './domain-error'

export class Todo {
    public readonly id: number
    public readonly ownerId: number
    public readonly slug: string
    public readonly text: string

    public constructor(data: { id: number; ownerId: number; slug: string; text: string }) {
        this.id = data.id
        this.ownerId = data.ownerId
        this.slug = data.slug
        this.text = data.text

        if (this.text.length === 0) {
            throw new InvalidEntityError('Text must not be empty')
        }
        if (this.slug.length === 0) {
            throw new InvalidEntityError('Slug must not be empty')
        }
    }
}
