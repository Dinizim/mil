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

export async function getTransactions() {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      id,
      type,
      amount,
      description,
      transaction_date,
      category_id,
      categories!transactions_category_owner_fk (
        name
      )
    `)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível carregar as transações."));

  return data;
}

export async function getTransactionById(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      id,
      type,
      amount,
      description,
      transaction_date,
      category_id
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (error) throw appError(databaseErrorMessage(error, "Transação não encontrada."));

  return data;
}

async function validateCategoryForTransaction(
  supabase: Awaited<ReturnType<typeof createClient>>,
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

function validateAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw appError("Informe um valor maior que zero.");
  }

  if (Math.round(amount * 100) !== amount * 100) {
    throw appError("O valor deve ter no máximo 2 casas decimais.");
  }
}

function validateDate(transactionDate: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(transactionDate) ||
    Number.isNaN(Date.parse(`${transactionDate}T00:00:00`))
  ) {
    throw appError("Informe uma data válida.");
  }
}

function validateDescription(description: string) {
  if (description.length > 200) {
    throw appError("A descrição deve ter no máximo 200 caracteres.");
  }
}

export async function createTransaction(
  type: "income" | "expense",
  amount: number,
  description: string,
  categoryId: string,
  transactionDate: string
) {
  const { supabase, user } = await getAuthenticatedUser();

  if (type !== "income" && type !== "expense") throw appError("Tipo de transação inválido.");
  validateAmount(amount);
  validateDate(transactionDate);
  validateDescription(description);
  if (!categoryId) throw appError("Selecione uma categoria.");

  await validateCategoryForTransaction(supabase, user.id, categoryId, type);

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      type,
      amount,
      description: description.trim() || null,
      category_id: categoryId,
      transaction_date: transactionDate,
    })
    .select()
    .single();

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível criar a transação."));

  return data;
}

export async function updateTransaction(
  id: string,
  type: "income" | "expense",
  amount: number,
  description: string,
  categoryId: string,
  transactionDate: string
) {
  const { supabase, user } = await getAuthenticatedUser();

  if (type !== "income" && type !== "expense") throw appError("Tipo de transação inválido.");
  validateAmount(amount);
  validateDate(transactionDate);
  validateDescription(description);
  if (!categoryId) throw appError("Selecione uma categoria.");

  await validateCategoryForTransaction(supabase, user.id, categoryId, type);

  const { data, error } = await supabase
    .from("transactions")
    .update({
      type,
      amount,
      description: description.trim() || null,
      category_id: categoryId,
      transaction_date: transactionDate,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível atualizar a transação."));

  return data;
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

export async function getTransactionSummary() {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível calcular o resumo financeiro."));

  const totalIncome = data
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const totalExpense = data
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
}

export async function getLatestTransactions(limit = 5) {
  const { supabase, user } = await getAuthenticatedUser();

  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("id, type, amount, description, transaction_date, category_id, created_at")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (transactionsError) throw appError(databaseErrorMessage(transactionsError, "Não foi possível carregar as últimas transações."));

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", user.id);

  if (categoriesError) throw appError(databaseErrorMessage(categoriesError, "Não foi possível carregar as categorias."));

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  return transactions.map((transaction) => ({
    ...transaction,
    categories: transaction.category_id
      ? [{ name: categoryMap.get(transaction.category_id) || "Sem categoria" }]
      : [],
  }));
}

export async function getExpensesByCategory() {
  const { supabase, user } = await getAuthenticatedUser();

  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("amount, category_id")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .is("deleted_at", null);

  if (transactionsError) throw appError(databaseErrorMessage(transactionsError, "Não foi possível carregar as despesas por categoria."));

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", user.id);

  if (categoriesError) throw appError(databaseErrorMessage(categoriesError, "Não foi possível carregar as categorias."));

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const grouped: Record<string, number> = {};

  for (const transaction of transactions) {
    const categoryName = categoryMap.get(transaction.category_id) || "Sem categoria";
    grouped[categoryName] = (grouped[categoryName] || 0) + Number(transaction.amount);
  }

  return Object.entries(grouped)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getMonthlyFinancialSummary() {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount, transaction_date")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("transaction_date", { ascending: true });

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível carregar o resumo mensal."));

  const grouped: Record<string, { month: string; income: number; expense: number }> = {};

  for (const transaction of data) {
    const month = transaction.transaction_date.slice(0, 7);
    if (!grouped[month]) grouped[month] = { month, income: 0, expense: 0 };

    if (transaction.type === "income") grouped[month].income += Number(transaction.amount);
    else grouped[month].expense += Number(transaction.amount);
  }

  return Object.values(grouped);
}
