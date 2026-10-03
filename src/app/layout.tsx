import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import PWARegister from "@/components/PWARegister";
import { privacyInitScript } from "@/components/PrivacyToggle";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Mil",
  description: "Controle financeiro pessoal",
  applicationName: "Mil",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Mil",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-privacy é aplicado pelo script antes da hidratação.
    <html lang="pt-BR" className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: privacyInitScript }} />
      </head>
      <body><PWARegister />{children}</body>
    </html>
  );
}
