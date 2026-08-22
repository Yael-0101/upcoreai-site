// Guardián del SITIO PÚBLICO (upcoreai.com): que no prometa lo que el producto se
// niega a hacer, y que no diga nada que la ley de EE.UU. prohíba.
//
//   node scripts/probar-sitio.mjs   (corre en el prebuild)
//
// 🔴 POR QUÉ EXISTE. El 2026-08-22, leyendo el sitio publicado como lo lee un
// prospecto, aparecieron cuatro cosas que ningún guardián veía:
//
//   · La portada prometía que el asistente responde con "unidades, planes de pago y
//     fechas de entrega", y que el panel controla "los precios que menciona". Las
//     tres son la línea roja nº1 de los cuatro productos: en preventa caducan solas.
//   · El diálogo de ejemplo de la portada tenía al asistente diciendo "Sí, quedan
//     unidades" — enseñándole al prospecto justo lo que su asistente NO va a hacer.
//   · El prompt de la DEMO pública prohibía plusvalía y fechas de entrega, pero no
//     precios ni disponibilidad: un prospecto podía preguntar "¿cuánto cuesta?" y la
//     IA inventarle un número, en vivo, en el sitio.
//   · El aviso "un prospecto probó tu demo" comparaba contra "Clínica Demo", un
//     nombre del nicho anterior. Como el default ya era "Inmobiliaria Demo", la
//     condición era SIEMPRE cierta y cada visitante anónimo disparaba un aviso falso.
//
// Los cuatro son del mismo tipo: el sitio vende algo distinto de lo que el producto
// hace. Y ninguno da error — solo llegan como reclamo el día de la entrega.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { soloVivo, textosVisibles } from "./lib-textos-visibles.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..");
const require = createRequire(import.meta.url);
// Sin caché: un guardián que lee el TypeScript compilado de hace un rato da luz verde
// sobre código que ya no existe.
const jiti = require("jiti")(fileURLToPath(import.meta.url), { cache: false, requireCache: false });

/** Los archivos del SITIO. Se excluyen los documentos del cliente, que tienen sus
 *  propios guardianes y sí nombran precios (los de Upcore) con toda razón. */
const CARPETAS = ["app", "lib", "components"];
const EXCLUIR = /acuerdo|propuesta|arranque|calc\.ts|calc-textos|nicho\.json|precios[\\/]page/;

const problemas = [];
const marca = (donde, que, porque, txt = "") =>
  problemas.push({ donde, que, porque, txt });

function archivos() {
  const out = [];
  const walk = (d) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) {
        if (!/node_modules|\.next/.test(p)) walk(p);
      } else if (/\.tsx?$/.test(f.name) && !EXCLUIR.test(p)) out.push(p);
    }
  };
  for (const c of CARPETAS) walk(path.join(RAIZ, c));
  return out;
}

// ── 1 · La línea roja del producto, oración por oración ──────────────────────
// ⚠️ Se exige que la señal aparezca JUNTO a lo que la vuelve mala: nombrar precios
// está bien —hace falta para negarlos—; lo que no se vale es prometerlos. Un
// verificador que marcara la palabra suelta tumbaría la frase correcta.
const AFIRMA = /(precios?|disponibilidad|inventario|unidades disponibles|quedan unidades|fechas? de entrega)/i;
const NIEGA =
  /\bno\s+(da|dice|publica|promete|cotiza|menciona|confirma|se publica)\b|no se publica|nunca (lo dice|da)|cambian? (a diario|por l[ií]nea|seguido)|caduca|pasa (a|al) (tu )?asesor|lo confirma su asesor|se la confirma|es a prop[óo]sito|disponibilidad ininterrumpida/i;
const SUJETO = /(asistente|sistema|sitio|p[áa]gina|web|bot|panel|agente)/i;

/** Una palabra COMPLETA en español.
 *
 * ⚠️ NUNCA con `\b`. En JavaScript `\b` no reconoce las vocales acentuadas, y
 * además "da" con `\b` al final coincide DENTRO de "agen-da" y "recomien-da":
 * la primera versión de esta regla marcó cuatro textos correctos, entre ellos la
 * FAQ que dice nuestros propios precios. Frontera escrita a mano, siempre. */
const palabra = (p) => `(?<![a-záéíóúüñ])${p}(?![a-záéíóúüñ])`;

// ⚠️ HACE FALTA UN VERBO DE DECIR. Sin él, la FAQ "…y el precio es cerrado. Se
// recomienda el sistema completo…" se marca sola — y ese precio es EL NUESTRO,
// que decirlo es justo lo que hacemos a propósito. La línea roja es sobre lo que
// el ASISTENTE le dice al comprador, no sobre lo que Upcore cobra.
const HABLA = new RegExp(
  [
    "dice", "dicen", "da", "dan", "responde", "responden", "contesta", "contestan",
    "menciona", "mencionan", "confirma", "confirman", "informa", "informan",
    "cotiza", "cotizan", "comparte", "comparten", "suelta", "promete", "prometen",
  ]
    .map(palabra)
    .join("|"),
  "i"
);

for (const a of archivos()) {
  const rel = path.relative(RAIZ, a);
  for (const { linea, txt } of textosVisibles(soloVivo(fs.readFileSync(a, "utf8")))) {
    const oraciones = txt.split(/(?<=[.;])\s+/);
    for (let i = 0; i < oraciones.length; i++) {
      // 🔴 SE MIRA LA ORACIÓN Y LA SIGUIENTE — y este es el arreglo del fallo del
      // 2026-08-22. En lib/soluciones.ts había dos fugas que este guardián dejaba
      // pasar porque el dato y el sistema vivían en oraciones DISTINTAS:
      //
      //   "Precios, planes de pago, fechas de entrega, si se puede comprar desde
      //    el extranjero. Horas de trabajo en preguntas que un asistente bien
      //    configurado responde igual y sin cansarse."
      //
      // Oración por oración suelta, ninguna de las dos disparaba: la primera no
      // nombra al sistema y la segunda no nombra el dato. Mirando el par, sí.
      const par = [oraciones[i], oraciones[i + 1] ?? ""].join(" ");
      if (AFIRMA.test(par) && SUJETO.test(par) && HABLA.test(par) && !NIEGA.test(par)) {
        marca(
          `${rel}:${linea}`,
          "promete precio / disponibilidad / fecha de entrega",
          "es la línea roja nº1 del producto: en preventa esos tres caducan solos",
          par.trim().slice(0, 130)
        );
      }
    }
  }
}

// ── 2 · Ley de EE.UU.: vivienda justa y promesas de rendimiento ──────────────
const LEYES = [
  [
    /zona segura|barrio (familiar|tranquilo|seguro)|ideal para familias|mucha comunidad|vecindario (seguro|familiar)|buen barrio/i,
    "la ley federal de vivienda justa prohíbe orientar por el perfil de quien vive en una zona",
  ],
  [
    /plusval[ií]a|se revaloriza|renta garantizada|retorno garantizado|inversi[oó]n segura/i,
    "es una promesa sobre el dinero de alguien que nadie controla",
  ],
];
// ⚠️ Una frase que PROHÍBE decir algo contiene esa misma frase. La primera versión
// marcó las tres líneas del prompt de la demo que enumeran lo prohibido — o sea, el
// guardián señalando justo el arreglo. Es la misma trampa de siempre: se revisa que
// la señal NO esté dentro de una negación.
const ES_PROHIBICION =
  /(no|nunca|nada que|jam[aá]s|prohib|evita|sin decir)|ley federal|vivienda justa/i;
for (const a of archivos()) {
  const rel = path.relative(RAIZ, a);
  const crudo = soloVivo(fs.readFileSync(a, "utf8"));
  const lineas = crudo.split("\n");
  for (const { linea, txt } of textosVisibles(crudo)) {
    for (const [re, porque] of LEYES) {
      const m = txt.match(re);
      if (!m) continue;
      // ⚠️ El CONTEXTO se busca en el archivo, no por número de línea: `soloVivo`
      // colapsa los comentarios de bloque en un espacio, así que los números ya no
      // corresponden y `lineas[linea-1]` traía otro renglón. Se mira una ventana
      // alrededor de donde aparece el texto.
      //
      // Hace falta porque en el prompt de la demo las frases prohibidas van
      // entrecomilladas DENTRO de la propia prohibición («Nada que oriente por quién
      // vive en una zona ("zona segura", …)»): el extractor devolvía solo el
      // fragmento y el guardián acababa marcando justo el arreglo.
      const pos = crudo.indexOf(m[0]);
      const ventana = pos < 0 ? txt : crudo.slice(Math.max(0, pos - 160), pos + 160);
      if (ES_PROHIBICION.test(ventana)) continue;
      marca(`${rel}:${linea}`, `«${m[0]}»`, porque, txt.slice(0, 100));
    }
  }
}

// ── 3 · El prompt de la DEMO pública lleva la línea roja COMPLETA ────────────
// Es el único sitio donde una IA de verdad le contesta a un prospecto en vivo. Si su
// prompt no le prohíbe los tres datos, se los va a inventar — y le enseña al
// prospecto que su asistente hará lo mismo.
{
  const demo = fs.readFileSync(path.join(RAIZ, "lib", "demo.ts"), "utf8");
  const exigidos = [
    [/NUNCA des un precio/i, "no le prohíbe dar precios"],
    [/cu[aá]ntas unidades quedan|disponibilidad/i, "no le prohíbe afirmar disponibilidad"],
    [/fecha de entrega/i, "no le prohíbe dar fechas de entrega"],
    [/vivienda justa/i, "no le recuerda la ley de vivienda justa"],
  ];
  for (const [re, porque] of exigidos) {
    if (!re.test(demo)) marca("lib/demo.ts", "prompt de la demo", porque);
  }
}

// ── 4 · Ningún nombre del nicho anterior usado como CENTINELA ────────────────
// Un valor escrito a mano que se compara contra otro se rompe en silencio al
// renombrar: la condición pasa a ser siempre cierta (o siempre falsa) y nadie se
// entera. Aquí eso llenaba de avisos falsos el WhatsApp de Yael.
{
  const { DEMO_DEFAULTS } = jiti(path.join(RAIZ, "lib", "demo-config.ts"));
  for (const a of archivos()) {
    const rel = path.relative(RAIZ, a);
    const src = soloVivo(fs.readFileSync(a, "utf8"));
    const m = src.match(/!==\s*"([^"]*(?:Cl[ií]nica|Consultorio|Dental)[^"]*)"/);
    if (m) {
      marca(
        rel,
        `centinela "${m[1]}"`,
        "es un nombre del nicho anterior comparado a mano: la condición nunca se cumple y falla en silencio"
      );
    }
  }
  // Y que el centinela vivo siga siendo el de la fuente única.
  const demoRoute = fs.readFileSync(path.join(RAIZ, "app", "api", "demo", "route.ts"), "utf8");
  if (!/DEMO_DEFAULTS\.clinica/.test(demoRoute)) {
    marca(
      "app/api/demo/route.ts",
      "aviso de demo probada",
      "no compara contra DEMO_DEFAULTS.clinica: un cambio de nicho lo vuelve a romper"
    );
  }
  if (!DEMO_DEFAULTS?.clinica) marca("lib/demo-config.ts", "DEMO_DEFAULTS", "no se pudo leer");
}

if (problemas.length) {
  console.error(`❌ El sitio público tiene ${problemas.length} problema(s):\n`);
  for (const p of problemas) {
    console.error(`   ${p.donde}  ${p.que}`);
    if (p.txt) console.error(`      "${p.txt}"`);
    console.error(`      → ${p.porque}\n`);
  }
  process.exit(1);
}
console.log("✅ El sitio no promete lo que el producto no hace, y respeta la ley de EE.UU.");
