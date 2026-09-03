"use client";

import { Plus, Target } from "lucide-react";
import { useState } from "react";

import AddContributionModal from "./AddContributionModal";
import CreateGoalModal from "./CreateGoalModal";
import GoalCard from "./GoalCard";

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

type Props = { goals: Goal[] };

export default function GoalsSection({ goals }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);

  function handleAddContribution(goal: Goal) {
    setSelectedGoal(goal);
    setIsContributionModalOpen(true);
  }

  function handleCloseContributionModal() {
    setIsContributionModalOpen(false);
    setSelectedGoal(null);
  }

  return (
    <>
      <section id="metas" className="mt-8 scroll-mt-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className="size-5 text-[#FF7A00]" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-white">Minhas metas</h2>
            </div>
            <p className="mt-2 text-sm text-zinc-500">Acompanhe o progresso do seu dinheiro.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-2.5 text-sm font-semibold text-[#17110A] transition-colors hover:bg-[#FF8A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]"
          >
            <Plus className="size-4" aria-hidden="true" />
            Nova meta
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#111113] p-8 text-center sm:p-10">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#FF7A00]/10 text-[#FF7A00]">
              <Target className="size-6" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">Você ainda não possui metas</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              Crie uma meta para começar a acompanhar quanto você já conseguiu guardar.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
            >
              <Plus className="size-4" aria-hidden="true" />
              Criar primeira meta
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onAddContribution={() => handleAddContribution(goal)} />
            ))}
          </div>
        )}
      </section>

      <CreateGoalModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <AddContributionModal goal={selectedGoal} isOpen={isContributionModalOpen} onClose={handleCloseContributionModal} />
    </>
  );
}
