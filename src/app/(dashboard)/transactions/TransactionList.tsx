"use client";

import { ArrowDownLeft, ArrowUpRight, Calendar, Filter, Search } from "lucide-react";
import { useState } from "react";

import DeleteTransactionButton from "./DeleteTransactionButton";
import EditTransactionButton from "./EditTransactionButton";

type Transaction = { id: string; type: "income" | "expense"; amount: number | string; description: string | null; transaction_date: string; categories: { name: string } | null };
type Category = { id: string; name: string; type: "income" | "expense" };
type Props = { transactions: Transaction[]; categories: Category[] };
type PeriodFilter = "none" | "today" | "7days" | "thisMonth" | "lastMonth" | "custom";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date + "T00:00:00"));
}

export default function TransactionList({ transactions, categories }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("none");

  function formatDateInput(date: Date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }

  function applyPeriod(period: "today" | "7days" | "thisMonth" | "lastMonth") {
    const today = new Date();
    let start: Date;
    let end = today;
    if (period === "today") start = today;
    else if (period === "7days") { start = new Date(today); start.setDate(today.getDate() - 6); }
    else if (period === "thisMonth") start = new Date(today.getFullYear(), today.getMonth(), 1);
    else { start = new Date(today.getFullYear(), today.getMonth() - 1, 1); end = new Date(today.getFullYear(), today.getMonth(), 0); }
    setStartDate(formatDateInput(start));
    setEndDate(formatDateInput(end));
    setPeriodFilter(period);
  }

  function clearFilters() {
    setSearch(""); setTypeFilter("all"); setCategoryFilter("all"); setStartDate(""); setEndDate(""); setPeriodFilter("none");
  }

  const invalidDateRange = Boolean(startDate && endDate && startDate > endDate);
  const filteredTransactions = transactions.filter((transaction) => {
    const term = search.toLowerCase();
    const category = transaction.categories?.name.toLowerCase() || "";
    return (
      (transaction.description?.toLowerCase().includes(term) || category.includes(term)) &&
      (typeFilter === "all" || transaction.type === typeFilter) &&
      (categoryFilter === "all" || transaction.categories?.name === categoryFilter) &&
      (!startDate || transaction.transaction_date >= startDate) &&
      (!endDate || transaction.transaction_date <= endDate)
    );
  });
  const filteredIncome = filteredTransactions.filter((item) => item.type === "income").reduce((total, item) => total + Number(item.amount), 0);
  const filteredExpense = filteredTransactions.filter((item) => item.type === "expense").reduce((total, item) => total + Number(item.amount), 0);
  const filteredBalance = filteredIncome - filteredExpense;

  return (
    <div className="mt-8">
      <section className="rounded-2xl border border-zinc-800 bg-[#111113] p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar por descrição ou categoria..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-h-12 w-full rounded-xl border border-zinc-700 bg-[#18181B] py-3 pl-11 pr-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20"
          />
        </div>
        <div className="mt-5 border-t border-zinc-800 pt-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <Filter className="size-4 text-[#FF7A00]" aria-hidden="true" />
            Filtros
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Tipo</p>
              <div className="flex flex-wrap gap-2">
                {[["all", "Todas"], ["income", "Entradas"], ["expense", "Despesas"]].map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setTypeFilter(value as "all" | "income" | "expense")} className={"min-h-10 rounded-xl px-4 text-sm font-medium transition " + (typeFilter === value ? "bg-[#FF7A00] text-[#17110A]" : "border border-zinc-700 bg-[#18181B] text-zinc-300 hover:bg-zinc-800")}>{label}</button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">Categoria</span>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="min-h-10 w-full rounded-xl border border-zinc-700 bg-[#18181B] px-3 text-sm text-zinc-200 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20">
                <option value="all">Todas as categorias</option>
                {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Período</p>
            <div className="flex flex-wrap gap-2">
              {[["today", "Hoje"], ["7days", "7 dias"], ["thisMonth", "Este mês"], ["lastMonth", "Mês passado"]].map(([value, label]) => (
                <button key={value} type="button" onClick={() => applyPeriod(value as "today" | "7days" | "thisMonth" | "lastMonth")} className={"min-h-10 rounded-xl px-4 text-sm font-medium transition " + (periodFilter === value ? "bg-zinc-100 text-zinc-950" : "border border-zinc-700 bg-[#18181B] text-zinc-300 hover:bg-zinc-800")}>{label}</button>
              ))}
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block flex-1"><span className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500"><Calendar className="size-3.5" aria-hidden="true" /> Data inicial</span><input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); setPeriodFilter("custom"); }} className="min-h-10 w-full rounded-xl border border-zinc-700 bg-[#18181B] px-3 text-sm text-zinc-200 outline-none focus:border-[#FF7A00]" /></label>
            <label className="block flex-1"><span className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Data final</span><input type="date" value={endDate} onChange={(event) => { setEndDate(event.target.value); setPeriodFilter("custom"); }} className="min-h-10 w-full rounded-xl border border-zinc-700 bg-[#18181B] px-3 text-sm text-zinc-200 outline-none focus:border-[#FF7A00]" /></label>
            <button type="button" onClick={clearFilters} className="min-h-10 rounded-xl px-3 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100">Limpar filtros</button>
          </div>
          {invalidDateRange && <p className="mt-3 text-sm text-rose-400">A data inicial não pode ser maior que a data final.</p>}
        </div>
      </section>

      <section className="my-6 grid gap-4 sm:grid-cols-3" aria-label="Resumo das transações filtradas">
        <SummaryCard label="Entradas" value={filteredIncome} detail="Valores recebidos" tone="text-emerald-400" icon={<ArrowDownLeft className="size-5" aria-hidden="true" />} />
        <SummaryCard label="Despesas" value={filteredExpense} detail="Valores gastos" tone="text-rose-400" icon={<ArrowUpRight className="size-5" aria-hidden="true" />} />
        <SummaryCard label="Saldo" value={filteredBalance} detail="Entradas menos despesas" tone={filteredBalance >= 0 ? "text-[#FF7A00]" : "text-rose-400"} icon={<Filter className="size-5" aria-hidden="true" />} />
      </section>

      <section>
        <div className="mb-4"><h2 className="text-xl font-semibold text-white">Transações</h2><p className="mt-1 text-sm text-zinc-500">{filteredTransactions.length} {filteredTransactions.length === 1 ? "transação encontrada" : "transações encontradas"}</p></div>
        {filteredTransactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#111113] px-6 py-14 text-center">
            <Search className="mx-auto size-7 text-[#FF7A00]" aria-hidden="true" />
            <h3 className="mt-4 font-semibold text-white">Nenhuma transação encontrada</h3>
            <p className="mt-2 text-sm text-zinc-500">Tente alterar os filtros ou realizar uma nova busca.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => {
              const isIncome = transaction.type === "income";
              return <article key={transaction.id} className="rounded-2xl border border-zinc-800 bg-[#111113] p-4 transition hover:border-zinc-700 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={"flex size-11 shrink-0 items-center justify-center rounded-xl " + (isIncome ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400")}>{isIncome ? <ArrowDownLeft className="size-5" aria-hidden="true" /> : <ArrowUpRight className="size-5" aria-hidden="true" />}</div>
                    <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-zinc-100 sm:text-base">{transaction.description || "Sem descrição"}</h3><div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500"><span className="rounded-md bg-zinc-800 px-2 py-1 text-zinc-300">{transaction.categories?.name || "Sem categoria"}</span><span>{formatDate(transaction.transaction_date)}</span></div></div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end"><p className={"text-base font-semibold " + (isIncome ? "text-emerald-400" : "text-rose-400")}>{isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}</p><div className="flex items-center gap-1"><EditTransactionButton transaction={transaction} categories={categories} /><DeleteTransactionButton id={transaction.id} /></div></div>
                </div>
              </article>;
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value, detail, tone, icon }: { label: string; value: number; detail: string; tone: string; icon: React.ReactNode }) {
  return <article className="rounded-2xl border border-zinc-800 bg-[#111113] p-5"><div className={"flex size-10 items-center justify-center rounded-xl bg-zinc-800 " + tone}>{icon}</div><p className="mt-4 text-sm text-zinc-500">{label}</p><p className={"mt-1 text-2xl font-semibold " + tone}>{formatCurrency(value)}</p><p className="mt-1 text-xs text-zinc-600">{detail}</p></article>;
}
