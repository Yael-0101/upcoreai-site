// VERIFICADOR DE PRODUCCIÓN — se corre DESPUÉS de publicar.
//
//   node scripts/probar-produccion.mjs            (contra www.upcoreai.com)
//   node scripts/probar-produccion.mjs http://localhost:3000
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
//
// ⚠️ Desde el 2026-08-31 la lógica vive en lib/verificacion-seo.ts, COMPARTIDA con
// el endpoint /api/seo-verificacion que llama el vigilante de n8n. Este script es
// solo el envoltorio de línea de comandos: si hay que agregar una comprobación,
// se agrega en la librería y la ganan los dos caminos a la vez.

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
const { verificarSeoEnVivo } = jiti(path.join(RAIZ, "lib", "verificacion-seo.ts"));

const BASE = process.argv[2] || "https://www.upcoreai.com";
const { ok, paginas, fallos } = await verificarSeoEnVivo(BASE);

if (!ok) {
  console.error(`❌ Producción tiene ${fallos.length} problema(s):\n`);
  for (const f of fallos) console.error("   ·", f);
  process.exit(1);
}
console.log(
  `✅ ${paginas} páginas en producción: sin redirecciones, canonical propio, hreflang vivo, títulos y descripciones en rango, robots.txt y sitemap.xml en orden.`
);
