/**
 * QUIÉN NOS ESCRIBE: las cuatro respuestas a "¿cuál es tu papel en la firma?" — y cómo
 * se dice ese papel cuando va DENTRO de una frase.
 *
 * 🔴 POR QUÉ EXISTE ESTE ARCHIVO (lección 2026-09-07, pasada móvil del acuerdo)
 * El formulario guarda la ETIQUETA en español (así la lee Yael en el panel, que es lo
 * correcto), y el acuerdo la imprimía tal cual debajo del título. Salían dos defectos a
 * la vez:
 *
 *   1. En el acuerdo en INGLÉS se leía "Valentina Ríos, Soy el dueño/a · September 7" —
 *      español dentro del documento que la firma va a firmar.
 *   2. Y en español tampoco encajaba: "Soy el dueño/a" es la respuesta a una pregunta,
 *      no un cargo. Puesto donde va un cargo, se lee a plantilla mal rellenada.
 *
 * Es la lección de siempre: un dato metido en una plantilla tiene que CABER en la frase.
 *
 * Las etiquetas viven aquí (no en el formulario) para que lo que se GUARDA y lo que se
 * TRADUCE no puedan desfasarse: si mañana alguien cambia "Soy el dueño/a", el diccionario
 * cambia con él porque son el mismo objeto. El formulario les pone su icono y las traduce
 * para la pantalla; el valor guardado sigue siendo el de aquí.
 *
 * Este archivo NO importa nada: lo cargan el sitio, el armador del acuerdo y su guardián.
 */

export type Papel = {
  /** Lo que viaja en el formulario. */
  val: string;
  /** Lo que se GUARDA en el lead (y lo que lee Yael en el panel). Siempre en español. */
  label: string;
  /**
   * Cómo se dice ese papel dentro de una frase ("Fulana, dueña · 7 de septiembre").
   * Vacío = no se dice nada: "Fulana, Otro" no le aporta nada a nadie.
   */
  puesto: { es: string; en: string };
};

export const PAPELES: Papel[] = [
  { val: "dueno", label: "Soy el dueño/a", puesto: { es: "dueño/a", en: "Owner" } },
  {
    val: "asesor",
    label: "Soy asesor(a) de ventas",
    puesto: { es: "asesor(a) de ventas", en: "Sales advisor" },
  },
  {
    val: "admin",
    label: "Administración / operaciones",
    puesto: { es: "administración y operaciones", en: "Administration and operations" },
  },
  { val: "otro", label: "Otro", puesto: { es: "", en: "" } },
];

/**
 * El papel, listo para meterlo en una frase.
 *
 * Lo que no reconoce lo devuelve TAL CUAL: si alguien escribió su cargo de verdad
 * ("Director de ventas"), eso vale más que cualquier diccionario y no se toca. Es la
 * regla de la casa: lo que no sé volver a generar, lo conservo.
 */
export function puestoLegible(decisor: string, idioma: "es" | "en"): string {
  const crudo = (decisor || "").trim();
  if (!crudo) return "";
  const papel = PAPELES.find((p) => p.label.toLowerCase() === crudo.toLowerCase());
  if (!papel) return crudo;
  return papel.puesto[idioma];
}
