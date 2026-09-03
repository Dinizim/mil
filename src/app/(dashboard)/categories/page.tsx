import { ArrowDownLeft, ArrowUpRight, Tags } from "lucide-react";

import { getCategories } from "@/services/category.services";

import CategoryForm from "./CategoryForm";
import DeleteCategoryButton from "./DeleteCategoryButton";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const incomeCategories = categories.filter((category) => category.type === "income");
  const expenseCategories = categories.filter((category) => category.type === "expense");

  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-6 text-zinc-100 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#FF7A00]">
              <Tags className="size-5" aria-hidden="true" />
              <span className="text-sm font-medium">Organização financeira</span>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Categorias
            </h1>
            <p className="mt-2 text-sm text-zinc-400 sm:text-base">
              Organize suas entradas e despesas do seu jeito.
            </p>
          </div>
          <CategoryForm />
        </header>

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          <CategorySection
            title="Entradas"
            description="Categorias para valores recebidos."
            categories={incomeCategories}
            type="income"
          />
          <CategorySection
            title="Despesas"
            description="Categorias para seus gastos."
            categories={expenseCategories}
            type="expense"
          />
        </div>
      </div>
    </main>
  );
}

function CategorySection({
  title,
  description,
  categories,
  type,
}: {
  title: string;
  description: string;
  categories: Category[];
  type: "income" | "expense";
}) {
  const isIncome = type === "income";
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;
  const tone = isIncome
    ? "bg-emerald-400/10 text-emerald-400"
    : "bg-rose-400/10 text-rose-400";

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#111113] shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-800 px-5 py-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{description}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
          {categories.length} {categories.length === 1 ? "categoria" : "categorias"}
        </span>
      </div>

      {categories.length === 0 ? (
        <div className="px-5 py-12 text-center sm:px-6">
          <div className={`mx-auto flex size-11 items-center justify-center rounded-xl ${tone}`}>
            <Tags className="size-5" aria-hidden="true" />
          </div>
          <h3 className="mt-4 font-semibold text-white">Nenhuma categoria criada</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
            Crie uma categoria para classificar melhor suas movimentações.
          </p>
          <CategoryForm defaultType={type} variant="empty" />
        </div>
      ) : (
        <ul className="divide-y divide-zinc-800">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                  <Tags className="size-4" aria-hidden="true" />
                </div>
                <p className="truncate text-sm font-semibold text-zinc-100 sm:text-base">{category.name}</p>
              </div>
              <DeleteCategoryButton id={category.id} name={category.name} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
