import { ArrowLeftRight } from "lucide-react";

import { getCategories } from "@/services/category.services";
import { getTransactions } from "@/services/transaction.service";

import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";

export default async function TransactionsPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-6 text-zinc-100 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#FF7A00]">
              <ArrowLeftRight className="size-5" aria-hidden="true" />
              <span className="text-sm font-medium">Movimentações</span>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Transações
            </h1>
            <p className="mt-2 text-sm text-zinc-400 sm:text-base">
              Gerencie suas entradas e despesas.
            </p>
          </div>
          <TransactionForm categories={categories} />
        </header>

        <TransactionList
          transactions={transactions.map((transaction) => ({
            ...transaction,
            categories: Array.isArray(transaction.categories)
              ? transaction.categories[0] ?? null
              : transaction.categories,
          }))}
          categories={categories}
        />
      </div>
    </main>
  );
}
