// ============================================================================
// RUTAS — la dirección de cada página en cada idioma. FUENTE ÚNICA.
//
// Todo el sitio escribe sus enlaces con la ruta CANÓNICA EN ESPAÑOL
// (`/precios`, `/soluciones/agente-de-voz-para-inmobiliarias`) y llama a
// `ruta(idioma, path)`. Esta función es la única que sabe que en inglés esa
// misma página vive en `/en/pricing` y en `/en/solutions/ai-voice-agent-for-
// real-estate`. Así no hay ni un enlace escrito a mano que se pueda desfasar.
//
// ⚠️ POR QUÉ LAS DIRECCIONES SE TRADUCEN (cambio del 2026-08-22).
// Hasta hoy el inglés vivía en la dirección española: `/en/soluciones/agente-
// de-voz-para-inmobiliarias`. La página estaba traducida y su dirección no —
// medio trabajo, y justo en la mitad que el buscador lee para saber de qué
// trata. Quien busca "voice agent for real estate" no teclea "agente de voz",
// y la dirección es de las primeras cosas que Google mira.
//
// ⚠️ POR QUÉ ESTE ARCHIVO NO ES `idioma.ts`.
// `ruta()` necesita los slugs, que viven en `soluciones.ts` y `blog.ts`, y esos
// archivos importan el tipo `Idioma`. Si `ruta()` se quedara en `idioma.ts`
// habría un ciclo de importaciones. `idioma.ts` se queda con lo primitivo (el
// tipo, los locales, el origen) y no importa nada; este archivo se apoya en él.
// ============================================================================

import { IDIOMAS, ORIGEN, PREFIJO, type Idioma } from "./idioma";
import { SOLUCIONES } from "./soluciones";
import { ARTICULOS } from "./blog";

/**
 * El primer tramo de cada dirección, en los dos idiomas.
 *
 * La clave es el tramo ESPAÑOL, que es como se escribe en todo el código. Un
 * tramo que se llama igual en los dos idiomas (`demo`, `blog`) también va aquí:
 * si mañana cambia, cambia en un solo lugar.
 */
export const SEGMENTOS: Record<string, string> = {
  soluciones: "solutions",
  blog: "blog",
  precios: "pricing",
  nosotros: "about",
  empezar: "start",
  demo: "demo",
  privacidad: "privacy",
  terminos: "terms",
};

/** Los tramos que llevan un slug de contenido detrás y de dónde sale ese slug. */
const CON_SLUG: Record<string, { slug: string; slugEn: string }[]> = {
  soluciones: SOLUCIONES,
  blog: ARTICULOS,
};

/** Traduce un slug de contenido al inglés. Devuelve `null` si no lo conoce. */
function slugEnDe(seccion: string, slug: string): string | null {
  const lista = CON_SLUG[seccion];
  if (!lista) return null;
  return lista.find((x) => x.slug === slug)?.slugEn ?? null;
}

/** Todos los slugs de una sección en el idioma pedido — para generateStaticParams.
 *  El camino de vuelta (de un slug a su contenido) lo hacen `getSolucion()` y
 *  `getArticulo()`, que reciben el idioma. Aquí NO hay un segundo buscador: dos
 *  formas de resolver lo mismo se desfasan. */
export function slugsDe(seccion: "soluciones" | "blog", idioma: Idioma): string[] {
  const lista = CON_SLUG[seccion] ?? [];
  return lista.map((x) => (idioma === "en" ? x.slugEn : x.slug));
}

/** El slug de un elemento en el idioma pedido. */
export function slugEnIdioma(x: { slug: string; slugEn: string }, idioma: Idioma): string {
  return idioma === "en" ? x.slugEn : x.slug;
}

/**
 * Convierte una ruta canónica (siempre escrita en español, con `/` al inicio) a
 * la ruta real del idioma pedido. Conserva lo que venga detrás de `?` o `#`.
 *
 *   ruta("es", "/precios")                     → "/precios"
 *   ruta("en", "/precios")                     → "/en/pricing"
 *   ruta("en", "/")                            → "/en"
 *   ruta("en", "/soluciones/x#demo-voz")       → "/en/solutions/x-en#demo-voz"
 *
 * ⚠️ TRUENA si no reconoce el primer tramo, en vez de devolverlo tal cual. Una
 * ruta desconocida devuelta a medio traducir sería un enlace roto publicado sin
 * un solo error: la página existiría en español y en inglés daría 404. Como
 * esto corre en el build de cada página, el fallo sale antes de publicar.
 */
export function ruta(idioma: Idioma, path: string): string {
  const conBarra = path.startsWith("/") ? path : `/${path}`;
  const corte = conBarra.search(/[?#]/);
  const limpio = corte === -1 ? conBarra : conBarra.slice(0, corte);
  const sufijo = corte === -1 ? "" : conBarra.slice(corte);

  if (idioma === "es") return conBarra;
  if (limpio === "/") return `${PREFIJO.en}${sufijo}`;

  const tramos = limpio.split("/").filter(Boolean);
  const [seccion, slug, ...resto] = tramos;

  const seccionEn = SEGMENTOS[seccion];
  if (!seccionEn) {
    throw new Error(
      `ruta(): no sé cómo se dice "/${seccion}" en inglés. ` +
        `Agrégalo a SEGMENTOS en lib/rutas.ts (la clave es el tramo español).`
    );
  }
  if (resto.length > 0) {
    throw new Error(`ruta(): "${limpio}" tiene más niveles de los que este sitio maneja.`);
  }

  if (!slug) return `${PREFIJO.en}/${seccionEn}${sufijo}`;

  const traducido = slugEnDe(seccion, slug);
  if (!traducido) {
    throw new Error(
      `ruta(): "${slug}" no está en ${seccion === "blog" ? "lib/blog.ts" : "lib/soluciones.ts"}, ` +
        `así que no tiene slug en inglés. ¿Se escribió mal, o falta su \`slugEn\`?`
    );
  }
  return `${PREFIJO.en}/${seccionEn}/${traducido}${sufijo}`;
}

/**
 * Las dos direcciones de una misma página, para las etiquetas `hreflang`.
 * Se incluye `x-default` apuntando al español: es el idioma original y el que
 * debe recibir a quien llegue sin preferencia declarada.
 */
export function alternativas(path: string) {
  return {
    canonical: `${ORIGEN}${ruta("es", path)}`,
    languages: {
      "es-MX": `${ORIGEN}${ruta("es", path)}`,
      "en-US": `${ORIGEN}${ruta("en", path)}`,
      "x-default": `${ORIGEN}${ruta("es", path)}`,
    },
  };
}

/** Las direcciones VIEJAS del inglés (con los tramos y slugs en español) y a
 *  dónde van ahora. Estuvieron publicadas y hay que redirigirlas, no dejarlas
 *  en 404. Lo consume `next.config.mjs`, que no puede importar TypeScript: se
 *  genera con `npm run generar:redirecciones`. */
export function redireccionesViejas(): { source: string; destination: string; permanent: boolean }[] {
  const salida: { source: string; destination: string; permanent: boolean }[] = [];
  for (const seccion of Object.keys(SEGMENTOS)) {
    const lista = CON_SLUG[seccion];
    if (lista) {
      for (const x of lista) {
        salida.push({
          source: `/en/${seccion}/${x.slug}`,
          destination: ruta("en", `/${seccion}/${x.slug}`),
          permanent: true,
        });
      }
    }
    if (SEGMENTOS[seccion] === seccion) continue; // el tramo no cambió de nombre
    salida.push({
      source: `/en/${seccion}`,
      destination: ruta("en", `/${seccion}`),
      permanent: true,
    });
  }
  return salida;
}

export { IDIOMAS, type Idioma };
