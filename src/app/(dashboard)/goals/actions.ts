"use server";

import { runAction } from "@/lib/action-result";
import { revalidateApp } from "@/lib/revalidate";
import type { GoalInput } from "@/lib/validation";
import {
  createGoal,
  createGoalContribution,
  deactivateGoal,
  reactivateGoal,
  updateGoal,
} from "@/services/goal.service";

export async function createGoalAction(input: GoalInput) {
  return runAction("Não foi possível criar a meta.", async () => {
    const goal = await createGoal(input);
    revalidateApp();
    return goal;
  });
}

export async function updateGoalAction(goalId: string, input: GoalInput) {
  return runAction("Não foi possível atualizar a meta.", async () => {
    await updateGoal(String(goalId), input);
    revalidateApp();
  });
}

export async function createGoalContributionAction(goalId: string, amount: string, description: string) {
  return runAction("Não foi possível adicionar dinheiro à meta.", async () => {
    const contribution = await createGoalContribution(String(goalId), amount, String(description ?? ""));
    revalidateApp();
    return contribution;
  });
}

export async function deactivateGoalAction(goalId: string) {
  return runAction("Não foi possível desativar a meta.", async () => {
    await deactivateGoal(String(goalId));
    revalidateApp();
  });
}

export async function reactivateGoalAction(goalId: string) {
  return runAction("Não foi possível reativar a meta.", async () => {
    await reactivateGoal(String(goalId));
    revalidateApp();
  });
}
