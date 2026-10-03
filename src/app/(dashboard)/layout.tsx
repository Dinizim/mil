import Navigation from "@/components/navigation/Navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="print-area min-h-screen bg-[#09090B]">
      <Navigation />
      <main className="pb-20 md:ml-64 md:pb-0 print:ml-0 print:pb-0">{children}</main>
    </div>
  );
}
