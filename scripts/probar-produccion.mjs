// VERIFICADOR DE PRODUCCIÓN — se corre DESPUÉS de publicar.
//
//   node scripts/probar-produccion.mjs
//
// No va en el prebuild: comprueba el sitio YA PUBLICADO, no el código.
//
// 🔴 POR QUÉ EXISTE. Al publicar el sitio bilingüe (2026-08-22) resultó que todos
// los `canonical` y todos los `hreflang` apuntaban a `https://upcoreai.com/...`,
// que devuelve un 307 hacia `https://www.upcoreai.com/...`. Con un solo idioma era
// un defecto menor. Con dos deja de serlo: Google exige que las URLs de `hreflang`
// sean canónicas y NO redirijan, o descarta la anotación entera — o sea, el sitio
// habría quedado publicado en dos idiomas y el buscador nunca se habría enterado de
// que son la misma página. No daba ningún error: había que ir a mirarlo.
//
// Es la regla de la casa de "al comprobar producción, busca un dato que sepas que
// cambió, no solo que la página responda 200".

// ⚠️ La lista NO se escribe a mano. Salía así hasta el 2026-08-22, y ese mismo
// día se quedó obsoleta entera al traducir las direcciones (`/en/precios` pasó a
// `/en/pricing`): un verificador de producción apuntando a las rutas viejas
// habría comprobado 10 redirecciones y las habría dado por buenas. Ahora sale de
// RUTAS_INDEXABLES —la misma fuente que el sitemap— pasada por `ruta()`, así que
// crece y se traduce sola. Es la regla de "un guardián comprueba coherencia, no
// una lista fija".
import path from "node:path";
import { fileURLToPath } from "node:url";
import createJiti from "jiti";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..");
const jiti = createJiti(path.join(AQUI, "x.mjs"), {
  cache: false,
  requireCache: false,
  interopDefault: true,
});
const { RUTAS_INDEXABLES } = jiti(path.join(RAIZ, "lib", "seo.ts"));
const { ruta } = jiti(path.join(RAIZ, "lib", "rutas.ts"));

const RUTAS = [
  ...RUTAS_INDEXABLES.flatMap((r) => [ruta("es", r.path), ruta("en", r.path)]),
  // La demo no está en el sitemap con entrada propia y el Nav sí la enlaza.
  ruta("es", "/demo"),
  ruta("en", "/demo"),
].filter((v, i, a) => a.indexOf(v) === i);

if (RUTAS.length < 10) {
  console.error("❌ La lista de rutas salió casi vacía: el lector de lib/seo.ts falló.");
  process.exit(1);
}

const BASE = process.argv[2] || "https://www.upcoreai.com";
const fallos = [];

/** Pide una URL SIN seguir redirecciones: hace falta saber si redirige. */
async function crudo(url) {
  const r = await fetch(url, { redirect: "manual" });
  return { status: r.status, destino: r.headers.get("location") || "", res: r };
}

for (const ruta of RUTAS) {
  const url = BASE + ruta;
  let html = "";
  try {
    const { status, destino, res } = await crudo(url);
    if (status >= 300 && status < 400) {
      fallos.push(`${ruta} redirige (${status}) a ${destino} — debería servirse directo`);
      continue;
    }
    if (status !== 200) {
      fallos.push(`${ruta} devolvió ${status}`);
      continue;
    }
    html = await res.text();
  } catch (e) {
    fallos.push(`${ruta} no respondió: ${e.message}`);
    continue;
  }

  const canonical = (html.match(/rel="canonical" href="([^"]+)"/) || [])[1];
  if (!canonical) {
    fallos.push(`${ruta} no declara canonical`);
  } else {
    // El canonical tiene que ser ESTA página y tiene que servirse sin redirigir.
    const esperado = BASE + (ruta === "/" ? "/" : ruta);
    if (canonical.replace(/\/$/, "") !== esperado.replace(/\/$/, "")) {
      fallos.push(`${ruta} declara canonical ${canonical} (se esperaba ${esperado})`);
    }
    const c = await crudo(canonical);
    if (c.status !== 200) {
      fallos.push(
        `${ruta}: su canonical ${canonical} devuelve ${c.status}${c.destino ? " → " + c.destino : ""} — Google descarta el hreflang de una URL que redirige`
      );
    }
  }

  // Los dos hreflang y el x-default, y que ninguno redirija.
  const alternos = [...html.matchAll(/hrefLang="([^"]+)" href="([^"]+)"/gi)].map((m) => [m[1], m[2]]);
  for (const clave of ["es-MX", "en-US", "x-default"]) {
    if (!alternos.some(([k]) => k.toLowerCase() === clave.toLowerCase())) {
      fallos.push(`${ruta} no declara hreflang ${clave}`);
    }
  }
  for (const [k, href] of alternos) {
    const a = await crudo(href);
    if (a.status !== 200) {
      fallos.push(`${ruta}: el hreflang ${k} apunta a ${href}, que devuelve ${a.status}`);
    }
  }

  // Y que la página inglesa se declare inglesa.
  if (ruta.startsWith("/en")) {
    if (!/lang="en-US"/.test(html)) fallos.push(`${ruta} no marca su contenido como en-US`);
  }
}

if (fallos.length) {
  console.error(`❌ Producción tiene ${fallos.length} problema(s):\n`);
  for (const f of fallos) console.error("   ·", f);
  process.exit(1);
}
console.log(
  `✅ ${RUTAS.length} páginas en producción: sin redirecciones, canonical propio, hreflang en las dos direcciones y sin URLs muertas.`
);
