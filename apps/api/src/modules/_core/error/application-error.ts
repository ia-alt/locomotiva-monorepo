import { ErrorType } from "./error-type";

export class ApplicationError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly type: ErrorType = ErrorType.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
