"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import CategoryCreateModal from "@/components/CategoryCreateModal";

type Props = {
  defaultType?: "income" | "expense";
  variant?: "header" | "empty";
};

export default function CategoryForm({ defaultType = "expense", variant = "header" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const isEmptyTrigger = variant === "empty";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={isEmptyTrigger
          ? "mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]"
          : "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-2.5 text-sm font-semibold text-[#17110A] transition-colors hover:bg-[#FF8A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]"}
      >
        <Plus className="size-4" aria-hidden="true" />
        {isEmptyTrigger ? "Criar categoria" : "Nova categoria"}
      </button>

      <CategoryCreateModal open={isOpen} defaultType={defaultType} onClose={() => setIsOpen(false)} />
    </>
  );
}
