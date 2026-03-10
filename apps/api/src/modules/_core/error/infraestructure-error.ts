import { ApplicationError } from "./application-error";
import { ErrorType } from "./error-type";

export class InfrastructureError extends ApplicationError {
  constructor(code: string, message: string) {
    super(code, message, ErrorType.INTERNAL_SERVER_ERROR);
  }
}
