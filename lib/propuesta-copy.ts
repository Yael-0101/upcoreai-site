// Copy POR PIEZA de la propuesta pública (/p/[token]) — FUENTE ÚNICA.
// Vivía dentro de app/p/[token]/page.tsx (mismo movimiento que lib/acuerdo.ts).
// Se mueve aquí para que el guardián scripts/probar-propuesta.mjs pruebe EXACTAMENTE
// los textos que verá el cliente, pieza por pieza, sin montar React.
//
// LECCIÓN 2026-08-10: una propuesta de "solo sitio web" salió con la fila de
// "Costos de APIs", el paso de "la decisión de tu número" y el bloque de la demo
// del agente — el 90% de la plantilla era texto fijo que salía SIEMPRE. Cada bloque
// de aquí decide su texto según las piezas COTIZADAS del snapshot (v4: `piezas`;
// v3 y anteriores: se infieren de los labels de `incluye`).

export type PiezaClave = "web" | "agente" | "voz" | "auto" | "reactivacion" | "panel";

const CLAVES: PiezaClave[] = ["web", "agente", "voz", "auto", "reactivacion", "panel"];

// v3 no trae claves crudas: se infieren del label. "Agente de voz" se prueba ANTES
// que "Agente" — el startsWith ciego era el bug que le daba a la voz el checklist
// del número de WhatsApp.
export function inferPiezas(incluye: string[]): PiezaClave[] {
  const out: PiezaClave[] = [];
  for (const x of incluye ?? []) {
    if (x.startsWith("Agente de voz")) out.push("voz");
    else if (x.startsWith("Agente")) out.push("agente");
    else if (x.startsWith("Sitio")) out.push("web");
    else if (x.startsWith("Automatizaciones")) out.push("auto");
    else if (x.startsWith("Reactivación")) out.push("reactivacion");
    else if (x.startsWith("Dashboard") || x.startsWith("Panel")) out.push("panel");
  }
  return [...new Set(out)];
}

export function piezasDeSnapshot(snap: { piezas?: string[]; incluye: string[] }): PiezaClave[] {
  const v4 = (snap.piezas ?? []).filter((p): p is PiezaClave => (CLAVES as string[]).includes(p));
  return v4.length ? v4 : inferPiezas(snap.incluye ?? []);
}

const tiene = (p: PiezaClave[], ...claves: PiezaClave[]) => claves.some((c) => p.includes(c));

/** ¿Alguna pieza consume APIs/IA? Todo menos la web sola. */
export const usaApis = (p: PiezaClave[]) =>
  tiene(p, "agente", "voz", "auto", "reactivacion", "panel");

export const esWebSola = (p: PiezaClave[]) => p.length > 0 && p.every((x) => x === "web");

// ── Fila de costos variables del PlanCard ────────────────────────────────────
// El VALOR (rango en pesos) siempre sale de la calculadora congelada; aquí solo
// cambia el NOMBRE y la nota según qué lo genera de verdad.
export function filaCostos(p: PiezaClave[]): { k: string; n: string } {
  if (esWebSola(p))
    return {
      k: "Dominio y hosting (tuyos)",
      n: "Directo al proveedor y a tu nombre — sin margen de Upcore. En la práctica es poco: el dominio ronda $200–400 MXN al año.",
    };
  return {
    k: "Costos de APIs (tuyos)",
    n: "Directo a los proveedores, a tu nombre — sin margen de Upcore",
  };
}

// ── FAQ: la última entrada cambia por pieza ──────────────────────────────────
const FAQ_BASE = [
  {
    q: "¿Es difícil de usar? No soy de tecnología.",
    a: "Está pensado justo para eso: tú sigues trabajando como siempre y el sistema hace la parte pesada. Te entrego un video corto y una guía de 1 página; si algo no queda claro, me escribes y lo vemos.",
  },
  {
    q: "Ya tengo mi sistema / mi forma de trabajar.",
    a: "No se toca. Nos integramos a lo que ya usas (agenda, WhatsApp, Excel, software) — tus datos se quedan donde están y esto se encarga de lo que hoy nadie alcanza a hacer.",
  },
  {
    q: "¿De quién queda todo esto?",
    a: "Tuyo, al 100%. Las cuentas, el número, la página y el sistema quedan a tu nombre. Si un día no quieres seguir con Upcore, todo sigue siendo tuyo — nunca quedas amarrado.",
  },
  {
    q: "¿Y si no funciona como esperaba?",
    a: "Los primeros 30 días los ajustes van por mi cuenta hasta que quede como acordamos. Y si no te entrego lo acordado funcionando, te devuelvo tu anticipo.",
  },
  {
    q: "¿Los números de esta propuesta son reales?",
    a: "Son estimaciones conservadoras calculadas con los datos que TÚ nos diste (los supuestos están a la vista). Preferimos quedarnos cortos a prometerte de más.",
  },
];
const FAQ_APIS = {
  q: "¿Por qué los costos de APIs van aparte?",
  a: "Porque son tuyos y así lo ves todo transparente: pagas el consumo real directo al proveedor, sin margen escondido de Upcore. Suelen ser unos cuantos dólares al mes, con tope de gasto activado.",
};
const FAQ_DOMINIO = {
  q: "¿Por qué el dominio y el hosting van aparte?",
  a: "Porque son tuyos y así lo ves todo transparente: el dominio y el hosting quedan a tu nombre y los pagas directo al proveedor, sin margen escondido de Upcore. Es poco — el dominio ronda los $200 a $400 pesos al año — y así nadie te puede quitar tu página: la dirección es tuya.",
};
export const faq = (p: PiezaClave[]) => [...FAQ_BASE, esWebSola(p) ? FAQ_DOMINIO : FAQ_APIS];

// ── Línea de tiempo: el Día 1 y el paso de pruebas cambian por pieza ─────────
export function dia1Desc(p: PiezaClave[]): string {
  const partes = ["el checklist de tu clínica (15 min)"];
  if (tiene(p, "agente", "auto", "reactivacion")) partes.push("la decisión de tu número de WhatsApp");
  if (tiene(p, "voz")) partes.push("cómo quedará el desvío de tu teléfono (tu número no cambia)");
  if (tiene(p, "web")) partes.push("tus textos, fotos, colores y páginas de referencia para tu sitio");
  if (usaApis(p)) partes.push("las guías para crear tus cuentas — a TU nombre y con tus propios clics");
  else if (tiene(p, "web")) partes.push("tu dominio — a TU nombre, como todo lo demás");
  return `Un link privado donde haces tu parte a tu ritmo: ${partes.join(", ")}. Todo se guarda solo.`;
}

export function pruebasDesc(p: PiezaClave[]): string {
  if (tiene(p, "agente") && tiene(p, "voz"))
    return "Le escribes y le marcas como si fueras tu propio paciente, y ajustamos lo que pidas antes de salir en vivo.";
  if (tiene(p, "agente"))
    return "Lo usas como si fueras tu propio paciente y ajustamos lo que pidas antes de salir en vivo.";
  if (tiene(p, "voz"))
    return "Le marcas como si fueras tu propio paciente: haces la llamada, pides una cita y ajustamos lo que pidas antes de salir en vivo.";
  if (tiene(p, "web"))
    return "Recorres tu sitio completo en tu celular y en tu computadora, como un paciente que te encuentra por primera vez, y pides los cambios que quieras antes de publicarlo.";
  if (tiene(p, "auto"))
    return "Corremos el flujo completo con una cita de mentira: ves llegar los recordatorios y confirmaciones tal como los verán tus pacientes, y ajustamos lo que pidas.";
  if (tiene(p, "reactivacion"))
    return "Revisas y apruebas los mensajes con tu propia lista antes de que salga el primero — nada se manda sin tu visto bueno.";
  return "Lo pruebas con calma y ajustamos lo que pidas antes de darlo por entregado.";
}

// ── Nuestra parte ────────────────────────────────────────────────────────────
export function nuestraParte(p: PiezaClave[], lineaAgenda: string | null): string[] {
  const primera = esWebSola(p)
    ? "Diseñar y construir tu sitio completo, de punta a punta — estructura, textos y agenda de citas incluidos"
    : p.length === 1 && p[0] === "reactivacion"
      ? "Armar la campaña completa, de punta a punta — lista, mensajes y seguimiento"
      : "Construir el sistema completo, de punta a punta";
  const resto = [
    "Probarlo contigo hasta que quede como acordamos",
    "Capacitarte con un video corto + guía de 1 página",
    "La garantía: si no entrego lo acordado funcionando, te devuelvo tu anticipo",
    "30 días de ajustes después de la entrega, por mi cuenta",
  ];
  return lineaAgenda ? [primera, lineaAgenda, ...resto] : [primera, ...resto];
}

// La línea de agenda solo aplica a piezas que TOCAN la agenda. Para web-sola se
// dice en clave de sitio; para reactivación-sola no se dice nada.
export function lineaAgendaPorPieza(agendaHoy: string, p: PiezaClave[]): string | null {
  const a = (agendaHoy || "").trim();
  if (!a) return null;
  if (tiene(p, "agente", "voz", "auto", "panel")) {
    const software = a.match(/\(([^)]+)\)/)?.[1]?.trim();
    if (software)
      return `Integrarnos a tu ${software} — tus datos y tu expediente se quedan donde están`;
    if (/software|sistema/i.test(a))
      return "Integrarnos al sistema que ya usas — tus datos se quedan donde están";
    if (/papel|excel/i.test(a))
      return "Dejarte la agenda ordenada en un calendario digital (hoy la llevas en papel/Excel) — sin costo extra";
    return "Conectarnos a tu forma actual de agendar — sin obligarte a cambiar nada";
  }
  if (tiene(p, "web"))
    return "Conectar el botón de citas de tu sitio con tu forma actual de agendar — sin obligarte a cambiar nada";
  return null;
}

// ── Lo que NO necesitas ──────────────────────────────────────────────────────
const NO_NECESITAS_BASE = [
  "Saber de tecnología",
  "Cambiar tu software o tu forma de trabajar",
  "Contratar a alguien más",
  "Pagar todo por adelantado",
  "Compartir contraseñas por chat (eso jamás)",
];
export const noNecesitas = (p: PiezaClave[]) =>
  tiene(p, "web")
    ? [...NO_NECESITAS_BASE, "Saber de diseño ni redactar textos — eso lo armamos nosotros con lo que ya tienes"]
    : NO_NECESITAS_BASE;

// ── Tu parte, por CLAVE de pieza ─────────────────────────────────────────────
// Antes se matcheaba por label.startsWith y "Agente de voz" caía en "Agente":
// a un proyecto de voz se le pedía decidir su número de WhatsApp.
export const TU_PARTE: Record<PiezaClave, { t: string; min: string }[]> = {
  agente: [
    { t: "Contestar el checklist de tu clínica: servicios, precios, horarios y tu tono", min: "15 min" },
    { t: "Decidir qué número de WhatsApp usará el asistente — te explico la diferencia antes", min: "5 min" },
    { t: "Tus cuentas: te las creamos nosotros a tu nombre para que no batalles, o las creas tú con nuestro video — contraseñas por chat, jamás", min: "5–30 min" },
    { t: "Darme acceso a tu calendario o agenda", min: "5 min" },
    { t: "Probarlo como si fueras tu paciente antes de salir en vivo", min: "15 min" },
  ],
  voz: [
    { t: "Contestar el checklist de tu clínica: servicios, precios, horarios y tu tono", min: "15 min" },
    { t: "Decidir cómo quedará el desvío de llamadas — tu número no cambia, te explico antes", min: "5 min" },
    { t: "Tus cuentas: te las creamos nosotros a tu nombre para que no batalles, o las creas tú con nuestro video — contraseñas por chat, jamás", min: "5–30 min" },
    { t: "Darme acceso a tu calendario o agenda", min: "5 min" },
    { t: "Hacerle una llamada de prueba como si fueras tu paciente", min: "10 min" },
  ],
  web: [
    { t: "Pasarme los textos, fotos y logo que ya tengas de tu clínica", min: "20 min" },
    { t: "Tu lista de servicios con precios — los que quieras mostrar (pueden ser rangos o “desde”)", min: "15 min" },
    { t: "Tu paleta de colores, si tienes una — o el link de una página cuyos colores te gusten", min: "5 min" },
    { t: "1 a 3 páginas web que te gusten como referencia, y qué te gusta de cada una", min: "10 min" },
    { t: "Reseñas o testimonios de pacientes que quieras presumir (con su permiso)", min: "10 min" },
    { t: "Fotos de tu equipo y tus instalaciones — con las del celular basta, nosotros las acomodamos", min: "15 min" },
    { t: "Horarios, dirección, teléfono y redes, tal cual quieres que aparezcan", min: "5 min" },
    { t: "Tu dominio (o lo compramos juntos, a tu nombre)", min: "10 min" },
    { t: "Revisar el borrador y pedirme cambios", min: "15 min" },
  ],
  auto: [
    { t: "Darme acceso a tu calendario o agenda", min: "5 min" },
    { t: "Aprobar los textos de recordatorios y confirmaciones (van con tu tono)", min: "10 min" },
    { t: "Probar el flujo completo con una cita de mentira", min: "10 min" },
  ],
  reactivacion: [
    { t: "Sacar tu lista de pacientes inactivos — te digo exactamente cómo exportarla", min: "15 min" },
    { t: "Aprobar los mensajes de reactivación", min: "10 min" },
  ],
  panel: [
    { t: "Una revisión corta de avances para dejar tu panel a tu gusto", min: "15 min" },
  ],
};
export const TU_PARTE_GENERICA = [
  { t: "Contestar el checklist de tu clínica", min: "15 min" },
  { t: "Tus cuentas: te las creamos nosotros a tu nombre, o las creas tú con nuestro video", min: "5–30 min" },
  { t: "Probar el sistema antes de la entrega", min: "15 min" },
];

export function tuParte(p: PiezaClave[]): { t: string; min: string }[] {
  const items: { t: string; min: string }[] = [];
  const vistos = new Set<string>();
  for (const clave of ["voz", "agente", "web", "auto", "reactivacion", "panel"] as PiezaClave[]) {
    if (!p.includes(clave)) continue;
    for (const item of TU_PARTE[clave]) {
      if (vistos.has(item.t)) continue; // dedup entre piezas (ej. acceso al calendario)
      vistos.add(item.t);
      items.push(item);
    }
  }
  return items.length > 0 ? items : TU_PARTE_GENERICA;
}

// ── Demo y sección de pérdida ────────────────────────────────────────────────
/** La demo pública ES el agente de WhatsApp (chat): solo se invita si se cotizó.
 *  A un proyecto de voz-sola no se le manda a ESCRIBIRLE a algo que contesta llamadas. */
export const mostrarDemo = (p: PiezaClave[]) => p.includes("agente");

/** Números honestos: a una web-sola no se le restriega una "pérdida mensual" armada
 *  con puros estimados de fallback. Si el cliente SÍ declaró sus citas perdidas y su
 *  ticket, el número es suyo y se muestra. Para las demás piezas, igual que siempre. */
export function mostrarPerdida(
  p: PiezaClave[],
  n?: { perdidaMensual: number; citasEstimado: boolean; ticketEstimado: boolean } | null
): boolean {
  if (!n || !(n.perdidaMensual > 0)) return false;
  if (esWebSola(p) && (n.citasEstimado || n.ticketEstimado)) return false;
  return true;
}
