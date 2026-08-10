// Prueba del copy POR PIEZA de la propuesta pública: TODAS las combinaciones.
//
// LECCIÓN 2026-08-10: una propuesta de "solo sitio web" salió con la fila de
// "Costos de APIs", el paso de "la decisión de tu número" y la invitación a la
// demo del agente — bloques fijos que salían siempre. Aquí se comprueba, para
// cada combinación de piezas, que NINGÚN texto de una pieza ausente se cuele, y
// (los dos casos de la lección de los verificadores) que los textos LEGÍTIMOS de
// cada pieza sí aparecen cuando la pieza está cotizada — un guardián demasiado
// bruto que se "arreglara" borrando textos buenos también fallaría aquí.
//
// Correr con:  node scripts/probar-propuesta.mjs   (corre en el prebuild)

import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const jiti = require("jiti")(fileURLToPath(import.meta.url));

const C = jiti(path.join(AQUI, "..", "lib", "propuesta-copy.ts"));

/** Todos los subconjuntos NO vacíos. */
function subconjuntos(lista) {
  const salida = [];
  for (let mascara = 1; mascara < 1 << lista.length; mascara++) {
    salida.push(lista.filter((_, i) => mascara & (1 << i)));
  }
  return salida;
}

// Literales de la página que el módulo no genera (viven en el JSX): se prueban
// aquí tal cual, gateados por los mismos booleanos que usa la página.
const LITERAL_DEMO =
  "¿Quieres ver el agente en acción antes de decidir? Pruébalo tú mismo aquí — juega a ser tu propio paciente.";
const LITERAL_PERDIDA = "Lo que te está costando seguir igual · que hoy se van cada mes";

const DECLARADOS = { perdidaMensual: 12124, citasEstimado: false, ticketEstimado: false };
const ESTIMADOS = { perdidaMensual: 12124, citasEstimado: true, ticketEstimado: false };

/** Todo el texto visible que la página armaría para estas piezas. */
function textoDe(piezas, numeros) {
  const partes = [];
  const fc = C.filaCostos(piezas);
  partes.push(fc.k, fc.n);
  for (const f of C.faq(piezas)) partes.push(f.q, f.a);
  partes.push(C.dia1Desc(piezas), C.pruebasDesc(piezas));
  // Las tres variantes de agenda, para cubrir todas las ramas de la línea.
  for (const agenda of ["", "Un software o sistema (Dentalink)", "papel y libreta"]) {
    partes.push(...C.nuestraParte(piezas, C.lineaAgendaPorPieza(agenda, piezas)));
  }
  partes.push(...C.noNecesitas(piezas));
  for (const it of C.tuParte(piezas)) partes.push(it.t);
  if (C.mostrarDemo(piezas)) partes.push(LITERAL_DEMO);
  if (C.mostrarPerdida(piezas, numeros)) partes.push(LITERAL_PERDIDA);
  return partes.join("\n");
}

const fallos = [];
let casos = 0;

// ── 1. Ninguna combinación deja pasar texto de una pieza ausente ──────────────
for (const sub of subconjuntos(["web", "agente", "voz", "auto", "reactivacion"])) {
  for (const conPanel of [false, true]) {
    casos++;
    const piezas = conPanel ? [...sub, "panel"] : sub;
    const etiqueta = `[${piezas.join("+")}]`;
    const texto = textoDe(piezas, DECLARADOS);
    const bajo = texto.toLowerCase();
    const t = (...c) => c.some((x) => piezas.includes(x));

    const prohibidos = [];
    if (!t("agente")) prohibidos.push("juega a ser tu propio paciente", "agente en acción");
    if (!t("agente", "auto", "reactivacion"))
      prohibidos.push("número de whatsapp", "decisión de tu número");
    if (!C.usaApis(piezas)) prohibidos.push("costos de apis", "crear tus cuentas");
    if (!t("voz")) prohibidos.push("desvío");
    if (!t("web")) prohibidos.push("paleta", "tu dominio", "dominio y hosting", "páginas web que te gusten");

    for (const p of prohibidos) {
      if (bajo.includes(p)) fallos.push(`${etiqueta} contiene texto de pieza ausente: "${p}"`);
    }
  }
}

// ── 2. El caso que Yael VIO salir mal: web-sola con números estimados ─────────
casos++;
{
  const texto = textoDe(["web"], ESTIMADOS).toLowerCase();
  for (const p of ["costos de apis", "decisión de tu número", "juega a ser tu propio paciente"]) {
    if (texto.includes(p)) fallos.push(`[web·estimados] la propuesta que salió mal seguiría saliendo: "${p}"`);
  }
  if (C.mostrarPerdida(["web"], ESTIMADOS))
    fallos.push("[web·estimados] muestra la pérdida mensual armada con fallbacks");
  if (!texto.includes("dominio y hosting"))
    fallos.push("[web·estimados] no muestra la fila de dominio y hosting");
  if (!texto.includes("paleta"))
    fallos.push('[web·estimados] "Tu parte" de web no pide la paleta de colores');
  if (!texto.includes("páginas web que te gusten"))
    fallos.push('[web·estimados] "Tu parte" de web no pide las referencias');
}

// ── 3. El caso PARECIDO y correcto (que nadie "arregle" el guardián borrando) ─
casos++;
{
  if (!C.mostrarPerdida(["web"], DECLARADOS))
    fallos.push("[web·declarados] esconde la pérdida aunque los números son SUYOS");
  const agente = textoDe(["agente"], DECLARADOS).toLowerCase();
  for (const p of ["costos de apis", "número de whatsapp", "juega a ser tu propio paciente"]) {
    if (!agente.includes(p)) fallos.push(`[agente] perdió su texto legítimo: "${p}"`);
  }
}

// ── 4. Regresión voz vs agente (el startsWith que los confundía) ──────────────
casos++;
{
  const voz = C.tuParte(["voz"]).map((x) => x.t).join("\n").toLowerCase();
  if (voz.includes("número de whatsapp"))
    fallos.push('[voz] "Tu parte" le pide decidir un número de WhatsApp (bug del startsWith)');
  if (!voz.includes("desvío")) fallos.push('[voz] "Tu parte" no habla del desvío de llamadas');
  const inferVoz = C.inferPiezas(["Agente de voz 24/7 que contesta el teléfono"]);
  if (String(inferVoz) !== "voz") fallos.push(`inferPiezas confunde la voz: ${inferVoz}`);
  const inferAg = C.inferPiezas(["Agente de citas por WhatsApp"]);
  if (String(inferAg) !== "agente") fallos.push(`inferPiezas confunde al agente: ${inferAg}`);
}

// ── 5. piezasDeSnapshot: v4 manda; v3 infiere de labels ───────────────────────
casos++;
{
  const v4 = C.piezasDeSnapshot({ piezas: ["web"], incluye: ["Agente de citas"] });
  if (String(v4) !== "web") fallos.push(`v4 no manda sobre los labels: ${v4}`);
  const v3 = C.piezasDeSnapshot({ incluye: ["Sitio web con agenda", "Dashboard de control"] });
  if (String(v3) !== "web,panel") fallos.push(`v3 no infiere bien de los labels: ${v3}`);
}

// ── Veredicto ─────────────────────────────────────────────────────────────────
console.log(`Casos probados: ${casos}`);
if (fallos.length) {
  console.log(`\n❌ ${fallos.length} fallo(s):\n`);
  for (const f of fallos.slice(0, 25)) console.log("  ·", f);
  if (fallos.length > 25) console.log(`  ... y ${fallos.length - 25} más`);
  process.exit(1);
}
console.log("✅ El copy de la propuesta respeta las piezas cotizadas en todas las combinaciones.");
