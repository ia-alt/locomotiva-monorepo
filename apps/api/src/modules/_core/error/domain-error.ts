import { ErrorType } from "./error-type";

export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly type: ErrorType = ErrorType.BAD_REQUEST
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
