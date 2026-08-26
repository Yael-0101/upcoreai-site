// «Nombrar una pieza para decir que NO la lleva» — la regla, sola y sin efectos.
//
// ============================================================================
// 🔴 POR QUÉ VIVE EN SU PROPIO ARCHIVO (2026-08-25)
//
// La escribí dentro de `probar-arranque.mjs` y el revisor del panel la importaba de
// ahí. Pero importar ese archivo lo EJECUTA ENTERO: cada corrida del revisor lanzaba
// el guardián completo del portal —867 casos— y, peor, si el guardián fallaba su
// `process.exit(1)` se llevaba por delante al revisor, que no tenía nada que ver.
//
// Es la regla de la casa que ya estaba escrita: lo que comparten un guardián y otra
// herramienta vive en un módulo que SOLO define funciones, sin efectos. El trabajo
// corre únicamente cuando se invoca el script.
// ============================================================================
//
// LA REGLA. Nombrar una pieza para avisar de que el cliente NO la tiene es correcto
// —"como tu proyecto no lleva el asistente de WhatsApp, no habría dónde leer lo que
// te contesten"— y sin esta excepción el guardián marcaba 12 combinaciones buenas.
//
// Va apretada a propósito, porque una excepción floja es un agujero:
//   · la negación tiene que ir DELANTE de la palabra y en la MISMA oración;
//   · a menos de 40 caracteres;
//   · y entre las dos, solo artículos — una coma o un "así que" delatan que la
//     negación era de otra cosa ("no lleva sitio web, así que el asistente escribe"
//     NO puede perdonar la palabra "asistente").

const NIEGA =
  /(?:no|sin)\s+(?:lo\s+|la\s+|le\s+)?(?:lleva|llevas|incluye|incluyes|tiene|tienes|compraste|contrataste|va a tener)|(?:does not|do not|doesn't|don't)\s+(?:include|have)/g;
const DISTANCIA_NEGACION = 40;
const SOLO_ARTICULOS = /^\s*(?:(?:el|la|los|las|tu|tus|un|una|de|del|the|your|a|an)\s+)*$/i;

export function perdonaPorNegacion(texto, palabra) {
  const oraciones = String(texto)
    .split(/(?<=[.!?;])\s+|\n+/)
    .map((o) => o.toLowerCase().trim())
    .filter(Boolean);
  return oraciones.some((o) => {
    const donde = typeof palabra === "string" ? o.indexOf(palabra) : o.search(palabra);
    if (donde < 0) return false;
    NIEGA.lastIndex = 0;
    for (let m; (m = NIEGA.exec(o)); ) {
      const fin = m.index + m[0].length;
      if (donde < fin || donde - fin > DISTANCIA_NEGACION) continue;
      if (SOLO_ARTICULOS.test(o.slice(fin, donde))) return true;
    }
    return false;
  });
}

/** Los casos que se parecen y no son lo mismo. Los usa el guardián para probarse. */
export const CASOS_NEGACION = [
  ["como tu proyecto no lleva el asistente de whatsapp, no te llega.", "asistente", true, "negar la pieza SÍ se perdona"],
  ["tu asistente no incluye llamadas.", "asistente", false, "si la negación es de otra cosa, NO se perdona"],
  ["tu asistente contesta a cualquier hora.", "asistente", false, "afirmarla nunca se perdona"],
  ["no incluye nada más. tu asistente contesta solo.", "asistente", false, "en otra oración no cuenta"],
  ["no lleva sitio web, así que el asistente escribe.", "asistente", false, "negar OTRA pieza no perdona ésta"],
  // ⚠️ El primer intento de este caso decía "does not include the whatsapp assistant"
  // buscando la palabra "assistant": entre la negación y la palabra quedaba "the
  // whatsapp", que NO son artículos, así que no se perdonaba. Y estaba bien que no se
  // perdonara — la regla es esa. Lo que estaba mal era el caso: los delatores buscan
  // la frase entera ("the assistant"), no la palabra suelta. Un caso de prueba
  // inventado que no se parece al texto real prueba otra cosa.
  ["since your project does not include the assistant, there is nowhere to read them.", "the assistant", true, "en inglés también se perdona la negación"],
  ["your assistant answers at any hour.", "your assistant", false, "en inglés, afirmarla tampoco se perdona"],
];
