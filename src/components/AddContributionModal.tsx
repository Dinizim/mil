"use client";

import { CircleDollarSign, LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClientErrorMessage } from "@/lib/errors";

import { createGoalContributionAction } from "@/app/(dashboard)/goals/actions";

type Goal = {
  id: string;
  name: string;
  target_amount: number;
  currentAmount: number;
  remainingAmount: number;
};

type Props = {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function parseAmount(value: string) {
  const cleaned = value.replace(/\s/g, "").replace("R$", "").replace(/\./g, "").replace(",", ".");
  return Number(cleaned);
}

export default function AddContributionModal({ goal, isOpen, onClose }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setDescription("");
      setError("");
      setIsSaving(false);
    }
  }, [isOpen]);

  if (!isOpen || !goal) return null;

  const selectedGoal = goal;

  async function handleSave() {
    console.log("BOTÃO ADICIONAR CLICADO");
    setError("");
    const numericAmount = parseAmount(amount);
    console.log("VALOR:", numericAmount);
    console.log("META:", selectedGoal.id);

    if (!numericAmount || numericAmount <= 0) {
      setError("Informe um valor válido.");
      return;
    }

    if (numericAmount > selectedGoal.remainingAmount) {
      setError(`Você pode adicionar no máximo ${formatCurrency(selectedGoal.remainingAmount)}.`);
      return;
    }

    try {
      setIsSaving(true);
      console.log("ENVIANDO PARA SERVER ACTION...");
      await createGoalContributionAction(selectedGoal.id, numericAmount, description);
      console.log("CONTRIBUIÇÃO SALVA!");
      onClose();
      router.refresh();
    } catch (error) {
      console.error("ERRO AO ADICIONAR CONTRIBUIÇÃO:", error);
      setError(getClientErrorMessage(error, "Não foi possível adicionar dinheiro à meta."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => { if (!isSaving) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="add-contribution-title" className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-800 bg-[#18181B] p-5 text-zinc-100 shadow-2xl sm:p-6" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400"><CircleDollarSign className="size-5" aria-hidden="true" /></div>
            <h2 id="add-contribution-title" className="text-xl font-semibold tracking-tight text-white">Adicionar dinheiro</h2>
            <p className="mt-1 text-sm text-zinc-400">Meta: {goal.name}</p>
          </div>
          <button type="button" onClick={onClose} disabled={isSaving} className="-mr-2 -mt-2 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Fechar modal"><X className="size-5" aria-hidden="true" /></button>
        </div>

        <div className="mt-5 rounded-xl border border-zinc-800 bg-[#111113] p-4">
          <div className="flex items-center justify-between gap-4 text-sm"><span className="text-zinc-500">Já guardado</span><span className="font-semibold text-zinc-100">{formatCurrency(goal.currentAmount)}</span></div>
          <div className="mt-2 flex items-center justify-between gap-4 text-sm"><span className="text-zinc-500">Falta</span><span className="font-semibold text-[#FF7A00]">{formatCurrency(selectedGoal.remainingAmount)}</span></div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-200">Valor</label>
            <input type="text" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="R$ 0,00" className="min-h-11 w-full rounded-xl border border-zinc-700 bg-[#111113] px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-200">Descrição <span className="ml-1 font-normal text-zinc-500">(opcional)</span></label>
            <input type="text" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ex.: dinheiro guardado este mês" className="min-h-11 w-full rounded-xl border border-zinc-700 bg-[#111113] px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20" />
          </div>
          {error && <div role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{error}</div>}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={isSaving} className="min-h-11 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50">Cancelar</button>
            <button type="button" onClick={handleSave} disabled={isSaving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-2.5 text-sm font-semibold text-[#17110A] transition hover:bg-[#FF8A1A] disabled:opacity-50">
              {isSaving && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
              {isSaving ? "Salvando..." : "Adicionar dinheiro"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
