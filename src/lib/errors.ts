export type ErrorCode =
  | "INVALID_REQUEST"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL";

const messages: Record<ErrorCode, string> = {
  INVALID_REQUEST: "Não foi possível processar os dados enviados.",
  UNAUTHENTICATED: "Entre na sua conta para continuar.",
  FORBIDDEN: "Você não tem permissão para realizar esta ação.",
  NOT_FOUND: "Não encontramos o conteúdo solicitado.",
  CONFLICT: "Esta ação conflita com o estado atual dos dados.",
  INTERNAL: "Algo deu errado. Tente novamente em instantes.",
};

export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly internalDetail?: string,
    options?: { cause?: unknown; publicMessage?: string },
  ) {
    super(options?.publicMessage ?? messages[code], { cause: options?.cause });
    this.name = "AppError";
  }
}

export function publicError(error: unknown): { code: ErrorCode; message: string } {
  if (error instanceof AppError) return { code: error.code, message: error.message };
  return { code: "INTERNAL", message: messages.INTERNAL };
}
