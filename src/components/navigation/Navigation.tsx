"use client";

import Link from "next/link";
import { ArrowLeftRight, LayoutDashboard, Tags, UserRound, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import LogoutButton from "@/components/LogoutButton";

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

const navigationItems: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, isActive: (pathname) => pathname === "/dashboard" },
  { href: "/transactions", label: "Transações", icon: ArrowLeftRight, isActive: (pathname) => pathname.startsWith("/transactions") },
  { href: "/categories", label: "Categorias", icon: Tags, isActive: (pathname) => pathname === "/categories" },
  { href: "/profile", label: "Meu Perfil", icon: UserRound, isActive: (pathname) => pathname === "/profile" },
];

export default function Navigation() {
  const pathname = usePathname() ?? "";

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-zinc-800 bg-[#111113] p-5 md:flex md:flex-col">
        <Link href="/dashboard" className="rounded-xl px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]">
          <span className="block text-2xl font-semibold tracking-tight text-white">Mil</span>
          <span className="mt-1 block text-sm text-zinc-500">Controle financeiro</span>
        </Link>

        <nav aria-label="Navegação principal" className="mt-9 space-y-1">
          {navigationItems.map((item) => <NavigationLink key={item.href} item={item} pathname={pathname} desktop />)}
        </nav>

        <div className="mt-auto border-t border-zinc-800 pt-5"><LogoutButton /></div>
      </aside>

      <nav aria-label="Navegação mobile" className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-[#111113]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {navigationItems.map((item) => <NavigationLink key={item.href} item={item} pathname={pathname} />)}
        </div>
      </nav>
    </>
  );
}

function NavigationLink({ item, pathname, desktop = false }: { item: NavigationItem; pathname: string; desktop?: boolean }) {
  const isActive = item.isActive(pathname);
  const Icon = item.icon;
  const className = desktop
    ? `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] ${isActive ? "bg-[#FF7A00]/10 text-[#FF7A00]" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"}`
    : `flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] ${isActive ? "bg-[#FF7A00]/10 text-[#FF7A00]" : "text-zinc-500"}`;

  return <Link href={item.href} aria-current={isActive ? "page" : undefined} className={className}><Icon className={desktop ? "size-4" : "size-5"} aria-hidden="true" /><span>{item.label}</span></Link>;
}
