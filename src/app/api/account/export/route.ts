import type { NextRequest } from "next/server";

import { csvResponse, toCSV } from "@/lib/csv";
import { AppError } from "@/lib/errors";
import { exportUserData } from "@/services/account.service";

const TABLES = ["transactions", "categories", "goals", "goal_contributions"] as const;
type Table = (typeof TABLES)[number];

/**
 * Portabilidade (LGPD, art. 18, V).
 * ?format=json → tudo em um arquivo; ?format=csv&table=transactions → uma tabela.
 */
export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") ?? "json";
  const table = request.nextUrl.searchParams.get("table") as Table | null;

  try {
    const data = await exportUserData();
    const date = data.exported_at.slice(0, 10);

    if (format === "csv") {
      if (!table || !TABLES.includes(table)) return new Response("Tabela inválida.", { status: 400 });

      const rows = data[table] as Array<Record<string, unknown>>;
      const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
      const csv = toCSV(
        headers,
        rows.map((row) => headers.map((header) => {
          const value = row[header];
          return typeof value === "object" && value !== null ? JSON.stringify(value) : (value as string | number | boolean | null);
        }))
      );
      return csvResponse(`mil-${table}-${date}.csv`, csv);
    }

    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="mil-meus-dados-${date}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const status = error instanceof AppError ? 401 : 500;
    return new Response(status === 401 ? "Não autenticado." : "Não foi possível exportar.", { status });
  }
}
