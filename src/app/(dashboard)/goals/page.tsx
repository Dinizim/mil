import { getGoalsWithProgress } from "@/services/goal.service";
import GoalForm from "./GoalForm";
import GoalContributionForm from "./GoalContributionForm";

export default async function GoalsPage() {
  const goals = await getGoalsWithProgress();

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">
          Minhas metas
        </h1>

        <p className="mt-2 text-gray-600">
          Acompanhe seus objetivos financeiros.
        </p>

        <GoalForm />

        <div className="mt-8">
          {goals.length === 0 ? (
            <p className="text-gray-500">
              Você ainda não possui nenhuma meta.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-xl border p-6"
                >
                  <h2 className="text-xl font-bold">
                    {goal.name}
                  </h2>

                  <div className="mt-4 flex justify-between text-sm">
                    <span>
                      R$ {goal.currentAmount.toFixed(2)}
                    </span>

                    <span>
                      R$ {Number(goal.target_amount).toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-black"
                      style={{
                        width: `${goal.percentage}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-sm text-gray-500">
                    <span>
                      {goal.percentage.toFixed(0)}%
                    </span>

                    <span>
                      Faltam R$ {goal.remainingAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    <p>
                      Início: {goal.start_date}
                    </p>

                    {goal.end_date && (
                      <p>
                        Prazo: {goal.end_date}
                      </p>
                    )}
                  </div>
                  <GoalContributionForm goalId={goal.id} />
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </main>
  );
}