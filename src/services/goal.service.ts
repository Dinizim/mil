import { createClient } from "@/lib/supabase/server";

export async function getGoals() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createGoal(
  name: string,
  targetAmount: number,
  startDate: string,
  endDate: string | null
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      name,
      target_amount: targetAmount,
      start_date: startDate,
      end_date: endDate,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getGoalsWithProgress() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  // Buscar apenas metas ativas
  const {
    data: goals,
    error: goalsError,
  } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (goalsError) {
    throw new Error(goalsError.message);
  }

  const goalsWithProgress = await Promise.all(
    goals.map(async (goal) => {
      const {
        data: contributions,
        error,
      } = await supabase
        .from("goal_contributions")
        .select("amount")
        .eq("goal_id", goal.id)
        .eq("user_id", user.id);

      if (error) {
        throw new Error(error.message);
      }

      const currentAmount = contributions.reduce(
        (total, contribution) =>
          total + Number(contribution.amount),
        0
      );

      const targetAmount = Number(goal.target_amount);

      const percentage =
        targetAmount > 0
          ? Math.min(
              (currentAmount / targetAmount) * 100,
              100
            )
          : 0;

      const remainingAmount = Math.max(
        targetAmount - currentAmount,
        0
      );

      return {
        ...goal,
        currentAmount,
        percentage,
        remainingAmount,
      };
    })
  );

  return goalsWithProgress;
}

export async function getAvailableBalance() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  // Buscar transações
  const {
    data: transactions,
    error: transactionsError,
  } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", user.id);

  if (transactionsError) {
    throw new Error(transactionsError.message);
  }

  // Buscar metas ativas
  const {
    data: activeGoals,
    error: goalsError,
  } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (goalsError) {
    throw new Error(goalsError.message);
  }

  const activeGoalIds = activeGoals.map(
    (goal) => goal.id
  );

  // Calcular valores reservados
  let totalContributions = 0;

  if (activeGoalIds.length > 0) {
    const {
      data: contributions,
      error: contributionsError,
    } = await supabase
      .from("goal_contributions")
      .select("amount")
      .eq("user_id", user.id)
      .in("goal_id", activeGoalIds);

    if (contributionsError) {
      throw new Error(contributionsError.message);
    }

    totalContributions = contributions.reduce(
      (total, contribution) =>
        total + Number(contribution.amount),
      0
    );
  }

  // Calcular entradas
  const totalIncome = transactions
    .filter(
      (transaction) => transaction.type === "income"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  // Calcular despesas
  const totalExpense = transactions
    .filter(
      (transaction) => transaction.type === "expense"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  // Saldo total
  const balance = totalIncome - totalExpense;

  // Saldo disponível
  return balance - totalContributions;
}

export async function createGoalContribution(
  goalId: string,
  amount: number,
  description: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  if (amount <= 0) {
    throw new Error("O valor deve ser maior que zero.");
  }

  // Buscar meta
  const {
    data: goal,
    error: goalError,
  } = await supabase
    .from("goals")
    .select("id, target_amount, is_active")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single();

  if (goalError) {
    throw new Error("Meta não encontrada.");
  }

  if (!goal.is_active) {
    throw new Error("Esta meta não está ativa.");
  }

  // Buscar contribuições existentes
  const {
    data: existingContributions,
    error: contributionsError,
  } = await supabase
    .from("goal_contributions")
    .select("amount")
    .eq("goal_id", goalId)
    .eq("user_id", user.id);

  if (contributionsError) {
    throw new Error(contributionsError.message);
  }

  const currentAmount = existingContributions.reduce(
    (total, contribution) =>
      total + Number(contribution.amount),
    0
  );

  const targetAmount = Number(goal.target_amount);

  // Impedir ultrapassar a meta
  if (currentAmount + amount > targetAmount) {
    throw new Error(
      "Essa contribuição ultrapassa o valor da meta."
    );
  }

  // Verificar saldo disponível
  const availableBalance = await getAvailableBalance();

  if (amount > availableBalance) {
    throw new Error(
      "Saldo disponível insuficiente."
    );
  }

  // Salvar contribuição
  const {
    data,
    error,
  } = await supabase
    .from("goal_contributions")
    .insert({
      goal_id: goalId,
      user_id: user.id,
      amount,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Verificar se a meta foi concluída
  const newCurrentAmount = currentAmount + amount;

  if (newCurrentAmount >= targetAmount) {
    const {
      error: deactivateError,
    } = await supabase
      .from("goals")
      .update({
        is_active: false,
      })
      .eq("id", goalId)
      .eq("user_id", user.id);

    if (deactivateError) {
      throw new Error(deactivateError.message);
    }
  }

  return data;
}

export async function getFinancialSummary() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  // Buscar transações
  const {
    data: transactions,
    error: transactionsError,
  } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", user.id);

  if (transactionsError) {
    throw new Error(transactionsError.message);
  }

  // Buscar metas ativas
  const {
    data: activeGoals,
    error: goalsError,
  } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (goalsError) {
    throw new Error(goalsError.message);
  }

  const activeGoalIds = activeGoals.map(
    (goal) => goal.id
  );

  // Calcular reservado apenas das metas ativas
  let totalReserved = 0;

  if (activeGoalIds.length > 0) {
    const {
      data: contributions,
      error: contributionsError,
    } = await supabase
      .from("goal_contributions")
      .select("amount")
      .eq("user_id", user.id)
      .in("goal_id", activeGoalIds);

    if (contributionsError) {
      throw new Error(contributionsError.message);
    }

    totalReserved = contributions.reduce(
      (total, contribution) =>
        total + Number(contribution.amount),
      0
    );
  }

  // Calcular entradas
  const totalIncome = transactions
    .filter(
      (transaction) => transaction.type === "income"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  // Calcular despesas
  const totalExpense = transactions
    .filter(
      (transaction) => transaction.type === "expense"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  // Saldo total
  const balance = totalIncome - totalExpense;

  // Saldo disponível
  const availableBalance =
    balance - totalReserved;

  return {
    totalIncome,
    totalExpense,
    balance,
    totalReserved,
    availableBalance,
  };
}

export async function deactivateGoal(
  goalId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const {
    data,
    error,
  } = await supabase
    .from("goals")
    .update({
      is_active: false,
    })
    .eq("id", goalId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}