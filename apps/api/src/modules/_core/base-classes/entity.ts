import { UniqueId } from "./unique-id";

export abstract class Entity {
    constructor(public readonly id: UniqueId) { }

    equals(other: Entity): boolean {
        return this.id.equals(other.id);
    }

    abstract toJSON(): unknown;
}