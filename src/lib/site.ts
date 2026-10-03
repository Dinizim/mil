/** Versão vigente dos Termos de Uso e da Política de Privacidade. Mude ao alterar os textos. */
export const TERMS_VERSION = "2026-09-30";

/** Canal de contato do titular (LGPD). Defina NEXT_PUBLIC_PRIVACY_EMAIL no ambiente. */
export const PRIVACY_EMAIL = process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? "";

/** Só aceita caminhos internos em ?next= para evitar redirecionamento aberto. */
export function safeNextPath(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
