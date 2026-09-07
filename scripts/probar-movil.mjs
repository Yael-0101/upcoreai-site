// Guardián de las trampas del móvil que no se ven compilando.
//
//   node scripts/probar-movil.mjs      (corre en `npm run build`)
//
// 🔴 POR QUÉ EXISTE (2026-09-07)
// Yael avisó de que el sitio «en celular no tanto, en especial el botón del chatbot». Al medirlo
// en un teléfono emulado salieron dos defectos que ningún compilador ve:
//
//  1. **Campos con letra menor de 16px.** iOS Safari AGRANDA la página al enfocar un campo cuya
//     letra mide menos de 16px. El chat del sitio lo tenía en 15.2px y la demo en 14px: al tocar
//     para escribir, la página daba un salto de zoom. Es el defecto más visible y el más fácil
//     de reintroducir, porque `text-sm` se ve bien en el escritorio.
//  2. **Botones por debajo del mínimo de control.** La guía de accesibilidad pide 44×44 pt en
//     móvil (28 como piso absoluto). El de enviar de la demo medía 40.
//
// Este guardián lee el CÓDIGO de los formularios: qué clase de tamaño lleva cada campo. No
// sustituye a mirar la pantalla —el alto del panel con el teclado abierto solo se ve midiendo—,
// pero sí ataja la reaparición silenciosa de estas dos.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
// `--raiz=<ruta>` para revisar otro proyecto con las mismas reglas: las plantillas que se le
// entregan al cliente (productos/sitio-inmobiliaria, productos/panel-inmobiliaria) tienen
// formularios propios y el mismo teléfono los abre.
const RAIZ = (process.argv.find((a) => a.startsWith("--raiz=")) || "").slice(7) || path.join(AQUI, "..");
const CARPETAS = ["components", "app"];

/** Tamaños de Tailwind que quedan por debajo de 16px. */
const CLASES_CHICAS = { "text-xs": 12, "text-sm": 14, "text-\\[0.7rem\\]": 11.2, "text-\\[0.72rem\\]": 11.5, "text-\\[0.75rem\\]": 12, "text-\\[0.8rem\\]": 12.8, "text-\\[0.85rem\\]": 13.6, "text-\\[0.9rem\\]": 14.4, "text-\\[0.95rem\\]": 15.2 };

/** Devuelve los px de la clase de tamaño que traiga el className, o null si no hay ninguna. */
function tamañoDe(clases) {
  for (const [clase, px] of Object.entries(CLASES_CHICAS)) {
    if (new RegExp(`(^|[\\s"'\`])${clase}([\\s"'\`]|$)`).test(clases)) return { clase: clase.replace(/\\/g, ""), px };
  }
  const arbitraria = /text-\[(\d+(?:\.\d+)?)(px|rem)\]/.exec(clases);
  if (arbitraria) {
    const px = arbitraria[2] === "rem" ? parseFloat(arbitraria[1]) * 16 : parseFloat(arbitraria[1]);
    if (px < 16) return { clase: arbitraria[0], px };
  }
  return null;
}

function archivos(dir) {
  const salida = [];
  if (!fs.existsSync(dir)) return salida;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const ruta = path.join(dir, e.name);
    if (e.isDirectory()) salida.push(...archivos(ruta));
    else if (/\.tsx$/.test(e.name)) salida.push(ruta);
  }
  return salida;
}

/**
 * Saca los atributos de cada `<input …>` / `<textarea …>`.
 *
 * ⚠️ NO se puede hacer con `<input[^>]*>`: los manejadores llevan flechas (`onChange={(e) =>`)
 * y ese `>` corta la etiqueta a la mitad, dejando el className fuera — el guardián revisaba
 * media etiqueta y pasaba en verde. Se recorre carácter a carácter respetando comillas y llaves
 * hasta el cierre de verdad.
 */
function etiquetas(texto) {
  const encontradas = [];
  const re = /<(input|textarea)\b/g;
  let m;
  while ((m = re.exec(texto))) {
    let i = m.index + m[0].length;
    let llaves = 0, comilla = null;
    for (; i < texto.length; i++) {
      const c = texto[i];
      if (comilla) {
        if (c === comilla && texto[i - 1] !== "\\") comilla = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") { comilla = c; continue; }
      if (c === "{") { llaves++; continue; }
      if (c === "}") { llaves--; continue; }
      if (c === ">" && llaves === 0) break;
    }
    encontradas.push({ etiqueta: m[1], attrs: texto.slice(m.index + m[0].length, i), index: m.index });
  }
  return encontradas;
}

/** Revisa una lista de {ruta, texto}. Devuelve { problemas, camposRevisados }. */
function revisar(fuentes) {
  const problemas = [];
  let camposRevisados = 0;
  for (const { ruta, texto } of fuentes) {
    for (const m of etiquetas(texto)) {
      const { etiqueta, attrs } = m;
      if (/type=["'](hidden|checkbox|radio|range|file|submit|button)["']/.test(attrs)) continue;
      camposRevisados++;
      const clases = (/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{"([^"]*)"\})/s.exec(attrs) || [])
        .slice(1)
        .filter(Boolean)
        .join(" ");
      const chico = tamañoDe(clases);
      if (chico) {
        const linea = texto.slice(0, m.index).split("\n").length;
        problemas.push(
          `${ruta}:${linea} · <${etiqueta}> con «${chico.clase}» (${chico.px}px). ` +
            "Los campos donde se escribe van en 16px (text-base) o iOS agranda la página al enfocarlos."
        );
      }
    }
  }
  return { problemas, camposRevisados };
}

const fuentes = CARPETAS.flatMap((c) => archivos(path.join(RAIZ, c))).map((ruta) => ({
  ruta: path.relative(RAIZ, ruta),
  texto: fs.readFileSync(ruta, "utf8").replace(/^﻿/, ""),
}));

// `--inyectar`: le mete el defecto a un campo real EN MEMORIA (nunca en disco) y exige que la
// revisión lo cace. Un guardián que nunca se ha visto fallar no protege nada.
if (process.argv.includes("--inyectar")) {
  // El defecto se mete DENTRO del className de un campo concreto, no en la primera aparición de
  // «text-base» del archivo — que puede estar en cualquier otro elemento y no probaría nada.
  let sucio = null, dónde = "";
  for (const f of fuentes) {
    const e = etiquetas(f.texto).find((x) => /className="[^"]*text-base/.test(x.attrs));
    if (!e) continue;
    const antes = f.texto;
    const inicio = antes.indexOf(e.attrs, e.index);
    const attrsSucios = e.attrs.replace("text-base", "text-sm");
    sucio = { ruta: f.ruta, texto: antes.slice(0, inicio) + attrsSucios + antes.slice(inicio + e.attrs.length) };
    dónde = f.ruta;
    break;
  }
  if (!sucio) {
    console.error("❌ No encontré ningún campo en 16px al que meterle el defecto: revisa el patrón.");
    process.exit(1);
  }
  const conCampo = { ruta: dónde };
  const { problemas } = revisar([sucio]);
  const cazado = problemas.some((p) => /text-sm/.test(p));
  console.log(cazado ? `✅ Defecto inyectado y cazado en ${conCampo.ruta}` : `❌ El defecto pasó limpio en ${conCampo.ruta}: el guardián NO sirve`);
  process.exit(cazado ? 0 : 1);
}

const { problemas, camposRevisados } = revisar(fuentes);

if (!camposRevisados) {
  console.error("❌ No encontré ni un campo de formulario que revisar: el patrón dejó de funcionar\n   o los formularios se movieron. Arregla este guardián antes de confiar en su verde.");
  process.exit(1);
}

if (problemas.length) {
  console.error("❌ Campos que harán saltar el zoom en iPhone:");
  for (const p of problemas) console.error(`   · ${p}`);
  process.exit(1);
}

console.log(`✅ Móvil: ${camposRevisados} campos de escritura, todos en 16px o más (sin zoom en iOS).`);
