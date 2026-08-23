// ============================================================================
// IDIOMA — fuente única para todo el sitio y los documentos del cliente.
//
// Antes `Idioma` vivía dentro de `acuerdo-textos.ts`, porque el acuerdo fue lo
// primero que se hizo bilingüe. Al hacer bilingüe también el sitio público, ese
// archivo habría acabado importado por la portada — que no tiene nada que ver
// con un contrato. El tipo vive aquí y todos lo leen de aquí.
//
// ⚠️ POR QUÉ EL SITIO NO USA `?lang=` COMO LOS DOCUMENTOS.
// La propuesta, el acuerdo y el Portal de Arranque son documentos privados con
// link secreto: no los indexa nadie, así que el idioma puede viajar en la URL
// como parámetro. Una página pública NO puede: Google vería la versión en
// español y la inglesa en la MISMA dirección, las trataría como contenido
// duplicado y la inglesa no aparecería nunca. Por eso el sitio tiene URLs
// propias — `/precios` y `/en/precios` — enlazadas entre sí con `hreflang`.
// ============================================================================

export type Idioma = "es" | "en";

export const IDIOMAS: Idioma[] = ["es", "en"];

/** El idioma en el que nació el sitio y el que gobierna los contratos. */
export const IDIOMA_POR_DEFECTO: Idioma = "es";

/** Valida un valor que viene de fuera (URL, webhook, formulario).
 *  ⚠️ Se compara contra la LISTA, nunca con `OBJETO[valor]`: indexar un objeto
 *  normal también encuentra lo que hereda de Object.prototype, así que
 *  `?lang=constructor` pasaría el filtro (lección 2026-08-19). */
export function idiomaDe(valor: unknown): Idioma {
  const v = String(valor ?? "").toLowerCase();
  return (IDIOMAS as string[]).includes(v) ? (v as Idioma) : IDIOMA_POR_DEFECTO;
}

/** El código que va en `<html lang>` y en `og:locale`. */
export const LOCALE: Record<Idioma, { html: string; og: string }> = {
  es: { html: "es-MX", og: "es_MX" },
  en: { html: "en-US", og: "en_US" },
};

/** El prefijo de ruta de cada idioma. El español vive en la raíz — es el idioma
 *  original del sitio y sus URLs ya están indexadas; moverlas a `/es` tiraría
 *  ese trabajo a la basura. */
export const PREFIJO: Record<Idioma, string> = { es: "", en: "/en" };

/**
 * ⚠️ `ruta()` y `alternativas()` YA NO VIVEN AQUÍ: están en `lib/rutas.ts`.
 *
 * Se mudaron el 2026-08-22, al traducir también las direcciones (`/en/pricing`
 * en vez de `/en/precios`). Para traducirlas hacen falta los slugs, que viven
 * en `soluciones.ts` y `blog.ts` — y esos archivos importan el tipo `Idioma` de
 * aquí. Dejarlas en este archivo habría creado un ciclo de importaciones.
 *
 * Este archivo se queda con lo primitivo y NO IMPORTA NADA, que es lo que le
 * permite ser la base de la que cuelga todo lo demás.
 */

/**
 * El origen del sitio, para canonical y hreflang absolutos.
 *
 * ⚠️ VA CON `www`, Y NO ES UN DETALLE. En Vercel el dominio principal es
 * `www.upcoreai.com`: el apex `upcoreai.com` devuelve un 307 hacia allá. Hasta el
 * 2026-08-22 esto decía el apex, así que TODOS los canonical apuntaban a una URL
 * que redirige. Con el sitio en un solo idioma era un defecto menor —Google sigue
 * la redirección y consolida—, pero con `hreflang` deja de serlo: la documentación
 * de Google es explícita en que las URLs de `hreflang` tienen que ser canónicas y
 * NO redirigir, o las anotaciones se descartan enteras. O sea que el sitio
 * bilingüe habría quedado publicado y Google no se habría enterado de que las dos
 * versiones son la misma página.
 *
 * Si algún día se cambia el dominio principal en Vercel, se cambia AQUÍ también:
 * `scripts/probar-produccion.mjs` comprueba que el canonical publicado no redirija.
 */
export const ORIGEN = "https://www.upcoreai.com";
