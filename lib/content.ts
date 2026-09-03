// ============================================================================
// CONTACTO — Upcore AI (inmobiliario de preventa, sur de Florida)
//
// Los TEXTOS del sitio ya no viven aquí: se hicieron bilingües y viven en
// `lib/site-textos.ts`, en una tabla `Record<Idioma, TextosSitio>` que obliga a
// que español e inglés tengan las mismas claves. Aquí solo queda lo que NO
// depende del idioma — un número de teléfono es el mismo en los dos.
// ============================================================================

export { contenido, TS, type TextosSitio, type Punto } from "./site-textos";

// ─── LOS NÚMEROS, ESCRITOS UNA SOLA VEZ ───────────────────────────────────────
// Cada número de Upcore se escribe aquí y en ningún otro lado: los campos de CONTACT se
// DERIVAN de estas constantes. Antes el número del bot estaba tres veces dentro de este
// mismo archivo y cinco más repartidas por el sitio; al mudar el bot a un número de Miami
// (2026-09-03) cada copia era una oportunidad de anunciar el viejo. Lo vigila
// scripts/probar-contacto.mjs: fuera de este archivo, ningún número de Upcore va a mano.
//
// Solo dígitos, con la clave de país (11 dígitos para EE.UU.).
/** El BOT de WhatsApp (Cloud API oficial de Meta). Vive en la nube, jamás en un teléfono.
 *  🔄 2026-09-03: mudado del 424 (Los Ángeles) a un 786 (Miami-Dade, el condado de los
 *  prospectos). El 424 se dio de baja de la Cloud API ese mismo día por decisión de Yael:
 *  ya no contesta nadie ahí. (Los dígitos van SOLO en la constante de abajo: el guardián
 *  cuenta copias.) */
const DIGITOS_BOT = "17868872372";
/** La línea HUMANA de Yael (WhatsApp Business + llamadas). Nunca se conecta a una API. */
const DIGITOS_YAEL = "17868871283";

/** Números de Upcore que YA NO existen para el público: no pueden aparecer en ningún archivo del
 *  sitio (lo vigila scripts/probar-contacto.mjs). El primero es el bot viejo de Los Ángeles,
 *  dado de baja el 2026-09-03. Solo dígitos, con clave de país. */
export const DIGITOS_RETIRADOS = ["14244472698"];

/** "1AAABBBCCCC" → "+1 AAA BBB CCCC" (formato de EE.UU.; otro largo se muestra tal cual). */
function mostrar(digitos: string): string {
  if (digitos.length !== 11) return `+${digitos}`;
  return `+${digitos[0]} ${digitos.slice(1, 4)} ${digitos.slice(4, 7)} ${digitos.slice(7)}`;
}

export const CONTACT = {
  // Número de negocio de Upcore (EEUU): entra al asistente IA (el bot).
  // En este nicho el +1 juega a favor: el cliente está en Florida y un número gringo es
  // lo normal (con clínicas mexicanas era justo al revés y por eso no se abrían).
  /** La base del enlace del BOT, sin texto. */
  whatsappBot: `https://wa.me/${DIGITOS_BOT}`,
  whatsapp:
    `https://wa.me/${DIGITOS_BOT}?text=` +
    encodeURIComponent(
      "Hola Upcore AI, quiero que ningún comprador se me quede sin respuesta. ¿Me ayudan?",
    ),
  whatsappDisplay: mostrar(DIGITOS_BOT),
  /**
   * El número de YAEL, una persona. NO es el del asistente.
   *
   * Existe por un caso concreto (2026-08-17): el botón "Me interesa, hablemos por
   * WhatsApp" de las propuestas mandaba SIEMPRE al número del bot. En una
   * propuesta que Yael acaba de trabajar por teléfono, eso deja al prospecto más
   * caliente del embudo hablando con un robot. Ver `linkWhatsApp()` en
   * propuesta-copy.ts: el bot contesta las propuestas que él mismo generó; el
   * resto llega aquí.
   */
  /**
   * La línea HUMANA de Yael, la que ve el público.
   *
   * 🔴 Cambiada al +1 786 el 2026-08-28 (decisión de Yael). Antes era el **+1 424 447 2941**,
   * que es de **Los Ángeles** — herencia del nicho de clínicas. Desde el 26 de agosto Yael
   * prospecta y llama desde el 786 (Miami-Dade, el mismo condado que los prospectos), así que
   * el sitio publicaba un número distinto del que de verdad opera. Peor: si el WhatsApp
   * Business ya no vive en el 424, este botón llevaría a un número sin WhatsApp — que es
   * exactamente el defecto que le señalamos a tres prospectos por teléfono.
   *
   * ⚠️ Las propuestas YA ENVIADAS llevan el número congelado dentro de su snapshot: eso es a
   * propósito (el cliente no puede leer mañana algo distinto de lo que aceptó), pero significa
   * que las viejas siguen apuntando al 424.
   */
  whatsappYael: `https://wa.me/${DIGITOS_YAEL}`,
  whatsappYaelDisplay: mostrar(DIGITOS_YAEL),
  // (2026-07-23) Sin agendado de llamadas en el embudo de diagnóstico — decisión
  // de Yael: los leads entrantes ya nos conocen; el diagnóstico es solo sin llamada.
};

/** El primer mensaje de WhatsApp, en el idioma de quien lo abre. El número es el
 *  mismo; lo que cambia es el texto que le llega ya escrito. */
export function linkWhatsApp(idioma: "es" | "en"): string {
  const texto =
    idioma === "en"
      ? "Hi Upcore AI, I don't want any buyer of mine going unanswered. Can you help?"
      : "Hola Upcore AI, quiero que ningún comprador se me quede sin respuesta. ¿Me ayudan?";
  // El número sale de CONTACT.whatsappBot: aquí estaba escrito a mano por segunda vez, y una
  // segunda copia es justo lo que se desfasa el día que el bot cambia de número (2026-09-03).
  return `${CONTACT.whatsappBot}?text=` + encodeURIComponent(texto);
}
