// GUARDIÁN DEL MAPA DE KEYWORDS — el plan editorial no se desfasa del sitio.
//
//   node scripts/probar-mapa-keywords.mjs
//   node scripts/probar-mapa-keywords.mjs --inyectar=muerta|duplicada|huerfana
//
// Qué exige (2026-08-31):
//   1. Toda keyword "publicado" apunta a una página que EXISTE en
//      RUTAS_INDEXABLES — una keyword apuntando a una página muerta es un plan
//      que miente.
//   2. Ninguna keyword (es o en) se repite entre entradas vivas — dos páginas
//      atacando la misma búsqueda se canibalizan y pierden las dos.
//   3. Todo artículo del blog y toda solución tienen keyword asignada — una
//      página sin búsqueda objetivo es una página que nadie va a encontrar.
//   4. Toda descartada dice su motivo — sin él, alguien la vuelve a proponer.

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

const { MAPA_KEYWORDS } = jiti(path.join(RAIZ, "lib", "mapa-keywords.ts"));
const { RUTAS_INDEXABLES } = jiti(path.join(RAIZ, "lib", "seo.ts"));
const { ARTICULOS } = jiti(path.join(RAIZ, "lib", "blog.ts"));
const { SOLUCIONES } = jiti(path.join(RAIZ, "lib", "soluciones.ts"));

const INYECTAR = (process.argv.find((a) => a.startsWith("--inyectar=")) || "").split("=")[1];

let mapa = MAPA_KEYWORDS.map((k) => ({ ...k }));
if (INYECTAR === "muerta") {
  mapa.push({ keywordEs: "prueba muerta", keywordEn: "dead test", intencion: "informacional", prioridad: 3, estado: "publicado", path: "/blog/no-existe" });
}
if (INYECTAR === "duplicada") {
  mapa.push({ ...mapa[0], path: undefined, estado: "planeado" });
}
if (INYECTAR === "huerfana") {
  const i = mapa.findIndex((k) => k.path && k.path.startsWith("/blog/"));
  mapa.splice(i, 1);
}

const fallos = [];
const rutas = new Set(RUTAS_INDEXABLES.map((r) => r.path));
const vivas = mapa.filter((k) => k.estado !== "descartado");

if (mapa.length < 10) {
  fallos.push("El mapa salió casi vacío: el lector de lib/mapa-keywords.ts falló.");
}

// 1) Publicadas → página existente.
for (const k of mapa) {
  if (k.estado === "publicado") {
    if (!k.path) fallos.push(`"${k.keywordEs}" está publicada sin path`);
    else if (!rutas.has(k.path)) fallos.push(`"${k.keywordEs}" apunta a ${k.path}, que no existe en RUTAS_INDEXABLES`);
  }
  if (k.estado === "descartado" && !(k.motivo || "").trim()) {
    fallos.push(`"${k.keywordEs}" está descartada sin motivo — sin él alguien la vuelve a proponer`);
  }
}

// 2) Sin duplicadas entre vivas (por idioma, comparando normalizado).
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
for (const campo of ["keywordEs", "keywordEn"]) {
  const vistos = new Map();
  for (const k of vivas) {
    const v = norm(k[campo]);
    const ya = vistos.get(v);
    if (ya) fallos.push(`${campo} repetida entre "${ya}" y "${k.keywordEs}" — dos páginas atacando la misma búsqueda se canibalizan`);
    else vistos.set(v, k.keywordEs);
  }
}

// 3) Toda página de contenido tiene su keyword.
const conKeyword = new Set(vivas.filter((k) => k.path).map((k) => k.path));
for (const a of ARTICULOS) {
  const p = `/blog/${a.slug}`;
  if (!conKeyword.has(p)) fallos.push(`el artículo ${p} no tiene keyword asignada en el mapa`);
}
for (const s of SOLUCIONES) {
  const p = `/soluciones/${s.slug}`;
  if (!conKeyword.has(p)) fallos.push(`la solución ${p} no tiene keyword asignada en el mapa`);
}

if (fallos.length) {
  console.error(`❌ Mapa de keywords con ${fallos.length} problema(s):\n`);
  for (const f of fallos) console.error("   ·", f);
  process.exit(1);
}
const publicadas = mapa.filter((k) => k.estado === "publicado").length;
const planeadas = mapa.filter((k) => k.estado === "planeado").length;
console.log(
  `✅ Mapa de keywords: ${publicadas} publicadas (todas con página viva), ${planeadas} planeadas, sin canibalización, y cada artículo y solución con su búsqueda objetivo.`
);
