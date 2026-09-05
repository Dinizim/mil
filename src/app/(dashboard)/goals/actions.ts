"use server";

import { revalidatePath } from "next/cache";
import { createGoal, createGoalContribution, deactivateGoal } from "@/services/goal.service";

function validateDate(date: string, message: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00`))) {
    throw new Error(message);
  }
}

export async function createGoalAction(name: string, targetAmount: number, startDate: string, endDate: string | null) {
  if (typeof name !== "string") throw new Error("Informe o nome da meta.");
  if (typeof targetAmount !== "number" || !Number.isFinite(targetAmount) || targetAmount <= 0) throw new Error("Informe um valor válido para a meta.");
  if (Math.round(targetAmount * 100) !== targetAmount * 100) throw new Error("O valor da meta deve ter no máximo 2 casas decimais.");
  validateDate(startDate, "Informe uma data de início válida.");
  if (endDate) validateDate(endDate, "Informe uma data final válida.");
  if (endDate && endDate < startDate) throw new Error("A data final não pode ser anterior à data de início.");

  const goal = await createGoal(name, targetAmount, startDate, endDate);
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return goal;
}

export async function createGoalContributionAction(goalId: string, amount: number, description: string) {
  if (typeof goalId !== "string" || !goalId) throw new Error("Meta inválida.");
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) throw new Error("O valor deve ser maior que zero.");
  if (typeof description !== "string") throw new Error("Descrição inválida.");

  const contribution = await createGoalContribution(goalId, amount, description);
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return contribution;
}

export async function deactivateGoalAction(goalId: string) {
  if (typeof goalId !== "string" || !goalId) throw new Error("Meta inválida.");
  const goal = await deactivateGoal(goalId);
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return goal;
}
