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

export async function getGoals() {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível carregar as metas."));
  return data;
}

export async function createGoal(
  name: string,
  targetAmount: number,
  startDate: string,
  endDate: string | null
) {
  const { supabase, user } = await getAuthenticatedUser();
  const normalizedName = name.trim();

  if (!normalizedName) throw appError("Informe o nome da meta.");
  if (normalizedName.length > 100) throw appError("O nome da meta deve ter no máximo 100 caracteres.");
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) throw appError("Informe um valor válido para a meta.");
  if (Math.round(targetAmount * 100) !== targetAmount * 100) throw appError("O valor da meta deve ter no máximo 2 casas decimais.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) throw appError("Informe uma data de início válida.");
  if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) throw appError("Informe uma data final válida.");
  if (endDate && endDate < startDate) throw appError("A data final não pode ser anterior à data de início.");

  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      name: normalizedName,
      target_amount: targetAmount,
      start_date: startDate,
      end_date: endDate,
    })
    .select()
    .single();

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível criar a meta."));
  return data;
}

export async function getGoalsWithProgress() {
  const { supabase, user } = await getAuthenticatedUser();

  const { data: goals, error: goalsError } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (goalsError) throw appError(databaseErrorMessage(goalsError, "Não foi possível carregar as metas."));

  if (goals.length === 0) return [];

  const goalIds = goals.map((goal) => goal.id);
  const { data: contributions, error: contributionsError } = await supabase
    .from("goal_contributions")
    .select("goal_id, amount")
    .eq("user_id", user.id)
    .in("goal_id", goalIds);

  if (contributionsError) throw appError(databaseErrorMessage(contributionsError, "Não foi possível carregar as contribuições."));

  const contributionTotals = new Map<string, number>();
  for (const contribution of contributions) {
    contributionTotals.set(
      contribution.goal_id,
      (contributionTotals.get(contribution.goal_id) || 0) + Number(contribution.amount)
    );
  }

  return goals.map((goal) => {
    const currentAmount = contributionTotals.get(goal.id) || 0;
    const targetAmount = Number(goal.target_amount);
    const percentage = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
    const remainingAmount = Math.max(targetAmount - currentAmount, 0);

    return { ...goal, currentAmount, percentage, remainingAmount };
  });
}

export async function getAvailableBalance() {
  const { supabase, user } = await getAuthenticatedUser();

  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (transactionsError) throw appError(databaseErrorMessage(transactionsError, "Não foi possível calcular o saldo disponível."));

  const { data: activeGoals, error: goalsError } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (goalsError) throw appError(databaseErrorMessage(goalsError, "Não foi possível calcular o saldo disponível."));

  let totalContributions = 0;
  if (activeGoals.length > 0) {
    const { data: contributions, error: contributionsError } = await supabase
      .from("goal_contributions")
      .select("amount")
      .eq("user_id", user.id)
      .in("goal_id", activeGoals.map((goal) => goal.id));

    if (contributionsError) throw appError(databaseErrorMessage(contributionsError, "Não foi possível calcular o saldo disponível."));
    totalContributions = contributions.reduce((total, contribution) => total + Number(contribution.amount), 0);
  }

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  return totalIncome - totalExpense - totalContributions;
}

export async function createGoalContribution(goalId: string, amount: number, description: string) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!goalId) throw appError("Meta inválida.");
  if (!Number.isFinite(amount) || amount <= 0) throw appError("O valor deve ser maior que zero.");
  if (Math.round(amount * 100) !== amount * 100) throw appError("O valor deve ter no máximo 2 casas decimais.");
  if (description.length > 200) throw appError("A descrição deve ter no máximo 200 caracteres.");

  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("id, target_amount, is_active")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single();

  if (goalError || !goal) throw appError("Meta não encontrada.");
  if (!goal.is_active) throw appError("Esta meta não está ativa.");

  const { data: existingContributions, error: contributionsError } = await supabase
    .from("goal_contributions")
    .select("amount")
    .eq("goal_id", goalId)
    .eq("user_id", user.id);

  if (contributionsError) throw appError(databaseErrorMessage(contributionsError, "Não foi possível verificar a meta."));

  const currentAmount = existingContributions.reduce((total, contribution) => total + Number(contribution.amount), 0);
  const targetAmount = Number(goal.target_amount);

  if (currentAmount + amount > targetAmount) throw appError("Essa contribuição ultrapassa o valor da meta.");

  const availableBalance = await getAvailableBalance();
  if (amount > availableBalance) throw appError("Saldo disponível insuficiente.");

  const { data, error } = await supabase
    .from("goal_contributions")
    .insert({
      goal_id: goalId,
      user_id: user.id,
      amount,
      description: description.trim() || null,
    })
    .select()
    .single();

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível adicionar dinheiro à meta."));

  if (currentAmount + amount >= targetAmount) {
    const { error: deactivateError } = await supabase
      .from("goals")
      .update({ is_active: false })
      .eq("id", goalId)
      .eq("user_id", user.id);

    if (deactivateError) throw appError(databaseErrorMessage(deactivateError, "A contribuição foi registrada, mas não foi possível concluir a meta automaticamente."));
  }

  return data;
}

export async function getFinancialSummary() {
  const { supabase, user } = await getAuthenticatedUser();

  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (transactionsError) throw appError(databaseErrorMessage(transactionsError, "Não foi possível carregar o resumo financeiro."));

  const { data: activeGoals, error: goalsError } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (goalsError) throw appError(databaseErrorMessage(goalsError, "Não foi possível carregar as metas."));

  let totalReserved = 0;
  if (activeGoals.length > 0) {
    const { data: contributions, error: contributionsError } = await supabase
      .from("goal_contributions")
      .select("amount")
      .eq("user_id", user.id)
      .in("goal_id", activeGoals.map((goal) => goal.id));

    if (contributionsError) throw appError(databaseErrorMessage(contributionsError, "Não foi possível carregar as contribuições."));
    totalReserved = contributions.reduce((total, contribution) => total + Number(contribution.amount), 0);
  }

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const balance = totalIncome - totalExpense;
  return { totalIncome, totalExpense, balance, totalReserved, availableBalance: balance - totalReserved };
}

export async function deactivateGoal(goalId: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("goals")
    .update({ is_active: false })
    .eq("id", goalId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível desativar a meta."));
  return data;
}
