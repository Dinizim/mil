"use server";

import { revalidatePath } from "next/cache";
import { createTransaction, softDeleteTransaction } from "@/services/transaction.service";

function validateTransactionInput(type: unknown, amount: unknown, description: unknown, categoryId: unknown, transactionDate: unknown) {
  if (type !== "income" && type !== "expense") throw new Error("Tipo de transação inválido.");
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) throw new Error("Informe um valor maior que zero.");
  if (Math.round(amount * 100) !== amount * 100) throw new Error("O valor deve ter no máximo 2 casas decimais.");
  if (typeof description !== "string" || description.length > 200) throw new Error("A descrição deve ter no máximo 200 caracteres.");
  if (typeof categoryId !== "string" || !categoryId) throw new Error("Selecione uma categoria.");
  if (typeof transactionDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(transactionDate) || Number.isNaN(Date.parse(`${transactionDate}T00:00:00`))) throw new Error("Informe uma data válida.");
}

export async function createTransactionAction(type: "income" | "expense", amount: number, description: string, categoryId: string, transactionDate: string) {
  validateTransactionInput(type, amount, description, categoryId, transactionDate);
  const transaction = await createTransaction(type, amount, description, categoryId, transactionDate);
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return transaction;
}

export async function deleteTransactionAction(id: string) {
  if (typeof id !== "string" || !id) throw new Error("Transação inválida.");
  await softDeleteTransaction(id);
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}
