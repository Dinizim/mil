export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

export function appError(message: string): AppError {
  return new AppError(message);
}

/** Traduz erros do Supabase Auth (que rodam no navegador) para mensagens em PT-BR. */
export function getClientErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (error instanceof AppError) return error.message;

  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message: unknown }).message)
        : "";
  const message = raw.toLowerCase();

  if (message.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (message.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (message.includes("user already registered")) return "Já existe uma conta com este e-mail.";
  if (message.includes("password should be at least")) return "A senha precisa ter pelo menos 8 caracteres.";
  if (message.includes("same_password") || message.includes("should be different")) return "A nova senha precisa ser diferente da atual.";
  if (message.includes("current password") || message.includes("current_password")) return "A senha atual está incorreta.";
  if (message.includes("weak") || message.includes("pwned")) return "Essa senha é fraca ou já apareceu em vazamentos. Escolha outra.";
  if (message.includes("rate limit") || message.includes("too many")) return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  if (message.includes("reauthentication")) return "Por segurança, saia e entre novamente antes de alterar a senha.";

  return fallback;
}

export function databaseErrorMessage(
  error: { code?: string; message?: string } | null | undefined,
  fallback: string
): string {
  switch (error?.code) {
    case "23505":
      return "Já existe um registro com esses dados.";
    case "23503":
      return "Não foi possível concluir porque este registro possui uma relação inválida.";
    case "23514":
      return "Os dados informados não atendem às regras do sistema.";
    case "42501":
      return "Você não tem permissão para realizar esta operação.";
    case "PGRST116":
      return "Registro não encontrado ou indisponível.";
    default:
      return fallback;
  }
}
