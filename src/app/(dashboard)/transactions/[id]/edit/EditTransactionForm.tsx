"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTransactionAction } from "../../actions";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
};

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  transaction_date: string;
  category_id: string | null;
};

type Props = {
  transaction: Transaction;
  categories: Category[];
};

export default function EditTransactionForm({
  transaction,
  categories,
}: Props) {
  const router = useRouter();

  const [type, setType] = useState<"income" | "expense">(
    transaction.type
  );

  const [amount, setAmount] = useState(
    transaction.amount.toString()
  );

  const [description, setDescription] = useState(
    transaction.description || ""
  );

  const [categoryId, setCategoryId] = useState(
    transaction.category_id || ""
  );

  const [transactionDate, setTransactionDate] = useState(
    transaction.transaction_date
  );

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErrorMessage("");

    if (!amount || Number(amount) <= 0) {
      setErrorMessage("Informe um valor vÃƒ¡lido.");
      return;
    }

    if (!categoryId) {
      setErrorMessage("Selecione uma categoria.");
      return;
    }

    try {
      setLoading(true);

      await updateTransactionAction(
        transaction.id,
        type,
        Number(amount),
        description,
        categoryId,
        transactionDate
      );


      router.push("/transactions");
      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage("Erro ao atualizar transaÃƒ§Ãƒ£o.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex max-w-md flex-col gap-4"
    >
      {errorMessage && (<div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage}</div>)}
      <div>
        <label className="block">Tipo</label>

        <select
          value={type}
          onChange={(event) => {
            const newType = event.target.value as
              | "income"
              | "expense";

            setType(newType);
            setCategoryId("");
          }}
          className="w-full rounded border p-2"
        >
          <option value="expense">SaÃƒ­da</option>
          <option value="income">Entrada</option>
        </select>
      </div>

      <div>
        <label className="block">Valor</label>

        <input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="block">DescriÃƒ§Ãƒ£o</label>

        <input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="block">Categoria</label>

        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="w-full rounded border p-2"
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
      </div>

      <div>
        <label className="block">Data</label>

        <input
          type="date"
          value={transactionDate}
          onChange={(event) =>
            setTransactionDate(event.target.value)
          }
          className="w-full rounded border p-2"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar alteraÃƒ§Ãƒµes"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/transactions")}
          className="rounded border px-4 py-2"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}