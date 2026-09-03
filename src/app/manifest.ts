import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mil — Controle financeiro",
    short_name: "Mil",
    description: "Controle financeiro pessoal simples e visual.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#09090B",
    theme_color: "#09090B",
    orientation: "portrait-primary",
    lang: "pt-BR",
    categories: ["finance", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
