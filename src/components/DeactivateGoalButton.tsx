"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useState } from "react";

import { deactivateGoalAction, reactivateGoalAction } from "@/app/(dashboard)/goals/actions";
import { Alert, Modal, SubmitLabel, dangerButtonClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";

type Props = { goalId: string; mode?: "deactivate" | "reactivate" };

/** Desativa (libera o dinheiro reservado) ou reativa (reserva de novo) uma meta. */
export default function DeactivateGoalButton({ goalId, mode = "deactivate" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const reactivating = mode === "reactivate";

  async function handleConfirm() {
    setIsSaving(true);
    setErrorMessage("");
    const result = reactivating ? await reactivateGoalAction(goalId) : await deactivateGoalAction(goalId);
    setIsSaving(false);

    if (result.ok) setIsOpen(false);
    else setErrorMessage(result.error);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setErrorMessage(""); setIsOpen(true); }}
        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-400 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200"
      >
        {reactivating && <RotateCcw className="size-3.5" aria-hidden="true" />}
        {reactivating ? "Reativar" : "Desativar"}
      </button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        busy={isSaving}
        role="alertdialog"
        title={reactivating ? "Reativar meta?" : "Desativar meta?"}
        icon={
          reactivating ? (
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#FF7A00]/10 text-[#FF7A00]"><RotateCcw className="size-5" aria-hidden="true" /></span>
          ) : (
            <span className="flex size-11 items-center justify-center rounded-xl bg-rose-400/10 text-rose-400"><AlertTriangle className="size-5" aria-hidden="true" /></span>
          )
        }
        description={
          reactivating
            ? "O dinheiro já guardado nesta meta volta a ficar reservado e sai do saldo disponível."
            : "O dinheiro guardado nesta meta volta para o saldo disponível. A meta continua no histórico e pode ser reativada depois."
        }
      >
        <Alert>{errorMessage}</Alert>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => setIsOpen(false)} disabled={isSaving} className={secondaryButtonClass}>Cancelar</button>
          <button type="button" onClick={handleConfirm} disabled={isSaving} className={reactivating ? primaryButtonClass : dangerButtonClass}>
            <SubmitLabel loading={isSaving} idle={reactivating ? "Reativar" : "Desativar"} busy="Salvando..." />
          </button>
        </div>
      </Modal>
    </>
  );
}
