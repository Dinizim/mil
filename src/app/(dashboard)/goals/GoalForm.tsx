"use client";

import { useState } from "react";
import { createGoalAction } from "./actions";

export default function GoalForm() {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErrorMessage("");

    if (!name || !targetAmount || !startDate) {
      setErrorMessage("Preencha os campos obrigatÃƒ³rios.");
      return;
    }

    setLoading(true);

    try {
      await createGoalAction(
        name,
        Number(targetAmount),
        startDate,
        endDate || null
      );

      setName("");
      setTargetAmount("");
      setStartDate("");
      setEndDate("");

    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro ao criar meta."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 max-w-xl space-y-4"
    >
      {errorMessage && (<div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage}</div>)}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Nome da meta
        </label>

        <input
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Ex: Comprar PC"
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Valor da meta
        </label>

        <input
          type="number"
          min="0.01"
          step="0.01"
          value={targetAmount}
          onChange={(event) =>
            setTargetAmount(event.target.value)
          }
          placeholder="5000.00"
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Data de inÃƒ­cio
        </label>

        <input
          type="date"
          value={startDate}
          onChange={(event) =>
            setStartDate(event.target.value)
          }
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Data limite
        </label>

        <input
          type="date"
          value={endDate}
          onChange={(event) =>
            setEndDate(event.target.value)
          }
          className="w-full rounded-lg border p-3"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-black px-5 py-3 font-medium text-white disabled:opacity-50"
      >
        {loading ? "Criando..." : "Criar meta"}
      </button>
    </form>
  );
}