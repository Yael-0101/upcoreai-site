// Saca de un archivo .ts/.tsx SOLO el texto que una persona ve en pantalla.
//
// Vive aparte porque lo usan DOS guardianes (el del Portal de Arranque y el de la
// propuesta) y una copia pegada se desfasa: el día que uno aprenda a ver un caso
// nuevo, el otro se quedaría ciego. Es un módulo que solo define funciones — no hace
// nada al importarse.
//
// 🩹 NACIÓ CIEGO DOS VECES (2026-08-21), y por eso está escrito así:
//   1. Su filtro anti-ruido descartaba «Precio (MXN)» por parecer una clase de CSS.
//      Un filtro que se come la señal es peor que no tener filtro.
//   2. Extraía las cadenas con una expresión regular y, con varias por renglón,
//      emparejaba mal las comillas: en `{ icon: "📱", desc: "…compradores" }` capturaba
//      `, desc: ` y se comía la comilla que ABRÍA el texto de verdad.
//   Las dos veces salió limpio a la primera.

/** Quita comentarios de línea y de bloque: queda el código + el texto visible.
 *  ⚠️ Sin esto, un guardián se marca a sí mismo — los comentarios que explican un
 *  defecto contienen justo las palabras prohibidas, y esa alarma falsa esconde las
 *  de verdad. */
export const soloVivo = (s) =>
  s
    .split("\n")
    .map((l) => l.replace(/(^|\s)\/\/.*$/, "$1"))
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ");

/** Las cadenas de una línea, emparejando comillas DE VERDAD (no con regex). */
export function cadenasDe(linea) {
  const out = [];
  let i = 0;
  while (i < linea.length) {
    const c = linea[i];
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      let buf = "";
      while (j < linea.length) {
        if (linea[j] === "\\") {
          buf += linea[j + 1] ?? "";
          j += 2;
          continue;
        }
        if (linea[j] === c) break;
        buf += linea[j];
        j++;
      }
      if (j >= linea.length) break; // comilla sin cerrar en esta línea
      if (buf.length >= 4) out.push(buf);
      i = j + 1;
      continue;
    }
    i++;
  }
  return out;
}

/** El texto que de verdad ve una persona: cadenas y texto suelto de JSX. */
export function textosVisibles(codigo) {
  const out = [];
  codigo.split("\n").forEach((l, i) => {
    for (const txt of cadenasDe(l)) {
      // Se ignoran SOLO las que son claramente clases de CSS o rutas.
      if (/^[/#.]/.test(txt) || /^https?:/.test(txt)) continue; // rutas, clases y URLs
      if (/(rounded|border-|text-\[|bg-\[|grid-|flex-|px-|py-|mb-|mt-|sm:|md:|hover:|font-)/.test(txt)) continue;
      // Llaves de datos, no texto: una palabra suelta en minúsculas sin acentos no
      // es algo que nadie lea en pantalla (`servicios`, `duracion`, `clinica`…).
      // ⚠️ Los guiones cuentan: `no-perder-citas` y `recuperar-pacientes` son valores
      // que guarda el formulario —columnas de n8n que no se pueden renombrar—, no
      // frases. Marcarlos era una alarma falsa, y las alarmas falsas hacen que el
      // guardián se deje de leer.
      if (/^[a-z_][a-z0-9_-]*$/.test(txt)) continue;
      // Lo que va dentro de `${…}` es CÓDIGO, no texto: son nombres de variables
      // (`${clinica}`, `${p.lead.clinica}`) y marcarlos no dice nada de lo que el
      // cliente lee. Se quita antes de revisar, conservando el resto de la frase.
      const limpio = txt.replace(/\$\{[^}]*\}/g, " ").trim();
      if (limpio.length < 4) continue;
      out.push({ linea: i + 1, txt: limpio });
    }
    for (const m of l.matchAll(/>([^<>{}\n]{6,})</g)) {
      out.push({ linea: i + 1, txt: m[1].trim() });
    }
  });
  return out;
}

/** Frontera de palabra escrita a mano: `\b` no funciona tras vocal acentuada. */
export const palabraCompleta = (w) =>
  new RegExp(`(?<![a-záéíóúüñ0-9])(?:${w})(?![a-záéíóúüñ0-9])`, "i");
