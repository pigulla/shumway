export class DeviceEntity {
    public readonly id: string
    public readonly name: string

    public constructor(data: { id: string; name: string }) {
        this.id = data.id
        this.name = data.name
    }
}
