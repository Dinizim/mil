import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com a chave service_role: ignora RLS. Usar SOMENTE no servidor e
 * só para operações administrativas (ex.: excluir a conta do próprio usuário).
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return null;

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
