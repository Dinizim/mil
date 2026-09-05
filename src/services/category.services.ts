import { createClient } from "@/lib/supabase/server";
import { appError, databaseErrorMessage } from "@/lib/errors";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw appError("Usuário não autenticado.");
  return { supabase, user };
}

export async function getCategories() {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("name");

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível carregar as categorias."));
  return data;
}

export async function createCategory(name: string, type: "income" | "expense") {
  const { supabase, user } = await getAuthenticatedUser();
  const normalizedName = name.trim();

  if (!normalizedName) throw appError("Informe o nome da categoria.");
  if (normalizedName.length > 60) throw appError("O nome da categoria deve ter no máximo 60 caracteres.");
  if (type !== "income" && type !== "expense") throw appError("Tipo de categoria inválido.");

  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", type)
    .ilike("name", normalizedName)
    .is("deleted_at", null)
    .limit(1);

  if (existing?.length) throw appError("Você já possui uma categoria com esse nome.");

  const { data, error } = await supabase
    .from("categories")
    .insert({ user_id: user.id, name: normalizedName, type })
    .select("id, name, type")
    .single();

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível criar a categoria."));
  return data;
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
