import { SOLUCIONES } from "./soluciones";

export const SITE_URL = "https://upcoreai.com";

// Lista central de rutas públicas indexables: el sitemap se genera de aquí.
// Las páginas de /soluciones se agregan solas desde lib/soluciones.ts.
export const RUTAS_INDEXABLES: {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
}[] = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/empezar", priority: 0.9, changeFrequency: "monthly" },
  { path: "/demo", priority: 0.8, changeFrequency: "monthly" },
  ...SOLUCIONES.map((s) => ({
    path: `/soluciones/${s.slug}`,
    priority: 0.7,
    changeFrequency: "monthly" as const,
  })),
  { path: "/casos/clinica-dental-ejemplo", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacidad", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terminos", priority: 0.3, changeFrequency: "yearly" },
];
