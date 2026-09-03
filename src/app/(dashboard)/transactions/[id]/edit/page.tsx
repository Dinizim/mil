import { getTransactionById } from "@/services/transaction.service";
import { getCategories } from "@/services/category.services";
import EditTransactionForm from "./EditTransactionForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditTransactionPage({
  params,
}: Props) {
  const { id } = await params;

  const [transaction, categories] = await Promise.all([
    getTransactionById(id),
    getCategories(),
  ]);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">
        Editar transação
      </h1>

      <EditTransactionForm
        transaction={transaction}
        categories={categories}
      />
    </main>
  );
}