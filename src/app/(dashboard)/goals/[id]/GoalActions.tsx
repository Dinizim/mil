"use client";

import { Pencil, Plus } from "lucide-react";
import { useState } from "react";

import AddContributionModal from "@/components/AddContributionModal";
import type { GoalCardData } from "@/components/GoalCard";
import GoalFormModal from "@/components/goals/GoalFormModal";
import { primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";

export default function GoalActions({ goal }: { goal: GoalCardData }) {
  const [editing, setEditing] = useState(false);
  const [contributing, setContributing] = useState(false);
  const canContribute = goal.is_active && goal.remainingAmount > 0;

  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => setEditing(true)} className={secondaryButtonClass}>
        <Pencil className="size-4" aria-hidden="true" />
        Editar
      </button>
      {canContribute && (
        <button type="button" onClick={() => setContributing(true)} className={primaryButtonClass}>
          <Plus className="size-4" aria-hidden="true" />
          Aportar
        </button>
      )}

      <GoalFormModal
        open={editing}
        onClose={() => setEditing(false)}
        goalId={goal.id}
        initial={{
          name: goal.name,
          targetAmount: goal.target_amount.toFixed(2).replace(".", ","),
          startDate: goal.start_date,
          endDate: goal.end_date ?? "",
        }}
      />
      <AddContributionModal goal={goal} isOpen={contributing} onClose={() => setContributing(false)} />
    </div>
  );
}
