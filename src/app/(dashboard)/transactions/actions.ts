"use server";

import { revalidatePath } from "next/cache";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/services/transaction.service";

function validateTransactionInput(
  type: string,
  amount: number,
  categoryId: string,
  transactionDate: string
) {
  if (type !== "income" && type !== "expense") {
    throw new Error("Tipo de transaÃ§Ã£o invÃ¡lido.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Informe um valor vÃ¡lido.");
  }

  if (!categoryId) {
    throw new Error("Selecione uma categoria.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(transactionDate) || Number.isNaN(Date.parse(`${transactionDate}T00:00:00`))) {
    throw new Error("Informe uma data vÃ¡lida.");
  }
}
export async function createTransactionAction(
  type: "income" | "expense",
  amount: number,
  description: string,
  categoryId: string,
  transactionDate: string
) {
  validateTransactionInput(type, amount, categoryId, transactionDate);
  const transaction = await createTransaction(
    type,
    amount,
    description,
    categoryId,
    transactionDate
  );

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return transaction;
}

export async function updateTransactionAction(
  id: string,
  type: "income" | "expense",
  amount: number,
  description: string,
  categoryId: string,
  transactionDate: string
) {
  validateTransactionInput(type, amount, categoryId, transactionDate);
  const transaction = await updateTransaction(
    id,
    type,
    amount,
    description,
    categoryId,
    transactionDate
  );

  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return transaction;
}

export async function deleteTransactionAction(id: string) {
  await deleteTransaction(id);

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}