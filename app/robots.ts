import { SITE_URL } from "@/lib/seo";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Rutas privadas o por token: ya llevan meta noindex, pero el Disallow
      // explícito ahorra presupuesto de rastreo y no depende de que el crawler
      // renderice la página para enterarse.
      disallow: ["/api/", "/p/", "/acuerdo/", "/arranque/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
