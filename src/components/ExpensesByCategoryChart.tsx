"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type ExpenseData = {
  category: string;
  amount: number;
};

type Props = {
  data: ExpenseData[];
};

const COLORS = ["#FF7A00", "#EF4444", "#F59E0B", "#FB7185", "#A1A1AA", "#71717A", "#D97706", "#BE123C"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function ExpensesByCategoryChart({ data }: Props) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
      <div className="h-[230px] w-full max-w-[270px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              innerRadius={68}
              nameKey="category"
              outerRadius={96}
              paddingAngle={3}
              stroke="#111113"
              strokeWidth={3}
            >
              {data.map((_, index) => (
                <Cell key={"cell-" + index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#18181B",
                border: "1px solid #3F3F46",
                borderRadius: "12px",
                color: "#F4F4F5",
              }}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <text x="50%" y="47%" textAnchor="middle" className="fill-zinc-100 text-lg font-semibold">
              {formatCurrency(total)}
            </text>
            <text x="50%" y="58%" textAnchor="middle" className="fill-zinc-500 text-xs">
              Total
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.amount / total) * 100 : 0;
          return (
            <div key={item.category} className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate text-sm text-zinc-400">{item.category}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-medium text-zinc-100">{formatCurrency(item.amount)}</span>
                <span className="text-xs text-zinc-500">{percentage.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
