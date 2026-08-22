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
  whatsappYael: "https://wa.me/14244472941",
  whatsappYaelDisplay: "+1 424 447 2941",
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
