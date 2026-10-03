"use client";

import { Eye, EyeOff } from "lucide-react";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

const STORAGE_KEY = "mil:privacy";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function isHidden() {
  return document.documentElement.dataset.privacy === "on";
}

function setHidden(hidden: boolean) {
  document.documentElement.dataset.privacy = hidden ? "on" : "off";
  try {
    localStorage.setItem(STORAGE_KEY, hidden ? "on" : "off");
  } catch {
    // Sem localStorage (aba anônima): vale só para esta página.
  }
  listeners.forEach((listener) => listener());
}

/** Script inline que aplica a preferência antes da página aparecer (sem "piscar" os valores). */
export const privacyInitScript = `try{document.documentElement.dataset.privacy=localStorage.getItem("${STORAGE_KEY}")==="on"?"on":"off"}catch(e){}`;

export default function PrivacyToggle({ className, showLabel = false }: { className?: string; showLabel?: boolean }) {
  const hidden = useSyncExternalStore(subscribe, isHidden, () => false);
  const Icon = hidden ? EyeOff : Eye;
  const label = hidden ? "Mostrar valores" : "Ocultar valores";

  return (
    <button
      type="button"
      onClick={() => setHidden(!hidden)}
      aria-pressed={hidden}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#111113] px-3 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-[#18181B] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]",
        className
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {showLabel && <span>{label}</span>}
    </button>
  );
}
