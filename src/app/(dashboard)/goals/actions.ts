"use server";

import { revalidatePath } from "next/cache";
import {
  createGoal,
  createGoalContribution,
  deactivateGoal,   
} from "@/services/goal.service";

export async function createGoalAction(
  name: string,
  targetAmount: number,
  startDate: string,
  endDate: string | null
) {
  if (!name.trim()) throw new Error("Informe o nome da meta.");
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) throw new Error("Informe um valor válido.");
  if (!startDate || (endDate && endDate < startDate)) throw new Error("A data final não pode ser anterior à data de início.");
  const goal = await createGoal(
    name,
    targetAmount,
    startDate,
    endDate
  );

  revalidatePath("/goals");

  return goal;
}

export async function createGoalContributionAction(
  goalId: string,
  amount: number,
  description: string
) {
  const contribution = await createGoalContribution(
    goalId,
    amount,
    description
  );

  revalidatePath("/goals");
  revalidatePath("/dashboard");

  return contribution;
}

export async function deactivateGoalAction(goalId: string) {
  const goal = await deactivateGoal(goalId);

  revalidatePath("/dashboard");

  return goal;
}
