import { DomainError } from "./domain-error";

export class InvalidPageSizeError extends DomainError {
  constructor(value: number) {
    super(`INVALID_PAGE_SIZE`, `O tamanho da página deve ser maior que 0. Recebido: ${value}`);
  }
}
