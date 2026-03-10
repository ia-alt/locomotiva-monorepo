import { DomainError } from "./domain-error";

export class InvalidDatePeriodError extends DomainError {
  constructor() {
    super(`INVALID_DATE_PERIOD`, `Período de datas inválido`);
  }
}
