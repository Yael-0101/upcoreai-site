// Config de la DEMO del agente, compartida entre cliente y servidor. SIN secretos.
// La demo juega el rol del asistente de la CLÍNICA del prospecto atendiendo a un paciente.

export type Giro = "dental" | "estetica" | "medica";

export const DEMO_DEFAULTS = { clinica: "Clínica Demo", giro: "dental" as Giro };

export const GIROS: Record<
  Giro,
  { label: string; servicios: string[]; chips: string[] }
> = {
  dental: {
    label: "clínica dental",
    servicios: [
      "limpieza dental",
      "valoración general",
      "resinas y curaciones",
      "extracciones",
      "ortodoncia (brackets y alineadores)",
      "blanqueamiento",
      "endodoncia",
    ],
    chips: ["Quiero una cita", "¿Qué servicios tienen?", "¿Cuánto cuesta una limpieza?"],
  },
  estetica: {
    label: "clínica de medicina estética",
    servicios: [
      "valoración facial",
      "toxina botulínica",
      "rellenos con ácido hialurónico",
      "limpieza facial profunda",
      "tratamientos para manchas",
      "depilación láser",
    ],
    chips: ["Quiero una valoración", "¿Qué tratamientos tienen?", "¿Hacen botox?"],
  },
  medica: {
    label: "clínica médica",
    servicios: [
      "consulta general",
      "consulta de especialidad",
      "chequeos y estudios",
      "certificados médicos",
      "seguimiento de tratamientos",
    ],
    chips: ["Quiero una consulta", "¿Qué servicios tienen?", "¿Atienden urgencias?"],
  },
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

export function sanitizeGiro(raw?: string | null): Giro {
  return raw === "estetica" || raw === "medica" || raw === "dental" ? raw : DEMO_DEFAULTS.giro;
}

// Saludo inicial: lo pinta el CLIENTE al abrir el chat (cero costo de API).
export function demoGreeting(clinica: string): string {
  return `¡Hola! 👋 Soy el asistente de ${clinica}. Puedo resolver tus dudas o agendarte una cita en menos de un minuto. ¿En qué te ayudo?`;
}

// Límites (el servidor los aplica de verdad; el cliente solo los refleja en la UI).
export const DEMO_LIMITS = {
  maxTurnosUsuario: 15,
  maxCharsMensaje: 300,
  maxMensajesHistorial: 24,
};

// Mensaje cuando la demo descansa (sin llave, límite del mes agotado o error de API).
export const DEMO_FALLBACK =
  "El asistente de demostración está tomando un descanso 😅 Pero lo que acabas de ver es exactamente lo que tu clínica tendría contestando su WhatsApp las 24 horas. ¿Te enseñamos el tuyo en vivo? Agenda tu diagnóstico gratis.";

// Cierre amable al llegar al tope de turnos de la demo.
export const DEMO_CIERRE =
  "Hasta aquí llega la demostración 🙂 Imagina esta misma conversación, pero en el WhatsApp de tu clínica y con tu agenda real. Agenda tu diagnóstico gratis y te lo enseñamos funcionando con tus datos.";
