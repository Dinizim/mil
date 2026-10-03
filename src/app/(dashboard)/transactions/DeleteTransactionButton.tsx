"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";

import { Alert, Modal, SubmitLabel, dangerButtonClass, secondaryButtonClass } from "@/components/ui/form";

import { deleteTransactionAction } from "./actions";

export default function DeleteTransactionButton({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    setIsDeleting(true);
    setErrorMessage("");
    const result = await deleteTransactionAction(id);
    setIsDeleting(false);

    if (result.ok) setIsOpen(false);
    else setErrorMessage(result.error);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setErrorMessage(""); setIsOpen(true); }}
        className="inline-flex size-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-rose-400/10 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        aria-label="Excluir transação"
        title="Excluir transação"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        busy={isDeleting}
        role="alertdialog"
        title="Cancelar transação?"
        icon={<span className="flex size-11 items-center justify-center rounded-xl bg-rose-400/10 text-rose-400"><AlertTriangle className="size-5" aria-hidden="true" /></span>}
        description="A transação será marcada como cancelada e deixará de aparecer no saldo e nos relatórios atuais. O registro será preservado para o histórico."
      >
        <Alert>{errorMessage}</Alert>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => setIsOpen(false)} disabled={isDeleting} className={secondaryButtonClass}>Voltar</button>
          <button type="button" onClick={handleDelete} disabled={isDeleting} className={dangerButtonClass}>
            <SubmitLabel loading={isDeleting} idle="Cancelar transação" busy="Cancelando..." />
          </button>
        </div>
      </Modal>
    </>
  );
}
