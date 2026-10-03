import "server-only";

import { getAuthenticatedUser, type Supabase } from "@/lib/auth";
import { monthRange, shiftMonth } from "@/lib/dates";
import { appError, databaseErrorMessage } from "@/lib/errors";
import { computeFinancialSummary, groupByCategory, groupByMonth, sumByType } from "@/lib/finance";

/** Soma das contribuições das metas ativas (o dinheiro reservado). */
async function getActiveContributions(supabase: Supabase, userId: string) {
  const { data: activeGoals, error: goalsError } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (goalsError) throw appError(databaseErrorMessage(goalsError, "Não foi possível carregar as metas."));
  if (activeGoals.length === 0) return [];

  const { data, error } = await supabase
    .from("goal_contributions")
    .select("amount")
    .eq("user_id", userId)
    .in("goal_id", activeGoals.map((goal) => goal.id));

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível carregar as contribuições."));
  return data;
}

/**
 * Único cálculo de saldo do app (total, reservado e disponível).
 * TODO(banco): mover para uma view/RPC no Postgres para não baixar todas as transações.
 */
export async function getFinancialSummary() {
  const { supabase, user } = await getAuthenticatedUser();

  const [transactionsResult, contributions] = await Promise.all([
    supabase.from("transactions").select("type, amount").eq("user_id", user.id).is("deleted_at", null),
    getActiveContributions(supabase, user.id),
  ]);

  if (transactionsResult.error) {
    throw appError(databaseErrorMessage(transactionsResult.error, "Não foi possível carregar o resumo financeiro."));
  }

  return computeFinancialSummary(transactionsResult.data, contributions);
}

export async function getAvailableBalance() {
  return (await getFinancialSummary()).availableBalance;
}

/** Entradas, despesas e resultado de um mês (YYYY-MM). */
export async function getMonthSummary(month: string) {
  const { supabase, user } = await getAuthenticatedUser();
  const { start, end } = monthRange(month);

  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .gte("transaction_date", start)
    .lt("transaction_date", end);

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível carregar o resumo do mês."));
  return sumByType(data);
}

/** Entradas e despesas por mês, terminando em `untilMonth`. */
export async function getMonthlyEvolution(untilMonth: string, months = 12) {
  const { supabase, user } = await getAuthenticatedUser();
  const start = monthRange(shiftMonth(untilMonth, -(months - 1))).start;
  const end = monthRange(untilMonth).end;

  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount, transaction_date")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .gte("transaction_date", start)
    .lt("transaction_date", end)
    .order("transaction_date", { ascending: true });

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível carregar o resumo mensal."));
  return groupByMonth(data);
}

type CategoryJoin = { name: string } | { name: string }[] | null;

export function categoryName(categories: CategoryJoin): string {
  const category = Array.isArray(categories) ? categories[0] : categories;
  return category?.name || "Sem categoria";
}

/** Despesas agrupadas por categoria dentro de um intervalo de meses. */
export async function getExpensesByCategory(month: string) {
  const { supabase, user } = await getAuthenticatedUser();
  const { start, end } = monthRange(month);

  const { data, error } = await supabase
    .from("transactions")
    .select("amount, categories!transactions_category_owner_fk ( name )")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .is("deleted_at", null)
    .gte("transaction_date", start)
    .lt("transaction_date", end);

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível carregar as despesas por categoria."));
  return groupByCategory(data.map((row) => ({ amount: row.amount, category: categoryName(row.categories) })));
}
