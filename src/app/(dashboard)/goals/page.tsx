import { Target } from "lucide-react";

import GoalCard from "@/components/GoalCard";
import GoalsSection from "@/components/GoalsSection";
import Money from "@/components/Money";
import { getFinancialSummary } from "@/services/finance.service";
import { getGoalsWithProgress } from "@/services/goal.service";

export default async function GoalsPage() {
  const [goals, summary] = await Promise.all([getGoalsWithProgress({ includeInactive: true }), getFinancialSummary()]);
  const activeGoals = goals.filter((goal) => goal.is_active);
  const inactiveGoals = goals.filter((goal) => !goal.is_active);

  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-6 text-zinc-100 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#FF7A00]">
              <Target className="size-5" aria-hidden="true" />
              <span className="text-sm font-medium">Planejamento</span>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Metas</h1>
            <p className="mt-2 text-sm text-zinc-400 sm:text-base">Dê uma função para cada real guardado.</p>
          </div>
          <dl className="grid grid-cols-2 gap-3 sm:w-auto">
            <div className="rounded-2xl border border-zinc-800 bg-[#111113] px-4 py-3">
              <dt className="text-xs text-zinc-500">Reservado</dt>
              <dd><Money value={summary.totalReserved} className="text-lg font-semibold text-[#FF7A00]" /></dd>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-[#111113] px-4 py-3">
              <dt className="text-xs text-zinc-500">Disponível</dt>
              <dd><Money value={summary.availableBalance} className="text-lg font-semibold text-white" /></dd>
            </div>
          </dl>
        </header>

        <GoalsSection goals={activeGoals} title="Metas ativas" description="O dinheiro dessas metas fica reservado." />

        {inactiveGoals.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-white">Concluídas e desativadas</h2>
            <p className="mt-2 text-sm text-zinc-500">O dinheiro dessas metas voltou para o saldo disponível.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {inactiveGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

