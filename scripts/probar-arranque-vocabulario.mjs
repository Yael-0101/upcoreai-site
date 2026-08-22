// Guardián del VOCABULARIO del Portal de Arranque.
//
//   node scripts/probar-arranque-vocabulario.mjs   (corre en el prebuild)
//
// `probar-arranque.mjs` comprueba que a cada cliente le salgan los pasos de SUS
// piezas. Esto es distinto: comprueba que lo que LEE no venga del nicho anterior
// ni de otro país.
//
// 🔴 POR QUÉ EXISTE. El 2026-08-21, abriendo los cuatro portales de prueba uno por
// uno, aparecieron cinco fugas que ningún guardián veía porque el filtrado por
// piezas funcionaba perfecto:
//
//   · «Precio (MXN)» con ejemplo de $800 — pesos mexicanos a un cliente de Miami.
//   · «Duración · Ej. 45 min» — un condominio no dura 45 minutos.
//   · «Servicio» / «Tus servicios y precios» — una firma de preventa vende unidades.
//   · «Las citas que se agenden» — en este nicho son VISITAS.
//   · «~$110–220 MXN al mes» en el costo del hosting.
//   · «¿Atienden niños? Sí, desde 3 años» de ejemplo de preguntas frecuentes.
//
// Todas eran texto VISIBLE. Ninguna la habría encontrado leyendo el código: se
// cazaron abriendo el portal como lo abre el cliente.
//
// ⚠️ SE MIRA SOLO EL TEXTO VIVO, no los comentarios: este mismo archivo y los
// comentarios que explican los defectos contienen las palabras prohibidas, y un
// guardián que se marca a sí mismo es una alarma falsa que esconde las de verdad.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..");

const ARCHIVOS = [
  "components/ArranquePortal.tsx",
  "lib/arranque-copy.ts",
  "lib/arranque.ts",
  "app/arranque/[token]/page.tsx",
];

/** Quita comentarios de línea y de bloque: queda el código + el texto visible. */
const soloVivo = (s) =>
  s
    .split("\n")
    .map((l) => l.replace(/(^|\s)\/\/.*$/, "$1"))
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ");

/**
 * Cada regla mira SOLO dentro de cadenas entrecomilladas o de texto JSX, porque
 * lo que importa es lo que el cliente lee. Las llaves de datos (`servicios:`,
 * `duracion:`, `clinica:`) son nombres internos y NO se tocan: `clinica` es una
 * columna de n8n que no se puede renombrar por API.
 */
const REGLAS = [
  {
    id: "moneda",
    // La moneda del nicho es el dólar. Un precio en pesos delata el país viejo.
    patron: /(MXN|\bpesos\b)/i,
    porque: "el cliente paga en dólares: un precio en pesos es del mercado anterior",
  },
  {
    id: "vocabulario-clinicas",
    patron: /(?<![a-záéíóúñ])(paciente|pacientes|cl[ií]nica|cl[ií]nicas|consultorio|dentista|odont[oó]logo|doctora?)(?![a-záéíóúñ])/i,
    porque: "vocabulario del nicho de clínicas",
  },
  {
    id: "citas",
    // En este nicho el comprador agenda una VISITA al sales center, no una cita.
    patron: /(?<![a-záéíóúñ])(citas?)(?![a-záéíóúñ])/i,
    porque: 'en este nicho se dice "visita", no "cita"',
  },
  {
    id: "servicios",
    // Una firma de preventa vende desarrollos y unidades, no servicios.
    patron: /(?<![a-záéíóúñ])(servicios?)(?![a-záéíóúñ])/i,
    porque: 'una firma de preventa vende desarrollos o unidades, no "servicios"',
  },
  {
    id: "campos-de-cita",
    // ⚠️ Solo "duración". NO se busca "minutos": el portal dice legítimamente
    // «tu parte toma ~30 minutos» y «son ~10 minutos en videollamada». Una regla
    // que marcara eso sería un falso positivo, y un guardián que marca lo bueno
    // se deja de leer.
    patron: /(?<![a-záéíóúñ])(duraci[oó]n)(?![a-záéíóúñ])/i,
    porque: 'un condominio no tiene "duración" — eso era la duración de una cita',
  },
];

/**
 * Las cadenas de una línea, emparejando comillas DE VERDAD.
 *
 * ⚠️ La primera versión usaba una expresión regular (`"([^"]+)"`) y emparejaba mal
 * en cuanto había varias cadenas en el mismo renglón: en
 *   { val: "actual", icon: "📱", desc: "El que ya conocen tus compradores" }
 * capturaba `actual` y luego `, desc: ` — consumiendo la comilla que ABRÍA el texto
 * de verdad, que no se extraía nunca. El guardián se veía limpio porque era ciego.
 * Y el filtro que puse para callar ese `, desc: ` fue justo lo que escondió el fallo.
 */
function cadenasDe(linea) {
  const out = [];
  let i = 0;
  while (i < linea.length) {
    const c = linea[i];
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      let buf = "";
      while (j < linea.length) {
        if (linea[j] === "\\") {
          buf += linea[j + 1] ?? "";
          j += 2;
          continue;
        }
        if (linea[j] === c) break;
        buf += linea[j];
        j++;
      }
      if (j >= linea.length) break; // comilla sin cerrar en esta línea
      if (buf.length >= 4) out.push(buf);
      i = j + 1;
      continue;
    }
    i++;
  }
  return out;
}

/** Saca el texto que de verdad ve una persona: cadenas y texto suelto de JSX. */
function textosVisibles(codigo) {
  const out = [];
  const lineas = codigo.split("\n");
  lineas.forEach((l, i) => {
    for (const txt of cadenasDe(l)) {
      // ⚠️ Se ignoran SOLO las que son claramente clases de CSS o rutas.
      // La primera versión descartaba todo lo que no tuviera una palabra larga
      // entre espacios, y con eso se le escapaba «Precio (MXN)» — justo uno de los
      // defectos que este guardián existe para cazar. Un filtro de ruido que se
      // come la señal es peor que no tener filtro.
      if (/^[/#.]/.test(txt)) continue;
      if (/(rounded|border-|text-\[|bg-\[|grid-|flex-|px-|py-|mb-|mt-|sm:|md:|hover:|font-)/.test(txt)) continue;
      // ⚠️ LLAVES DE DATOS, NO TEXTO. `"servicios"` y `duracion:` son nombres
      // internos —y `clinica` es una columna de n8n que no se puede renombrar—,
      // así que marcarlos es una alarma falsa. Una palabra suelta en minúsculas
      // sin acentos no es algo que nadie lea en pantalla.
      if (/^[a-z_][a-z0-9_]*$/.test(txt)) continue;
      out.push({ linea: i + 1, txt });
    }
    // Texto suelto dentro de JSX: >Palabras aquí<
    for (const m of l.matchAll(/>([^<>{}\n]{6,})</g)) {
      out.push({ linea: i + 1, txt: m[1].trim() });
    }
  });
  return out;
}

let fallos = 0;
const problemas = [];

for (const rel of ARCHIVOS) {
  const ruta = path.join(RAIZ, rel);
  if (!fs.existsSync(ruta)) continue;
  const visibles = textosVisibles(soloVivo(fs.readFileSync(ruta, "utf8")));
  for (const { linea, txt } of visibles) {
    for (const r of REGLAS) {
      const m = txt.match(r.patron);
      if (m) problemas.push({ rel, linea, txt: txt.slice(0, 90), palabra: m[0], porque: r.porque });
    }
  }
}


// ── PARIDAD ENTRE ESPAÑOL E INGLÉS (2026-08-22) ──────────────────────────────
//
// El portal se lee en los dos idiomas. TypeScript ya obliga a que las dos tablas
// tengan las mismas claves; lo que NO puede comprobar es que el inglés esté de
// verdad en inglés, que salga lo mismo en los dos, y —lo que más importa aquí— que
// el idioma SE GUARDE: el cliente vuelve días después con el mismo link.
{
  const { createRequire } = await import("node:module");
  const require2 = createRequire(import.meta.url);
  // Sin caché: un guardián que lee el TypeScript compilado de hace un rato da luz
  // verde sobre código que ya no existe (lección del guardián de la propuesta).
  const jiti = require2("jiti")(fileURLToPath(import.meta.url), { cache: false, requireCache: false });
  const { TA } = jiti(path.join(RAIZ, "lib", "arranque-textos.ts"));
  const copy = jiti(path.join(RAIZ, "lib", "arranque-copy.ts"));

  const SOLO_ES = ["que", "para", "los", "las", "por", "con", "del", "una", "está", "todo", "tus", "tu"];
  const palabra = (w) => new RegExp(`(?<![a-záéíóúüñ0-9])${w}(?![a-záéíóúüñ0-9])`, "i");

  /** Todas las cadenas de un objeto, ejecutando las funciones con datos de mentira. */
  const textosDe = (v, ruta = "", out = []) => {
    if (typeof v === "string") { if (v.length > 10) out.push([ruta, v]); return out; }
    if (typeof v === "function") {
      try {
        const r = v(1, 2, "X");
        if (typeof r === "string") out.push([ruta + "()", r]);
      } catch { /* firmas distintas: se saltan */ }
      return out;
    }
    if (Array.isArray(v)) { v.forEach((x, i) => textosDe(x, `${ruta}[${i}]`, out)); return out; }
    if (v && typeof v === "object") for (const k of Object.keys(v)) textosDe(v[k], ruta ? `${ruta}.${k}` : k, out);
    return out;
  };

  // 1. Nada de español dentro de la tabla en inglés.
  for (const [ruta, txt] of textosDe(TA.en)) {
    const intrusas = SOLO_ES.filter((w) => palabra(w).test(txt));
    if (intrusas.length >= 2) {
      problemas.push({ rel: "arranque bilingüe", linea: 0, palabra: ruta, txt: txt.slice(0, 80),
        porque: `español dentro de la tabla en inglés ("${intrusas.join(", ")}")` });
    }
  }

  // 2. Misma ESTRUCTURA en las dos: si el inglés tuviera un paso, un tono o una
  //    idea de prueba de más o de menos, serían dos portales distintos.
  const PIEZAS = ["web", "agente", "voz", "auto", "reactivacion", "panel"];
  const combos = [];
  for (let m = 1; m < 1 << PIEZAS.length; m++) combos.push(PIEZAS.filter((_, i) => m & (1 << i)));
  if (TA.es.tonos.length !== TA.en.tonos.length) {
    problemas.push({ rel: "arranque bilingüe", linea: 0, palabra: "tonos", txt: "",
      porque: `${TA.es.tonos.length} en español y ${TA.en.tonos.length} en inglés` });
  }
  // ⚠️ Los `val` de los tonos son lo que se GUARDA: si cambian entre idiomas, el
  //    cliente elige "cálido" en inglés y se guarda otra cosa.
  for (let i = 0; i < Math.min(TA.es.tonos.length, TA.en.tonos.length); i++) {
    if (TA.es.tonos[i].val !== TA.en.tonos[i].val) {
      problemas.push({ rel: "arranque bilingüe", linea: 0, palabra: `tonos[${i}].val`, txt: "",
        porque: `el valor guardado cambia con el idioma: "${TA.es.tonos[i].val}" vs "${TA.en.tonos[i].val}"` });
    }
  }
  if (TA.es.demo.ideas.length !== TA.en.demo.ideas.length) {
    problemas.push({ rel: "arranque bilingüe", linea: 0, palabra: "demo.ideas", txt: "",
      porque: "distinto número de ideas de prueba" });
  }
  for (const piezas of combos) {
    const es = copy.copyHorarios(piezas, "es");
    const en = copy.copyHorarios(piezas, "en");
    for (const k of ["pideTono", "pideFaqs", "pideLogo"]) {
      if (es[k] !== en[k]) {
        problemas.push({ rel: "arranque bilingüe", linea: 0, palabra: `${piezas.join("+")} · ${k}`, txt: "",
          porque: "el idioma cambia QUÉ se le pide, no solo cómo se dice" });
      }
    }
  }

  // 3. EL IDIOMA SE GUARDA. Es lo que distingue a este portal de la propuesta y
  //    del acuerdo: no se lee de una sentada. Si solo viviera en la URL, el
  //    cliente volvería al día siguiente y lo encontraría en español.
  const arranque = fs.readFileSync(path.join(RAIZ, "lib", "arranque.ts"), "utf8");
  if (!/idioma\?:\s*"es"\s*\|\s*"en"/.test(arranque)) {
    problemas.push({ rel: "lib/arranque.ts", linea: 0, palabra: "idioma", txt: "",
      porque: "ArranqueDatos no guarda el idioma: al volver, el cliente lo encontraría en español" });
  }
  const portal = fs.readFileSync(path.join(RAIZ, "components", "ArranquePortal.tsx"), "utf8");
  if (!/setIdioma\(otro\)/.test(portal) || !/guardar\(conIdioma\)/.test(portal)) {
    problemas.push({ rel: "components/ArranquePortal.tsx", linea: 0, palabra: "cambiarIdioma", txt: "",
      porque: "el selector de idioma no guarda la elección" });
  }
}

if (problemas.length) {
  fallos = problemas.length;
  console.error(`❌ El Portal de Arranque le muestra al cliente ${problemas.length} texto(s) del nicho o del país anterior:\n`);
  for (const p of problemas) {
    console.error(`   ${p.rel}:${p.linea}  «${p.palabra}»`);
    console.error(`      "${p.txt}"`);
    console.error(`      → ${p.porque}\n`);
  }
  console.error("   (Si es un nombre de dato y no texto visible, muévelo fuera de una cadena");
  console.error("    o renómbralo: aquí solo se miran cadenas y texto de JSX.)");
} else {
  console.log("✅ El Portal de Arranque no le muestra al cliente vocabulario del nicho ni moneda anterior.");
}

process.exit(fallos ? 1 : 0);
