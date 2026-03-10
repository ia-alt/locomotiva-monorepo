import { DomainError } from "./domain-error";

export class InvalidTimeError extends DomainError {
  constructor() {
    super(`INVALID_TIME`, `Hora inválida`);
  }
}
