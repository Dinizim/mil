interface FinancialCardProps {
  title: string;
  value: number;
  description?: string;
}

export default function FinancialCard({
  title,
  value,
  description,
}: FinancialCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {formatCurrency(value)}
      </p>

      {description && (
        <p className="mt-2 text-sm text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}