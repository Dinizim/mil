"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      <Printer className="size-4" aria-hidden="true" />
      PDF / Imprimir
    </button>
  );
}
