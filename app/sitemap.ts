import type { MetadataRoute } from "next";
import { RUTAS_INDEXABLES, SITE_URL } from "@/lib/seo";
import { IDIOMAS } from "@/lib/idioma";
import { alternativas, ruta } from "@/lib/rutas";

// El sitemap lista LAS DOS versiones de cada página, y cada entrada declara a su
// pareja con `alternates.languages` (hreflang). Sin eso, Google ve dos páginas que
// dicen lo mismo en distinto idioma y no sabe que son la misma — que es la forma
// más común de que una traducción no sirva de nada.
export default function sitemap(): MetadataRoute.Sitemap {
  return RUTAS_INDEXABLES.flatMap((r) =>
    IDIOMAS.map((idioma) => ({
      url: `${SITE_URL}${ruta(idioma, r.path)}`,
      changeFrequency: r.changeFrequency,
      // La versión original manda: el inglés es una traducción, no una página nueva.
      priority: idioma === "es" ? r.priority : Math.max(0.1, r.priority - 0.1),
      alternates: { languages: alternativas(r.path).languages },
      ...(r.lastModified && { lastModified: r.lastModified }),
    }))
  );
}
