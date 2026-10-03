import type { NextRequest } from "next/server";

import { toCSV, csvResponse } from "@/lib/csv";
import { isValidMonth } from "@/lib/dates";
import { AppError } from "@/lib/errors";
import { getTransactions } from "@/services/transaction.service";

/** Exporta transações em CSV: ?month=YYYY-MM ou ?month=all. */
export async function GET(request: NextRequest) {
  const monthParam = request.nextUrl.searchParams.get("month");
  const month = isValidMonth(monthParam) ? monthParam : null;

  try {
    const transactions = await getTransactions({ month });
    const csv = toCSV(
      ["Data", "Tipo", "Categoria", "Descrição", "Valor"],
      transactions.map((transaction) => [
        transaction.transaction_date,
        transaction.type === "income" ? "Entrada" : "Despesa",
        transaction.categoryName,
        transaction.description ?? "",
        transaction.type === "income" ? transaction.amount : -transaction.amount,
      ])
    );

    return csvResponse(`mil-transacoes-${month ?? "completo"}.csv`, csv);
  } catch (error) {
    const status = error instanceof AppError ? 401 : 500;
    return new Response(status === 401 ? "Não autenticado." : "Não foi possível exportar.", { status });
  }
}
