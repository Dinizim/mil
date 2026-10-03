"use client";

import { Plus } from "lucide-react";
import { useId, useState } from "react";

import CategoryCreateModal, { type Category } from "@/components/CategoryCreateModal";
import { Alert, Field, Modal, SubmitLabel, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { todayISO } from "@/lib/dates";
import { parseMoney } from "@/lib/money";

import { createTransactionAction, updateTransactionAction } from "./actions";

export type TransactionDraft = {
  type: "income" | "expense";
  amount: string;
  description: string;
  categoryId: string;
  transactionDate: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  /** Quando informado, o formulário edita essa transação. */
  editingId?: string;
  initial?: Partial<TransactionDraft>;
};

/** Formata número para o campo de valor no padrão brasileiro ("19,99"). */
export function amountToInput(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

export function TransactionFormModal(props: Props) {
  // Montado só quando aberto: cada abertura começa com o estado limpo.
  return props.open ? <TransactionFormDialog {...props} /> : null;
}

function TransactionFormDialog({ onClose, categories, editingId, initial }: Props) {
  const [createdCategories, setCreatedCategories] = useState<Category[]>([]);
  const [draft, setDraft] = useState<TransactionDraft>(() => emptyDraft(initial));
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const ids = { type: useId(), amount: useId(), description: useId(), category: useId(), date: useId() };

  const filteredCategories = [...categories, ...createdCategories].filter((category) => category.type === draft.type);
  const update = (patch: Partial<TransactionDraft>) => setDraft((current) => ({ ...current, ...patch }));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const amount = parseMoney(draft.amount);
    if (amount === null || amount <= 0) {
      setErrorMessage("Informe um valor válido, como 19,99.");
      return;
    }
    if (!draft.categoryId) {
      setErrorMessage("Selecione uma categoria.");
      return;
    }

    setLoading(true);
    const result = editingId
      ? await updateTransactionAction(editingId, draft)
      : await createTransactionAction(draft);
    setLoading(false);

    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }
    onClose();
  }

  return (
    <>
      <Modal
        open
        onClose={onClose}
        busy={loading}
        size="lg"
        title={editingId ? "Editar transação" : "Nova transação"}
        description={
          editingId
            ? "O lançamento original será cancelado e substituído por este, preservando o histórico."
            : "Registre uma entrada ou saída."
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>{errorMessage}</Alert>

          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo">
            {(["expense", "income"] as const).map((type) => (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={draft.type === type}
                onClick={() => update({ type, categoryId: "" })}
                className={
                  "min-h-11 rounded-xl text-sm font-semibold transition " +
                  (draft.type === type
                    ? type === "expense"
                      ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/40"
                      : "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/40"
                    : "border border-zinc-700 text-zinc-400 hover:bg-zinc-800")
                }
              >
                {type === "expense" ? "Saída" : "Entrada"}
              </button>
            ))}
          </div>

          <Field label="Valor" htmlFor={ids.amount}>
            <input id={ids.amount} type="text" inputMode="decimal" value={draft.amount} onChange={(event) => update({ amount: event.target.value })} placeholder="0,00" autoFocus className={inputClass} />
          </Field>

          <Field label="Descrição" hint="(opcional)" htmlFor={ids.description}>
            <input id={ids.description} type="text" value={draft.description} maxLength={200} onChange={(event) => update({ description: event.target.value })} placeholder="Ex.: Mercado" className={inputClass} />
          </Field>

          <Field label="Categoria" htmlFor={ids.category}>
            <div className="flex gap-2">
              <select id={ids.category} value={draft.categoryId} onChange={(event) => update({ categoryId: event.target.value })} className={inputClass}>
                <option value="">Selecione uma categoria</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => setCategoryModalOpen(true)} className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-zinc-700 text-zinc-200 transition hover:bg-zinc-800" title="Criar categoria" aria-label="Criar categoria">
                <Plus className="size-5" aria-hidden="true" />
              </button>
            </div>
          </Field>

          <Field label="Data" htmlFor={ids.date}>
            <input id={ids.date} type="date" value={draft.transactionDate} onChange={(event) => update({ transactionDate: event.target.value })} className={inputClass} />
          </Field>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={loading} className={secondaryButtonClass}>Cancelar</button>
            <button type="submit" disabled={loading} className={primaryButtonClass}>
              <SubmitLabel loading={loading} idle={editingId ? "Salvar alterações" : "Adicionar transação"} busy="Salvando..." />
            </button>
          </div>
        </form>
      </Modal>

      <CategoryCreateModal
        open={categoryModalOpen}
        defaultType={draft.type}
        onClose={() => setCategoryModalOpen(false)}
        onCreated={(category) => {
          setCreatedCategories((current) => [...current, category]);
          update({ type: category.type, categoryId: category.id });
        }}
      />
    </>
  );
}

function emptyDraft(initial?: Partial<TransactionDraft>): TransactionDraft {
  return {
    type: "expense",
    amount: "",
    description: "",
    categoryId: "",
    transactionDate: todayISO(),
    ...initial,
  };
}

export default function TransactionForm({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={primaryButtonClass}>
        <Plus className="size-4" aria-hidden="true" />
        Nova transação
      </button>
      <TransactionFormModal open={open} onClose={() => setOpen(false)} categories={categories} />
    </>
  );
}
