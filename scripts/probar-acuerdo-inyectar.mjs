// Le mete al guardián del acuerdo los defectos que encontró la pasada móvil del
// 2026-09-07, y comprueba que truene POR SU REGLA.
//
//   node scripts/probar-acuerdo-inyectar.mjs
//
// 🔴 Un guardián en verde desde el primer intento no prueba nada. Y exigir que truene no
// basta: hay que exigir que truene por ESO, o acabas aprobando un acierto por casualidad.
//
// Los defectos son los REALES, copiados de lo que estaba publicado — no ejemplos
// inventados que ya cumplen la regla.
//
// ⚠️ Cada archivo se restaura desde su BUFFER original, byte a byte: los .ts y .tsx con
// texto en español no se tocan con herramientas de texto de la terminal.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { paginaApp } from "./lib-rutas-app.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const GUARDIAN = path.join(AQUI, "probar-acuerdo.mjs");
const PAGINA = paginaApp("acuerdo/[token]/page.tsx");
const PROPUESTA = paginaApp("p/[token]/page.tsx");
const PORTAL = path.join(AQUI, "..", "components", "ArranquePortal.tsx");
const PAPELES = path.join(AQUI, "..", "lib", "papeles.ts");
const ACUERDO = path.join(AQUI, "..", "lib", "acuerdo.ts");

const DEFECTOS = [
  {
    // 🔴 EL DEFECTO ORIGINAL: en un teléfono de 320px la tabla no cabía y los cuatro
    // importes se quedaban fuera de la pantalla.
    que: "la tabla de pagos vuelve a llevar ancho mínimo",
    archivo: PAGINA,
    de: '<table className="w-full border-collapse text-left">',
    a: '<table className="w-full min-w-[380px] border-collapse text-left">',
    espera: /ancho m[íi]nimo.*cifras se salen/is,
  },
  {
    que: "el título de la pestaña vuelve a estar fijo en español",
    archivo: PAGINA,
    de: "export async function generateMetadata({",
    a: "export const metadata = { title: \"Tu acuerdo\" };\nasync function generateMetadataViejo({",
    espera: /t[íi]tulo de la pesta[ñn]a/i,
  },
  {
    que: "el acuerdo deja de decir en qué idioma está",
    archivo: PAGINA,
    de: '<IdiomaDelDocumento lang={en ? "en-US" : "es-MX"} />',
    a: "",
    espera: /no declara en qu[ée] idioma/i,
  },
  {
    que: "la propuesta deja de decir en qué idioma está",
    archivo: PROPUESTA,
    de: '<IdiomaDelDocumento lang={en ? "en-US" : "es-MX"} />',
    a: "",
    espera: /la propuesta no declara en qu[ée] idioma/i,
  },
  {
    que: "el Portal de Arranque deja de decir en qué idioma está",
    archivo: PORTAL,
    de: 'useDocumentoEn(en ? "en-US" : "es-MX");',
    a: "",
    espera: /Portal de Arranque no declara/i,
  },
  {
    que: "un papel se queda sin traducir al inglés",
    archivo: PAPELES,
    de: 'puesto: { es: "asesor(a) de ventas", en: "Sales advisor" }',
    a: 'puesto: { es: "asesor(a) de ventas", en: "" }',
    espera: /se queda sin traducir/i,
  },
  {
    que: "el papel se mete en la frase como la respuesta cruda del formulario",
    archivo: PAPELES,
    de: '{ val: "dueno", label: "Soy el dueño/a", puesto: { es: "dueño/a", en: "Owner" } }',
    a: '{ val: "dueno", label: "Soy el dueño/a", puesto: { es: "Soy el dueño/a", en: "Owner" } }',
    espera: /como respuesta/i,
  },
  {
    // Volver al código de antes: imprimir el decisor tal como se guardó.
    que: "el acuerdo vuelve a imprimir el papel sin traducir",
    archivo: ACUERDO,
    de: 'puesto: puestoLegible(snap.lead?.decisor || "", idioma),',
    a: 'puesto: (snap.lead?.decisor || "").trim(),',
    espera: /imprime "Soy el due[ñn]o\/a"|imprime "Soy asesor/i,
  },
];

let malos = 0;
for (const d of DEFECTOS) {
  const original = fs.readFileSync(d.archivo);
  const texto = original.toString("utf8");
  if (!texto.includes(d.de)) {
    console.log(`⚠️  no encontré dónde inyectar «${d.que}» — ¿cambió el código?`);
    malos++;
    continue;
  }
  let salida = "";
  let codigo = 0;
  try {
    fs.writeFileSync(d.archivo, texto.replace(d.de, () => d.a), "utf8");
    try {
      salida = execFileSync(process.execPath, [GUARDIAN], { encoding: "utf8" });
    } catch (e) {
      codigo = e.status ?? 1;
      salida = (e.stdout || "") + (e.stderr || "");
    }
  } finally {
    // Pase lo que pase, el archivo vuelve a su estado original ANTES de salir.
    fs.writeFileSync(d.archivo, original);
  }

  if (!codigo) {
    console.log(`❌ ${d.que}: el guardián NO se dio cuenta`);
    malos++;
  } else if (!d.espera.test(salida)) {
    console.log(`❌ ${d.que}: tronó, pero por otra cosa`);
    console.log(salida.split("\n").filter((l) => l.startsWith("  ·")).slice(0, 3).join("\n"));
    malos++;
  } else {
    console.log(`✅ ${d.que}`);
  }
}

if (malos) {
  console.log(`\n❌ ${malos} defecto(s) no se cazan como deberían.`);
  process.exit(1);
}
console.log(`\n✅ El guardián caza los ${DEFECTOS.length} defectos, y por su propia regla.`);
