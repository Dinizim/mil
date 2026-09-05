"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Pencil, X } from "lucide-react";
import { getClientErrorMessage } from "@/lib/errors";

import { updateTransactionAction } from "./actions";

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number | string;
  description: string | null;
  transaction_date: string;
  categories: {
    name: string;
  } | null;
};

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
};

type Props = {
  transaction: Transaction;
  categories: Category[];
};

export default function EditTransactionButton({
  transaction,
  categories,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [type, setType] = useState<
    "income" | "expense"
  >(transaction.type);

  const [amount, setAmount] = useState(
    String(transaction.amount)
  );

  const [description, setDescription] =
    useState(
      transaction.description || ""
    );

  const [categoryId, setCategoryId] =
    useState("");

  const [transactionDate, setTransactionDate] =
    useState(
      transaction.transaction_date
    );

  const filteredCategories =
    categories.filter(
      (category) =>
        category.type === type
    );

  useEffect(() => {
    const currentCategory =
      categories.find(
        (category) =>
          category.name ===
          transaction.categories?.name
      );

    if (currentCategory) {
      setCategoryId(currentCategory.id);
    }
  }, [
    categories,
    transaction.categories?.name,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open]);

  function handleTypeChange(
    newType: "income" | "expense"
  ) {
    setType(newType);

    const categoryStillValid =
      categories.some(
        (category) =>
          category.id === categoryId &&
          category.type === newType
      );

    if (!categoryStillValid) {
      setCategoryId("");
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErrorMessage("");

    const numericAmount =
      Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setErrorMessage("Informe um valor válido.");

      return;
    }

    if (!categoryId) {
      setErrorMessage(
        "Selecione uma categoria."
      );

      return;
    }

    try {
      setLoading(true);

      await updateTransactionAction(
        transaction.id,
        type,
        numericAmount,
        description,
        categoryId,
        transactionDate
      );

      setOpen(false);

      router.refresh();
    } catch (error) {
      setErrorMessage(
        getClientErrorMessage(error, "Não foi possível atualizar a transação.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* BOTÃO EDITAR */}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-100"
        aria-label="Editar transação"
        title="Editar transação"
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>

      {/* MODAL */}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setOpen(false);
            }
          }}
        >
          <div role="dialog" aria-modal="true" className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-800 bg-[#18181B] text-zinc-100 shadow-2xl">

            {/* CABEÇALHO */}

            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 sm:px-6">

              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">Editar transação</h2>

                <p className="mt-0.5 text-sm text-zinc-400">Atualize as informações da transação.</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="flex size-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
                aria-label="Fechar"
              >
                <X className="size-5" aria-hidden="true" />
              </button>

            </div>

            {/* FORMULÁRIO */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5 sm:p-6"
            >
      {errorMessage && (<div role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{errorMessage}</div>)}

              {/* TIPO */}

              <div>

                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  Tipo
                </label>

                <div className="grid grid-cols-2 gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      handleTypeChange(
                        "income"
                      )
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      type === "income"
                        ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                        : "border-zinc-700 bg-[#111113] text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    Entrada
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleTypeChange(
                        "expense"
                      )
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      type === "expense"
                        ? "border-rose-400 bg-rose-400/10 text-rose-400"
                        : "border-zinc-700 bg-[#111113] text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    Saída
                  </button>

                </div>

              </div>

              {/* VALOR */}

              <div>

                <label
                  htmlFor={`amount-${transaction.id}`}
                  className="mb-2 block text-sm font-medium text-zinc-200"
                >
                  Valor
                </label>

                <input
                  id={`amount-${transaction.id}`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value
                    )
                  }
                  className="min-h-11 w-full rounded-xl border border-zinc-700 bg-[#111113] px-3 text-sm text-zinc-100 outline-none transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20"
                  placeholder="0,00"
                  required
                />

              </div>

              {/* DESCRIÇÃO */}

              <div>

                <label
                  htmlFor={`description-${transaction.id}`}
                  className="mb-2 block text-sm font-medium text-zinc-200"
                  >Descrição</label>

                <input
                  id={`description-${transaction.id}`}
                  type="text"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  className="min-h-11 w-full rounded-xl border border-zinc-700 bg-[#111113] px-3 text-sm text-zinc-100 outline-none transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20"
                  placeholder="Ex: Salário"
                />

              </div>

              {/* CATEGORIA */}

              <div>

                <label
                  htmlFor={`category-${transaction.id}`}
                  className="mb-2 block text-sm font-medium text-zinc-200"
                >
                  Categoria
                </label>

                <select
                  id={`category-${transaction.id}`}
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(
                      event.target.value
                    )
                  }
                  className="min-h-11 w-full rounded-xl border border-zinc-700 bg-[#111113] px-3 text-sm text-zinc-100 outline-none transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20"
                  required
                >
                  <option value="">
                    Selecione uma categoria
                  </option>

                  {filteredCategories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* DATA */}

              <div>

                <label
                  htmlFor={`date-${transaction.id}`}
                  className="mb-2 block text-sm font-medium text-zinc-200"
                >
                  Data
                </label>

                <input
                  id={`date-${transaction.id}`}
                  type="date"
                  value={transactionDate}
                  onChange={(event) =>
                    setTransactionDate(
                      event.target.value
                    )
                  }
                  className="min-h-11 w-full rounded-xl border border-zinc-700 bg-[#111113] px-3 text-sm text-zinc-100 outline-none transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20"
                  required
                />

              </div>

              {/* AÇÕES */}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setOpen(false)
                  }
                  disabled={loading}
                  className="min-h-11 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-5 py-3 text-sm font-semibold text-[#17110A] transition hover:bg-[#FF8A1A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                  {loading ? "Salvando..." : "Salvar alterações"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
