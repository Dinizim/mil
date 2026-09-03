"use client";

import { LoaderCircle, Plus, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { createCategoryAction } from "./actions";

type Props = {
  defaultType?: "income" | "expense";
  variant?: "header" | "empty";
};

export default function CategoryForm({ defaultType = "expense", variant = "header" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">(defaultType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const nameId = useId();
  const typeId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) setIsOpen(false);
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isSubmitting]);

  function openModal() {
    setType(defaultType);
    setErrorMessage("");
    setIsOpen(true);
  }

  function closeModal() {
    if (!isSubmitting) setIsOpen(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMessage("Informe o nome da categoria.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await createCategoryAction(trimmedName, type);
      setName("");
      setType(defaultType);
      setIsOpen(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível criar a categoria.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isEmptyTrigger = variant === "empty";

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={isEmptyTrigger
          ? "mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]"
          : "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-2.5 text-sm font-semibold text-[#17110A] transition-colors hover:bg-[#FF8A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]"}
      >
        <Plus className="size-4" aria-hidden="true" />
        {isEmptyTrigger ? "Criar categoria" : "Nova categoria"}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="new-category-title" className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-800 bg-[#18181B] p-5 text-zinc-100 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="new-category-title" className="text-xl font-semibold tracking-tight text-white">Nova categoria</h2>
                <p className="mt-1 text-sm text-zinc-400">Crie uma categoria para organizar suas movimentações.</p>
              </div>
              <button type="button" onClick={closeModal} disabled={isSubmitting} className="-mr-2 -mt-2 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] disabled:cursor-not-allowed disabled:opacity-50" aria-label="Fechar modal">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {errorMessage && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{errorMessage}</p>}
              <div>
                <label htmlFor={nameId} className="mb-2 block text-sm font-medium text-zinc-200">Nome da categoria</label>
                <input id={nameId} type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Alimentação" autoFocus className="min-h-11 w-full rounded-xl border border-zinc-700 bg-[#111113] px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20" />
              </div>
              <div>
                <label htmlFor={typeId} className="mb-2 block text-sm font-medium text-zinc-200">Tipo</label>
                <select id={typeId} value={type} onChange={(event) => setType(event.target.value as "income" | "expense")} className="min-h-11 w-full rounded-xl border border-zinc-700 bg-[#111113] px-3 text-sm text-zinc-100 outline-none transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20">
                  <option value="expense">Despesa</option>
                  <option value="income">Entrada</option>
                </select>
              </div>
              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeModal} disabled={isSubmitting} className="min-h-11 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] disabled:cursor-not-allowed disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-2.5 text-sm font-semibold text-[#17110A] transition hover:bg-[#FF8A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] disabled:cursor-not-allowed disabled:opacity-50">
                  {isSubmitting && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                  {isSubmitting ? "Criando..." : "Criar categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
