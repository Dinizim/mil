"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Target, X } from "lucide-react";
import { createGoalAction } from "@/app/(dashboard)/goals/actions";
import { getClientErrorMessage } from "@/lib/errors";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateGoalModal({
  isOpen,
  onClose,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const today = new Date().toISOString().split("T")[0];

    setName("");
    setTargetAmount("");
    setStartDate(today);
    setEndDate("");
    setError("");
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const amount = Number(
      targetAmount.replace(",", ".")
    );

    if (!name.trim()) {
      setError("Digite o nome da meta.");
      return;
    }

    if (!amount || amount <= 0) {
      setError("Digite um valor válido para a meta.");
      return;
    }

    if (!startDate) {
      setError("Informe a data de início.");
      return;
    }

    if (endDate && endDate < startDate) {
      setError(
        "A data final não pode ser anterior à data de início."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await createGoalAction(
        name.trim(),
        amount,
        startDate,
        endDate || null
      );

      onClose();
      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        getClientErrorMessage(error, "Não foi possível criar a meta.")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-800 bg-[#18181B] p-5 text-zinc-100 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        {/* CABEÇALHO */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[#FF7A00]/10 text-[#FF7A00]">
              <Target className="size-5" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Nova meta
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Defina quanto você quer guardar.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="-mr-2 -mt-2 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* FORMULÁRIO */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          {/* NOME */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-200">
              Nome da meta
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ex: Reserva de emergência"
              disabled={isSubmitting}
              className="min-h-11 w-full rounded-xl border border-zinc-700 bg-[#111113] px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* VALOR */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-200">
              Valor da meta
            </label>

            <input
              type="text"
              inputMode="decimal"
              value={targetAmount}
              onChange={(event) =>
                setTargetAmount(event.target.value)
              }
              placeholder="Ex: 5000"
              disabled={isSubmitting}
              className="min-h-11 w-full rounded-xl border border-zinc-700 bg-[#111113] px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* DATAS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-200">
                Data de início
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
                disabled={isSubmitting}
                className="min-h-11 w-full rounded-xl border border-zinc-700 bg-[#111113] px-3 text-sm text-zinc-100 outline-none transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-200">
                Data final
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
                disabled={isSubmitting}
                className="min-h-11 w-full rounded-xl border border-zinc-700 bg-[#111113] px-3 text-sm text-zinc-100 outline-none transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* ERRO */}
          {error && (
            <div role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          {/* AÇÕES */}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-11 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-5 py-2.5 text-sm font-semibold text-[#17110A] transition hover:bg-[#FF8A1A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
              {isSubmitting
                ? "Criando..."
                : "Criar meta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
