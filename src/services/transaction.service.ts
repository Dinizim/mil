import "server-only";

import { getAuthenticatedUser, type Supabase } from "@/lib/auth";
import { isValidDate, monthRange } from "@/lib/dates";
import { appError, databaseErrorMessage } from "@/lib/errors";
import { importKey } from "@/lib/import-statement";
import { parseInput, transactionInputSchema, type TransactionInput } from "@/lib/validation";

import { categoryName } from "./finance.service";

const TRANSACTION_FIELDS = `
  id,
  type,
  amount,
  description,
  transaction_date,
  category_id,
  created_at,
  categories!transactions_category_owner_fk ( name )
`;

type TransactionRow = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  transaction_date: string;
  category_id: string | null;
  created_at: string;
  categories: { name: string } | { name: string }[] | null;
};

export type Transaction = Omit<TransactionRow, "categories"> & { categoryName: string };

function normalize(rows: TransactionRow[]): Transaction[] {
  return rows.map(({ categories, ...transaction }) => ({
    ...transaction,
    amount: Number(transaction.amount),
    categoryName: transaction.category_id ? categoryName(categories) : "Sem categoria",
  }));
}

/** Lista transações ativas; com `month` (YYYY-MM) filtra pelo mês. */
export async function getTransactions(options: { month?: string | null; limit?: number } = {}) {
  const { supabase, user } = await getAuthenticatedUser();

  let query = supabase
    .from("transactions")
    .select(TRANSACTION_FIELDS)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (options.month) {
    const { start, end } = monthRange(options.month);
    query = query.gte("transaction_date", start).lt("transaction_date", end);
  }
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw appError(databaseErrorMessage(error, "Não foi possível carregar as transações."));

  return normalize(data as TransactionRow[]);
}

export async function getLatestTransactions(limit = 5, month?: string) {
  return getTransactions({ limit, month });
}

async function validateCategoryForTransaction(
  supabase: Supabase,
  userId: string,
  categoryId: string,
  type: "income" | "expense"
) {
  const { data: category, error } = await supabase
    .from("categories")
    .select("id, type")
    .eq("id", categoryId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (error || !category) throw appError("A categoria selecionada não está disponível.");
  if (category.type !== type) throw appError("A categoria não pertence ao tipo da transação.");
}

export async function createTransaction(input: TransactionInput) {
  const { supabase, user } = await getAuthenticatedUser();
  const transaction = parseInput(transactionInputSchema, input);

  await validateCategoryForTransaction(supabase, user.id, transaction.categoryId, transaction.type);

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description || null,
      category_id: transaction.categoryId,
      transaction_date: transaction.transactionDate,
    })
    .select("id")
    .single();

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível criar a transação."));
  return data;
}

/**
 * Editar transação. O banco trata transações como imutáveis (trigger), então a
 * edição cria o lançamento corrigido e cancela o original, preservando o histórico.
 * TODO(banco): fazer as duas operações numa RPC com transação.
 */
export async function replaceTransaction(id: string, input: TransactionInput) {
  const { supabase, user } = await getAuthenticatedUser();

  const { data: original, error: originalError } = await supabase
    .from("transactions")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (originalError || !original) throw appError("Transação não encontrada.");

  const created = await createTransaction(input);

  try {
    await softDeleteTransaction(id);
  } catch (error) {
    // Desfaz a nova transação para não duplicar o lançamento.
    await softDeleteTransaction(created.id).catch(() => undefined);
    throw error;
  }

  return created;
}

/** Soft delete: mantém a transação no banco para histórico e futuras auditorias. */
export async function softDeleteTransaction(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("transactions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select("id")
    .single();

  if (error || !data) {
    throw appError(databaseErrorMessage(error, "Não foi possível excluir a transação."));
  }

  return data;
}

/** Método reservado para recuperação futura de transações canceladas. */
export async function restoreTransaction(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("transactions")
    .update({ deleted_at: null })
    .eq("id", id)
    .eq("user_id", user.id)
    .not("deleted_at", "is", null)
    .select("id")
    .single();

  if (error || !data) throw appError("Não foi possível restaurar a transação.");

  return data;
}

/** Chaves (data|valor|descrição) das transações existentes no intervalo, para detectar duplicadas. */
export async function getExistingImportKeys(startDate: string, endDate: string) {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return [];
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount, description, transaction_date")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate);

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível verificar transações duplicadas."));

  return data.map((row) =>
    importKey({ date: row.transaction_date, amount: Number(row.amount) * (row.type === "income" ? 1 : -1), description: row.description ?? "" })
  );
}

const MAX_IMPORT_ROWS = 500;

/** Importa várias transações de uma vez (extrato OFX/CSV), validando cada linha. */
export async function importTransactions(rows: TransactionInput[]) {
  if (rows.length === 0) throw appError("Selecione ao menos uma transação para importar.");
  if (rows.length > MAX_IMPORT_ROWS) throw appError(`Importe no máximo ${MAX_IMPORT_ROWS} transações por vez.`);

  const { supabase, user } = await getAuthenticatedUser();
  const parsed = rows.map((row, index) => {
    try {
      return parseInput(transactionInputSchema, row);
    } catch (error) {
      throw appError(`Linha ${index + 1}: ${error instanceof Error ? error.message : "dados inválidos."}`);
    }
  });

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, type")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (categoriesError) throw appError(databaseErrorMessage(categoriesError, "Não foi possível carregar as categorias."));
  const categoryTypes = new Map(categories.map((category) => [category.id, category.type]));

  parsed.forEach((row, index) => {
    const type = categoryTypes.get(row.categoryId);
    if (!type) throw appError(`Linha ${index + 1}: a categoria selecionada não está disponível.`);
    if (type !== row.type) throw appError(`Linha ${index + 1}: a categoria não pertence ao tipo da transação.`);
  });

  const { error } = await supabase.from("transactions").insert(
    parsed.map((row) => ({
      user_id: user.id,
      type: row.type,
      amount: row.amount,
      description: row.description || null,
      category_id: row.categoryId,
      transaction_date: row.transactionDate,
    }))
  );

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível importar as transações."));
  return { imported: parsed.length };
}
