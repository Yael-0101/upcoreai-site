// ============================================================================
// EN QUÉ IDIOMAS ATIENDE CADA PIEZA — el hecho, con su prueba. FUENTE ÚNICA.
//
// 🔴 POR QUÉ EXISTE. El 2026-08-22, al decidir que todo se vende bilingüe,
// apareció que la misma pieza se describía de dos formas distintas según dónde
// se leyera: `calc.ts` —que es la fuente de la propuesta Y DEL ACUERDO QUE SE
// FIRMA— decía que el agente de WhatsApp "responde en español", y la página de
// soluciones decía "español, inglés o portugués". Las dos las lee el mismo
// cliente, con un día de diferencia. Es la lección de siempre —dos canales que
// dicen lo mismo con textos distintos se desfasan sin dar error— aplicada a un
// eje que nadie había mirado: el idioma.
//
// ⚠️ ESTO NO ES UNA ASPIRACIÓN, ES UN INVENTARIO DE HECHOS COMPROBADOS. Cada
// línea lleva de dónde salió. Agregar un idioma aquí sin comprobarlo primero es
// exactamente cómo se le promete a un cliente algo que el producto no hace.
//
// Lo consume `scripts/probar-idiomas-producto.mjs`, en el prebuild. NADIE MÁS
// lo importa — y en particular NO lo importa `calc.ts`, que se espeja al panel
// y no puede arrastrar dependencias (ver verificar-calc-espejo.mjs).
// ============================================================================

/** Los idiomas que este archivo sabe nombrar. No es el `Idioma` del sitio: el
 *  sitio se publica en dos y el agente de WhatsApp atiende en tres. */
export type IdiomaProducto = "es" | "en" | "pt";

/** Cómo se dice cada idioma en los textos, para poder buscarlo. Sin acentos
 *  opcionales: se comparan en minúsculas y con los acentos que de verdad se
 *  escriben. */
export const NOMBRES: Record<IdiomaProducto, string[]> = {
  es: ["español", "spanish"],
  en: ["inglés", "ingles", "english"],
  pt: ["portugués", "portugues", "portuguese"],
};

/**
 * Idiomas que el producto NO habla, listados para poder cazarlos.
 *
 * 🔴 Existe por un hueco del propio guardián, encontrado al probarlo con un
 * defecto a propósito (2026-08-22). La comprobación buscaba solo los tres
 * idiomas conocidos, así que un texto que prometiera "español, inglés o
 * ALEMÁN" pasaba limpio: el guardián no sabía mirar lo que no esperaba. Un
 * verificador que solo reconoce lo correcto no detecta lo inventado.
 *
 * El criollo haitiano está en la lista aposta: en Miami es de los idiomas que
 * más tentación da prometer, y hoy no está comprobado en ningún producto.
 */
export const NO_LOS_HABLAMOS = [
  "alemán", "aleman", "german",
  "francés", "frances", "french",
  "italiano", "italian",
  "chino", "mandarín", "mandarin", "chinese",
  "ruso", "russian",
  "árabe", "arabe", "arabic",
  "japonés", "japones", "japanese",
  "coreano", "korean",
  "hindi",
  "criollo", "creole",
  "catalán", "catalan",
];

export type FichaIdiomas = {
  /** TODOS los idiomas en los que la pieza atiende de verdad. */
  idiomas: IdiomaProducto[];
  /**
   * Los que se prometen SIEMPRE, hasta en un rótulo de seis palabras. Son el
   * subconjunto de `idiomas` con el que se vende.
   *
   * ⚠️ Los dos niveles existen por un caso concreto, no para ablandar la regla.
   * El agente de WhatsApp atiende también en portugués (el comprador brasileño
   * pesa en Miami), pero meterlo en el rótulo corto —"Contesta en español e
   * inglés, a cualquier hora"— obliga a sacar "a cualquier hora", que es el
   * otro argumento de esa línea. El portugués sí va en el `alcance`, que es la
   * frase completa y la que acaba dentro del acuerdo.
   *
   * La regla que esto habilita NO es "se puede decir menos": es que un rótulo
   * corto puede callar un idioma SECUNDARIO, y ninguno de los dos puede callar
   * un principal ni inventarse uno que no esté en `idiomas`.
   */
  principales: IdiomaProducto[];
  /** Dónde se comprobó, y cuándo. Si no se puede escribir, no se puede afirmar. */
  prueba: string;
};

/**
 * La clave es el `val` de la pieza en `PRODUCTO_OPTIONS` (lib/calc.ts), más
 * `panel`, que no es una pieza sino un añadido.
 */
export const IDIOMAS_DE_PIEZA: Record<string, FichaIdiomas> = {
  agente: {
    idiomas: ["es", "en", "pt"],
    principales: ["es", "en"],
    prueba:
      "2026-08-22 · el prompt del bot (lib/demo.ts) trae la línea «Si te escriben " +
      "en inglés o en portugués, contesta en ese idioma y sigue todas estas reglas " +
      "igual». El modelo es Claude, que maneja los tres.",
  },
  "agente-basico": {
    idiomas: ["es"],
    principales: ["es"],
    prueba:
      "2026-08-28 · es una decisión de ALCANCE, no un límite del motor, y hay que " +
      "decirlo así: el modelo es el mismo (Claude) y sabe inglés y portugués. Lo que " +
      "NO se hace en esta pieza es el trabajo de atender en ellos — el guion, las " +
      "pruebas y el mantenimiento de cada idioma extra—, y por eso cuesta la mitad. " +
      "Su `alcance` lo dice de frente («no atiende en inglés ni portugués… para eso " +
      "está el agente completo») en lugar de fingir que no puede.",
  },
  voz: {
    idiomas: ["es", "en"],
    principales: ["es", "en"],
    prueba:
      "2026-08-22 · comprobado EN VIVO contra la API de Retell: los dos agentes " +
      "(el molde del cliente, agent_ba316e13…, y el de la demo, agent_88479b5a…) " +
      "tienen `language: [\"es-419\",\"en-US\"]`, que es su modo multilingüe, y sus " +
      "instrucciones dicen «Si te hablan en inglés, contesta en inglés». " +
      "⚠️ El respaldo del 2026-08-19 decía solo `es-419` y estaba VIEJO: la " +
      "configuración viva le gana al archivo. " +
      "⚠️ Lo que NO está comprobado es cómo SUENA en inglés (la voz es " +
      "cartesia-Hailey-Spanish-latin-america): ese veredicto es de oído y lo da Yael.",
  },
  web: {
    idiomas: ["es", "en"],
    principales: ["es", "en"],
    prueba:
      "2026-08-22 · CONSTRUIDO Y COMPROBADO. La plantilla " +
      "`productos/sitio-inmobiliaria` sirve `/` y `/en` con canonical propio, " +
      "hreflang en las dos direcciones y x-default; los textos del cliente van en " +
      "`{es,en}` (no compila si falta uno) y el armazón en `lib/i18n.ts`. Se montó " +
      "una firma de prueba, se compiló y se LEYÓ el sitio servido: " +
      "`scripts/leer-ingles.mjs` dio 0 de 2 páginas con español. Ese lector queda " +
      "en la plantilla y se corre antes de enseñarle el sitio a nadie.",
  },
  auto: {
    idiomas: ["es", "en"],
    principales: ["es", "en"],
    prueba:
      "2026-08-22 · el seguimiento lo redactan los mismos agentes, que ya detectan " +
      "el idioma del comprador. Los textos de plantilla se escriben en los dos.",
  },
  reactivacion: {
    idiomas: ["es", "en"],
    principales: ["es", "en"],
    prueba: "2026-08-22 · igual que el seguimiento: los mensajes se escriben en los dos.",
  },
  panel: {
    idiomas: ["es", "en"],
    principales: ["es", "en"],
    prueba:
      "2026-08-22 · CONSTRUIDO Y COMPROBADO. `productos/panel-inmobiliaria` lleva " +
      "botón de idioma con la preferencia guardada en galleta, todo el texto en " +
      "`lib/i18n.ts` y guardián (`npm run verificar`) que no deja compilar con una " +
      "frase escrita a mano. Se levantó y se pidieron las tres páginas en los dos " +
      "idiomas: cambian entera la interfaz y el formato de fecha " +
      "(sáb, 22 de ago, 5:00 p.m. · Sat, Aug 22, 5:00 PM).",
  },
};

/** Qué idiomas nombra un texto. Se usa para comprobar que ninguna descripción
 *  se quede corta respecto al hecho de arriba.
 *
 *  ⚠️ Las fronteras van A MANO. En JavaScript `\b` no reconoce las vocales
 *  acentuadas, así que `inglés\b` no coincide nunca y `da\b` sí coincide dentro
 *  de «agenda» — las dos formas de fallar, y las dos nos han costado un día. */
const suelta = (p: string) => new RegExp(`(?<![a-záéíóúüñ0-9])${p}(?![a-záéíóúüñ0-9])`);

export function idiomasNombrados(texto: string): IdiomaProducto[] {
  const t = texto.toLowerCase();
  const salida: IdiomaProducto[] = [];
  for (const clave of Object.keys(NOMBRES) as IdiomaProducto[]) {
    if (NOMBRES[clave].some((p) => suelta(p).test(t))) salida.push(clave);
  }
  return salida;
}

/** Idiomas que el texto promete y que no hablamos. Debería devolver siempre
 *  una lista vacía; si no, alguien está prometiendo algo que no existe. */
export function idiomasInventados(texto: string): string[] {
  const t = texto.toLowerCase();
  return NO_LOS_HABLAMOS.filter((p) => suelta(p).test(t));
}
