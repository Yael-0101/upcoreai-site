// Dónde vive cada página dentro de app/, sin que los guardianes tengan que saberlo.
//
// 🔴 POR QUÉ (2026-09-07)
// El sitio se partió en dos esqueletos —`app/(es)` y `app/(en)`— para poder declarar el
// idioma de cada versión. Los paréntesis NO aparecen en la dirección, pero sí en la ruta
// del archivo, así que todos los guardianes que abrían "app/acuerdo/[token]/page.tsx"
// se habrían quedado leyendo un archivo que ya no está ahí.
//
// Y ese es justo el fallo peligroso de la casa: un guardián que no encuentra lo que
// vigila puede quedarse en VERDE para siempre. Por eso esto no devuelve null: si no
// encuentra la página, TRUENA y dice dónde buscó.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(AQUI, "..", "app");

/** Los sitios donde puede estar una página, en orden. */
const ESQUELETOS = ["", "(es)", "(en)"];

/**
 * Ruta absoluta de una página del sitio.
 * @param {string} rel ruta SIN el esqueleto: "acuerdo/[token]/page.tsx", "en/pricing/page.tsx"
 */
export function paginaApp(rel) {
  const partes = rel.split("/").filter(Boolean);
  for (const esqueleto of ESQUELETOS) {
    const completa = path.join(APP, ...(esqueleto ? [esqueleto] : []), ...partes);
    if (fs.existsSync(completa)) return completa;
  }
  throw new Error(
    `no encuentro la página "${rel}" en app/ ni en ${ESQUELETOS.filter(Boolean)
      .map((e) => `app/${e}/`)
      .join(" ni en ")} — ¿se movió? el guardián se estaba quedando ciego`
  );
}

/** Lo mismo, ya leído. */
export function leerPaginaApp(rel) {
  return fs.readFileSync(paginaApp(rel), "utf8");
}

/**
 * Ruta absoluta de CUALQUIER archivo del repo escrito como se ve en el editor
 * ("components/X.tsx", "app/arranque/[token]/page.tsx"). Lo que empieza por "app/" pasa
 * por el resolvedor de esqueletos; lo demás se une tal cual.
 */
export function rutaRepo(rel) {
  const limpio = rel.replace(/\\/g, "/");
  if (limpio.startsWith("app/")) return paginaApp(limpio.slice(4));
  return path.join(AQUI, "..", ...limpio.split("/"));
}

/** ¿Existe? (para lo que de verdad es opcional; lo demás usa paginaApp, que truena). */
export function hayPaginaApp(rel) {
  try {
    paginaApp(rel);
    return true;
  } catch {
    return false;
  }
}
