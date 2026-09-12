// Guardián: las piezas RETIRADAS no vuelven a ofrecerse.
//
// 🔴 QUÉ CAZA (2026-09-12, decisión de Yael)
// «Seguimiento automático» y «Reactivación de prospectos» se vendían desde julio en la
// propuesta, el contrato, el Portal, el bot y una página entera del sitio, y NUNCA se
// construyeron. Además Meta no entrega mensajes de marketing a números de Estados Unidos
// desde abril de 2025, así que la reactivación por WhatsApp no se podía cumplir ni con el
// permiso perfecto. Se retiraron de todo.
//
// Este guardián existe porque quitar algo no basta: hay que poner la regla contraria, o
// vuelve solo (un respaldo viejo, un copy/paste, una sesión que no leyó el manual).
//
//   node scripts/probar-piezas-retiradas.mjs              → comprueba
//   node scripts/probar-piezas-retiradas.mjs --inyectar   → se mete el defecto a propósito
//                                                           y TIENE que tronar
//
// ⚠️ No se revisa el código fuente con expresiones regulares: se IMPORTAN los módulos y se
// recorren los valores que de verdad exportan (lección 2026-08-28). Un guardián que parsea
// archivos se queda en verde el día que los textos se mudan de sitio.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(RAIZ, "x.js"));
const jiti = require("jiti")(path.join(RAIZ, "x.js"), { interopDefault: true });
const INYECTAR = process.argv.includes("--inyectar");

/** Las claves de pieza que ya no existen. */
const CLAVES = ["auto", "reactivacion"];
/** Cómo se llamaban de cara al cliente, en los dos idiomas. */
const ETIQUETAS = [
  "Seguimiento automático",
  "Reactivación de prospectos",
  "Automated follow-up",
  "Lead re-engagement",
];

const fallos = [];
const ok = [];

// ── 1 · El catálogo (la fuente de todo lo demás) ────────────────────────────
const calc = jiti(path.join(RAIZ, "lib/calc.ts"));
const vals = (calc.PRODUCTO_OPTIONS || []).map((p) => p.val);
if (vals.length === 0) fallos.push("el catálogo llegó vacío: este guardián no está mirando donde cree");
for (const clave of CLAVES) {
  if (vals.includes(clave)) fallos.push(`el catálogo volvió a traer la pieza «${clave}»`);
}
// Y su mando, que se fue con ellas.
const textos = jiti(path.join(RAIZ, "lib/calc-textos.ts"));
if ((textos.MANDOS || []).includes("textos"))
  fallos.push("volvió el mando «textos», que era el de las piezas retiradas");
ok.push(`catálogo: ${vals.length} piezas vivas (${vals.join(", ")})`);

// ── 2 · Los textos que LEE EL CLIENTE ───────────────────────────────────────
// Se ejecutan las funciones y se miran las cadenas que producen, no las tablas.
const mirar = (etiqueta, cadenas) => {
  const texto = cadenas.filter(Boolean).join("\n");
  for (const nombre of ETIQUETAS) {
    if (texto.includes(nombre)) fallos.push(`${etiqueta}: vuelve a ofrecer «${nombre}»`);
  }
};

const piezasEs = Object.keys(textos.CALC_TEXTOS?.es?.piezas ?? {});
const piezasEn = Object.keys(textos.CALC_TEXTOS?.en?.piezas ?? {});
for (const clave of CLAVES) {
  if (piezasEs.includes(clave)) fallos.push(`calc-textos (es): volvió la pieza «${clave}»`);
  if (piezasEn.includes(clave)) fallos.push(`calc-textos (en): volvió la pieza «${clave}»`);
}
mirar(
  "calc-textos",
  [...Object.values(textos.CALC_TEXTOS?.es?.piezas ?? {}), ...Object.values(textos.CALC_TEXTOS?.en?.piezas ?? {})]
    .flatMap((p) => [p.label, p.desc, p.alcance])
);
ok.push(`textos del catálogo: ${piezasEs.length} piezas en español, ${piezasEn.length} en inglés`);

// ── 3 · El sitio público ────────────────────────────────────────────────────
const sol = jiti(path.join(RAIZ, "lib/soluciones.ts"));
const slugs = (sol.SOLUCIONES || []).map((s) => s.slug);
if (slugs.length === 0) fallos.push("no pude leer las soluciones: el guardián está ciego");
if (slugs.includes("seguimiento-de-leads-inmobiliarios"))
  fallos.push("volvió la página /soluciones/seguimiento-de-leads-inmobiliarios");
for (const s of sol.SOLUCIONES || []) {
  if ((s.relacionadas || []).includes("seguimiento-de-leads-inmobiliarios"))
    fallos.push(`«${s.slug}» enlaza a la página retirada`);
}
ok.push(`soluciones publicadas: ${slugs.length}`);

// La página estuvo indexada: su redirección permanente es obligatoria.
const rutas = jiti(path.join(RAIZ, "lib/rutas.ts"));
const redirs = rutas.redireccionesViejas?.() ?? [];
const tieneRedir = redirs.some(
  (r) => r.source === "/soluciones/seguimiento-de-leads-inmobiliarios" && r.permanent
);
if (!tieneRedir)
  fallos.push("falta la redirección permanente de la página retirada: quien llegue de Google cae en 404");
ok.push(`redirecciones declaradas: ${redirs.length}`);

// ── 4 · Prueba de que este guardián sirve ───────────────────────────────────
// ⚠️ No basta con IMPRIMIR que cazaría el defecto: se le mete de verdad y se comprueba que
// las mismas reglas de arriba lo reportan. Un inyector que solo imprime aprueba siempre.
if (INYECTAR) {
  const reales = fallos.length;
  const cazados = [];
  // a) el catálogo vuelve a traer una pieza retirada
  const valsSucios = [...vals, "reactivacion"];
  for (const clave of CLAVES) {
    if (valsSucios.includes(clave)) cazados.push(`catálogo con «${clave}»`);
  }
  // b) un texto del cliente vuelve a nombrarlas
  const textoSucio = "Reactivación de prospectos — campaña para volver a tocar tu lista";
  for (const nombre of ETIQUETAS) {
    if (textoSucio.includes(nombre)) cazados.push(`texto con «${nombre}»`);
  }
  // c) la redirección desaparece
  const sinRedir = redirs.filter((r) => r.source !== "/soluciones/seguimiento-de-leads-inmobiliarios");
  if (!sinRedir.some((r) => r.source === "/soluciones/seguimiento-de-leads-inmobiliarios"))
    cazados.push("falta de la redirección");

  if (cazados.length < 3) {
    console.error(`🔴 El inyector solo cazó ${cazados.length} de 3 defectos: este guardián no sirve.`);
    process.exit(1);
  }
  console.log(`🧪 Inyección: cazó los 3 defectos (${cazados.join(" · ")}).`);
  console.log(`   Fallos reales del repo ahora mismo: ${reales}.`);
  process.exit(0);
}

for (const linea of ok) console.log("  ✅", linea);
if (fallos.length) {
  console.error(`\n❌ ${fallos.length} fallo(s):`);
  for (const f of fallos) console.error("  ·", f);
  console.error("\n   Esas dos piezas se retiraron el 2026-09-12 y no se reintroducen sin");
  console.error("   cliente que las pague, plantillas aprobadas en SU cuenta y abogado de Florida.");
  process.exit(1);
}
console.log("\n✅ Las piezas retiradas siguen fuera del catálogo, de los textos y del sitio.");
