"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, LoaderCircle, Trash2 } from "lucide-react";
import { deleteTransactionAction } from "./actions";

type Props = {
  id: string;
};

export default function DeleteTransactionButton({ id }: Props) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    try {
      setIsDeleting(true);
      setErrorMessage("");

      await deleteTransactionAction(id);

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage("Não foi possível excluir a transação.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      {/* BOTÃO EXCLUIR */}
      <button
        type="button"
        onClick={() => { setErrorMessage(""); setIsOpen(true); }}
        className="inline-flex size-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-rose-400/10 hover:text-rose-400"
        aria-label="Excluir transação"
        title="Excluir transação"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>

      {/* MODAL */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!isDeleting) {
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
            {/* ÍCONE */}
            <div className="flex size-11 items-center justify-center rounded-xl bg-rose-400/10 text-rose-400">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>

            {/* TÍTULO */}
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-white">Cancelar transação?</h2>

            {/* DESCRIÇÃO */}
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              A transação será marcada como cancelada e deixará de aparecer no saldo e nos relatórios atuais. O registro será preservado para o histórico.
            </p>

            {/* AÇÕES */}
            {errorMessage && <p role="alert" className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{errorMessage}</p>}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="min-h-11 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                {isDeleting ? "Cancelando..." : "Cancelar transação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
