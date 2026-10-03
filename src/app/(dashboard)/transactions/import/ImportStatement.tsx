"use client";

import { CheckCircle2, FileUp } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

import type { Category } from "@/components/CategoryCreateModal";
import Money from "@/components/Money";
import { Alert, SubmitLabel, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { formatDate } from "@/lib/dates";
import { importKey, parseStatement, type StatementRow } from "@/lib/import-statement";

import { getImportKeysAction, importTransactionsAction } from "../actions";

type Row = StatementRow & { id: number; selected: boolean; categoryId: string };

/** Bancos brasileiros ainda exportam muito em Windows-1252; tenta UTF-8 primeiro. */
async function readFileText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
}

export default function ImportStatement({ categories }: { categories: Category[] }) {
  const fileId = useId();
  const [rows, setRows] = useState<Row[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [inverted, setInverted] = useState(false);
  const [existingKeys, setExistingKeys] = useState<Set<string>>(new Set());

  const expenseCategories = categories.filter((category) => category.type === "expense");
  const incomeCategories = categories.filter((category) => category.type === "income");

  const signed = (row: StatementRow, invert = inverted) => ({ ...row, amount: invert ? -row.amount : row.amount });
  const typeOf = (row: StatementRow) => (signed(row).amount >= 0 ? "income" : "expense");
  const isDuplicate = (row: StatementRow, invert = inverted) => existingKeys.has(importKey(signed(row, invert)));

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setImportedCount(null);
    setLoading(true);

    try {
      if (file.size > 2_000_000) throw new Error("O arquivo é grande demais (máximo de 2 MB).");
      const { rows: parsed, errors } = parseStatement(file.name, await readFileText(file));
      setWarnings(errors);

      if (parsed.length === 0) {
        setRows([]);
        setError("Nenhuma transação válida encontrada no arquivo.");
        return;
      }

      const dates = parsed.map((row) => row.date).sort();
      const result = await getImportKeysAction(dates[0], dates[dates.length - 1]);
      const existing = new Set(result.ok ? result.data : []);
      if (!result.ok) setWarnings((current) => [...current, result.error]);

      setExistingKeys(existing);
      setRows(
        parsed.map((row, index) => ({
          ...row,
          id: index,
          selected: !existing.has(importKey(signed(row))),
          categoryId: "",
        }))
      );
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : "Não foi possível ler o arquivo.");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  function updateRow(id: number, patch: Partial<Row>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function applyDefaultCategory(type: "income" | "expense", categoryId: string) {
    setRows((current) => current.map((row) => (typeOf(row) === type && !row.categoryId ? { ...row, categoryId } : row)));
  }

  const selected = rows.filter((row) => row.selected);
  const missingCategory = selected.filter((row) => !row.categoryId).length;

  async function handleImport() {
    setError("");
    if (selected.length === 0) {
      setError("Selecione ao menos uma transação.");
      return;
    }
    if (missingCategory > 0) {
      setError(`Escolha a categoria de ${missingCategory} ${missingCategory === 1 ? "transação" : "transações"}.`);
      return;
    }

    setLoading(true);
    const result = await importTransactionsAction(
      selected.map((row) => ({
        type: typeOf(row),
        amount: Math.abs(row.amount),
        description: row.description,
        categoryId: row.categoryId,
        transactionDate: row.date,
      }))
    );
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setImportedCount(result.data.imported);
    setRows([]);
    setWarnings([]);
  }

  if (importedCount !== null) {
    return (
      <section className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-emerald-400" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold text-white">
          {importedCount} {importedCount === 1 ? "transação importada" : "transações importadas"}
        </h2>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <button type="button" onClick={() => setImportedCount(null)} className={secondaryButtonClass}>Importar outro arquivo</button>
          <Link href="/transactions" className={primaryButtonClass}>Ver transações</Link>
        </div>
      </section>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <label
        htmlFor={fileId}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-[#111113] px-6 py-10 text-center transition hover:border-[#FF7A00]/60"
      >
        <FileUp className="size-8 text-[#FF7A00]" aria-hidden="true" />
        <span className="mt-3 font-semibold text-white">{loading ? "Lendo arquivo..." : "Escolher arquivo OFX ou CSV"}</span>
        <span className="mt-1 text-sm text-zinc-500">CSV precisa de cabeçalho com Data, Descrição e Valor (saídas negativas).</span>
        <input id={fileId} type="file" accept=".ofx,.csv,.txt,text/csv,application/x-ofx" onChange={handleFile} disabled={loading} className="sr-only" />
      </label>

      <Alert>{error}</Alert>
      {warnings.length > 0 && (
        <Alert tone="info">
          <p className="font-medium">Algumas linhas foram ignoradas:</p>
          <ul className="mt-1 list-inside list-disc text-xs">
            {warnings.slice(0, 5).map((warning) => <li key={warning}>{warning}</li>)}
            {warnings.length > 5 && <li>e mais {warnings.length - 5}.</li>}
          </ul>
        </Alert>
      )}

      {rows.length > 0 && (
        <>
          <section className="grid gap-4 rounded-2xl border border-zinc-800 bg-[#111113] p-4 sm:grid-cols-3 sm:p-5">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-zinc-200">Categoria padrão das saídas</span>
              <select defaultValue="" onChange={(event) => applyDefaultCategory("expense", event.target.value)} className={inputClass}>
                <option value="">Escolher...</option>
                {expenseCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-zinc-200">Categoria padrão das entradas</span>
              <select defaultValue="" onChange={(event) => applyDefaultCategory("income", event.target.value)} className={inputClass}>
                <option value="">Escolher...</option>
                {incomeCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-3 self-end rounded-xl border border-zinc-800 px-3 py-2.5 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={inverted}
                onChange={(event) => {
                  const invert = event.target.checked;
                  setInverted(invert);
                  setRows((current) => current.map((row) => ({ ...row, categoryId: "", selected: !isDuplicate(row, invert) })));
                }}
                className="size-4 accent-[#FF7A00]"
              />
              Inverter sinais (fatura de cartão)
            </label>
          </section>

          <p className="text-sm text-zinc-400">
            {selected.length} de {rows.length} selecionadas
            {rows.some((row) => isDuplicate(row)) && " · possíveis duplicadas já vêm desmarcadas"}
          </p>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[#111113] text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Selecionar todas"
                      checked={selected.length === rows.length}
                      onChange={(event) => setRows((current) => current.map((row) => ({ ...row, selected: event.target.checked })))}
                      className="size-4 accent-[#FF7A00]"
                    />
                  </th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3">Categoria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {rows.map((row) => {
                  const type = typeOf(row);
                  const options = type === "income" ? incomeCategories : expenseCategories;
                  return (
                    <tr key={row.id} className={row.selected ? "bg-[#09090B]" : "bg-[#09090B] opacity-50"}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={row.selected} onChange={(event) => updateRow(row.id, { selected: event.target.checked })} aria-label={`Importar ${row.description}`} className="size-4 accent-[#FF7A00]" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-400">{formatDate(row.date)}</td>
                      <td className="px-4 py-3 text-zinc-100">
                        {row.description || "Sem descrição"}
                        {isDuplicate(row) && <span className="ml-2 rounded-md bg-amber-400/10 px-2 py-0.5 text-xs text-amber-300">possível duplicada</span>}
                      </td>
                      <td className={"whitespace-nowrap px-4 py-3 text-right font-semibold " + (type === "income" ? "text-emerald-400" : "text-rose-400")}>
                        <Money value={Math.abs(row.amount)} sign={type === "income" ? "+" : "-"} />
                      </td>
                      <td className="px-4 py-3">
                        <select value={row.categoryId} onChange={(event) => updateRow(row.id, { categoryId: event.target.value })} aria-label="Categoria" className="min-h-9 w-full rounded-lg border border-zinc-700 bg-[#111113] px-2 text-sm text-zinc-100">
                          <option value="">Escolher...</option>
                          {options.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {categories.length === 0 && (
            <Alert tone="info">Você ainda não tem categorias. <Link href="/categories" className="font-semibold text-[#FF7A00]">Crie algumas</Link> antes de importar.</Alert>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setRows([])} disabled={loading} className={secondaryButtonClass}>Descartar</button>
            <button type="button" onClick={handleImport} disabled={loading} className={primaryButtonClass}>
              <SubmitLabel loading={loading} idle={`Importar ${selected.length}`} busy="Importando..." />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
