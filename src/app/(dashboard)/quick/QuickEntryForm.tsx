"use client";

import { ArrowDownLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState } from "react";

import type { Category } from "@/components/CategoryCreateModal";
import Money from "@/components/Money";
import { Alert, SubmitLabel, inputClass, primaryButtonClass } from "@/components/ui/form";
import { todayISO } from "@/lib/dates";
import { parseQuickEntry } from "@/lib/quick-entry";

import { createTransactionAction } from "../transactions/actions";

export default function QuickEntryForm({ categories }: { categories: Category[] }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [categoryOverride, setCategoryOverride] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const entry = parseQuickEntry(text, categories);
  const categoryId = categoryOverride ?? entry?.categoryId ?? "";
  const options = categories.filter((category) => category.type === (entry?.type ?? "expense"));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved("");

    if (!entry) {
      setError("Inclua um valor, por exemplo: mercado 85.");
      return;
    }
    if (!categoryId) {
      setError("Escolha a categoria.");
      return;
    }

    setLoading(true);
    const result = await createTransactionAction({
      type: entry.type,
      amount: entry.amount,
      description: entry.description,
      categoryId,
      transactionDate: todayISO(),
    });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSaved(`${entry.type === "income" ? "Entrada" : "Saída"} registrada: ${entry.description || "sem descrição"}.`);
    setText("");
    setCategoryOverride(null);
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <label htmlFor={inputId} className="sr-only">Lançamento</label>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setCategoryOverride(null);
          setSaved("");
        }}
        placeholder="mercado 85"
        autoFocus
        autoComplete="off"
        enterKeyHint="send"
        className="min-h-14 w-full rounded-2xl border border-zinc-700 bg-[#111113] px-4 text-lg text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20"
      />

      {entry && (
        <section aria-label="Prévia" className="rounded-2xl border border-zinc-800 bg-[#111113] p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className={"flex size-11 shrink-0 items-center justify-center rounded-xl " + (entry.type === "income" ? "bg-emerald-400/10 text-emerald-400" : "bg-rose-400/10 text-rose-400")}>
                {entry.type === "income" ? <ArrowDownLeft className="size-5" aria-hidden="true" /> : <ArrowUpRight className="size-5" aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-zinc-100">{entry.description || "Sem descrição"}</p>
                <p className="text-xs text-zinc-500">{entry.type === "income" ? "Entrada" : "Saída"} · hoje</p>
              </div>
            </div>
            <Money value={entry.amount} className={"shrink-0 text-lg font-semibold " + (entry.type === "income" ? "text-emerald-400" : "text-rose-400")} />
          </div>

          <label className="mt-4 block text-sm">
            <span className="mb-1.5 block font-medium text-zinc-200">Categoria</span>
            <select value={categoryId} onChange={(event) => setCategoryOverride(event.target.value)} className={inputClass}>
              <option value="">Escolher...</option>
              {options.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          {options.length === 0 && (
            <p className="mt-2 text-xs text-zinc-500">
              Nenhuma categoria desse tipo. <Link href="/categories" className="text-[#FF7A00]">Criar categoria</Link>
            </p>
          )}
        </section>
      )}

      <Alert>{error}</Alert>
      {saved && (
        <Alert tone="success">
          <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4" aria-hidden="true" />{saved}</span>
        </Alert>
      )}

      <button type="submit" disabled={loading || !entry} className={primaryButtonClass + " w-full"}>
        <SubmitLabel loading={loading} idle="Registrar" busy="Registrando..." />
      </button>

      <p className="text-center text-xs text-zinc-600">
        Comece com <span className="text-zinc-400">+</span> para entrada. Precisa de outra data?{" "}
        <Link href="/transactions" className="text-zinc-400 underline-offset-4 hover:underline">Use o formulário completo</Link>.
      </p>
    </form>
  );
}
