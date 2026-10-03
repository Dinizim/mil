"use client";

import { ArrowRight, Plus, Target } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import AddContributionModal from "./AddContributionModal";
import GoalCard, { type GoalCardData } from "./GoalCard";
import GoalFormModal from "./goals/GoalFormModal";

type Props = {
  goals: GoalCardData[];
  title?: string;
  description?: string;
  /** Na dashboard mostra um link para a página de metas. */
  showAllLink?: boolean;
  emptyMessage?: string;
};

export default function GoalsSection({
  goals,
  title = "Minhas metas",
  description = "Acompanhe o progresso do seu dinheiro.",
  showAllLink = false,
  emptyMessage = "Crie uma meta para começar a acompanhar quanto você já conseguiu guardar.",
}: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalCardData | null>(null);

  return (
    <>
      <section id="metas" className="mt-8 scroll-mt-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className="size-5 text-[#FF7A00]" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-white">{title}</h2>
            </div>
            <p className="mt-2 text-sm text-zinc-500">{description}</p>
          </div>
          <div className="flex items-center gap-3">
            {showAllLink && (
              <Link href="/goals" className="inline-flex items-center gap-1 text-sm font-medium text-zinc-300 transition-colors hover:text-[#FF7A00]">
                Ver todas
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-2.5 text-sm font-semibold text-[#17110A] transition-colors hover:bg-[#FF8A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]"
            >
              <Plus className="size-4" aria-hidden="true" />
              Nova meta
            </button>
          </div>
        </div>

        {goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#111113] p-8 text-center sm:p-10">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#FF7A00]/10 text-[#FF7A00]">
              <Target className="size-6" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">Nenhuma meta por aqui</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onAddContribution={setSelectedGoal} />
            ))}
          </div>
        )}
      </section>

      <GoalFormModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <AddContributionModal goal={selectedGoal} isOpen={selectedGoal !== null} onClose={() => setSelectedGoal(null)} />
    </>
  );
}
