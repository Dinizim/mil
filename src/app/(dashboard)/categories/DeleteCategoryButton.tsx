"use client";

import { AlertTriangle, LoaderCircle, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { deleteCategoryAction } from "./actions";

type Props = { id: string; name: string };

export default function DeleteCategoryButton({ id, name }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) setIsOpen(false);
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isDeleting]);

  async function handleDelete() {
    setIsDeleting(true);
    setErrorMessage("");

    try {
      await deleteCategoryAction(id);
      setIsOpen(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível excluir a categoria.");
    } finally {
      setIsDeleting(false);
    }
  }

  function closeModal() {
    if (!isDeleting) setIsOpen(false);
  }

  return (
    <>
      <button type="button" onClick={() => { setErrorMessage(""); setIsOpen(true); }} className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-rose-400/10 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400" aria-label={`Excluir categoria ${name}`} title="Excluir categoria">
        <Trash2 className="size-4" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-category-title" className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#18181B] p-5 text-zinc-100 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-400/10 text-rose-400"><AlertTriangle className="size-5" aria-hidden="true" /></div>
              <button type="button" onClick={closeModal} disabled={isDeleting} className="-mr-2 -mt-2 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] disabled:cursor-not-allowed disabled:opacity-50" aria-label="Fechar confirmação"><X className="size-5" aria-hidden="true" /></button>
            </div>
            <h2 id="delete-category-title" className="mt-4 text-xl font-semibold tracking-tight text-white">Excluir categoria?</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">A categoria <span className="font-medium text-zinc-200">{name}</span> será removida permanentemente.</p>
            {errorMessage && <p role="alert" className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{errorMessage}</p>}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeModal} disabled={isDeleting} className="min-h-11 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] disabled:cursor-not-allowed disabled:opacity-50">Cancelar</button>
              <button type="button" onClick={handleDelete} disabled={isDeleting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:cursor-not-allowed disabled:opacity-50">
                {isDeleting && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                {isDeleting ? "Excluindo..." : "Excluir categoria"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
