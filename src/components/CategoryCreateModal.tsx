"use client";

import { Tags } from "lucide-react";
import { useId, useState } from "react";

import { createCategoryAction } from "@/app/(dashboard)/categories/actions";
import { Alert, Field, Modal, SubmitLabel, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";

export type Category = { id: string; name: string; type: "income" | "expense" };

type Props = {
  open: boolean;
  defaultType: "income" | "expense";
  onClose: () => void;
  onCreated?: (category: Category) => void;
};

export default function CategoryCreateModal(props: Props) {
  // Montado só quando aberto: cada abertura começa com o formulário limpo.
  return props.open ? <CategoryCreateDialog {...props} /> : null;
}

function CategoryCreateDialog({ defaultType, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState(defaultType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nameId = useId();
  const typeId = useId();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Informe o nome da categoria.");
      return;
    }

    setLoading(true);
    setError("");
    const result = await createCategoryAction(name.trim(), type);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onCreated?.(result.data);
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      busy={loading}
      title="Nova categoria"
      description="Crie uma categoria para organizar suas movimentações."
      icon={<span className="flex size-11 items-center justify-center rounded-xl bg-[#FF7A00]/10 text-[#FF7A00]"><Tags className="size-5" aria-hidden="true" /></span>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Alert>{error}</Alert>
        <Field label="Nome da categoria" htmlFor={nameId}>
          <input id={nameId} type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Alimentação" maxLength={60} autoFocus className={inputClass} />
        </Field>
        <Field label="Tipo" htmlFor={typeId}>
          <select id={typeId} value={type} onChange={(event) => setType(event.target.value as "income" | "expense")} className={inputClass}>
            <option value="expense">Despesa</option>
            <option value="income">Entrada</option>
          </select>
        </Field>
        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={loading} className={secondaryButtonClass}>Cancelar</button>
          <button type="submit" disabled={loading} className={primaryButtonClass}>
            <SubmitLabel loading={loading} idle="Criar categoria" busy="Criando..." />
          </button>
        </div>
      </form>
    </Modal>
  );
}
