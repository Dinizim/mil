import { createClient } from "@/lib/supabase/server";
import { appError, databaseErrorMessage } from "@/lib/errors";

export async function getDashboardSummary() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  // BUSCAR TRANSAÇÕES
  const {
    data: transactions,
    error: transactionsError,
  } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (transactionsError) {
    throw appError(databaseErrorMessage(transactionsError, "Não foi possível carregar as transações."));
  }

  // BUSCAR METAS ATIVAS
  const {
    data: activeGoals,
    error: goalsError,
  } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (goalsError) {
    throw appError(databaseErrorMessage(goalsError, "Não foi possível carregar as metas."));
  }

  const activeGoalIds = activeGoals.map(
    (goal) => goal.id
  );

  // CALCULAR DINHEIRO RESERVADO
  let totalReserved = 0;

  if (activeGoalIds.length > 0) {
    const {
      data: contributions,
      error: contributionsError,
    } = await supabase
      .from("goal_contributions")
      .select("amount")
      .eq("user_id", user.id)
      .in("goal_id", activeGoalIds);

    if (contributionsError) {
      throw appError(databaseErrorMessage(contributionsError, "Não foi possível carregar as contribuições."));
    }

    totalReserved = contributions.reduce(
      (total, contribution) =>
        total + Number(contribution.amount),
      0
    );
  }

  // CALCULAR ENTRADAS
  const totalIncome = transactions
    .filter(
      (transaction) => transaction.type === "income"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  // CALCULAR DESPESAS
  const totalExpense = transactions
    .filter(
      (transaction) => transaction.type === "expense"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  // SALDO TOTAL
  const balance = totalIncome - totalExpense;

  // SALDO DISPONÍVEL
  const availableBalance =
    balance - totalReserved;

  return {
    totalIncome,
    totalExpense,
    balance,
    totalReserved,
    availableBalance,
  };
}