/**
 * CSV no padrão que o Excel em português abre direto: separador ";",
 * vírgula decimal e BOM UTF-8 para os acentos.
 */
export function toCSV(headers: string[], rows: Array<Array<string | number | boolean | null | undefined>>): string {
  const escape = (value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined) return "";
    const text = typeof value === "number" ? String(value).replace(".", ",") : String(value);
    // Evita injeção de fórmula ao abrir no Excel/Sheets.
    const safe = /^[=+\-@\t\r]/.test(text) && typeof value !== "number" ? `'${text}` : text;
    return /[;"\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };

  return "﻿" + [headers, ...rows].map((row) => row.map(escape).join(";")).join("\r\n");
}

export function csvResponse(fileName: string, content: string): Response {
  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
