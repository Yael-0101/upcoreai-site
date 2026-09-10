// Los documentos que lee el cliente —propuesta, acuerdo y Portal de Arranque— TUTEAN.
//
// 🔴 De dónde sale esta regla (2026-09-10): Yael leyó la propuesta de un cliente y encontró
// que el bloque del boceto entero y una de las preguntas frecuentes hablaban de usted
// («Ábralo desde su celular y pruébelo», «Nada de eso nos lo dio usted») mientras el resto
// del documento tuteaba. Se lee como dos personas distintas escribiendo el mismo documento,
// justo donde le estás pidiendo que confíe. No lo veía ningún guardián porque todos miran
// QUÉ dice el texto, nunca cómo trata a quien lo lee.
//
// Vive aquí, en un módulo sin efectos, porque la regla es de los TRES documentos y una copia
// por guardián se desfasa sola. Ese fue justamente el otro hallazgo del mismo día: había
// cinco preguntas frecuentes duplicadas en propuesta-copy.ts que ya no leía nadie, y una era
// la del usted, con el texto viejo dentro.
//
// ⚠️ El chat y la demo del sitio SÍ hablan de usted, a propósito (lección 2026-08-24): esto
// no se aplica ahí.

// Frontera a mano, nunca `\b`: en JavaScript la «é» ya es un no-carácter y la frontera falla
// en silencio con media lengua española. La de ABRIR mira atrás; la de CERRAR, adelante.
const ANTES = "(?<![a-záéíóúüñ])";
const DESPUES = "(?![a-záéíóúüñ])";

// ⚠️ `usted(?:es)?`, NUNCA `ustedes?` — eso último significa «ustede» con la ese opcional,
// así que no caza «usted» y el guardián pasa en verde sobre el defecto. Se descubrió
// inyectando el texto real que estaba publicado; leyendo la regla se ve perfecta.
const USTED = new RegExp(`${ANTES}usted(?:es)?${DESPUES}`, "i");

// Los imperativos son la otra mitad: un bloque escrito en usted puede no contener nunca la
// palabra —el del boceto solo la tenía una vez, y traía tres imperativos—.
//
// Se miran SOLO las formas CON ENCLÍTICO pegado (véalo, ábralo, pruébelo, dígame). Dos
// motivos: llevan tilde por ser esdrújulas, así que son inconfundibles; y las formas sueltas
// («vea», «pruebe», «diga») son idénticas al subjuntivo, que es correcto en tuteo — «para que
// tu firma se vea» marcaría en rojo un texto perfecto. Es la regla de la casa de probar los
// dos lados: uno que debe marcar y uno correcto que se le parezca.
//
// La lista es corta y a sabiendas incompleta: está para cazar lo que de verdad se escribe en
// estos documentos, no para ser un diccionario. La señal segura es «usted».
const IMPERATIVOS = new RegExp(
  `${ANTES}(véa|ábra|pruébe|díga|mánde|páse|hága|escríba|lláme|muéstre|revíse|elíja|tóme|háble|fírme|acépte|envíe|indíque)(lo|la|le|los|las|me|nos|se)`,
  "i"
);

/** Devuelve la primera marca de usted que haya en el texto, o null. */
export function marcaDeUsted(texto) {
  const m = String(texto).match(USTED) || String(texto).match(IMPERATIVOS);
  return m ? m[0] : null;
}

/**
 * Recorre una tabla de textos EJECUTÁNDOLA (invoca las plantillas) y avisa de cada
 * texto que trate de usted. Nunca lee el archivo: media tabla son funciones y el
 * defecto puede vivir dentro de una de ellas.
 *
 * Devuelve { fallos, revisados } — quien llama decide qué hacer con ellos.
 */
export function revisarTuteo(tabla, raiz = "textos") {
  const fallos = [];
  let revisados = 0;
  const visto = new Set();

  function recorrer(v, ruta) {
    if (typeof v === "string") {
      revisados++;
      const marca = marcaDeUsted(v);
      if (marca) fallos.push(`[tuteo] ${ruta} trata de usted: «${marca}» en "${v.slice(0, 70)}…"`);
      return;
    }
    if (typeof v === "function") {
      // Se prueba con los argumentos que de verdad recibe: un nombre de firma o una cifra.
      for (const arg of ["Firma Demo", 1000]) {
        try {
          recorrer(v(arg), `${ruta}()`);
          return;
        } catch {
          /* prueba el siguiente */
        }
      }
      return;
    }
    if (v && typeof v === "object") {
      if (visto.has(v)) return;
      visto.add(v);
      for (const [k, hijo] of Object.entries(v)) recorrer(hijo, `${ruta}.${k}`);
    }
  }

  recorrer(tabla, raiz);
  return { fallos, revisados };
}
