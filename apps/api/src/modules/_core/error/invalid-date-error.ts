import { DomainError } from "./domain-error";

export class InvalidDateError extends DomainError {
  constructor() {
    super(`INVALID_DATE`, `Data inválida`);
  }
}
