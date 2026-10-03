import AuthShell from "@/components/auth/AuthShell";

import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error.slice(0, 200) : "";
  const notice = params.deleted === "1" ? "Sua conta e todos os seus dados foram excluídos." : "";

  return (
    <AuthShell title="Bem-vindo de volta" subtitle="Entre na sua conta para acompanhar sua vida financeira.">
      <LoginForm initialError={error} notice={notice} />
    </AuthShell>
  );
}
