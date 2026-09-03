"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MonthlyData = {
  month: string;
  income: number;
  expense: number;
};

type Props = {
  data: MonthlyData[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-");
  return new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(new Date(Number(year), Number(monthNumber) - 1, 1))
    .replace(".", "");
}

export default function MonthlyFinancialChart({ data }: Props) {
  const formattedData = data.map((item) => ({
    ...item,
    monthLabel: formatMonth(item.month),
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 12, right: 4, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="#27272A" strokeDasharray="3 5" vertical={false} />
          <XAxis
            dataKey="monthLabel"
            axisLine={false}
            tick={{ fill: "#A1A1AA", fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#A1A1AA", fontSize: 10 }}
            tickFormatter={(value) => "R$ " + value}
            tickLine={false}
            width={58}
          />
          <Tooltip
            contentStyle={{
              background: "#18181B",
              border: "1px solid #3F3F46",
              borderRadius: "12px",
              color: "#F4F4F5",
            }}
            formatter={(value, name) => [
              formatCurrency(Number(value)),
              name === "income" ? "Entradas" : "Despesas",
            ]}
            labelStyle={{ color: "#A1A1AA" }}
          />
          <Legend
            formatter={(value) => (value === "income" ? "Entradas" : "Despesas")}
            wrapperStyle={{ color: "#A1A1AA", fontSize: "12px", paddingTop: "12px" }}
          />
          <Line
            activeDot={{ fill: "#22C55E", r: 5, stroke: "#111113", strokeWidth: 3 }}
            dataKey="income"
            dot={false}
            name="income"
            stroke="#22C55E"
            strokeWidth={3}
            type="monotone"
          />
          <Line
            activeDot={{ fill: "#EF4444", r: 5, stroke: "#111113", strokeWidth: 3 }}
            dataKey="expense"
            dot={false}
            name="expense"
            stroke="#EF4444"
            strokeWidth={3}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
