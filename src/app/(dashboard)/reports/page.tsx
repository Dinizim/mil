import { ArrowDownRight, ArrowUpRight, BarChart3, Download, Minus } from "lucide-react";

import Money from "@/components/Money";
import MonthNavigator from "@/components/MonthNavigator";
import { formatDate, formatMonthLabel, resolveMonth, shiftMonth } from "@/lib/dates";
import { compareWithAverage } from "@/lib/finance";
import { getExpensesByCategory, getMonthSummary } from "@/services/finance.service";
import { getTransactions } from "@/services/transaction.service";

import PrintButton from "./PrintButton";

const COMPARISON_MONTHS = 3;

const actionClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#111113] px-3.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-[#18181B] hover:text-white";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const month = resolveMonth((await searchParams).month);
  const previousMonths = Array.from({ length: COMPARISON_MONTHS }, (_, index) => shiftMonth(month, -(index + 1)));

  const [summary, current, transactions, ...previous] = await Promise.all([
    getMonthSummary(month),
    getExpensesByCategory(month),
    getTransactions({ month }),
    ...previousMonths.map((value) => getExpensesByCategory(value)),
  ]);

  const comparison = compareWithAverage(current, previous);
  const topExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
  const incomes = transactions.filter((transaction) => transaction.type === "income");
  const monthLabel = formatMonthLabel(month);

  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-6 text-zinc-100 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="no-print flex items-center gap-2 text-[#FF7A00]">
              <BarChart3 className="size-5" aria-hidden="true" />
              <span className="text-sm font-medium">Relatórios</span>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Relatório de {monthLabel.toLocaleLowerCase("pt-BR")}</h1>
            <p className="mt-2 text-sm text-zinc-400">Comparado com a média dos {COMPARISON_MONTHS} meses anteriores.</p>
          </div>
          <div className="no-print flex flex-wrap gap-2">
            <a href={`/api/export/transactions?month=${month}`} download className={actionClass}>
              <Download className="size-4" aria-hidden="true" />
              CSV
            </a>
            <PrintButton className={actionClass} />
          </div>
        </header>

        <MonthNavigator basePath="/reports" month={month} className="mt-6" />

        <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="Resumo do mês">
          <Stat label="Entradas" value={summary.totalIncome} tone="text-emerald-400" />
          <Stat label="Despesas" value={summary.totalExpense} tone="text-rose-400" />
          <Stat label="Resultado" value={summary.balance} tone={summary.balance >= 0 ? "text-white" : "text-rose-400"} />
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-[#111113]">
          <div className="border-b border-zinc-800 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-white">Despesas por categoria</h2>
            <p className="mt-1 text-sm text-zinc-500">Este mês contra a média de {formatMonthLabel(previousMonths[COMPARISON_MONTHS - 1], "short")} a {formatMonthLabel(previousMonths[0], "short")}.</p>
          </div>
          {comparison.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-zinc-500 sm:px-6">Sem despesas no período.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-5 py-3 sm:px-6">Categoria</th>
                    <th className="px-5 py-3 text-right">Este mês</th>
                    <th className="px-5 py-3 text-right">Média</th>
                    <th className="px-5 py-3 text-right sm:pr-6">Variação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {comparison.map((row) => (
                    <tr key={row.category}>
                      <td className="px-5 py-3 font-medium text-zinc-100 sm:px-6">{row.category}</td>
                      <td className="px-5 py-3 text-right"><Money value={row.current} className="text-zinc-100" /></td>
                      <td className="px-5 py-3 text-right"><Money value={row.average} className="text-zinc-400" /></td>
                      <td className="px-5 py-3 text-right sm:pr-6"><Variation value={row.variation} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <TransactionTable title="Maiores gastos" empty="Sem despesas neste mês." rows={topExpenses} tone="text-rose-400" />
          <TransactionTable title="Entradas" empty="Sem entradas neste mês." rows={incomes} tone="text-emerald-400" />
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-[#111113] p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <Money value={value} className={"mt-1 block text-2xl font-semibold " + tone} />
    </article>
  );
}

/** Gastar mais que a média é ruim (vermelho); gastar menos é bom (verde). */
function Variation({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-zinc-500">novo</span>;
  const percent = Math.round(value * 100);
  if (percent === 0) {
    return <span className="inline-flex items-center gap-1 text-zinc-400"><Minus className="size-3.5" aria-hidden="true" />0%</span>;
  }
  const up = percent > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={"inline-flex items-center gap-1 font-medium " + (up ? "text-rose-400" : "text-emerald-400")}>
      <Icon className="size-3.5" aria-hidden="true" />
      {up ? "+" : ""}{percent}%
    </span>
  );
}

function TransactionTable({
  title,
  empty,
  rows,
  tone,
}: {
  title: string;
  empty: string;
  rows: Awaited<ReturnType<typeof getTransactions>>;
  tone: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#111113]">
      <h2 className="border-b border-zinc-800 px-5 py-4 text-lg font-semibold text-white sm:px-6">{title}</h2>
      {rows.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-zinc-500 sm:px-6">{empty}</p>
      ) : (
        <ul className="divide-y divide-zinc-800">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-4 px-5 py-3 sm:px-6">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-100">{row.description || "Sem descrição"}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{row.categoryName} · {formatDate(row.transaction_date)}</p>
              </div>
              <Money value={row.amount} className={"shrink-0 text-sm font-semibold " + tone} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
