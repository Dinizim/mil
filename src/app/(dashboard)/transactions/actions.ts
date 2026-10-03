"use server";

import { runAction } from "@/lib/action-result";
import { revalidateApp } from "@/lib/revalidate";
import type { TransactionInput } from "@/lib/validation";
import {
  createTransaction,
  getExistingImportKeys,
  importTransactions,
  replaceTransaction,
  softDeleteTransaction,
} from "@/services/transaction.service";

export async function createTransactionAction(input: TransactionInput) {
  return runAction("Não foi possível criar a transação.", async () => {
    const transaction = await createTransaction(input);
    revalidateApp();
    return transaction;
  });
}

export async function updateTransactionAction(id: string, input: TransactionInput) {
  return runAction("Não foi possível editar a transação.", async () => {
    const transaction = await replaceTransaction(String(id), input);
    revalidateApp();
    return transaction;
  });
}

export async function deleteTransactionAction(id: string) {
  return runAction("Não foi possível excluir a transação.", async () => {
    await softDeleteTransaction(String(id));
    revalidateApp();
  });
}

export async function getImportKeysAction(startDate: string, endDate: string) {
  return runAction("Não foi possível verificar transações duplicadas.", () =>
    getExistingImportKeys(String(startDate), String(endDate))
  );
}

export async function importTransactionsAction(rows: TransactionInput[]) {
  return runAction("Não foi possível importar as transações.", async () => {
    const result = await importTransactions(Array.isArray(rows) ? rows : []);
    revalidateApp();
    return result;
  });
}
