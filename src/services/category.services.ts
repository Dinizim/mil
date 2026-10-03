import "server-only";

import { getAuthenticatedUser } from "@/lib/auth";
import { appError, databaseErrorMessage } from "@/lib/errors";
import { categoryInputSchema, parseInput } from "@/lib/validation";

export async function getCategories() {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("name");

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível carregar as categorias."));
  return data as Array<{ id: string; name: string; type: "income" | "expense" }>;
}

export async function createCategory(name: string, type: "income" | "expense") {
  const { supabase, user } = await getAuthenticatedUser();
  const category = parseInput(categoryInputSchema, { name, type });

  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", category.type)
    .ilike("name", category.name.replace(/[\\%_]/g, "\\$&"))
    .is("deleted_at", null)
    .limit(1);

  if (existing?.length) throw appError("Você já possui uma categoria com esse nome.");

  const { data, error } = await supabase
    .from("categories")
    .insert({ user_id: user.id, name: category.name, type: category.type })
    .select("id, name, type")
    .single();

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível criar a categoria."));
  return data as { id: string; name: string; type: "income" | "expense" };
}

/** Soft delete: preserva a categoria para que o histórico continue íntegro. */
export async function softDeleteCategory(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select("id")
    .single();

  if (error || !data) throw appError(databaseErrorMessage(error, "Não foi possível excluir a categoria."));
  return data;
}

/** Método reservado para recuperação futura de categorias arquivadas. */
export async function restoreCategory(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("categories")
    .update({ deleted_at: null })
    .eq("id", id)
    .eq("user_id", user.id)
    .not("deleted_at", "is", null)
    .select("id")
    .single();

  if (error || !data) throw appError("Não foi possível restaurar a categoria.");
  return data;
}
