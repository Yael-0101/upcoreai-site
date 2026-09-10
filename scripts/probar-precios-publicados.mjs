// Guardián: los precios que el SITIO publica son los del catálogo, y están completos.
//
//   node scripts/probar-precios-publicados.mjs   (corre en el prebuild)
//
// 🔴 POR QUÉ EXISTE (2026-08-28). El catálogo vive en `lib/calc.ts`, que es la fuente única —
// pero la página /precios y un artículo del blog repetían los precios A MANO, en español y en
// inglés, sin que nadie comparara. Al crear el escalón de entrada (`agente-basico`, $3,000)
// las cuatro copias se quedaron viejas. El sitio compilaba, se veía bien y mentía.
//
// ⚠️ NO SE PARSEA EL CÓDIGO FUENTE: se IMPORTAN los módulos y se recorren los textos que de
// verdad exportan. La primera versión buscaba cadenas entre comillas con una expresión
// regular y **no vio ni uno solo de los textos del blog** — pasaba en verde dejando dos
// idiomas sin vigilar, que es peor que no tener guardián. Es la regla de la casa: el
// guardián no revisa la tabla, ejecuta y mira lo que sale.
//
// Se comprueban LAS DOS DIRECCIONES:
//   1. que ninguna pieza del catálogo falte en una lista de precios publicada, y
//   2. que ninguna lista publique una cifra que ya NO exista en el catálogo — el defecto
//      silencioso, un precio viejo que sobrevive a un cambio.
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..");
const require = createRequire(path.join(RAIZ, "x.js"));
const jiti = require("jiti")(path.join(RAIZ, "x.js"), { interopDefault: true });

const { PRODUCTO_OPTIONS, PANEL_ADICIONAL, DESCUENTO_PAQUETE } = jiti(path.join(RAIZ, "lib", "calc.ts"));

const comoSeEscribe = (n) => "$" + n.toLocaleString("en-US");
const PRECIOS = new Set([...PRODUCTO_OPTIONS.map((p) => p.setupUSD), PANEL_ADICIONAL.setupUSD].map(comoSeEscribe));

/** Todo texto que exporte un módulo, venga de donde venga dentro del objeto. */
function textosDe(valor, salida = []) {
  if (typeof valor === "string") salida.push(valor);
  else if (Array.isArray(valor)) for (const v of valor) textosDe(v, salida);
  else if (valor && typeof valor === "object") for (const v of Object.values(valor)) textosDe(v, salida);
  return salida;
}

const MODULOS = [
  ["lib/paginas-textos.ts", jiti(path.join(RAIZ, "lib", "paginas-textos.ts"))],
  ["lib/blog.ts", jiti(path.join(RAIZ, "lib", "blog.ts"))],
];

const fallos = [];
let listas = 0;

for (const [rel, mod] of MODULOS) {
  for (const frase of textosDe(mod)) {
    // Una "lista de precios" es una frase con TRES o más cifras en dólares: nadie escribe
    // eso por accidente, así que las encuentra solas y no hay que apuntarlas a mano.
    // ⚠️ La cifra termina en DÍGITO: con `[\d,]+` la coma que separa la frase se colaba
    // dentro ("$3,000,") y el guardián marcaba precios correctos.
    const cifras = [...frase.matchAll(/\$[\d,]*\d/g)].map((x) => x[0]);
    if (cifras.length < 3) continue;
    listas++;

    for (const c of new Set(cifras)) {
      if (!PRECIOS.has(c)) {
        fallos.push(`${rel}: publica ${c}, que NO es ningún precio del catálogo — ¿quedó de una versión anterior?`);
      }
    }
    for (const p of PRODUCTO_OPTIONS) {
      if (!frase.includes(comoSeEscribe(p.setupUSD))) {
        fallos.push(`${rel}: una lista de precios no menciona ${comoSeEscribe(p.setupUSD)} (${p.label})`);
      }
    }
    const pct = Math.round(DESCUENTO_PAQUETE * 100);
    if (/segunda pieza|second piece/i.test(frase) && !frase.includes(`${pct}%`)) {
      fallos.push(`${rel}: dice lo de la segunda pieza pero no el ${pct}% que marca DESCUENTO_PAQUETE`);
    }
  }
}

// Si un día los textos se mueven de archivo, este guardián se quedaría mirando al vacío y
// pasaría en verde. Antes que eso, se planta: son cuatro listas conocidas (dos páginas ×
// dos idiomas, y dos del blog). Menos de eso significa que dejó de ver algo.
const MINIMO = 4;
if (listas < MINIMO) {
  console.error(
    `\n🔴 Solo encontré ${listas} lista(s) de precios y esperaba al menos ${MINIMO} ` +
      `(/precios y el blog, en español y en inglés).\n   O los textos se movieron, o este guardián dejó de verlos: ` +
      `en cualquier caso ahora mismo NO está vigilando y hay que arreglarlo, no ignorarlo.`
  );
  process.exit(1);
}

// ── El otro eje: que la página de precios de verdad los ENSEÑE ────────────────────────────
// 🔴 2026-09-10. Este guardián vigilaba que ninguna lista MINTIERA, y por eso pasó meses en
// verde con un defecto peor: /precios no enseñaba ni una cifra. Prometía «cada pieza tiene un
// precio cerrado, lo ves abajo» y para verlas había que terminar el cuestionario de la
// calculadora — mientras los datos estructurados SÍ se los daban a Google. Y el guion de
// llamadas le dice al prospecto «está publicado en nuestra página», así que Yael afirmaba por
// teléfono algo que no era verdad.
// «No mentir» y «no faltar» son dos cosas distintas, y una medida que solo mira una de las
// dos da la falsa sensación de estar cubierta.
{
  const fs = await import("node:fs");
  const COMPONENTE = path.join(RAIZ, "components", "paginas", "Precios.tsx");
  const src = fs.readFileSync(COMPONENTE, "utf8");

  // Que la tabla salga del CATÁLOGO. No se comprueba el contenido leyendo el JSX (eso sería
  // parsear código fuente, que ya nos falló una vez): se comprueba el ENGANCHE a la fuente
  // única, que es lo único que se puede ver sin levantar el sitio. Que las cifras salgan
  // bien en pantalla lo mira scripts/probar-produccion.mjs contra la página servida.
  // ⚠️ Se exige el USO, no la mención. La primera versión buscaba `PRODUCTO_OPTIONS` a
  // secas y al inyectarle el defecto (cambiar la tabla a `[].map(...)`) PASÓ EN VERDE: el
  // nombre seguía en la línea del import. Un guardián que no dispara nunca es peor que no
  // tenerlo, porque da por revisado lo que nadie revisó.
  for (const [pieza, uso] of [
    ["el catálogo de piezas", "PRODUCTO_OPTIONS.map"],
    ["el precio del panel", "PANEL_ADICIONAL.setupUSD"],
    ["el formateador de precios", "precioFijo("],
  ]) {
    if (!src.includes(uso))
      fallos.push(
        `components/paginas/Precios.tsx ya no usa ${pieza} (${uso}): la página de precios dejó de leer el catálogo`
      );
  }
  // Y que no haya vuelto una cifra escrita a mano dentro del componente.
  const aMano = src.match(/\$\s?\d[\d,]{2,}/g);
  if (aMano) fallos.push(`components/paginas/Precios.tsx tiene precios escritos a mano: ${aMano.join(", ")}`);

  // Los encabezados de la tabla, en los DOS idiomas y distintos entre sí (media traducción
  // se nota más que ninguna).
  const { paginas } = jiti(path.join(RAIZ, "lib", "paginas-textos.ts"));
  const CLAVES = ["tablaTitulo", "tablaSub", "tablaCabPieza", "tablaCabPrecio", "tablaDescuento", "tablaPanel", "tablaNota"];
  const es = paginas("es").precios;
  const en = paginas("en").precios;
  for (const c of CLAVES) {
    if (!String(es?.[c] || "").trim()) fallos.push(`falta el texto «${c}» en español`);
    if (!String(en?.[c] || "").trim()) fallos.push(`falta el texto «${c}» en inglés`);
    else if (es?.[c] === en?.[c]) fallos.push(`«${c}» está igual en los dos idiomas: no se tradujo`);
  }
}

console.log("");
if (fallos.length) {
  console.error(`❌ Los precios publicados no cuadran con el catálogo (${fallos.length}):\n`);
  for (const f of [...new Set(fallos)]) console.error("   · " + f);
  console.error("\n   El catálogo manda: lib/calc.ts. Se corrigen los TEXTOS, no el catálogo.");
  process.exit(1);
}
console.log(
  `✅ Los precios publicados son los del catálogo. ${listas} listas revisadas · ` +
    `${PRODUCTO_OPTIONS.length} piezas + panel.`
);
