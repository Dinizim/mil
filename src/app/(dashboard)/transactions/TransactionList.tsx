"use client";

import { ArrowDownLeft, ArrowUpRight, Filter, Pencil, Search } from "lucide-react";
import { useState } from "react";

import type { Category } from "@/components/CategoryCreateModal";
import Money from "@/components/Money";
import { formatDate } from "@/lib/dates";
import { normalizeText } from "@/lib/import-statement";
import { fromCents, toCents } from "@/lib/money";

import DeleteTransactionButton from "./DeleteTransactionButton";
import { TransactionFormModal, amountToInput } from "./TransactionForm";

export type ListTransaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  transaction_date: string;
  category_id: string | null;
  categoryName: string;
};

type Props = { transactions: ListTransaction[]; categories: Category[] };

export default function TransactionList({ transactions, categories }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editing, setEditing] = useState<ListTransaction | null>(null);

  function clearFilters() {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
  }

  const term = normalizeText(search);
  const filteredTransactions = transactions.filter((transaction) => {
    const text = normalizeText(`${transaction.description ?? ""} ${transaction.categoryName}`);
    return (
      (!term || text.includes(term)) &&
      (typeFilter === "all" || transaction.type === typeFilter) &&
      (categoryFilter === "all" || transaction.category_id === categoryFilter)
    );
  });

  let incomeCents = 0;
  let expenseCents = 0;
  for (const item of filteredTransactions) {
    if (item.type === "income") incomeCents += toCents(item.amount);
    else expenseCents += toCents(item.amount);
  }
  const filteredBalance = fromCents(incomeCents - expenseCents);
  const hasFilters = Boolean(search) || typeFilter !== "all" || categoryFilter !== "all";

  return (
    <div className="mt-6">
      <section className="rounded-2xl border border-zinc-800 bg-[#111113] p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar por descrição ou categoria..."
            aria-label="Buscar transações"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-h-12 w-full rounded-xl border border-zinc-700 bg-[#18181B] py-3 pl-11 pr-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20"
          />
        </div>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Tipo</p>
            <div className="flex flex-wrap gap-2">
              {([["all", "Todas"], ["income", "Entradas"], ["expense", "Despesas"]] as const).map(([value, label]) => (
                <button key={value} type="button" aria-pressed={typeFilter === value} onClick={() => setTypeFilter(value)} className={"min-h-10 rounded-xl px-4 text-sm font-medium transition " + (typeFilter === value ? "bg-[#FF7A00] text-[#17110A]" : "border border-zinc-700 bg-[#18181B] text-zinc-300 hover:bg-zinc-800")}>{label}</button>
              ))}
            </div>
          </div>
          <label className="block lg:w-64">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">Categoria</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="min-h-10 w-full rounded-xl border border-zinc-700 bg-[#18181B] px-3 text-sm text-zinc-200 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20">
              <option value="all">Todas as categorias</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          {hasFilters && <button type="button" onClick={clearFilters} className="min-h-10 rounded-xl px-3 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100">Limpar filtros</button>}
        </div>
      </section>

      <section className="my-6 grid gap-4 sm:grid-cols-3" aria-label="Resumo das transações filtradas">
        <SummaryCard label="Entradas" value={fromCents(incomeCents)} tone="text-emerald-400" icon={<ArrowDownLeft className="size-5" aria-hidden="true" />} />
        <SummaryCard label="Despesas" value={fromCents(expenseCents)} tone="text-rose-400" icon={<ArrowUpRight className="size-5" aria-hidden="true" />} />
        <SummaryCard label="Resultado" value={filteredBalance} tone={filteredBalance >= 0 ? "text-[#FF7A00]" : "text-rose-400"} icon={<Filter className="size-5" aria-hidden="true" />} />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">Transações</h2>
          <p className="mt-1 text-sm text-zinc-500">{filteredTransactions.length} {filteredTransactions.length === 1 ? "transação encontrada" : "transações encontradas"}</p>
        </div>
        {filteredTransactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#111113] px-6 py-14 text-center">
            <Search className="mx-auto size-7 text-[#FF7A00]" aria-hidden="true" />
            <h3 className="mt-4 font-semibold text-white">Nenhuma transação encontrada</h3>
            <p className="mt-2 text-sm text-zinc-500">Tente outro mês, altere os filtros ou registre uma nova transação.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => {
              const isIncome = transaction.type === "income";
              return (
                <article key={transaction.id} className="rounded-2xl border border-zinc-800 bg-[#111113] p-4 transition hover:border-zinc-700 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={"flex size-11 shrink-0 items-center justify-center rounded-xl " + (isIncome ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400")}>{isIncome ? <ArrowDownLeft className="size-5" aria-hidden="true" /> : <ArrowUpRight className="size-5" aria-hidden="true" />}</div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-zinc-100 sm:text-base">{transaction.description || "Sem descrição"}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                          <span className="rounded-md bg-zinc-800 px-2 py-1 text-zinc-300">{transaction.categoryName}</span>
                          <span>{formatDate(transaction.transaction_date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <Money value={transaction.amount} sign={isIncome ? "+" : "-"} className={"text-base font-semibold " + (isIncome ? "text-emerald-400" : "text-rose-400")} />
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setEditing(transaction)} className="inline-flex size-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]" aria-label="Editar transação" title="Editar transação">
                          <Pencil className="size-4" aria-hidden="true" />
                        </button>
                        <DeleteTransactionButton id={transaction.id} />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <TransactionFormModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        categories={categories}
        editingId={editing?.id}
        initial={
          editing
            ? {
                type: editing.type,
                amount: amountToInput(editing.amount),
                description: editing.description ?? "",
                // Categoria arquivada não pode ser reutilizada: o usuário escolhe outra.
                categoryId: categories.some((category) => category.id === editing.category_id) ? (editing.category_id ?? "") : "",
                transactionDate: editing.transaction_date,
              }
            : undefined
        }
      />
    </div>
  );
}

function SummaryCard({ label, value, tone, icon }: { label: string; value: number; tone: string; icon: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-[#111113] p-5">
      <div className={"flex size-10 items-center justify-center rounded-xl bg-zinc-800 " + tone}>{icon}</div>
      <p className="mt-4 text-sm text-zinc-500">{label}</p>
      <Money value={value} className={"mt-1 block text-2xl font-semibold " + tone} />
    </article>
  );
}
