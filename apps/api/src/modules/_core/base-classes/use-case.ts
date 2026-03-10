export abstract class UseCase<P, R> {
    abstract execute(params: P): Promise<R>;
}
