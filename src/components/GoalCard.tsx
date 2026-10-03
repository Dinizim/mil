import { CheckCircle2, ChevronRight, Plus, Target } from "lucide-react";
import Link from "next/link";

import Money from "@/components/Money";
import { formatDate } from "@/lib/dates";
import type { GoalPace, GoalPlan } from "@/lib/finance";

import DeactivateGoalButton from "./DeactivateGoalButton";

export type GoalCardData = {
  id: string;
  name: string;
  target_amount: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  currentAmount: number;
  percentage: number;
  remainingAmount: number;
  plan: GoalPlan;
};

const PACE_LABEL: Record<GoalPace, { label: string; className: string } | null> = {
  completed: { label: "Concluída", className: "bg-emerald-400/10 text-emerald-400" },
  ahead: { label: "Adiantada", className: "bg-emerald-400/10 text-emerald-400" },
  on_track: { label: "No ritmo", className: "bg-sky-400/10 text-sky-300" },
  behind: { label: "Atrasada", className: "bg-amber-400/10 text-amber-300" },
  overdue: { label: "Prazo vencido", className: "bg-rose-400/10 text-rose-300" },
  no_deadline: null,
};

export function PaceBadge({ pace }: { pace: GoalPace }) {
  const info = PACE_LABEL[pace];
  if (!info) return null;
  return <span className={"rounded-full px-2.5 py-1 text-xs font-medium " + info.className}>{info.label}</span>;
}

type Props = {
  goal: GoalCardData;
  onAddContribution?: (goal: GoalCardData) => void;
};

export default function GoalCard({ goal, onAddContribution }: Props) {
  const isCompleted = goal.percentage >= 100;
  const progress = Math.min(goal.percentage, 100);
  const { plan } = goal;

  return (
    <article className="rounded-2xl border border-zinc-800 bg-[#111113] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/goals/${goal.id}`} className="group flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FF7A00]/10 text-[#FF7A00]">
            <Target className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="flex items-center gap-1 truncate text-base font-semibold text-white group-hover:text-[#FF7A00]">
              {goal.name}
              <ChevronRight className="size-4 shrink-0 text-zinc-600 group-hover:text-[#FF7A00]" aria-hidden="true" />
            </h3>
            {goal.end_date && <p className="mt-1 text-xs text-zinc-500">Até {formatDate(goal.end_date)}</p>}
          </div>
        </Link>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-sm font-semibold text-[#FF7A00]">{goal.percentage.toFixed(0)}%</span>
          {goal.is_active && <PaceBadge pace={plan.pace} />}
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <Money value={goal.currentAmount} className="block text-2xl font-semibold tracking-tight text-white" />
          <p className="mt-1 text-xs text-zinc-500">de <Money value={goal.target_amount} /></p>
        </div>
        {!isCompleted && (
          <div className="text-right">
            <p className="text-xs text-zinc-500">Faltam</p>
            <Money value={goal.remainingAmount} className="mt-1 block text-sm font-semibold text-zinc-300" />
          </div>
        )}
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso da meta ${goal.name}`}>
        <div className="h-full rounded-full bg-[#FF7A00] transition-[width] duration-300" style={{ width: progress + "%" }} />
      </div>

      {goal.is_active && !isCompleted && plan.suggestedMonthly !== null && (
        <p className="mt-4 text-sm text-zinc-400">
          {plan.pace === "overdue" ? "Prazo vencido. Faltam " : "Guarde "}
          <Money value={plan.suggestedMonthly} className="font-semibold text-zinc-100" />
          {plan.pace === "overdue" ? "." : plan.monthsLeft === 1 ? " até o fim do prazo." : ` por mês nos próximos ${plan.monthsLeft} meses.`}
        </p>
      )}

      <div className="mt-5">
        {isCompleted ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-400">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Meta concluída
          </div>
        ) : goal.is_active ? (
          <>
            {onAddContribution && (
              <button
                type="button"
                onClick={() => onAddContribution(goal)}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-3 text-sm font-semibold text-[#17110A] transition-colors hover:bg-[#FF8A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111113]"
              >
                <Plus className="size-4" aria-hidden="true" />
                Adicionar dinheiro
              </button>
            )}
            <div className="mt-3 flex justify-end">
              <DeactivateGoalButton goalId={goal.id} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 px-4 py-3">
            <span className="text-sm text-zinc-500">Meta desativada</span>
            <DeactivateGoalButton goalId={goal.id} mode="reactivate" />
          </div>
        )}
      </div>
    </article>
  );
}
