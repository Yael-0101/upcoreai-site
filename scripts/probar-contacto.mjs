// Guardián de los NÚMEROS DE CONTACTO del sitio: viven UNA sola vez, en lib/content.ts.
//
//   node scripts/probar-contacto.mjs             (corre en el prebuild)
//   node scripts/probar-contacto.mjs --inyectar  (se prueba a sí mismo con un defecto)
//
// 🔴 POR QUÉ EXISTE (2026-09-03). Al preparar la mudanza del bot de WhatsApp a un número de
// Miami aparecieron CINCO copias del número escritas a mano fuera de content.ts: cuatro en las
// páginas legales (es/en × privacidad/términos), una en el propio content.ts (linkWhatsApp) y
// otra en el JSON-LD de seo.ts. Ninguna daba error: el día del cambio, la portada habría dicho
// el número nuevo y las legales el viejo — y el cliente lee las legales justo cuando desconfía.
//
// Regla: cualquier número de Upcore (bot o línea humana) aparece en el código SOLO dentro de
// lib/content.ts. Todo lo demás lo importa de CONTACT. Se buscan los DÍGITOS de cada número
// (con o sin espacios, guiones o paréntesis), no una lista de formatos escrita a mano.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..");
const require = createRequire(import.meta.url);
const jiti = require("jiti")(fileURLToPath(import.meta.url), { cache: false, requireCache: false });
const { CONTACT } = jiti(path.join(RAIZ, "lib", "content.ts"));

const INYECTAR = process.argv.includes("--inyectar");
const CARPETAS = ["app", "lib", "components"];
const FUENTE = path.join(RAIZ, "lib", "content.ts");

// Los números que vigilamos, sacados de la fuente (no escritos aquí).
const soloDigitos = (s) => String(s || "").replace(/\D/g, "");
const numeros = [
  ...new Set(
    [CONTACT.whatsappBot, CONTACT.whatsappYael, CONTACT.telefonoVoz]
      .map(soloDigitos)
      .filter((d) => d.length >= 10),
  ),
];
if (numeros.length === 0) {
  console.error("❌ probar-contacto: no pude leer ni un número de CONTACT — el roto soy yo.");
  process.exit(1);
}

// Un número escrito "a mano" puede llevar espacios, guiones, puntos o paréntesis entre los
// dígitos: +1 424 447 2698 · +1-424-447-2698 · (424) 447-2698 · 14244472698.
const patron = (digitos) => {
  // Se permite el "1" de país opcional al frente, para cazar también "424 447 2698".
  const sin1 = digitos.startsWith("1") ? digitos.slice(1) : digitos;
  const cuerpo = sin1.split("").join("[\\s\\-.()]*");
  return new RegExp(`(?<!\\d)(?:1[\\s\\-.()]*)?${cuerpo}(?!\\d)`);
};
const patrones = numeros.map((d) => ({ digitos: d, re: patron(d) }));

function archivos() {
  const out = [];
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) {
        if (!/node_modules|\.next/.test(p)) walk(p);
      } else if (/\.tsx?$/.test(f.name)) out.push(p);
    }
  };
  for (const c of CARPETAS) walk(path.join(RAIZ, c));
  return out;
}

const problemas = [];
let revisados = 0;
for (const archivo of archivos()) {
  if (path.resolve(archivo) === path.resolve(FUENTE)) continue;
  let txt = fs.readFileSync(archivo, "utf8");
  revisados++;
  // Defecto a propósito: el número del bot pegado en un componente cualquiera.
  if (INYECTAR && archivo.endsWith(path.join("components", "Legal.tsx"))) {
    txt += `\n// prueba: ${CONTACT.whatsappDisplay}\n`;
  }
  const lineas = txt.split(/\r?\n/);
  lineas.forEach((linea, i) => {
    for (const { digitos, re } of patrones) {
      if (re.test(linea)) {
        problemas.push({
          archivo: path.relative(RAIZ, archivo),
          linea: i + 1,
          digitos,
          texto: linea.trim().slice(0, 120),
        });
      }
    }
  });
}

// La fuente misma tiene que declarar cada número UNA sola vez por campo (bot y humano):
// dos copias dentro de content.ts es el mismo defecto un piso más abajo.
const fuente = fs.readFileSync(FUENTE, "utf8");
for (const { digitos, re } of patrones) {
  const veces = fuente.split(/\r?\n/).filter((l) => re.test(l)).length;
  if (veces > 1) {
    problemas.push({
      archivo: "lib/content.ts",
      linea: 0,
      digitos,
      texto: `el número ${digitos} aparece ${veces} veces dentro de content.ts; debe ir una sola vez`,
    });
  }
}

if (revisados < 20) {
  console.error(`❌ probar-contacto: solo revisé ${revisados} archivos — la carpeta cambió de lugar.`);
  process.exit(1);
}

if (problemas.length) {
  console.error(`❌ probar-contacto: ${problemas.length} número(s) de Upcore escritos a mano fuera de lib/content.ts`);
  for (const p of problemas) {
    console.error(`   · ${p.archivo}:${p.linea} (${p.digitos}) → ${p.texto}`);
  }
  console.error("   Impórtalos de CONTACT (whatsappBot / whatsappDisplay / whatsappYael…).");
  process.exit(1);
}

console.log(
  `✅ probar-contacto: ${revisados} archivos revisados, ${numeros.length} número(s) vigilados y ninguno escrito a mano fuera de content.ts` +
    (INYECTAR ? " — ⚠️ con --inyectar debió fallar" : ""),
);
if (INYECTAR) process.exit(1);
