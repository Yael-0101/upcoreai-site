import type { Metadata } from "next";
import { SOLUCIONES } from "./soluciones";
import { ARTICULOS, HAY_BLOG } from "./blog";

export const SITE_URL = "https://upcoreai.com";
export const SITE_NAME = "Upcore AI";

// ============================================================================
// Identidad de la marca — una sola fuente para JSON-LD, contacto y logo.
// ============================================================================
export const ORGANIZACION = {
  nombre: SITE_NAME,
  email: "upcoreai.com@gmail.com",
  telefono: "+1-424-447-2698",
  logo: `${SITE_URL}/icon-512.png`,
  descripcion:
    "Automatización con IA para clínicas privadas de salud y estética: agentes de WhatsApp, reducción de no-shows, sistemas y dashboards a la medida.",
  // Perfiles oficiales de la marca — alimentan el sameAs del JSON-LD.
  // Pendiente de agregar: página de empresa de LinkedIn (cuando exista).
  sameAs: ["https://www.instagram.com/upcore.ai/"] as string[],
  // Fundador (perfil PERSONAL — va en el nodo Person, no en el de la marca).
  fundadorNombre: "Robert López",
  fundadorLinkedIn: "https://www.linkedin.com/in/robert-l%C3%B3pez-898923423/",
  knowsAbout: [
    "automatización para clínicas",
    "agentes de WhatsApp con IA",
    "inteligencia artificial conversacional",
    "WhatsApp Business API",
    "reducción de no-shows",
    "recuperación de pacientes inactivos",
    "dashboards para clínicas",
  ],
};

// ============================================================================
// Metadata por página.
// REGLA DURA: las páginas declaran su metadata SOLO con metaPagina().
// Escribir `openGraph:` a mano pisa el openGraph del layout (el merge de Next
// es superficial) y la página pierde og:image/siteName/locale — ese bug ya
// nos pasó una vez.
// ============================================================================
export function metaPagina({
  title,
  description,
  path,
  tipo = "website",
}: {
  /** Título SIN "| Upcore AI" — el template del layout agrega la marca */
  title: string;
  description: string;
  /** Ruta relativa ("/precios") — se vuelve canonical y og:url vía metadataBase */
  path: string;
  tipo?: "website" | "article";
}): Metadata {
  const tituloCompleto = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      // El template del layout NO aplica a og:title — se arma completo aquí.
      title: tituloCompleto,
      description,
      url: path,
      siteName: SITE_NAME,
      type: tipo,
      locale: "es_MX",
      // Sin `images`: las inyecta la convención opengraph-image.tsx, que
      // tiene prioridad y sobrevive a cualquier merge.
    },
    twitter: { card: "summary_large_image", title: tituloCompleto, description },
  };
}

// ============================================================================
// Lista central de rutas públicas indexables: el sitemap se genera de aquí.
// /soluciones y /blog se agregan solos desde sus archivos de datos.
// lastModified: SOLO fechas reales (inflarlas erosiona la confianza del crawler).
// ============================================================================
export const RUTAS_INDEXABLES: {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
  lastModified?: string;
}[] = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/empezar", priority: 0.9, changeFrequency: "monthly" },
  { path: "/demo", priority: 0.8, changeFrequency: "monthly" },
  { path: "/precios", priority: 0.8, changeFrequency: "monthly" },
  ...SOLUCIONES.map((s) => ({
    path: `/soluciones/${s.slug}`,
    priority: 0.7,
    changeFrequency: "monthly" as const,
    lastModified: s.actualizado,
  })),
  ...(HAY_BLOG
    ? [{ path: "/blog", priority: 0.6, changeFrequency: "weekly" as const }]
    : []),
  ...ARTICULOS.map((a) => ({
    path: `/blog/${a.slug}`,
    priority: 0.6,
    changeFrequency: "monthly" as const,
    lastModified: a.fechaActualizado ?? a.fechaPublicado,
  })),
  { path: "/casos/clinica-dental-ejemplo", priority: 0.6, changeFrequency: "monthly" },
  { path: "/nosotros", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacidad", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terminos", priority: 0.3, changeFrequency: "yearly" },
];

// ============================================================================
// JSON-LD (datos estructurados)
// ============================================================================

/** Grafo global (todas las páginas, via layout): organización + fundador + sitio. */
export function jsonLdGlobal() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#organizacion`,
        name: ORGANIZACION.nombre,
        url: SITE_URL,
        logo: ORGANIZACION.logo,
        image: ORGANIZACION.logo,
        description: ORGANIZACION.descripcion,
        email: ORGANIZACION.email,
        telephone: ORGANIZACION.telefono,
        founder: { "@id": `${SITE_URL}/#fundador` },
        areaServed: { "@type": "Country", name: "México" },
        knowsAbout: ORGANIZACION.knowsAbout,
        ...(ORGANIZACION.sameAs.length > 0 && { sameAs: ORGANIZACION.sameAs }),
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "sales",
          email: ORGANIZACION.email,
          url: `${SITE_URL}/empezar`,
        },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#fundador`,
        name: ORGANIZACION.fundadorNombre,
        jobTitle: "Fundador",
        worksFor: { "@id": `${SITE_URL}/#organizacion` },
        sameAs: [ORGANIZACION.fundadorLinkedIn],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#sitio`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "es-MX",
        publisher: { "@id": `${SITE_URL}/#organizacion` },
      },
    ],
  };
}

/** Migas de pan. Solo rutas que EXISTEN como página (no inventar niveles). */
export function breadcrumbJsonLd(items: { nombre: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.nombre,
      item: `${SITE_URL}${it.path === "/" ? "" : it.path}`,
    })),
  };
}

/** Article para el caso de ejemplo y los artículos del blog. */
export function articleJsonLd(a: {
  titulo: string;
  descripcion: string;
  path: string;
  fechaPublicado: string;
  fechaActualizado?: string;
  imagen?: string;
}) {
  return {
    "@type": "Article",
    headline: a.titulo,
    description: a.descripcion,
    url: `${SITE_URL}${a.path}`,
    mainEntityOfPage: `${SITE_URL}${a.path}`,
    inLanguage: "es-MX",
    image: a.imagen ?? `${SITE_URL}/opengraph-image`,
    datePublished: a.fechaPublicado,
    dateModified: a.fechaActualizado ?? a.fechaPublicado,
    author: { "@id": `${SITE_URL}/#organizacion` },
    publisher: { "@id": `${SITE_URL}/#organizacion` },
  };
}
