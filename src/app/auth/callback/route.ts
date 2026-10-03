import { NextResponse, type NextRequest } from "next/server";

import { safeNextPath, TERMS_VERSION } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino dos links do Supabase: login com Google, recuperação de senha e
 * confirmação de e-mail. Troca o `code` por uma sessão e segue para `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const providerError = searchParams.get("error_description") || searchParams.get("error");

  if (providerError || !code) {
    const message = providerError ? "Não foi possível entrar. Tente novamente." : "Link inválido ou expirado.";
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Link inválido ou expirado. Peça um novo.")}`);
  }

  // Quem entra pelo Google aceita os termos pelo aviso na tela de login; registramos data e versão.
  if (!data.user.user_metadata?.terms_version) {
    await supabase.auth.updateUser({
      data: { terms_version: TERMS_VERSION, terms_accepted_at: new Date().toISOString() },
    });
  }

  return NextResponse.redirect(`${origin}${next}`);
}
