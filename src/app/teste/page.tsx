"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestePage() {
  const [status, setStatus] = useState("Testando conexão...");

  useEffect(() => {
    async function testarConexao() {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);
      if (error) {
        console.error(error);
        setStatus(`Erro: ${error.message}`);
        return;
      }

      setStatus("Conexão com Supabase funcionando! 🚀");
    }

    testarConexao();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">
        {status}
      </h1>
    </main>
  );
}

