"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createTransactionAction } from "./actions";
import CategoryForm from "./CategoryForm";
import { getClientErrorMessage } from "@/lib/errors";
type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
};

type Props = {
  categories: Category[];
};

export default function TransactionForm({ categories }: Props) {
  const [open, setOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState(categories);

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredCategories = availableCategories.filter(
    (category) => category.type === type
  );

  function closeModal() {
    setOpen(false);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErrorMessage("");

    if (!amount || Number(amount) <= 0) {
      setErrorMessage("Informe um valor válido.");
      return;
    }

    if (!categoryId) {
      setErrorMessage("Selecione uma categoria.");
      return;
    }

    setLoading(true);

    try {
      await createTransactionAction(
        type,
        Number(amount),
        description,
        categoryId,
        transactionDate
      );

      setAmount("");
      setDescription("");
      setCategoryId("");

      closeModal();
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        getClientErrorMessage(error, "Não foi possível criar a transação.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Botão para abrir o modal */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-3 text-sm font-semibold text-[#17110A] transition hover:bg-[#FF8A1A]"
      >
        <Plus className="size-4" aria-hidden="true" />
        Nova transação
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-800 bg-[#18181B] p-5 text-zinc-100 shadow-2xl sm:p-6">
            {/* Cabeçalho */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Nova transação</h2>

                <p className="mt-1 text-sm text-zinc-400">Registre uma entrada ou saída.</p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            {/* Formulário */}
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >
      {errorMessage && (<div role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{errorMessage}</div>)}
              {/* Tipo */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Tipo
                </label>

                <select
                  value={type}
                  onChange={(event) => {
                    const newType = event.target.value as
                      | "income"
                      | "expense";

                    setType(newType);

                    // Evita manter uma categoria incompatível
                    setCategoryId("");
                  }}
                  className="w-full rounded-xl border border-zinc-700 bg-[#111113] p-3 text-zinc-100 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20"
                >
                  <option value="expense">Saída</option>
                  <option value="income">Entrada</option>
                </select>
              </div>

              {/* Valor */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Valor
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  placeholder="0,00"
                  className="w-full rounded-xl border border-zinc-700 bg-[#111113] p-3 text-zinc-100 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="mb-1 block text-sm font-medium">Descrição</label>

                <input
                  type="text"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Ex: Mercado"
                  className="w-full rounded-xl border border-zinc-700 bg-[#111113] p-3 text-zinc-100 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Categoria
                </label>

                <div className="flex gap-2">
                  <select
                    value={categoryId}
                    onChange={(event) =>
                      setCategoryId(event.target.value)
                    }
                    className="w-full rounded-xl border border-zinc-700 bg-[#111113] p-3 text-zinc-100 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20"
                  >
                    <option value="">
                      Selecione uma categoria
                    </option>

                    {filteredCategories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setCategoryModalOpen(true)}
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-zinc-700 text-zinc-200 transition hover:bg-zinc-800"
                    title="Criar categoria"
                    aria-label="Criar categoria"
                  >
                    <Plus className="size-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Data */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Data
                </label>

                <input
                  type="date"
                  value={transactionDate}
                  onChange={(event) =>
                    setTransactionDate(event.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-[#111113] p-3 text-zinc-100 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20"
                />
              </div>

              {/* Botões */}
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="rounded-xl border border-zinc-700 px-5 py-3 font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#FF7A00] px-5 py-3 font-semibold text-[#17110A] transition hover:bg-[#FF8A1A] disabled:opacity-50"
                >
                  {loading ? "Salvando..." : "Adicionar transação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {categoryModalOpen && (
        <CategoryForm
          defaultType={type}
          onCategoryCreated={(category) => {
            setAvailableCategories((current) => [...current, category]);
            setType(category.type);
            setCategoryId(category.id);
            setCategoryModalOpen(false);
          }}
          onClose={() => setCategoryModalOpen(false)}
        />
      )}
      
    </>
  );
}
