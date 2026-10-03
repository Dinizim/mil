import { AppError } from "./errors";

/**
 * Resultado de Server Action. Em produção o Next esconde a mensagem de erros
 * lançados, então erros esperados voltam como valor: { ok: false, error }.
 */
export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

export async function runAction<T>(fallback: string, action: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await action() };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };

    // Erro inesperado: registra só o tipo/mensagem técnica, nunca os dados do usuário.
    console.error("[action]", fallback, error instanceof Error ? error.message : "erro desconhecido");
    return { ok: false, error: fallback };
  }
}
