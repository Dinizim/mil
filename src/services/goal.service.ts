import "server-only";

import { getAuthenticatedUser, type Supabase } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import { appError, databaseErrorMessage } from "@/lib/errors";
import { computeGoalPlan } from "@/lib/finance";
import { fromCents, toCents } from "@/lib/money";
import { contributionInputSchema, goalInputSchema, parseInput, type GoalInput } from "@/lib/validation";

import { getAvailableBalance } from "./finance.service";

type GoalRow = {
  id: string;
  name: string;
  target_amount: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
};

async function getContributionTotals(supabase: Supabase, userId: string, goalIds: string[]) {
  const totals = new Map<string, number>();
  if (goalIds.length === 0) return totals;

  const { data, error } = await supabase
    .from("goal_contributions")
    .select("goal_id, amount")
    .eq("user_id", userId)
    .in("goal_id", goalIds);

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível carregar as contribuições."));

  for (const contribution of data) {
    totals.set(contribution.goal_id, (totals.get(contribution.goal_id) ?? 0) + toCents(contribution.amount));
  }
  return totals;
}

function withProgress(goal: GoalRow, currentCents: number, today: string) {
  const targetCents = toCents(goal.target_amount);
  const currentAmount = fromCents(currentCents);
  const percentage = targetCents > 0 ? Math.min((currentCents / targetCents) * 100, 100) : 0;

  return {
    ...goal,
    target_amount: Number(goal.target_amount),
    currentAmount,
    percentage,
    remainingAmount: fromCents(Math.max(targetCents - currentCents, 0)),
    plan: computeGoalPlan(goal, currentAmount, today),
  };
}

export type GoalWithProgress = ReturnType<typeof withProgress>;

/** Metas com progresso, ritmo e valor mensal sugerido. Por padrão, só as ativas. */
export async function getGoalsWithProgress(options: { includeInactive?: boolean } = {}) {
  const { supabase, user } = await getAuthenticatedUser();

  let query = supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (!options.includeInactive) query = query.eq("is_active", true);

  const { data: goals, error } = await query;
  if (error) throw appError(databaseErrorMessage(error, "Não foi possível carregar as metas."));

  const totals = await getContributionTotals(supabase, user.id, goals.map((goal) => goal.id));
  const today = todayISO();
  return (goals as GoalRow[]).map((goal) => withProgress(goal, totals.get(goal.id) ?? 0, today));
}

/** Meta com o histórico de aportes. */
export async function getGoalDetails(goalId: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const [goalResult, contributionsResult] = await Promise.all([
    supabase.from("goals").select("*").eq("id", goalId).eq("user_id", user.id).maybeSingle(),
    supabase
      .from("goal_contributions")
      .select("id, amount, description, contribution_date, created_at")
      .eq("goal_id", goalId)
      .eq("user_id", user.id)
      .order("contribution_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (goalResult.error) throw appError(databaseErrorMessage(goalResult.error, "Não foi possível carregar a meta."));
  if (!goalResult.data) return null;
  if (contributionsResult.error) {
    throw appError(databaseErrorMessage(contributionsResult.error, "Não foi possível carregar os aportes."));
  }

  const contributions = contributionsResult.data.map((item) => ({ ...item, amount: Number(item.amount) }));
  const currentCents = contributions.reduce((total, item) => total + toCents(item.amount), 0);

  return { goal: withProgress(goalResult.data as GoalRow, currentCents, todayISO()), contributions };
}

async function getGoalWithTotal(supabase: Supabase, userId: string, goalId: string) {
  const { data: goal, error } = await supabase
    .from("goals")
    .select("id, target_amount, is_active")
    .eq("id", goalId)
    .eq("user_id", userId)
    .single();

  if (error || !goal) throw appError("Meta não encontrada.");

  const totals = await getContributionTotals(supabase, userId, [goalId]);
  return { goal, currentCents: totals.get(goalId) ?? 0 };
}

export async function createGoal(input: GoalInput) {
  const { supabase, user } = await getAuthenticatedUser();
  const goal = parseInput(goalInputSchema, input);

  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      name: goal.name,
      target_amount: goal.targetAmount,
      start_date: goal.startDate,
      end_date: goal.endDate,
    })
    .select("id")
    .single();

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível criar a meta."));
  return data;
}

/** Edita nome, valor e prazo. O novo valor não pode ficar abaixo do que já foi guardado. */
export async function updateGoal(goalId: string, input: GoalInput) {
  const { supabase, user } = await getAuthenticatedUser();
  const goal = parseInput(goalInputSchema, input);
  const { currentCents } = await getGoalWithTotal(supabase, user.id, goalId);

  if (toCents(goal.targetAmount) < currentCents) {
    throw appError("O valor da meta não pode ser menor do que o já guardado.");
  }

  const { error } = await supabase
    .from("goals")
    .update({ name: goal.name, target_amount: goal.targetAmount, start_date: goal.startDate, end_date: goal.endDate })
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível atualizar a meta."));
}

/**
 * Reabre uma meta desativada. O dinheiro dela volta a ficar reservado,
 * então o saldo disponível precisa cobrir o que já foi guardado.
 */
export async function reactivateGoal(goalId: string) {
  const { supabase, user } = await getAuthenticatedUser();
  const { goal, currentCents } = await getGoalWithTotal(supabase, user.id, goalId);

  if (goal.is_active) throw appError("Esta meta já está ativa.");
  if (currentCents >= toCents(goal.target_amount)) {
    throw appError("Esta meta já foi concluída. Aumente o valor da meta para reabri-la.");
  }

  const available = await getAvailableBalance();
  if (currentCents > toCents(available)) {
    throw appError("Saldo disponível insuficiente para reservar novamente o dinheiro desta meta.");
  }

  const { error } = await supabase.from("goals").update({ is_active: true }).eq("id", goalId).eq("user_id", user.id);
  if (error) throw appError(databaseErrorMessage(error, "Não foi possível reativar a meta."));
}

/**
 * TODO(banco): mover para uma RPC no Postgres com transação. Hoje ler saldo,
 * validar, inserir e desativar são passos separados.
 */
export async function createGoalContribution(goalId: string, amount: string | number, description: string) {
  const { supabase, user } = await getAuthenticatedUser();
  const contribution = parseInput(contributionInputSchema, { goalId, amount, description });
  const { goal, currentCents } = await getGoalWithTotal(supabase, user.id, contribution.goalId);

  if (!goal.is_active) throw appError("Esta meta não está ativa.");

  const amountCents = toCents(contribution.amount);
  const targetCents = toCents(goal.target_amount);

  if (currentCents + amountCents > targetCents) throw appError("Essa contribuição ultrapassa o valor da meta.");

  const available = await getAvailableBalance();
  if (amountCents > toCents(available)) throw appError("Saldo disponível insuficiente.");

  const { data, error } = await supabase
    .from("goal_contributions")
    .insert({
      goal_id: contribution.goalId,
      user_id: user.id,
      amount: contribution.amount,
      description: contribution.description || null,
      contribution_date: todayISO(),
    })
    .select("id")
    .single();

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível adicionar dinheiro à meta."));

  if (currentCents + amountCents >= targetCents) {
    const { error: deactivateError } = await supabase
      .from("goals")
      .update({ is_active: false })
      .eq("id", contribution.goalId)
      .eq("user_id", user.id);

    if (deactivateError) {
      throw appError(
        databaseErrorMessage(deactivateError, "A contribuição foi registrada, mas não foi possível concluir a meta automaticamente.")
      );
    }
  }

  return data;
}

export async function deactivateGoal(goalId: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("goals")
    .update({ is_active: false })
    .eq("id", goalId)
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (error) throw appError(databaseErrorMessage(error, "Não foi possível desativar a meta."));
  return data;
}
