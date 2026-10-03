"use client";

import { CircleDollarSign } from "lucide-react";
import { useId, useState } from "react";

import { createGoalContributionAction } from "@/app/(dashboard)/goals/actions";
import Money from "@/components/Money";
import { Alert, Field, Modal, SubmitLabel, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { formatCurrency, parseMoney, toCents } from "@/lib/money";

type Goal = {
  id: string;
  name: string;
  currentAmount: number;
  remainingAmount: number;
  plan?: { suggestedMonthly: number | null };
};

type Props = {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function AddContributionModal({ goal, isOpen, onClose }: Props) {
  return isOpen && goal ? <AddContributionDialog goal={goal} onClose={onClose} /> : null;
}

function AddContributionDialog({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const suggestion = goal.plan?.suggestedMonthly;
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const ids = { amount: useId(), description: useId() };

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const numericAmount = parseMoney(amount);

    if (numericAmount === null || numericAmount <= 0) {
      setError("Informe um valor válido, como 150,00.");
      return;
    }
    if (toCents(numericAmount) > toCents(goal.remainingAmount)) {
      setError(`Você pode adicionar no máximo ${formatCurrency(goal.remainingAmount)}.`);
      return;
    }

    setIsSaving(true);
    const result = await createGoalContributionAction(goal.id, amount, description);
    setIsSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      busy={isSaving}
      title="Adicionar dinheiro"
      description={`Meta: ${goal.name}`}
      icon={<span className="flex size-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400"><CircleDollarSign className="size-5" aria-hidden="true" /></span>}
    >
      <div className="rounded-xl border border-zinc-800 bg-[#111113] p-4 text-sm">
        <div className="flex items-center justify-between gap-4"><span className="text-zinc-500">Já guardado</span><Money value={goal.currentAmount} className="font-semibold text-zinc-100" /></div>
        <div className="mt-2 flex items-center justify-between gap-4"><span className="text-zinc-500">Falta</span><Money value={goal.remainingAmount} className="font-semibold text-[#FF7A00]" /></div>
      </div>

      <form onSubmit={handleSave} className="mt-5 space-y-4">
        <Field label="Valor" htmlFor={ids.amount}>
          <input id={ids.amount} type="text" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="R$ 0,00" autoFocus className={inputClass} />
        </Field>
        {suggestion ? (
          <button type="button" onClick={() => setAmount(Math.min(suggestion, goal.remainingAmount).toFixed(2).replace(".", ","))} className="text-xs font-medium text-[#FF7A00] hover:text-[#FF8A1A]">
            Usar valor mensal sugerido ({formatCurrency(Math.min(suggestion, goal.remainingAmount))})
          </button>
        ) : null}
        <Field label="Descrição" hint="(opcional)" htmlFor={ids.description}>
          <input id={ids.description} type="text" value={description} maxLength={200} onChange={(event) => setDescription(event.target.value)} placeholder="Ex.: dinheiro guardado este mês" className={inputClass} />
        </Field>
        <Alert>{error}</Alert>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={isSaving} className={secondaryButtonClass}>Cancelar</button>
          <button type="submit" disabled={isSaving} className={primaryButtonClass}>
            <SubmitLabel loading={isSaving} idle="Adicionar dinheiro" busy="Salvando..." />
          </button>
        </div>
      </form>
    </Modal>
  );
}
