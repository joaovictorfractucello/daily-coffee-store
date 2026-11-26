import "server-only";
import { AppError } from "./app-error";

export class CepNotFoundError extends AppError {
  constructor() {
    super({
      message: "CEP não encontrado.",
      code: "CEP_NOT_FOUND",
      kind: "NOT_FOUND",
    });
  }
}

// ViaCEP fora do ar, lento ou com resposta inesperada: a mensagem é genérica.
export class CepUnavailableError extends AppError {
  constructor() {
    super({
      message: "Não foi possível consultar o CEP agora.",
      code: "CEP_UNAVAILABLE",
      kind: "UNAVAILABLE",
    });
  }
}

export class DeliveryUnavailableError extends AppError {
  constructor() {
    super({
      message: "Ainda não entregamos nessa cidade.",
      code: "DELIVERY_UNAVAILABLE",
      kind: "UNPROCESSABLE",
    });
  }
}

export class AddressNotFoundError extends AppError {
  constructor() {
    super({
      message: "Endereço não encontrado.",
      code: "ADDRESS_NOT_FOUND",
      kind: "NOT_FOUND",
    });
  }
}

export class AddressLimitError extends AppError {
  constructor() {
    super({
      message: "Limite de endereços atingido.",
      code: "ADDRESS_LIMIT",
      kind: "CONFLICT",
    });
  }
}
