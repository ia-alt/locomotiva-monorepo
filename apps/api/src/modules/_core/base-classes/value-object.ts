
export abstract class ValueObject<T> {
    constructor(public readonly value: T) {
        Object.freeze(this.value);
    }

    equals(other: ValueObject<T>): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return JSON.stringify(this.value);
    }

    abstract toJSON(): unknown;
}