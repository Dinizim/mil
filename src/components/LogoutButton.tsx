"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-[#111113] px-3.5 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-[#18181B] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="Sair da conta"
    >
      <LogOut className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">{loading ? "Saindo..." : "Sair"}</span>
    </button>
  );
}
