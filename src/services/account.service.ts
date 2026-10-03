import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getAuthenticatedUser } from "@/lib/auth";
import { appError, databaseErrorMessage } from "@/lib/errors";
import { createAdminClient } from "@/lib/supabase/admin";

/** Todos os dados do usuário (LGPD, art. 18, V – portabilidade). */
export async function exportUserData() {
  const { supabase, user } = await getAuthenticatedUser();

  const [profile, categories, transactions, goals, contributions] = await Promise.all([
    supabase.from("profiles").select("id, name, created_at").eq("id", user.id).maybeSingle(),
    supabase.from("categories").select("id, name, type, created_at, deleted_at").eq("user_id", user.id).order("created_at"),
    supabase
      .from("transactions")
      .select("id, type, amount, description, category_id, transaction_date, created_at, deleted_at")
      .eq("user_id", user.id)
      .order("transaction_date"),
    supabase
      .from("goals")
      .select("id, name, target_amount, start_date, end_date, is_active, created_at")
      .eq("user_id", user.id)
      .order("created_at"),
    supabase
      .from("goal_contributions")
      .select("id, goal_id, amount, description, contribution_date, created_at")
      .eq("user_id", user.id)
      .order("contribution_date"),
  ]);

  const failed = [profile, categories, transactions, goals, contributions].find((result) => result.error);
  if (failed?.error) throw appError(databaseErrorMessage(failed.error, "Não foi possível exportar seus dados."));

  return {
    exported_at: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email ?? null,
      created_at: user.created_at,
      providers: user.app_metadata?.providers ?? [],
      terms_version: user.user_metadata?.terms_version ?? null,
      terms_accepted_at: user.user_metadata?.terms_accepted_at ?? null,
    },
    profile: profile.data,
    categories: categories.data ?? [],
    transactions: transactions.data ?? [],
    goals: goals.data ?? [],
    goal_contributions: contributions.data ?? [],
  };
}

function hasPasswordIdentity(user: { identities?: Array<{ provider: string }> | null }) {
  return Boolean(user.identities?.some((identity) => identity.provider === "email"));
}

/**
 * Exclui a conta de verdade (LGPD, art. 18, VI). Apaga o usuário em auth.users;
 * as tabelas têm ON DELETE CASCADE, então todos os dados vão junto.
 */
export async function deleteAccount(confirmation: { password?: string; phrase?: string }) {
  const { user } = await getAuthenticatedUser();

  if (hasPasswordIdentity(user)) {
    if (!confirmation.password) throw appError("Informe sua senha para confirmar.");

    // Cliente avulso, sem cookies, só para conferir a senha.
    const verifier = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await verifier.auth.signInWithPassword({ email: user.email!, password: confirmation.password });
    if (error) throw appError("Senha incorreta.");
  } else if (confirmation.phrase?.trim().toUpperCase() !== "EXCLUIR") {
    throw appError('Digite EXCLUIR para confirmar.');
  }

  const admin = createAdminClient();
  if (!admin) {
    throw appError("A exclusão de conta não está configurada no servidor. Entre em contato pelo e-mail de privacidade.");
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw appError("Não foi possível excluir a conta. Tente novamente ou entre em contato.");
}
