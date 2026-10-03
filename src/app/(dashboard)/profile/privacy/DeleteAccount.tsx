"use client";

import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { Alert, Field, Modal, SubmitLabel, dangerButtonClass, inputClass, secondaryButtonClass } from "@/components/ui/form";
import { createClient } from "@/lib/supabase/client";

import { deleteAccountAction } from "../actions";

/** Exclusão definitiva da conta (LGPD, art. 18, VI). */
export default function DeleteAccount({ hasPassword }: { hasPassword: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-rose-300">Excluir minha conta</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-400">
        Apaga de forma definitiva sua conta e todos os dados: transações, categorias, metas e aportes. Não dá para desfazer.
        Se quiser, exporte seus dados antes.
      </p>
      <button type="button" onClick={() => setOpen(true)} className={dangerButtonClass + " mt-4"}>
        Excluir conta
      </button>
      {open && <DeleteAccountDialog hasPassword={hasPassword} onClose={() => setOpen(false)} />}
    </section>
  );
}

function DeleteAccountDialog({ hasPassword, onClose }: { hasPassword: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputId = useId();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await deleteAccountAction(hasPassword ? { password: value } : { phrase: value });
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // O usuário já não existe: limpa só a sessão local e sai.
    await createClient().auth.signOut({ scope: "local" });
    router.replace("/login?deleted=1");
    router.refresh();
  }

  return (
    <Modal
      open
      onClose={onClose}
      busy={loading}
      role="alertdialog"
      title="Excluir conta definitivamente?"
      icon={<span className="flex size-11 items-center justify-center rounded-xl bg-rose-400/10 text-rose-400"><AlertTriangle className="size-5" aria-hidden="true" /></span>}
      description="Todos os seus dados serão apagados agora. Essa ação não pode ser desfeita."
    >
      <form onSubmit={handleDelete} className="space-y-4">
        <Field label={hasPassword ? "Confirme com sua senha" : "Digite EXCLUIR para confirmar"} htmlFor={inputId}>
          <input
            id={inputId}
            type={hasPassword ? "password" : "text"}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete={hasPassword ? "current-password" : "off"}
            autoFocus
            className={inputClass}
          />
        </Field>
        <Alert>{error}</Alert>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={loading} className={secondaryButtonClass}>Cancelar</button>
          <button type="submit" disabled={loading || !value} className={dangerButtonClass}>
            <SubmitLabel loading={loading} idle="Excluir para sempre" busy="Excluindo..." />
          </button>
        </div>
      </form>
    </Modal>
  );
}
