import Link from "next/link";

import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Info,
  Plus,
  Wallet,
  Zap,
} from "lucide-react";

import ExpensesByCategoryChart from "@/components/ExpensesByCategoryChart";
import GoalsSection from "@/components/GoalsSection";
import Money from "@/components/Money";
import MonthNavigator from "@/components/MonthNavigator";
import MonthlyFinancialChart from "@/components/MonthlyFinancialChart";
import PrivacyToggle from "@/components/PrivacyToggle";
import { getDisplayName } from "@/lib/auth";
import { formatDate, formatMonthLabel, resolveMonth } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import {
  getExpensesByCategory,
  getFinancialSummary,
  getMonthSummary,
  getMonthlyEvolution,
} from "@/services/finance.service";
import { getGoalsWithProgress } from "@/services/goal.service";
import { getLatestTransactions } from "@/services/transaction.service";

async function getUserName() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle()
    : { data: null };

  return getDisplayName(user, profile?.name);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const month = resolveMonth((await searchParams).month);
  const monthLabel = formatMonthLabel(month);

  const [userName, summary, monthSummary, latestTransactions, monthlySummary, expensesByCategory, goals] =
    await Promise.all([
      getUserName(),
      getFinancialSummary(),
      getMonthSummary(month),
      getLatestTransactions(5, month),
      getMonthlyEvolution(month),
      getExpensesByCategory(month),
      getGoalsWithProgress(),
    ]);

  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-6 text-zinc-100 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#FF7A00]">
              Olá, {userName}!
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Visão geral
            </h1>
            <p className="mt-2 text-sm text-zinc-400 sm:text-base">
              Acompanhe sua vida financeira em um só lugar.
            </p>
          </div>

          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <PrivacyToggle className="md:hidden" />
            <Link
              href="/quick"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#111113] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-[#18181B] sm:flex-none"
            >
              <Zap className="size-4 text-[#FF7A00]" aria-hidden="true" />
              Lançamento rápido
            </Link>
            <Link
              href="/transactions"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-2.5 text-sm font-semibold text-[#17110A] transition-colors hover:bg-[#FF8A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] sm:flex-none"
            >
              <Plus className="size-4" aria-hidden="true" />
              Adicionar transação
            </Link>
          </div>
        </header>

        <section aria-label="Resumo financeiro" className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-zinc-800 bg-[#18181B] p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-400">Saldo total</p>
                <Money value={summary.balance} className="mt-3 block text-3xl font-semibold tracking-tight text-white sm:text-4xl" />
              </div>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#FF7A00]/15 text-[#FF7A00]">
                <Wallet className="size-5" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-7 border-t border-zinc-800 pt-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Movimento do mês</p>
                <MonthNavigator basePath="/dashboard" month={month} />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-[#111113] p-4">
                  <p className="flex items-center gap-2 text-sm text-zinc-400">
                    <ArrowDownLeft className="size-4 text-emerald-400" aria-hidden="true" />
                    Entradas
                  </p>
                  <Money value={monthSummary.totalIncome} className="mt-2 block text-xl font-semibold text-emerald-400" />
                </div>

                <div className="rounded-xl bg-[#111113] p-4">
                  <p className="flex items-center gap-2 text-sm text-zinc-400">
                    <ArrowUpRight className="size-4 text-rose-400" aria-hidden="true" />
                    Despesas
                  </p>
                  <Money value={monthSummary.totalExpense} className="mt-2 block text-xl font-semibold text-rose-400" />
                </div>

                <div className="rounded-xl bg-[#111113] p-4">
                  <p className="text-sm text-zinc-400">Resultado</p>
                  <Money
                    value={monthSummary.balance}
                    className={"mt-2 block text-xl font-semibold " + (monthSummary.balance >= 0 ? "text-zinc-100" : "text-rose-400")}
                  />
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-[#111113] p-5 shadow-sm sm:p-6">
            <p className="flex items-center gap-2 text-sm font-medium text-zinc-400">
              <Info className="size-4 text-[#FF7A00]" aria-hidden="true" />
              Saldo disponível
            </p>
            <Money value={summary.availableBalance} className="mt-4 block text-3xl font-semibold tracking-tight text-white" />
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Saldo total menos o valor reservado para suas metas ativas.
            </p>
            <div className="mt-6 border-t border-zinc-800 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Reservado
              </p>
              <Money value={summary.totalReserved} className="mt-1 block text-lg font-semibold text-[#FF7A00]" />
            </div>
          </article>
        </section>

        <GoalsSection goals={goals} showAllLink />

        <section className="mt-8 grid gap-5 xl:grid-cols-2">
          <article className="rounded-2xl border border-zinc-800 bg-[#111113] p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">
                Evolução financeira
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Entradas e despesas nos 12 meses até {monthLabel.toLocaleLowerCase("pt-BR")}.
              </p>
            </div>

            {monthlySummary.length === 0 ? (
              <EmptyChartState message="Ainda não existem dados suficientes para exibir o gráfico." />
            ) : (
              <div className="sensitive">
                <MonthlyFinancialChart data={monthlySummary} />
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-[#111113] p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">
                Despesas por categoria
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Onde seu dinheiro foi em {monthLabel.toLocaleLowerCase("pt-BR")}.
              </p>
            </div>

            {expensesByCategory.length === 0 ? (
              <EmptyChartState message="Nenhuma despesa neste mês." />
            ) : (
              <div className="sensitive">
                <ExpensesByCategoryChart data={expensesByCategory} />
              </div>
            )}
          </article>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-[#111113] shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-800 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Últimas transações
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Movimentações de {monthLabel.toLocaleLowerCase("pt-BR")}.
              </p>
            </div>

            <Link
              href={`/transactions?month=${month}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-zinc-300 transition-colors hover:text-[#FF7A00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]"
            >
              Ver todas
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-800">
            {latestTransactions.length === 0 ? (
              <div className="px-5 py-10 text-center sm:px-6">
                <p className="text-sm text-zinc-400">
                  Nenhuma transação neste mês.
                </p>
                <Link
                  href="/transactions"
                  className="mt-3 inline-flex text-sm font-medium text-[#FF7A00] hover:text-[#FF8A1A]"
                >
                  Adicionar transação
                </Link>
              </div>
            ) : (
              latestTransactions.map((transaction) => {
                const isIncome = transaction.type === "income";

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={
                          "flex size-10 shrink-0 items-center justify-center rounded-xl " +
                          (isIncome
                            ? "bg-emerald-400/10 text-emerald-400"
                            : "bg-rose-400/10 text-rose-400")
                        }
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="size-5" aria-hidden="true" />
                        ) : (
                          <ArrowUpRight className="size-5" aria-hidden="true" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-100">
                          {transaction.description || "Sem descrição"}
                        </p>
                        <p className="mt-1 truncate text-xs text-zinc-500">
                          {transaction.categoryName}{" "}
                          <span aria-hidden="true">|</span>{" "}
                          {formatDate(transaction.transaction_date)}
                        </p>
                      </div>
                    </div>

                    <Money
                      value={transaction.amount}
                      sign={isIncome ? "+" : "-"}
                      className={
                        "shrink-0 text-sm font-semibold sm:text-base " +
                        (isIncome ? "text-emerald-400" : "text-rose-400")
                      }
                    />
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-[#18181B] px-6 text-center">
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  );
}
