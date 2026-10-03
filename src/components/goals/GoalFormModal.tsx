"use client";

import { Target } from "lucide-react";
import { useId, useState } from "react";

import { createGoalAction, updateGoalAction } from "@/app/(dashboard)/goals/actions";
import { Alert, Field, Modal, SubmitLabel, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { todayISO } from "@/lib/dates";
import { parseMoney } from "@/lib/money";

export type GoalDraft = { name: string; targetAmount: string; startDate: string; endDate: string };

type Props = {
  open: boolean;
  onClose: () => void;
  /** Quando informado, edita a meta. */
  goalId?: string;
  initial?: GoalDraft;
};

export default function GoalFormModal(props: Props) {
  return props.open ? <GoalFormDialog {...props} /> : null;
}

function GoalFormDialog({ onClose, goalId, initial }: Props) {
  const [draft, setDraft] = useState<GoalDraft>(
    () => initial ?? { name: "", targetAmount: "", startDate: todayISO(), endDate: "" }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ids = { name: useId(), amount: useId(), start: useId(), end: useId() };
  const update = (patch: Partial<GoalDraft>) => setDraft((current) => ({ ...current, ...patch }));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!draft.name.trim()) return setError("Digite o nome da meta.");
    const amount = parseMoney(draft.targetAmount);
    if (amount === null || amount <= 0) return setError("Digite um valor válido para a meta.");
    if (!draft.startDate) return setError("Informe a data de início.");
    if (draft.endDate && draft.endDate < draft.startDate) return setError("A data final não pode ser anterior à data de início.");

    setLoading(true);
    const input = { ...draft, endDate: draft.endDate || null };
    const result = goalId ? await updateGoalAction(goalId, input) : await createGoalAction(input);
    setLoading(false);

    if (!result.ok) return setError(result.error);
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      busy={loading}
      title={goalId ? "Editar meta" : "Nova meta"}
      description={goalId ? "Ajuste nome, valor ou prazo." : "Defina quanto você quer guardar e até quando."}
      icon={<span className="flex size-11 items-center justify-center rounded-xl bg-[#FF7A00]/10 text-[#FF7A00]"><Target className="size-5" aria-hidden="true" /></span>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome da meta" htmlFor={ids.name}>
          <input id={ids.name} type="text" value={draft.name} maxLength={100} onChange={(event) => update({ name: event.target.value })} placeholder="Ex.: Reserva de emergência" disabled={loading} className={inputClass} />
        </Field>
        <Field label="Valor da meta" htmlFor={ids.amount}>
          <input id={ids.amount} type="text" inputMode="decimal" value={draft.targetAmount} onChange={(event) => update({ targetAmount: event.target.value })} placeholder="Ex.: 5.000,00" disabled={loading} className={inputClass} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Data de início" htmlFor={ids.start}>
            <input id={ids.start} type="date" value={draft.startDate} onChange={(event) => update({ startDate: event.target.value })} disabled={loading} className={inputClass} />
          </Field>
          <Field label="Data final" hint="(opcional)" htmlFor={ids.end}>
            <input id={ids.end} type="date" value={draft.endDate} onChange={(event) => update({ endDate: event.target.value })} disabled={loading} className={inputClass} />
          </Field>
        </div>
        <p className="text-xs leading-5 text-zinc-500">Com data final, o Mil calcula quanto guardar por mês e se você está no ritmo.</p>

        <Alert>{error}</Alert>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={loading} className={secondaryButtonClass}>Cancelar</button>
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            <SubmitLabel loading={loading} idle={goalId ? "Salvar" : "Criar meta"} busy="Salvando..." />
          </button>
        </div>
      </form>
    </Modal>
  );
}
