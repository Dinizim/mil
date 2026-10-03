import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { currentMonth, formatMonthLabel, shiftMonth } from "@/lib/dates";
import { cn } from "@/lib/utils";

const linkClass =
  "inline-flex size-10 items-center justify-center rounded-xl border border-zinc-800 bg-[#111113] text-zinc-300 transition hover:border-zinc-700 hover:bg-[#18181B] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]";

/** Navegação por mês via ?month=YYYY-MM, preservando os outros parâmetros. */
export default function MonthNavigator({
  basePath,
  month,
  params = {},
  className,
}: {
  basePath: string;
  month: string;
  params?: Record<string, string | undefined>;
  className?: string;
}) {
  const hrefFor = (value: string) => {
    const search = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) if (val) search.set(key, val);
    search.set("month", value);
    return `${basePath}?${search.toString()}`;
  };

  const isCurrent = month === currentMonth();

  return (
    <nav aria-label="Escolher mês" className={cn("no-print flex items-center gap-2", className)}>
      <Link href={hrefFor(shiftMonth(month, -1))} className={linkClass} aria-label="Mês anterior">
        <ChevronLeft className="size-4" aria-hidden="true" />
      </Link>
      <span className="min-w-36 text-center text-sm font-semibold text-zinc-100" aria-live="polite">
        {formatMonthLabel(month)}
      </span>
      <Link href={hrefFor(shiftMonth(month, 1))} className={linkClass} aria-label="Próximo mês">
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
      {!isCurrent && (
        <Link href={hrefFor(currentMonth())} className="ml-1 text-sm font-medium text-[#FF7A00] hover:text-[#FF8A1A]">
          Hoje
        </Link>
      )}
    </nav>
  );
}
