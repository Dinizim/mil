import { CheckCircle2, Plus, Target } from "lucide-react";

import DeactivateGoalButton from "./DeactivateGoalButton";

type Goal = {
  id: string;
  name: string;
  target_amount: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  currentAmount: number;
  percentage: number;
  remainingAmount: number;
};

type Props = {
  goal: Goal;
  onAddContribution: (goal: Goal) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function GoalCard({ goal, onAddContribution }: Props) {
  const isCompleted = goal.percentage >= 100;
  const progress = Math.min(goal.percentage, 100);

  return (
    <article className="rounded-2xl border border-zinc-800 bg-[#111113] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FF7A00]/10 text-[#FF7A00]">
            <Target className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white">{goal.name}</h3>
            {goal.end_date && (
              <p className="mt-1 text-xs text-zinc-500">
                Até {new Intl.DateTimeFormat("pt-BR").format(new Date(goal.end_date + "T00:00:00"))}
              </p>
            )}
          </div>
        </div>
        <span className="shrink-0 text-sm font-semibold text-[#FF7A00]">{goal.percentage.toFixed(0)}%</span>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-white">{formatCurrency(goal.currentAmount)}</p>
          <p className="mt-1 text-xs text-zinc-500">de {formatCurrency(Number(goal.target_amount))}</p>
        </div>
        {!isCompleted && (
          <div className="text-right">
            <p className="text-xs text-zinc-500">Faltam</p>
            <p className="mt-1 text-sm font-semibold text-zinc-300">{formatCurrency(goal.remainingAmount)}</p>
          </div>
        )}
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-[#FF7A00] transition-[width] duration-300" style={{ width: progress + "%" }} />
      </div>

      <div className="mt-5">
        {isCompleted ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-400">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Meta concluída
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onAddContribution(goal)}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-3 text-sm font-semibold text-[#17110A] transition-colors hover:bg-[#FF8A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111113]"
            >
              <Plus className="size-4" aria-hidden="true" />
              Adicionar dinheiro
            </button>
            <div className="mt-3 flex justify-end">
              <DeactivateGoalButton goalId={goal.id} />
            </div>
          </>
        )}
      </div>
    </article>
  );
}
