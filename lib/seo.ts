import type { Metadata } from "next";
import { SOLUCIONES } from "./soluciones";
import { ARTICULOS, HAY_BLOG } from "./blog";
import { LOCALE, IDIOMAS, ORIGEN, type Idioma } from "./idioma";
import { alternativas, ruta } from "./rutas";

// El host que de VERDAD sirve. Vive en lib/idioma.ts (ver el comentario de ORIGEN:
// apuntar al apex, que redirige, hacía que Google descartara el hreflang).
// Se re-exporta con el nombre de siempre para no tocar a quien ya lo importaba.
export const SITE_URL = ORIGEN;
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
    "Automatización con IA para inmobiliarias de preventa en el sur de Florida: agentes de WhatsApp y voz en español e inglés, seguimiento de prospectos, sitios y paneles a la medida.",
  // Perfiles oficiales de la marca — alimentan el sameAs del JSON-LD.
  // Pendiente de agregar: página de empresa de LinkedIn (cuando exista).
  sameAs: ["https://www.instagram.com/upcore.ai/"] as string[],
  // Fundador (perfil PERSONAL — va en el nodo Person, no en el de la marca).
  fundadorNombre: "Robert López",
  fundadorLinkedIn: "https://www.linkedin.com/in/robert-l%C3%B3pez-898923423/",
  knowsAbout: [
    "automatización para inmobiliarias",
    "agentes de WhatsApp con IA",
    "inteligencia artificial conversacional",
    "WhatsApp Business API",
    "seguimiento de leads inmobiliarios",
    "preventa inmobiliaria en Miami",
    "paneles para inmobiliarias",
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
  idioma = "es",
  tituloAbsoluto = false,
}: {
  /** Título SIN "| Upcore AI" — el template del layout agrega la marca */
  title: string;
  description: string;
  /**
   * true = el título ya trae la marca y NO hay que volver a pegársela.
   *
   * ⚠️ Existe por un defecto real (2026-08-22): la portada quedó con el título
   * "Upcore AI | AI automation for real estate firms | Upcore AI". El título de
   * la portada SÍ lleva la marca al principio —es el de la marca— y el template
   * del layout le añadía otra al final. Se vio abriendo la página, no leyendo el
   * código: en el <title> del navegador, con la marca dos veces.
   */
  tituloAbsoluto?: boolean;
  /** Ruta CANÓNICA en español ("/precios"). El prefijo del idioma lo pone esta
   *  función: pasar "/en/precios" a mano rompería el par de `hreflang`. */
  path: string;
  tipo?: "website" | "article";
  idioma?: Idioma;
}): Metadata {
  const tituloCompleto = tituloAbsoluto ? title : `${title} | ${SITE_NAME}`;
  const propia = ruta(idioma, path);
  const alt = alternativas(path);
  return {
    title: tituloAbsoluto ? { absolute: title } : title,
    description,
    alternates: {
      // ⚠️ El canonical de cada página es ELLA MISMA, no la española: si el
      // inglés declarara como canonical al español, le estaríamos pidiendo a
      // Google que no indexe el inglés — y la traducción no serviría de nada.
      // Lo que las empareja es `languages` (hreflang), no el canonical.
      canonical: `${SITE_URL}${propia}`,
      languages: alt.languages,
    },
    openGraph: {
      // El template del layout NO aplica a og:title — se arma completo aquí.
      title: tituloCompleto,
      description,
      url: `${SITE_URL}${propia}`,
      siteName: SITE_NAME,
      type: tipo,
      locale: LOCALE[idioma].og,
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
        // ⚠️ Decía `Country: México` — un resto del nicho anterior. Le estaba
        // diciendo al buscador que atendemos México cuando el cliente está en el
        // sur de Florida. No da error y no se ve en pantalla: solo hace que la
        // ficha estructurada contradiga a todo el sitio.
        areaServed: { "@type": "AdministrativeArea", name: "South Florida, United States" },
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
        // El sitio existe en los dos idiomas; el original es el español.
        inLanguage: IDIOMAS.map((i) => LOCALE[i].html),
        publisher: { "@id": `${SITE_URL}/#organizacion` },
      },
    ],
  };
}

/** Migas de pan. Solo rutas que EXISTEN como página (no inventar niveles).
 *  Los `path` se escriben SIEMPRE en su forma canónica española; el prefijo del
 *  idioma lo pone esta función, para que la miga del inglés apunte a páginas
 *  inglesas y no cruce al español a media navegación. */
export function breadcrumbJsonLd(
  items: { nombre: string; path: string }[],
  idioma: Idioma = "es"
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => {
      const r = ruta(idioma, it.path);
      return {
        "@type": "ListItem",
        position: i + 1,
        name: it.nombre,
        item: `${SITE_URL}${r === "/" ? "" : r}`,
      };
    }),
  };
}

/** Article para el caso de ejemplo y los artículos del blog. */
export function articleJsonLd(a: {
  titulo: string;
  descripcion: string;
  /** Ruta canónica española; el prefijo del idioma lo pone esta función. */
  path: string;
  fechaPublicado: string;
  fechaActualizado?: string;
  imagen?: string;
  idioma?: Idioma;
}) {
  const idioma = a.idioma ?? "es";
  const r = ruta(idioma, a.path);
  return {
    "@type": "Article",
    headline: a.titulo,
    description: a.descripcion,
    url: `${SITE_URL}${r}`,
    mainEntityOfPage: `${SITE_URL}${r}`,
    inLanguage: LOCALE[idioma].html,
    image: a.imagen ?? `${SITE_URL}/opengraph-image`,
    datePublished: a.fechaPublicado,
    dateModified: a.fechaActualizado ?? a.fechaPublicado,
    author: { "@id": `${SITE_URL}/#organizacion` },
    publisher: { "@id": `${SITE_URL}/#organizacion` },
  };
}
