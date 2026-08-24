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
// ⚠️ «lo confirma TU asesor» hace falta además de «su asesor». El sitio le habla al
// cliente de TÚ y los guiones del agente le hablan al comprador de USTED: reconocer
// solo la forma de usted bloquea copy correcto del sitio. Es el fallo de `de el`/`a el`
// del 2026-08-08, del lado que estorba en vez del que deja pasar.
const NIEGA =
  /\bno\s+(da|dice|publica|promete|cotiza|menciona|confirma|se publica)\b|no se publica|nunca (lo dice|da|los da|las da)|cambian? (a diario|por l[ií]nea|seguido)|caduca|pasa (a|al) (tu |su )?asesor|lo(s|as)? confirma (tu|su) asesor|se l(a|o)s? confirma|es a prop[óo]sito|disponibilidad ininterrumpida/i;
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
    // 🔴 El prompt no decía NADA sobre pedir un humano, y es justo la frase que el
    // Portal de Arranque le dice al cliente que pruebe ("Di: quiero hablar con una
    // persona"). El prospecto que la escribía en la demo se topaba con lo que al
    // modelo se le ocurriera — probablemente insistir, que es lo contrario del
    // producto: "nunca deja a un comprador atrapado con un robot" (lib/soluciones.ts).
    [
      /PIDE HABLAR CON UNA PERSONA/i,
      "no le dice qué hacer cuando el comprador pide un humano — y es la frase que el Portal le pide probar al cliente",
    ],
  ];
  for (const [re, porque] of exigidos) {
    if (!re.test(demo)) marca("lib/demo.ts", "prompt de la demo", porque);
  }
}

// ── 3a · Todo lo que el ASISTENTE dice trata de USTED ────────────────────────
// 🔴 El prompt de la demo pide usted y da su motivo: quien escribe está pensando en
// una compra grande desde otro país. Pero el SALUDO tuteaba —"puedo resolver TUS
// dudas… ¿en qué TE ayudo?"— y ese saludo entra literal en el prompt como "ya
// saludaste así". El modelo copiaba el ejemplo, no la regla, y salían frases
// mezcladas: "eso se lo confirma SU asesor… ¿cuál desarrollo TE interesa?".
//
// ⚠️ Solo se revisan los textos que son MENSAJES DEL ASISTENTE. El copy de Upcore
// tutea a propósito (le habla al dueño de la inmobiliaria, no a su comprador), así
// que meterlo aquí marcaría media web correcta.
{
  const cfg = jiti(path.join(RAIZ, "lib", "demo-config.ts"));
  const textos = jiti(path.join(RAIZ, "lib", "site-textos.ts"));
  const delAsistente = [
    ["lib/demo-config.ts · demoGreeting", cfg.demoGreeting("Inmobiliaria Demo")],
    ...Object.entries(cfg.DEMO_DISCULPAS ?? {}).map(([k, v]) => [
      `lib/demo-config.ts · DEMO_DISCULPAS.${k}`,
      v,
    ]),
    ...["es", "en"].flatMap((idi) =>
      (textos.contenido(idi)?.demo?.burbujas ?? [])
        .filter((b) => b.de === "bot")
        .map((b, i) => [`lib/site-textos.ts · burbuja ${idi}#${i + 1}`, b.texto])
    ),
  ];
  // Frontera a mano: `\b` no reconoce vocales acentuadas y marcaría dentro de
  // palabras ("agen-te", "vis-tus"). Regla de la casa.
  const TUTEO = [
    "t[úu]", "te", "tus", "tu", "tienes", "quieres", "puedes", "necesitas",
    "contigo", "d[íi]game.*t[úu]",
  ].map((p) => new RegExp(`(?<![a-záéíóúüñ])${p}(?![a-záéíóúüñ])`, "i"));
  for (const [donde, txt] of delAsistente) {
    for (const re of TUTEO) {
      const m = String(txt).match(re);
      if (m)
        marca(
          donde,
          `tutea: «${m[0]}»`,
          "los mensajes del ASISTENTE van de usted — y este texto entra al prompt como ejemplo, así que el modelo lo copia",
          String(txt).slice(0, 110)
        );
    }
  }
  // Y que la regla siga escrita en el prompt, no solo en el ejemplo.
  const demo = fs.readFileSync(path.join(RAIZ, "lib", "demo.ts"), "utf8");
  if (!/USTED EN TODO EL MENSAJE/i.test(demo))
    marca("lib/demo.ts", "prompt de la demo", "perdió la regla de no mezclar tú y usted en la misma frase");

  // ⚠️ Y que nadie vuelva a escribir un mensaje del asistente SUELTO en la ruta de
  // la API. Ahí vivían dos disculpas que tuteaban ("¿Me lo repites?") y que este
  // guardián no veía, porque miraba la config y las burbujas pero no el endpoint.
  // Es la capa que siempre se olvida: la que envuelve.
  const ruta = fs.readFileSync(path.join(RAIZ, "app", "api", "demo", "route.ts"), "utf8");
  for (const m of soloVivo(ruta).matchAll(/reply:\s*"([^"]{12,})"/g)) {
    marca(
      "app/api/demo/route.ts",
      `mensaje del asistente escrito a mano: «${m[1].slice(0, 40)}…»`,
      "los textos que dice el asistente viven en lib/demo-config.ts, donde el guardián los revisa"
    );
  }
}

// ── 3b · La lista de servicios de la demo NO declara lo prohibido ────────────
// `lib/nicho.json` está fuera del barrido de arriba (lo excluye EXCLUIR, y con razón:
// es datos, no texto de página). El problema es que `demo.servicios` acaba DENTRO del
// prompt, inyectado con "resuelve dudas usando SOLO esta lista" (lib/demo.ts). Así que
// una lista sucia contradice los LÍMITES del mismo prompt, y gana la que el modelo lea
// más cerca de la pregunta.
//
// Lo que había el 2026-08-24: `desarrolladora` declaraba "unidades disponibles del
// desarrollo" y "avance de obra y fecha estimada de entrega" — los dos datos que el
// propio prompt prohíbe tres párrafos abajo — y `equipo` declaraba "estimación de renta
// y retorno", que es la línea roja 5 (promesas sobre el dinero de alguien).
//
// ⚠️ Los `chips` NO se revisan, a propósito: son preguntas del COMPRADOR, no cosas que
// el asistente diga. "¿Cuándo entregan?" es un chip legítimo — el mejor momento de la
// demo es ver el desvío elegante en vivo.
{
  const nicho = JSON.parse(fs.readFileSync(path.join(RAIZ, "lib", "nicho.json"), "utf8"));
  const PROHIBIDO = [
    [/precios?|cu[aá]nto cuesta/i, "precios"],
    [/unidades disponibles|disponibilidad|cu[aá]ntas unidades|quedan unidades/i, "disponibilidad"],
    [/fechas? (estimada )?de entrega|cu[aá]ndo entregan/i, "fechas de entrega"],
    [/plusval[ií]a|revaloriza|renta garantizada|retorno garantizado|estimaci[oó]n de (renta|retorno)/i, "promesas de rendimiento"],
  ];
  for (const g of nicho.giros ?? []) {
    for (const s of g.demo?.servicios ?? []) {
      for (const [re, que] of PROHIBIDO) {
        if (re.test(s))
          marca(
            `lib/nicho.json · giro "${g.key}"`,
            `servicio «${s}»`,
            `declara ${que} como tema en alcance, y esta lista entra en el prompt de la demo con "usando SOLO esta lista"`
          );
      }
    }
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
