import { DomainError } from "./domain-error";

export class InvalidPageNumberError extends DomainError {
  constructor() {
    super(`INVALID_PAGE_NUMBER`, `O número da página deve ser maior ou igual a 1`);
  }
}
