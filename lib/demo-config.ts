// Config de la DEMO del agente, compartida entre cliente y servidor. SIN secretos.
// La demo juega el rol del asistente de la CLÍNICA del prospecto atendiendo a un paciente.

import nicho from "./nicho.json";

// Los giros ya NO se declaran aquí: salen de lib/nicho.json, la fuente única del nicho.
// Antes esta lista era una de CINCO copias del mismo concepto (aquí, CLINICA_OPTIONS en
// calc.ts, giroKey() en el panel, SCIAN_INCLUIDOS en prospección, y sanitizeGiro abajo),
// y se desfasaban en silencio.
export type Giro = string;

type GiroDemo = { label: string; servicios: string[]; chips: string[] };

/** Solo los giros que tienen guion de demo — no todos los del selector lo tienen. */
export const GIROS: Record<Giro, GiroDemo> = Object.fromEntries(
  nicho.giros.filter((g) => g.demo).map((g) => [g.key, g.demo as GiroDemo]),
);

/** Claves válidas para la demo, en orden. Las usa sanitizeGiro. */
export const GIROS_DEMO: Giro[] = Object.keys(GIROS);

export const DEMO_DEFAULTS = {
  clinica: nicho.demo.negocioDemo,
  giro: (GIROS[nicho.demo.giroPorDefecto] ? nicho.demo.giroPorDefecto : GIROS_DEMO[0]) as Giro,
};

// El nombre de la clínica viene de la URL (?c=...) y se interpola en el prompt:
// sanitización dura — largo corto y solo caracteres inofensivos.
export function sanitizeClinica(raw?: string | null): string {
  if (!raw) return DEMO_DEFAULTS.clinica;
  const limpio = raw
    .replace(/[^\p{L}\p{N} .,'&-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
  return limpio.length >= 2 ? limpio : DEMO_DEFAULTS.clinica;
}

// El giro llega del `?g=` de la URL: es texto NO confiable y se valida siempre contra la
// lista real de nicho.json. (Antes tenía los tres giros escritos a mano: al cambiar de nicho
// habría seguido aceptando "dental" y rechazando los nuevos, en silencio.)
export function sanitizeGiro(raw?: string | null): Giro {
  // 🔴 Se valida contra la LISTA de claves, no con `GIROS[raw]`.
  //
  // Una versión anterior hacía `GIROS[raw] ? raw : defecto`, y eso es una trampa: en
  // JavaScript, buscar una propiedad en un objeto normal también encuentra las heredadas
  // de Object.prototype. Con `?g=constructor` (o `__proto__`, `toString`, `valueOf`) la
  // comprobación daba verdadero, el giro inválido pasaba, y al armar el prompt reventaba
  // con "Cannot read properties of undefined". El código original —una lista blanca
  // literal— era inmune; la "mejora" lo empeoró.
  return raw && GIROS_DEMO.includes(raw) ? raw : DEMO_DEFAULTS.giro;
}

// Saludo inicial: lo pinta el CLIENTE al abrir el chat (cero costo de API).
export function demoGreeting(clinica: string): string {
  return `¡Hola! 👋 Soy el asistente de ${clinica}. Puedo resolver tus dudas o agendarte una visita en menos de un minuto. ¿En qué te ayudo?`;
}

// Límites (el servidor los aplica de verdad; el cliente solo los refleja en la UI).
export const DEMO_LIMITS = {
  maxTurnosUsuario: 15,
  maxCharsMensaje: 300,
  maxMensajesHistorial: 24,
};

// Mensaje cuando la demo descansa (sin llave, límite del mes agotado o error de API).
export const DEMO_FALLBACK =
  "El asistente de demostración está tomando un descanso 😅 Pero lo que acabas de ver es exactamente lo que tu inmobiliaria tendría contestando su WhatsApp las 24 horas. ¿Te enseñamos el tuyo en vivo? Haz tu diagnóstico gratis.";

// Cierre amable al llegar al tope de turnos de la demo.
export const DEMO_CIERRE =
  "Hasta aquí llega la demostración 🙂 Imagina esta misma conversación, pero en el WhatsApp de tu inmobiliaria y con tu agenda real. Haz tu diagnóstico gratis y te lo enseñamos funcionando con tus datos.";
