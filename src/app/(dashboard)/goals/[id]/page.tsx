import { ArrowLeft, History } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import GoalCard from "@/components/GoalCard";
import Money from "@/components/Money";
import { formatDate } from "@/lib/dates";
import { getGoalDetails } from "@/services/goal.service";

import GoalActions from "./GoalActions";

export default async function GoalDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const details = await getGoalDetails(id);
  if (!details) notFound();

  const { goal, contributions } = details;

  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-6 text-zinc-100 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/goals" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Metas
        </Link>

        <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-semibold tracking-tight text-white">{goal.name}</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Desde {formatDate(goal.start_date)}
              {goal.end_date && ` · até ${formatDate(goal.end_date)}`}
            </p>
          </div>
          <GoalActions goal={goal} />
        </header>

        <div className="mt-6">
          <GoalCard goal={goal} />
        </div>

        {goal.plan.expectedToday !== null && goal.is_active && goal.plan.pace !== "completed" && (
          <p className="mt-4 rounded-xl border border-zinc-800 bg-[#111113] px-4 py-3 text-sm text-zinc-400">
            Pelo ritmo do prazo, o ideal hoje seria ter <Money value={goal.plan.expectedToday} className="font-semibold text-zinc-100" /> guardados.
          </p>
        )}

        <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-[#111113]">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-4 sm:px-6">
            <History className="size-4 text-[#FF7A00]" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Histórico de aportes</h2>
          </div>
          {contributions.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-zinc-500 sm:px-6">Nenhum aporte ainda.</p>
          ) : (
            <ul className="divide-y divide-zinc-800">
              {contributions.map((contribution) => (
                <li key={contribution.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-100">{contribution.description || "Aporte"}</p>
                    <p className="mt-1 text-xs text-zinc-500">{formatDate(contribution.contribution_date)}</p>
                  </div>
                  <Money value={contribution.amount} sign="+" className="shrink-0 text-sm font-semibold text-emerald-400" />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
