"use client";

import { LoaderCircle, Tags, X } from "lucide-react";
import { useState } from "react";
import { createCategoryAction } from "../categories/actions";


type Props = {
  type: "income" | "expense";
  onCategoryCreated: (categoryId: string) => void;
  onClose: () => void;
};

export default function CategoryForm({
  type,
  onCategoryCreated,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Informe o nome da categoria.");
      return;
    }

    setLoading(true);

    try {
      const category = await createCategoryAction(
        name.trim(),
        type
      );

      onCategoryCreated(category.id);

      setName("");
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro ao criar categoria."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-800 bg-[#18181B] p-5 text-zinc-100 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[#FF7A00]/10 text-[#FF7A00]"><Tags className="size-5" aria-hidden="true" /></div>
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Nova categoria
            </h2>

            <p className="mt-1 text-sm text-zinc-400">Crie uma categoria para esta transação.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="-mr-2 -mt-2 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
            aria-label="Fechar modal"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
      {errorMessage && (<div role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{errorMessage}</div>)}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-200">
              Nome
            </label>

              <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ex: Alimentação"
              autoFocus
              className="min-h-11 w-full rounded-xl border border-zinc-700 bg-[#111113] px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-200">
              Tipo
            </label>

            <div className="rounded-xl border border-zinc-700 bg-[#111113] p-3 text-sm text-zinc-300">
              {type === "expense" ? "Saída" : "Entrada"}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="min-h-11 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-5 py-3 text-sm font-semibold text-[#17110A] transition hover:bg-[#FF8A1A] disabled:opacity-50"
            >
              {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
              {loading ? "Criando..." : "Criar categoria"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
