// ============================================================================
// CONTACTO — Upcore AI (inmobiliario de preventa, sur de Florida)
//
// Los TEXTOS del sitio ya no viven aquí: se hicieron bilingües y viven en
// `lib/site-textos.ts`, en una tabla `Record<Idioma, TextosSitio>` que obliga a
// que español e inglés tengan las mismas claves. Aquí solo queda lo que NO
// depende del idioma — un número de teléfono es el mismo en los dos.
// ============================================================================

export { contenido, TS, type TextosSitio, type Punto } from "./site-textos";

export const CONTACT = {
  // Número de negocio de Upcore (EEUU): entra a la bandeja Chatwoot y al asistente IA.
  // En este nicho el +1 juega a favor: el cliente está en Florida y un número gringo es
  // lo normal (con clínicas mexicanas era justo al revés y por eso no se abrían).
  /** La base del enlace del BOT, sin texto. Una sola copia del número: el resto la usa. */
  whatsappBot: "https://wa.me/14244472698",
  whatsapp:
    "https://wa.me/14244472698?text=" +
    encodeURIComponent(
      "Hola Upcore AI, quiero que ningún comprador se me quede sin respuesta. ¿Me ayudan?",
    ),
  whatsappDisplay: "+1 424 447 2698",
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
  whatsappYael: "https://wa.me/17868871283",
  whatsappYaelDisplay: "+1 786 887 1283",
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
  return "https://wa.me/14244472698?text=" + encodeURIComponent(texto);
}
