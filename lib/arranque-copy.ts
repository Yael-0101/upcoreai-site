// ============================================================================
// Portal de Arranque — TODO el texto que cambia según las piezas del proyecto.
//
// POR QUÉ EXISTE (lección 2026-08-16): el portal ya filtraba QUÉ PASOS se le
// muestran a cada cliente, pero los textos de adentro seguían escritos para el
// chatbot. Un cliente que solo compró su sitio web leía "con esto tu asistente
// responde con TU información real" y "¿cómo debe sonar tu asistente?" — dos
// frases sobre un producto que no compró. Lo cachó Yael mirando la pantalla.
//
// La causa de fondo era que el texto vivía suelto dentro del componente: cada
// pieza nueva obligaba a acordarse de revisar nueve pantallas a mano, y eso se
// rompe solo. Aquí el texto tiene UN dueño, y `scripts/probar-arranque.mjs`
// recorre todas las combinaciones de piezas para que no vuelva a colarse.
//
// REGLA AL AGREGAR UNA PIEZA NUEVA: se agrega aquí y se agrega su caso al
// guardián. Si el texto no depende de la pieza, no vive en este archivo.
// ============================================================================

import { TA } from "./arranque-textos";
import type { Idioma } from "./acuerdo-textos";

export type Pieza = "agente" | "voz" | "web" | "auto" | "reactivacion" | "panel";

export const TODAS_LAS_PIEZAS: Pieza[] = [
  "agente",
  "voz",
  "web",
  "auto",
  "reactivacion",
  "panel",
];

/**
 * Lista vacía = fila vieja que nunca se sembró con sus piezas. Se trata como
 * "todas", igual que en pasosVisibles(): a un proyecto del que no sabemos sus
 * piezas no se le esconde nada. Las dos funciones TIENEN que coincidir en esto,
 * o un portal mostraría el paso del número con el texto de un sitio web.
 */
export function normalizarPiezas(piezas: string[] | undefined | null): string[] {
  const p = piezas ?? [];
  return p.length === 0 ? [...TODAS_LAS_PIEZAS] : p;
}

const tiene = (p: string[], ...cuales: Pieza[]) => cuales.some((c) => p.includes(c));

// ── Familias de piezas ───────────────────────────────────────────────────────
// Nombradas por lo que COMPARTEN, no por el producto: así el texto se escribe
// una vez para todas las piezas que se comportan igual.

/** Piezas que conversan con el comprador en nombre de la inmobiliaria. */
export const hayAsistente = (p: string[]) => tiene(p, "agente", "voz");
/** Piezas que mandan mensajes por WhatsApp (necesitan número y textos). */
export const hayMensajes = (p: string[]) => tiene(p, "agente", "auto", "reactivacion");
export const hayWeb = (p: string[]) => tiene(p, "web");
export const hayVoz = (p: string[]) => tiene(p, "voz");
export const hayChat = (p: string[]) => tiene(p, "agente");

/** ¿Le pedimos el tono? Solo si algo de lo suyo le habla a un comprador. */
export const pideTono = (p: string[]) =>
  hayAsistente(p) || hayWeb(p) || hayMensajes(p);

/**
 * ¿A quién avisamos cuando un comprador pide hablar con una persona?
 *
 * 🔴 Solo con asistente (chat o voz): una web sola no conversa ni escala a nadie.
 *
 * Hasta el 2026-08-24 esto NO se preguntaba en ninguna pantalla, ni aquí ni en el
 * diagnóstico: `{{TELEFONO_HUMANO_ESCALACION}}` era un placeholder sin origen que
 * alguien tenía que resolver a mano antes de construir.
 *
 * ⚠️ Y tiene que ser un número DIRECTO, distinto del teléfono público de la firma:
 * con desvío de llamadas el agente de voz entra JUSTAMENTE porque ese número ya no
 * contestó, así que mandar el aviso ahí es un bucle.
 */
export const pideEscalacion = (p: string[]) => hayAsistente(p);

/**
 * ¿Le preguntamos qué hace su asistente con los precios?
 *
 * 🔄 CAMBIO DE POLÍTICA (decisión de Yael, 2026-08-25). Antes era una línea roja de la casa:
 * el asistente no daba precios, disponibilidad ni fechas, y punto. Ahora **lo elige el
 * cliente** — junto con el resto del comportamiento.
 *
 * ⚠️ Y lo que se elige es de DÓNDE sale el dato, nunca el dato en sí. Ese matiz es lo único
 * que evita el daño que la regla vieja prevenía: un precio tecleado en la configuración está
 * vencido en semanas y el asistente lo dice con toda seguridad. Por eso las opciones son
 * transferir / repetir lo que él ya publica / consultar su fuente en vivo — y en ninguna hay
 * un campo donde escribir un número.
 *
 * Solo con asistente: una web sola no conversa con nadie.
 */
export const pidePrecios = (p: string[]) => hayAsistente(p);

/**
 * ¿Le pedimos que elija la voz? Solo si compró el agente de voz.
 *
 * ⚠️ La elige OYENDO muestras, no leyendo etiquetas: el 19 de agosto casi ponemos en el
 * teléfono de un comprador una voz "latinoamericana" cuya muestra estaba en inglés — de su
 * español no habíamos oído una palabra. La etiqueta del proveedor dice la intención, no el
 * resultado.
 */
export const pideVoz = (p: string[]) => hayVoz(p);
/** Las preguntas frecuentes alimentan al asistente o llenan el sitio. */
export const pideFaqs = (p: string[]) => hayAsistente(p) || hayWeb(p);
export const pideLogo = (p: string[]) => tiene(p, "web", "panel");

/**
 * Cómo se llama, en cristiano, lo que le estamos construyendo. Se usa donde el
 * texto necesita nombrar su producto sin inventarle uno que no compró.
 */
export function loSuyo(piezas: string[], idioma: Idioma = "es"): string {
  const t = TA[idioma].suyo;
  const p = normalizarPiezas(piezas);
  const partes: string[] = [];
  if (tiene(p, "agente", "voz")) {
    partes.push(
      p.includes("agente") && p.includes("voz")
        ? t.asistente
        : p.includes("agente")
          ? t.asistenteWa
          : t.asistenteTel
    );
  }
  if (p.includes("web")) partes.push(t.sitio);
  if (p.includes("auto")) partes.push(t.recordatorios);
  if (p.includes("reactivacion")) partes.push(t.reactivacion);
  if (p.includes("panel")) partes.push(t.panel);
  return partes.length === 0 ? t.sistema : TA[idioma].unir(partes);
}

// ── 1 · Bienvenida ───────────────────────────────────────────────────────────

/**
 * Cuánto le va a tomar su parte. Se calcula de los pasos que SÍ va a ver: a un
 * cliente de solo-web decirle "una hora" lo asusta de gratis — son cuatro
 * pantallas cortas.
 */
export function copyBienvenida(piezas: string[], numPasos: number, idioma: Idioma = "es") {
  const t = TA[idioma];
  const p = normalizarPiezas(piezas);
  const duracion =
    numPasos <= 5 ? t.duraciones.corta : numPasos <= 7 ? t.duraciones.media : t.duraciones.larga;
  return { duracion, intro: t.bienvenida.intro(loSuyo(p, idioma)) };
}

// ── 2 · Servicios y precios ──────────────────────────────────────────────────

export function copyServicios(piezas: string[], idioma: Idioma = "es") {
  const t = TA[idioma].desarrollos;
  const p = normalizarPiezas(piezas);
  // ⚠️ El campo interno sigue llamándose `servicios` (es la llave del dato guardado
  // y una columna de n8n), pero lo que LEE el cliente habla de desarrollos.
  const q = t.q;
  if (hayAsistente(p)) return { q, hint: t.hintAsistente };
  if (hayWeb(p)) return { q, hint: t.hintWeb };
  if (hayMensajes(p)) return { q, hint: t.hintMensajes };
  return { q, hint: t.hintPanel };
}

// ── 3 · Horarios y estilo ────────────────────────────────────────────────────

export function copyHorarios(piezas: string[], idioma: Idioma = "es") {
  const t = TA[idioma].horarios;
  const p = normalizarPiezas(piezas);
  const asistente = hayAsistente(p);

  const q = asistente ? t.qAsistente : pideTono(p) ? t.qEstilo : t.qSolo;

  let hint: string;
  if (hayChat(p) && hayVoz(p)) hint = t.hintChatYVoz;
  else if (hayChat(p)) hint = t.hintChat;
  else if (hayVoz(p)) hint = t.hintVoz;
  else if (hayWeb(p)) hint = t.hintWeb;
  else if (hayMensajes(p)) hint = t.hintMensajes;
  else hint = t.hintSolo;

  const tonoLabel = asistente ? t.tonoAsistente : hayWeb(p) ? t.tonoSitio : t.tonoMensajes;
  // Solo se muestra si pideFaqs; aun así la etiqueta se calcula bien para las dos
  // familias, para que nadie herede una frase falsa al mover el gate.
  const faqsLabel = hayAsistente(p) ? t.faqsAsistente : hayWeb(p) ? t.faqsWeb : t.faqsAsistente;

  return {
    q,
    hint,
    tonoLabel,
    faqsLabel,
    pideTono: pideTono(p),
    pideFaqs: pideFaqs(p),
    pideLogo: pideLogo(p),
  };
}

// ── 4 · El número de WhatsApp ────────────────────────────────────────────────
// Aplica a las piezas que escriben por WhatsApp. No es lo mismo un asistente
// que CONVERSA (el número lo atiende él) que unos recordatorios que solo SALEN.

export function copyNumero(piezas: string[], idioma: Idioma = "es") {
  const t = TA[idioma].numero;
  const p = normalizarPiezas(piezas);
  if (hayChat(p)) {
    return {
      q: t.qChat,
      hint: t.hintChat,
      actual: t.actualChat,
      // ⚠️ Sin mencionar "tu sitio": este texto lo ve quien compró SOLO el agente, y
      // nombrarle una pieza que no compró es el defecto que caza probar-arranque.mjs.
      nuevo: t.nuevoChat,
      labelActual: t.labelActual,
      labelNuevo: t.labelNuevo,
    };
  }
  return {
    q: t.qMensajes,
    hint: t.hintMensajes,
    actual: t.actualMensajes,
    nuevo: t.nuevoMensajes,
    labelActual: t.labelActual,
    labelNuevo: t.labelNuevo,
  };
}

// ── 5 · La línea telefónica (solo agente de voz) ─────────────────────────────
// El paso que NO existía: al cliente de voz nunca se le preguntaba qué pasa con
// su teléfono, que es justo LA decisión de ese producto.

export function copyLinea(idioma: Idioma = "es") {
  const t = TA[idioma].linea;
  return {
    q: t.q,
    hint: t.hint,
    desvio: t.desvio,
    nuevo: t.nuevo,
    labelDesvio: t.labelDesvio,
    labelNuevo: t.labelNuevo,
  };
}

// ── 7 · Calendario ───────────────────────────────────────────────────────────

export function copyCalendario(piezas: string[], idioma: Idioma = "es") {
  const t = TA[idioma].calendario;
  const p = normalizarPiezas(piezas);
  const q = t.q;
  if (hayAsistente(p) && hayWeb(p)) return { q, hint: t.hintAmbos };
  if (hayAsistente(p)) return { q, hint: t.hintAsistente };
  if (hayWeb(p)) return { q, hint: t.hintWeb };
  return { q, hint: t.hintMensajes };
}

// ── 9 · Textos y estilo del sitio ────────────────────────────────────────────

export function copyTextos(piezas: string[], idioma: Idioma = "es") {
  const t = TA[idioma].textos;
  const p = normalizarPiezas(piezas);
  const web = hayWeb(p);
  const mensajes = hayMensajes(p);
  if (web && mensajes) return { q: t.qAmbos, hint: t.hintAmbos };
  if (web) return { q: t.qWeb, hint: t.hintWeb };
  return { q: t.qMensajes, hint: t.hintMensajes };
}

// ── 10 · Resumen ─────────────────────────────────────────────────────────────

export function etiquetaNumero(piezas: string[], idioma: Idioma = "es") {
  const t = TA[idioma].resumen;
  return hayChat(normalizarPiezas(piezas)) ? t.etiquetaNumeroChat : t.etiquetaNumeroMensajes;
}

export function etiquetaDemo(piezas: string[], idioma: Idioma = "es") {
  const t = TA[idioma].resumen;
  return hayChat(normalizarPiezas(piezas)) ? t.etiquetaDemoChat : t.etiquetaDemoOtro;
}

/** Cierre del portal: qué sigue de NUESTRO lado, dicho con sus piezas. */
export function copyFinal(piezas: string[], idioma: Idioma = "es") {
  const p = normalizarPiezas(piezas);
  return { seguimos: TA[idioma].resumen.seguimos(loSuyo(p, idioma)) };
}
