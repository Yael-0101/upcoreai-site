import type { MetadataRoute } from "next";
import { RUTAS_INDEXABLES, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return RUTAS_INDEXABLES.map((ruta) => ({
    url: ruta.path === "/" ? SITE_URL : `${SITE_URL}${ruta.path}`,
    changeFrequency: ruta.changeFrequency,
    priority: ruta.priority,
    ...(ruta.lastModified && { lastModified: ruta.lastModified }),
  }));
}
