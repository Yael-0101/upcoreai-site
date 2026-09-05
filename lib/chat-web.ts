// ── Chat del sitio: reglas puras (sin red), para poder probarlas sin levantar nada ─────────
//
// El chat de upcoreai.com es EL MISMO agente de WhatsApp entrando por otra puerta (decisión de
// Yael, 2026-09-04: un solo cerebro, nunca un segundo bot). El sitio solo pinta mensajes: cada
// texto viaja a la puerta web de n8n, que llama al cerebro y guarda el historial por sesión.
// Aquí viven las reglas que protegen esa puerta: qué es una sesión válida, qué es un mensaje
// válido, y cuánto puede escribir un visitante. Los textos de respaldo por idioma también.

import type { Idioma } from "./idioma";

/** Id de sesión que genera el navegador: letras, dígitos y guiones, de 16 a 64 caracteres. */
export const RE_SESION = /^[a-zA-Z0-9-]{16,64}$/;

export const CHAT_LIMITES = {
  maxCaracteres: 600,
  /** Mensajes por sesión en un día: más que eso ya no es una plática, es alguien probando. */
  maxMensajesSesion: 40,
  /** Por dirección IP en 10 minutos (protege el tope de gasto de Anthropic ante un bot). */
  maxPorIp10min: 30,
} as const;

export function sesionValida(v: unknown): v is string {
  return typeof v === "string" && RE_SESION.test(v);
}

/** Devuelve el texto limpio, o null si no sirve (vacío, demasiado largo, no es texto). */
export function textoValido(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.replace(/\s+/g, " ").trim();
  if (!t || t.length > CHAT_LIMITES.maxCaracteres) return null;
  return t;
}

// Limitador en memoria por clave (IP o sesión). Vive lo que viva la instancia serverless: no es
// perfecto, pero frena a quien dispare en ráfaga, que es el único abuso que cuesta dinero.
type Ventana = { inicio: number; cuenta: number };
const ventanas = new Map<string, Ventana>();

export function permitido(clave: string, max: number, ventanaMs: number, ahora = Date.now()): boolean {
  const v = ventanas.get(clave);
  if (!v || ahora - v.inicio > ventanaMs) {
    ventanas.set(clave, { inicio: ahora, cuenta: 1 });
    return true;
  }
  v.cuenta += 1;
  return v.cuenta <= max;
}

/** Solo para pruebas: olvida todas las ventanas. */
export function _reiniciarLimites(): void {
  ventanas.clear();
}

/** Lo que ve el visitante si la puerta no contesta. Nunca un error técnico. */
export const CHAT_RESPALDO: Record<Idioma, string> = {
  es: "Se me fue la señal un momento 😅 ¿Me lo repite? Y si prefiere, escríbanos por WhatsApp con el botón de arriba: ahí le contesto igual.",
  en: "I lost the connection for a second 😅 Could you send that again? Or tap the WhatsApp button above and I'll answer you there.",
};

/** Cuando el visitante ya escribió demasiado: se le manda al WhatsApp, no se le corta a secas. */
export const CHAT_TOPE: Record<Idioma, string> = {
  es: "Ya platicamos bastante por aquí 🙂 Para seguir sin límite, escríbanos por WhatsApp con el botón de arriba: ahí retomo justo donde nos quedamos.",
  en: "We've covered a lot here 🙂 To keep going without limits, tap the WhatsApp button above and I'll pick up right where we left off.",
};
