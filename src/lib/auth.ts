import "server-only";

import type { User } from "@supabase/supabase-js";
import { cache } from "react";

import { appError } from "./errors";
import { createClient } from "./supabase/server";

/**
 * Único ponto de entrada para obter o cliente Supabase e o usuário logado no servidor.
 * `cache` evita repetir a chamada ao Supabase Auth quando vários serviços rodam na mesma renderização.
 */
export const getAuthenticatedUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw appError("Usuário não autenticado.");
  return { supabase, user };
});

export type Supabase = Awaited<ReturnType<typeof getAuthenticatedUser>>["supabase"];

/** Nome para exibição: perfil, depois metadados do cadastro, depois do Google. */
export function getDisplayName(user: User | null, profileName?: string | null): string {
  const metadata = user?.user_metadata ?? {};
  return (
    profileName?.trim() ||
    String(metadata.name ?? "").trim() ||
    String(metadata.full_name ?? "").trim() ||
    "Usuário"
  );
}
