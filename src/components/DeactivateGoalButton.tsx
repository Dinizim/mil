"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import { getClientErrorMessage } from "@/lib/errors";

import { deactivateGoalAction } from "@/app/(dashboard)/goals/actions";

type Props = {
  goalId: string;
};

export default function DeactivateGoalButton({
  goalId,
}: Props) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDeactivate() {
    try {
      setIsSaving(true);
      setErrorMessage("");

      await deactivateGoalAction(goalId);

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        getClientErrorMessage(error, "Não foi possível desativar a meta.")
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setErrorMessage(""); setIsOpen(true); }}
        disabled={isSaving}
        className="rounded-xl border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-400 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
      >
        Desativar
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!isSaving) {
              setIsOpen(false);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-800 bg-[#18181B] p-5 text-zinc-100 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-rose-400/10 text-rose-400">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-zinc-100">
              Desativar meta?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              A meta continuará salva no seu histórico, mas você
              não poderá adicionar novos valores a ela.
            </p>

            {errorMessage && (<div className="mt-4 rounded-xl bg-rose-400/10 px-4 py-3 text-sm text-rose-400">{errorMessage}</div>)}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
                className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDeactivate}
                disabled={isSaving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                {isSaving ? "Desativando..." : "Desativar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
