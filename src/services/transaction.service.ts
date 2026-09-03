import { createClient } from "@/lib/supabase/server";

export async function getTransactions() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      id,
      type,
      amount,
      description,
      transaction_date,
      category_id,
      categories!transactions_category_owner_fk (
      name
     )
    `)
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getTransactionById(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      id,
      type,
      amount,
      description,
      transaction_date,
      category_id
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


export async function createTransaction(
  type: "income" | "expense",
  amount: number,
  description: string,
  categoryId: string,
  transactionDate: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      type,
      amount,
      description,
      category_id: categoryId,
      transaction_date: transactionDate,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateTransaction(
  id: string,
  type: "income" | "expense",
  amount: number,
  description: string,
  categoryId: string,
  transactionDate: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("transactions")
    .update({
      type,
      amount,
      description,
      category_id: categoryId,
      transaction_date: transactionDate,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getTransactionSummary() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  const totalIncome = data
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => {
      return total + Number(transaction.amount);
    }, 0);

  const totalExpense = data
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => {
      return total + Number(transaction.amount);
    }, 0);

  const balance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    balance,
  };
}

export async function getLatestTransactions(limit = 5) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select(`
      id,
      type,
      amount,
      description,
      transaction_date,
      category_id,
      created_at
    `)
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (transactionsError) {
    throw new Error(transactionsError.message);
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", user.id);

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  const categoryMap = new Map(
    categories.map((category) => [category.id, category.name])
  );

  return transactions.map((transaction) => ({
    ...transaction,
    categories: transaction.category_id
      ? [
          {
            name: categoryMap.get(transaction.category_id) || "Sem categoria",
          },
        ]
      : [],
  }));
}

export async function getExpensesByCategory() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("amount, category_id")
    .eq("user_id", user.id)
    .eq("type", "expense");

  if (transactionsError) {
    throw new Error(transactionsError.message);
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", user.id);

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  const categoryMap = new Map(
    categories.map((category) => [category.id, category.name])
  );

  const grouped = transactions.reduce(
    (acc, transaction) => {
      const categoryName =
        categoryMap.get(transaction.category_id) || "Sem categoria";

      const amount = Number(transaction.amount);

      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }

      acc[categoryName] += amount;

      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(grouped)
    .map(([category, amount]) => ({
      category,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
}
export async function getMonthlyFinancialSummary() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount, transaction_date")
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const grouped = data.reduce(
    (acc, transaction) => {
      const month = transaction.transaction_date.slice(0, 7);
      const amount = Number(transaction.amount);

      if (!acc[month]) {
        acc[month] = {
          month,
          income: 0,
          expense: 0,
        };
      }

      if (transaction.type === "income") {
        acc[month].income += amount;
      } else {
        acc[month].expense += amount;
      }

      return acc;
    },
    {} as Record<
      string,
      {
        month: string;
        income: number;
        expense: number;
      }
    >
  );

  return Object.values(grouped);
}
