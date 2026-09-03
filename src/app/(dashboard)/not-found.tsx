import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
          🔎
        </div>

        <h2 className="mt-5 text-xl font-semibold text-gray-900">
          Página não encontrada
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          A página que você está procurando não existe
          ou não está mais disponível.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Voltar para o dashboard
        </Link>
      </div>
    </div>
  );
}