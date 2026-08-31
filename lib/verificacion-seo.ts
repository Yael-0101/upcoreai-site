// ============================================================================
// VERIFICACIÓN SEO EN VIVO — la librería que comparten el endpoint
// /api/seo-verificacion (lo llama el vigilante de n8n) y el CLI
// scripts/probar-produccion.mjs (se corre a mano tras publicar).
//
// Vive AQUÍ, dentro del sitio, a propósito: importa RUTAS_INDEXABLES y ruta()
// directo, así que se actualiza sola con cada deploy — cero espejos que
// desfasar. Un vigilante externo con su propia lista de rutas se habría
// quedado viejo el día que se tradujo una dirección (ya pasó el 2026-08-22).
//
// Qué comprueba del sitio YA PUBLICADO:
//   1. Cada página indexable (ES+EN) sirve 200 SIN redirigir.
//   2. Declara canonical propio, y ese canonical sirve 200 (Google descarta el
//      hreflang de una URL que redirige — la lección que parió todo esto).
//   3. Declara los 3 hreflang (es-MX, en-US, x-default) y ninguno está muerto.
//   4. Las páginas /en marcan su contenido como en-US.
//   5. El <title> y la meta description RENDERIZADOS respetan los límites
//      (respaldo en vivo del guardián probar-seo-meta.mjs, misma constante).
//   6. robots.txt existe, referencia el sitemap y trae los Disallow.
//   7. sitemap.xml parsea y sus URLs son EXACTAMENTE las esperadas, 1:1.
// ============================================================================

import { RUTAS_INDEXABLES, SITE_URL } from "./seo";
import { ruta } from "./rutas";
import { IDIOMAS } from "./idioma";

/** Límites de metadata — la ÚNICA copia. El guardián de prebuild
 *  (probar-seo-meta.mjs) los importa de aquí. */
export const LIMITES_META = {
  /** Título FINAL (con la marca). Google trunca alrededor de ~60–65. */
  title: 65,
  descMin: 70,
  descMax: 160,
};

/** Los Disallow que robots.txt tiene que declarar (rutas privadas o por token). */
export const ROBOTS_DISALLOW = ["/api/", "/p/", "/acuerdo/", "/arranque/"];

/** Todas las rutas públicas a verificar, en los dos idiomas, sin repetidas. */
export function rutasAVerificar(): string[] {
  return [
    ...RUTAS_INDEXABLES.flatMap((r) => IDIOMAS.map((i) => ruta(i, r.path))),
  ].filter((v, i, a) => a.indexOf(v) === i);
}

export type ResultadoSeo = {
  ok: boolean;
  paginas: number;
  fallos: string[];
};

type Crudo = { status: number; destino: string; html: string };

/** Pide una URL SIN seguir redirecciones (hace falta saber si redirige). */
async function pedir(url: string, conCuerpo: boolean): Promise<Crudo> {
  const r = await fetch(url, { redirect: "manual", cache: "no-store" });
  return {
    status: r.status,
    destino: r.headers.get("location") || "",
    html: conCuerpo && r.status === 200 ? await r.text() : "",
  };
}

/** Corre tareas con un tope de concurrencia (el endpoint tiene 60 s). */
async function porLotes<T>(items: T[], tope: number, fn: (t: T) => Promise<void>) {
  const cola = [...items];
  const obreros = Array.from({ length: Math.min(tope, cola.length) }, async () => {
    while (cola.length) {
      const item = cola.shift();
      if (item !== undefined) await fn(item);
    }
  });
  await Promise.all(obreros);
}

export async function verificarSeoEnVivo(base: string = SITE_URL): Promise<ResultadoSeo> {
  const fallos: string[] = [];
  const RUTAS = rutasAVerificar();

  if (RUTAS.length < 10) {
    return {
      ok: false,
      paginas: RUTAS.length,
      fallos: ["La lista de rutas salió casi vacía: el lector de RUTAS_INDEXABLES falló — el roto soy yo, no el sitio."],
    };
  }

  // Cache de estados: canonical y hreflang repiten las mismas URLs muchas veces.
  // Las páginas declaran SIEMPRE el origen de producción (SITE_URL); si se está
  // probando contra otro base (localhost), la vivez se comprueba ahí — si no,
  // "probar en local" estaría pidiendo producción sin decirlo.
  const enBase = (url: string) => (base === SITE_URL ? url : url.replace(SITE_URL, base));
  const estados = new Map<string, Promise<{ status: number; destino: string }>>();
  const estadoDe = (url: string) => {
    const real = enBase(url);
    let p = estados.get(real);
    if (!p) {
      p = pedir(real, false).then(({ status, destino }) => ({ status, destino }));
      estados.set(real, p);
    }
    return p;
  };

  await porLotes(RUTAS, 8, async (rutaPagina) => {
    const url = base + rutaPagina;
    let html = "";
    try {
      const r = await pedir(url, true);
      if (r.status >= 300 && r.status < 400) {
        fallos.push(`${rutaPagina} redirige (${r.status}) a ${r.destino} — debería servirse directo`);
        return;
      }
      if (r.status !== 200) {
        fallos.push(`${rutaPagina} devolvió ${r.status}`);
        return;
      }
      html = r.html;
    } catch (e) {
      fallos.push(`${rutaPagina} no respondió: ${(e as Error).message}`);
      return;
    }

    // Canonical: propio (con el origen de PRODUCCIÓN, aunque se pruebe en
    // local), y que se sirva sin redirigir.
    const canonical = (html.match(/rel="canonical" href="([^"]+)"/) || [])[1];
    if (!canonical) {
      fallos.push(`${rutaPagina} no declara canonical`);
    } else {
      const esperado = SITE_URL + (rutaPagina === "/" ? "/" : rutaPagina);
      if (canonical.replace(/\/$/, "") !== esperado.replace(/\/$/, "")) {
        fallos.push(`${rutaPagina} declara canonical ${canonical} (se esperaba ${esperado})`);
      }
      const c = await estadoDe(canonical);
      if (c.status !== 200) {
        fallos.push(
          `${rutaPagina}: su canonical ${canonical} devuelve ${c.status}${c.destino ? " → " + c.destino : ""} — Google descarta el hreflang de una URL que redirige`
        );
      }
    }

    // Los dos hreflang y el x-default, y que ninguno redirija.
    const alternos = [...html.matchAll(/hrefLang="([^"]+)" href="([^"]+)"/gi)].map(
      (m) => [m[1], m[2]] as const
    );
    for (const clave of ["es-MX", "en-US", "x-default"]) {
      if (!alternos.some(([k]) => k.toLowerCase() === clave.toLowerCase())) {
        fallos.push(`${rutaPagina} no declara hreflang ${clave}`);
      }
    }
    for (const [k, href] of alternos) {
      const a = await estadoDe(href);
      if (a.status !== 200) {
        fallos.push(`${rutaPagina}: el hreflang ${k} apunta a ${href}, que devuelve ${a.status}`);
      }
    }

    // La página inglesa se declara inglesa.
    if (rutaPagina.startsWith("/en") && !/lang="en-US"/.test(html)) {
      fallos.push(`${rutaPagina} no marca su contenido como en-US`);
    }

    // Title y description RENDERIZADOS dentro de límites (respaldo en vivo del
    // guardián de prebuild — misma constante, no una copia).
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
    if (!title) {
      fallos.push(`${rutaPagina} no tiene <title>`);
    } else if (title.length > LIMITES_META.title) {
      fallos.push(`${rutaPagina}: <title> de ${title.length} caracteres (máx ${LIMITES_META.title}) — "${title}"`);
    }
    const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
    if (!desc) {
      fallos.push(`${rutaPagina} no tiene meta description`);
    } else if (desc.length > LIMITES_META.descMax || desc.length < LIMITES_META.descMin) {
      fallos.push(
        `${rutaPagina}: meta description de ${desc.length} caracteres (fuera de ${LIMITES_META.descMin}–${LIMITES_META.descMax})`
      );
    }
  });

  // robots.txt: que exista, que apunte al sitemap y que traiga los Disallow.
  try {
    const r = await pedir(`${base}/robots.txt`, true);
    if (r.status !== 200) {
      fallos.push(`/robots.txt devolvió ${r.status}`);
    } else {
      if (!r.html.includes("Sitemap:")) fallos.push("/robots.txt no referencia el sitemap");
      for (const d of ROBOTS_DISALLOW) {
        if (!r.html.includes(`Disallow: ${d}`)) fallos.push(`/robots.txt no trae "Disallow: ${d}"`);
      }
    }
  } catch (e) {
    fallos.push(`/robots.txt no respondió: ${(e as Error).message}`);
  }

  // sitemap.xml: que parsee y que sus URLs sean EXACTAMENTE las esperadas.
  try {
    const r = await pedir(`${base}/sitemap.xml`, true);
    if (r.status !== 200) {
      fallos.push(`/sitemap.xml devolvió ${r.status}`);
    } else {
      const locs = [...r.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      if (locs.length === 0) {
        fallos.push("/sitemap.xml no trae ninguna <loc> — no parsea o está vacío");
      } else {
        // El sitemap publica URLs con el ORIGEN de producción aunque se pruebe
        // contra otro base: se comparan solo las rutas.
        const rutasSitemap = new Set(
          locs.map((u) => {
            const sinOrigen = u.replace(/^https?:\/\/[^/]+/, "");
            return sinOrigen === "" ? "/" : sinOrigen;
          })
        );
        const esperadas = new Set(RUTAS);
        for (const e of esperadas) {
          if (!rutasSitemap.has(e)) fallos.push(`el sitemap no lista ${e}`);
        }
        for (const s of rutasSitemap) {
          if (!esperadas.has(s)) fallos.push(`el sitemap lista ${s}, que no está en RUTAS_INDEXABLES`);
        }
      }
    }
  } catch (e) {
    fallos.push(`/sitemap.xml no respondió: ${(e as Error).message}`);
  }

  return { ok: fallos.length === 0, paginas: RUTAS.length, fallos };
}
