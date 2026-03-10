import { DomainError } from "./domain-error";

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`INVALID_EMAIL`, `O email "${email}" é inválido`);
  }
}
