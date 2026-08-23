// Genera `redirecciones.json` a partir de lib/rutas.ts.
//
//   node scripts/generar-redirecciones.mjs              → lo escribe
//   node scripts/generar-redirecciones.mjs --verificar  → falla si está desfasado
//
// 🔴 POR QUÉ EXISTE. El 2026-08-22 el inglés dejó de vivir en la dirección
// española: `/en/precios` pasó a `/en/pricing` y `/en/soluciones/agente-de-voz-
// para-inmobiliarias` a `/en/solutions/ai-voice-agent-for-real-estate`. Las
// direcciones viejas ESTUVIERON PUBLICADAS, así que no se pueden dejar en 404:
// llevan a una redirección permanente.
//
// `next.config.mjs` es JavaScript y no puede importar TypeScript, así que la
// lista viaja por un JSON. Y como un JSON escrito a mano se desfasa en cuanto
// alguien agrega una solución, lo escribe este generador y el prebuild
// comprueba que siga cuadrando — la regla de la casa: si algo se puede editar
// en dos sitios, el generador es el que manda.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import createJiti from "jiti";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..");
const DESTINO = path.join(RAIZ, "redirecciones.json");

const jiti = createJiti(path.join(AQUI, "x.mjs"), {
  cache: false,
  requireCache: false,
  interopDefault: true,
});

const { redireccionesViejas } = jiti(path.join(RAIZ, "lib", "rutas.ts"));

const lista = redireccionesViejas();
if (!lista.length) {
  console.error("❌ redireccionesViejas() no devolvió nada: el lector falló o la tabla se vació.");
  process.exit(1);
}

// Una redirección hacia sí misma es un bucle infinito publicado. Pasaría si un
// slug inglés se dejara escrito igual que el español.
for (const r of lista) {
  if (r.source === r.destination) {
    console.error(`❌ "${r.source}" se redirige a sí misma: sería un bucle. Revisa su \`slugEn\`.`);
    process.exit(1);
  }
}

const json = JSON.stringify(lista, null, 2) + "\n";
const verificar = process.argv.includes("--verificar");

if (verificar) {
  const actual = fs.existsSync(DESTINO) ? fs.readFileSync(DESTINO, "utf8") : "";
  if (actual !== json) {
    console.error("❌ redirecciones.json está desfasado de lib/rutas.ts.");
    console.error("   Córrelo sin --verificar para regenerarlo:");
    console.error("   npm run generar:redirecciones");
    process.exit(1);
  }
  console.log(`✅ Las ${lista.length} redirecciones de las direcciones viejas cuadran con lib/rutas.ts.`);
} else {
  fs.writeFileSync(DESTINO, json, "utf8");
  console.log(`✅ redirecciones.json escrito con ${lista.length} redirecciones.`);
}
