import { ArrowLeftRight, Download, Tags, Upload, Zap } from "lucide-react";
import Link from "next/link";

import MonthNavigator from "@/components/MonthNavigator";
import { resolveMonth } from "@/lib/dates";
import { getCategories } from "@/services/category.services";
import { getTransactions } from "@/services/transaction.service";

import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";

const secondaryLink =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#111113] px-3.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-[#18181B] hover:text-white";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const showAll = params.month === "all";
  const month = resolveMonth(params.month);

  const [transactions, categories] = await Promise.all([
    getTransactions({ month: showAll ? null : month }),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-6 text-zinc-100 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#FF7A00]">
              <ArrowLeftRight className="size-5" aria-hidden="true" />
              <span className="text-sm font-medium">Movimentações</span>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Transações</h1>
            <p className="mt-2 text-sm text-zinc-400 sm:text-base">Gerencie suas entradas e despesas.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/quick" className={secondaryLink}><Zap className="size-4" aria-hidden="true" />Rápido</Link>
            <Link href="/transactions/import" className={secondaryLink}><Upload className="size-4" aria-hidden="true" />Importar</Link>
            <a href={`/api/export/transactions?month=${showAll ? "all" : month}`} className={secondaryLink} download><Download className="size-4" aria-hidden="true" />CSV</a>
            <Link href="/categories" className={secondaryLink + " md:hidden"}><Tags className="size-4" aria-hidden="true" />Categorias</Link>
            <TransactionForm categories={categories} />
          </div>
        </header>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {showAll ? (
            <p className="text-sm font-semibold text-zinc-100">Todo o período</p>
          ) : (
            <MonthNavigator basePath="/transactions" month={month} />
          )}
          <Link
            href={showAll ? "/transactions" : "/transactions?month=all"}
            className="text-sm font-medium text-[#FF7A00] hover:text-[#FF8A1A]"
          >
            {showAll ? "Ver por mês" : "Ver todo o período"}
          </Link>
        </div>

        <TransactionList transactions={transactions} categories={categories} />
      </div>
    </main>
  );
}
