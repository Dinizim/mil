import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Valor em reais que fica borrado no modo privacidade. */
export default function Money({
  value,
  className,
  sign,
}: {
  value: number | string;
  className?: string;
  sign?: "+" | "-";
}) {
  return (
    <span className={cn("sensitive", className)}>
      {sign && `${sign} `}
      {formatCurrency(value)}
    </span>
  );
}
