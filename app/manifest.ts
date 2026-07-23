import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Upcore AI",
    short_name: "Upcore AI",
    description:
      "Automatización con IA para clínicas privadas de salud y estética.",
    lang: "es-MX",
    start_url: "/",
    display: "browser",
    // Obsidian: el chrome del sitio es oscuro; clay como UI del navegador chillaría.
    background_color: "#1A1512",
    theme_color: "#1A1512",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
