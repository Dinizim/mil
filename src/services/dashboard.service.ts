import { createClient } from "@/lib/supabase/server";

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
    .eq("user_id", user.id);

  if (transactionsError) {
    throw new Error(transactionsError.message);
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
    throw new Error(goalsError.message);
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
      throw new Error(contributionsError.message);
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