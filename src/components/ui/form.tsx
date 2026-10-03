"use client";

import { LoaderCircle, X } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export const inputClass =
  "min-h-11 w-full rounded-xl border border-zinc-700 bg-[#111113] px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 disabled:cursor-not-allowed disabled:opacity-50";

export const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-2.5 text-sm font-semibold text-[#17110A] transition hover:bg-[#FF8A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] disabled:cursor-not-allowed disabled:opacity-50";

export const dangerButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:cursor-not-allowed disabled:opacity-50";

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-zinc-200">
        {label}
        {hint && <span className="ml-1 font-normal text-zinc-500">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

export function Alert({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "success" | "info" }) {
  if (!children) return null;
  const styles = {
    error: "border-rose-400/20 bg-rose-400/10 text-rose-300",
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    info: "border-zinc-700 bg-zinc-800/60 text-zinc-300",
  }[tone];

  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("rounded-xl border px-4 py-3 text-sm leading-5", styles)}>
      {children}
    </div>
  );
}

export function SubmitLabel({ loading, idle, busy }: { loading: boolean; idle: string; busy: string }) {
  return (
    <>
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
      {loading ? busy : idle}
    </>
  );
}

/** Modal acessível: fecha com Esc e clique fora, exceto enquanto `busy`. */
export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  busy = false,
  role = "dialog",
  size = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  busy?: boolean;
  role?: "dialog" | "alertdialog";
  size?: "md" | "lg";
  children: ReactNode;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-2xl border border-zinc-800 bg-[#18181B] p-5 text-zinc-100 shadow-2xl sm:p-6",
          size === "lg" ? "max-w-lg" : "max-w-md"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {icon && <div className="mb-4 flex size-11 items-center justify-center rounded-xl">{icon}</div>}
            <h2 id={titleId} className="text-xl font-semibold tracking-tight text-white">
              {title}
            </h2>
            {description && <div className="mt-1 text-sm leading-6 text-zinc-400">{description}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="-mr-2 -mt-2 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
