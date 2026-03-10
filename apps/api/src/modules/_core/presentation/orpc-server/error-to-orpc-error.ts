import { ApplicationError, DomainError, ErrorType, InfrastructureError } from "@core/error";
import { ORPCError } from "@orpc/server";



export function errorToOrpcError(error: unknown) {
  if (error instanceof DomainError) {
    const err = error as DomainError;
    return new ORPCError("ERROR", {
      status: errorTypeToStatusCode(err.type),
      message: err.message,
    });
  }

  if (error instanceof ApplicationError) {
    const err = error as ApplicationError;
    return new ORPCError("ERROR", {
      status: errorTypeToStatusCode(err.type),
      message: err.message,
    });
  }

  if (error instanceof InfrastructureError) {
    const err = error as InfrastructureError;
    return new ORPCError("ERROR", {
      status: errorTypeToStatusCode(err.type),
      message: err.message,
    });
  }

  if (error instanceof InfrastructureError) {
    const err = error as InfrastructureError;
    return new ORPCError("ERROR", {
      status: errorTypeToStatusCode(err.type),
      message: err.message,
    });
  }

  if (error instanceof Error) {
    const err = error as Error;
    console.log(err.stack);
    return new ORPCError("ERROR", {
      status: 500,
      message: err.message,
    });
  }

  return new ORPCError("ERROR", {
    status: 500,
    message: "Unknown Internal Server Error",
  });
}

function errorTypeToStatusCode(errorType: ErrorType): number {
  switch (errorType) {
    case ErrorType.BAD_REQUEST:
      return 400;
    case ErrorType.UNAUTHORIZED:
      return 401;
    case ErrorType.FORBIDDEN:
      return 403;
    case ErrorType.NOT_FOUND:
      return 404;
    case ErrorType.CONFLICT:
      return 409;
    case ErrorType.INTERNAL_SERVER_ERROR:
      return 500;
    default:
      return 500; // Default to internal server error
  }
}
