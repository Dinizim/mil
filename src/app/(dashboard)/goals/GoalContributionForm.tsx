"use client";

import { useState } from "react";
import { createGoalContributionAction } from "./actions";
import { getClientErrorMessage } from "@/lib/errors";

interface GoalContributionFormProps {
  goalId: string;
}

export default function GoalContributionForm({
  goalId,
}: GoalContributionFormProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErrorMessage("");

    if (!amount) {
      setErrorMessage("Informe o valor da contribuição.");
      return;
    }

    const numericAmount = Number(amount);

    if (numericAmount <= 0) {
      setErrorMessage("O valor deve ser maior que zero.");
      return;
    }

    setLoading(true);

    try {
      await createGoalContributionAction(
        goalId,
        numericAmount,
        description
      );

      setAmount("");
      setDescription("");

      setErrorMessage("Dinheiro adicionado à meta!");
    } catch (error) {
      setErrorMessage(
        getClientErrorMessage(error, "Não foi possível adicionar dinheiro à meta.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-3"
    >
      {errorMessage && (<div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage}</div>)}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Adicionar dinheiro
        </label>

        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(event) =>
            setAmount(event.target.value)
          }
          placeholder="100.00"
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          DescriÃƒ§Ãƒ£o
        </label>

        <input
          type="text"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="Ex: Dinheiro guardado em setembro"
          className="w-full rounded-lg border p-3"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-black px-5 py-3 font-medium text-white disabled:opacity-50"
      >
        {loading ? "Adicionando..." : "Adicionar dinheiro"}
      </button>
    </form>
  );
}
