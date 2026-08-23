// Guardián: que TODAS las pantallas digan lo mismo sobre en qué idiomas atiende
// cada pieza.
//
//   node scripts/probar-idiomas-producto.mjs   (corre en el prebuild)
//
// 🔴 EL DEFECTO QUE LO TRAJO (2026-08-22). `lib/calc.ts` —fuente de la propuesta
// y del ACUERDO QUE SE FIRMA— decía que el agente de WhatsApp "responde en
// español". La página de soluciones, del mismo producto, decía "español, inglés
// o portugués". Las lee el mismo cliente con un día de diferencia, y ninguna de
// las dos daba error. Es "dos canales que dicen lo mismo con textos distintos",
// en un eje que no habíamos mirado nunca: el idioma.
//
// LA REGLA QUE SE COMPRUEBA, y por qué está escrita así:
//
//   Un texto que describe una pieza y NOMBRA un idioma no puede nombrar MENOS
//   idiomas de los que la pieza atiende de verdad.
//
// No se exige que todo texto hable de idiomas —hay descripciones donde no viene
// a cuento— y no se prohíbe nombrar el español solo: se prohíbe nombrarlo
// EN LUGAR DE los demás. Así el guardián caza "sitio en español" (que se queda
// corto) sin tumbar "en español está más afinado" (que es una observación).
//
// Se mira solo el puñado de cadenas que son descripción PURA de producto: los
// `desc` y `alcance` del catálogo, sus espejos en inglés y el diccionario del
// acuerdo. Ahí no hay prosa que interpretar, así que no hay falsos positivos —
// que es la otra mitad de la lección: un guardián demasiado bruto bloquea
// trabajo bueno y se deja de mirar.

import path from "node:path";
import { fileURLToPath } from "node:url";
import createJiti from "jiti";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..");
const jiti = createJiti(path.join(AQUI, "x.mjs"), {
  cache: false,
  requireCache: false,
  interopDefault: true,
});

const { IDIOMAS_DE_PIEZA, idiomasNombrados, idiomasInventados } = jiti(
  path.join(RAIZ, "lib", "idiomas-producto.ts")
);
const { PRODUCTO_OPTIONS } = jiti(path.join(RAIZ, "lib", "calc.ts"));
const { CALC_TEXTOS } = jiti(path.join(RAIZ, "lib", "calc-textos.ts"));
const { CATALOGO_EN_PARA_PRUEBAS } = jiti(path.join(RAIZ, "lib", "acuerdo-textos.ts"));

const fallos = [];
const marca = (donde, porque, txt = "") => fallos.push({ donde, porque, txt });

const nombre = { es: "español", en: "inglés", pt: "portugués" };
const listar = (xs) => xs.map((x) => nombre[x]).join(", ");

if (!PRODUCTO_OPTIONS?.length) {
  console.error("❌ No se pudo leer PRODUCTO_OPTIONS de lib/calc.ts.");
  process.exit(1);
}

/**
 * El corazón: un texto no puede quedarse corto respecto al hecho.
 *
 * `exigidos` son los que TIENE que nombrar si nombra alguno; `permitidos` son
 * los que puede nombrar sin mentir. En la frase completa (`alcance`) coinciden:
 * se exigen todos. En un rótulo corto (`desc`) se exigen solo los principales,
 * pero seguir permitidos los demás — ver la nota de `principales` en
 * lib/idiomas-producto.ts.
 */
function revisar(donde, texto, exigidos, permitidos = exigidos) {
  if (!texto) return;

  // ⚠️ Esto va PRIMERO y fuera del `if (dichos.length === 0)`: un texto que
  // promete un idioma que no hablamos no nombra ninguno de los nuestros, así
  // que se escapaba entero. Se descubrió metiéndole "alemán" a propósito y
  // viendo que el guardián salía verde — un verificador que solo reconoce lo
  // correcto no detecta lo inventado.
  const inventados = idiomasInventados(texto);
  if (inventados.length > 0) {
    marca(donde, `promete un idioma que el producto NO habla: ${inventados.join(", ")}`, texto.slice(0, 120));
  }

  const dichos = idiomasNombrados(texto);
  if (dichos.length === 0) return; // no habla de idiomas: perfecto
  const esperados = exigidos;
  const faltan = esperados.filter((x) => !dichos.includes(x));
  if (faltan.length > 0) {
    marca(
      donde,
      `nombra un idioma pero se queda corto: le falta ${listar(faltan)} ` +
        `(la pieza atiende en ${listar(esperados)})`,
      texto.slice(0, 120)
    );
  }
  const sobran = dichos.filter((x) => !permitidos.includes(x));
  if (sobran.length > 0) {
    marca(
      donde,
      `promete ${listar(sobran)}, que NO está en lib/idiomas-producto.ts. ` +
        `O se comprobó y hay que anotarlo ahí con su prueba, o no se puede afirmar`,
      texto.slice(0, 120)
    );
  }
}

// ── 1 · El catálogo en español (lib/calc.ts) ─────────────────────────────────
for (const p of PRODUCTO_OPTIONS) {
  const ficha = IDIOMAS_DE_PIEZA[p.val];
  if (!ficha) {
    marca(`pieza "${p.val}"`, "no está en lib/idiomas-producto.ts: nadie sabe en qué idiomas atiende");
    continue;
  }
  revisar(`calc.ts · ${p.val} · desc`, p.desc, ficha.principales, ficha.idiomas);
  revisar(`calc.ts · ${p.val} · alcance`, p.alcance, ficha.idiomas);
}

// ── 2 · Las tablas de calc-textos.ts, EN LOS DOS IDIOMAS ─────────────────────
//
// 🔴 Aquí estaba el hueco que dejó pasar el defecto de verdad. La primera
// versión revisaba solo `CALC_TEXTOS.en`, dando por hecho que el español salía
// de PRODUCTO_OPTIONS. No: `calculate()` PREFIERE esta tabla, así que
// `CALC_TEXTOS.es.piezas` es la que el cliente lee en la propuesta y en el
// acuerdo, y PRODUCTO_OPTIONS quedó de respaldo. Con el guardián mirando solo
// el inglés, se actualizó el respaldo, todo salió verde, y la propuesta seguía
// diciendo "responde WhatsApp en español".
for (const idioma of ["es", "en"]) {
  for (const [val, t] of Object.entries(CALC_TEXTOS[idioma]?.piezas ?? {})) {
    const ficha = IDIOMAS_DE_PIEZA[val];
    if (!ficha) continue;
    revisar(`calc-textos.ts · ${idioma} · ${val} · desc`, t.desc, ficha.principales, ficha.idiomas);
    revisar(`calc-textos.ts · ${idioma} · ${val} · alcance`, t.alcance, ficha.idiomas);
  }
}

// ── 2b · Y las dos copias del español tienen que decir LO MISMO ──────────────
// Mientras exista `CALC_TEXTOS.es.piezas` además de PRODUCTO_OPTIONS, hay dos
// sitios donde escribir la misma frase. La regla de la casa es "una cifra, un
// dueño"; como aquí la simetría de la tabla bilingüe pide las dos, al menos se
// prohíbe que se separen — que es lo que las volvió peligrosas.
for (const p of PRODUCTO_OPTIONS) {
  const t = CALC_TEXTOS.es.piezas?.[p.val];
  if (!t) {
    marca(`calc-textos.ts · es · ${p.val}`, "la pieza existe en calc.ts y falta aquí, que es la tabla que gana");
    continue;
  }
  for (const campo of ["label", "desc", "alcance"]) {
    if (t[campo] !== p[campo]) {
      marca(
        `${p.val} · ${campo}`,
        "calc.ts y calc-textos.ts (es) dicen cosas distintas, y la que el cliente lee es la de calc-textos",
        `calc.ts: "${String(p[campo]).slice(0, 60)}…" / calc-textos: "${String(t[campo]).slice(0, 60)}…"`
      );
    }
  }
}

// ── 3 · El diccionario del acuerdo (lib/acuerdo-textos.ts) ───────────────────
// Es el documento que se FIRMA: si aquí dijera menos idiomas que la propuesta,
// el cliente habría comprado una cosa y firmado otra.
{
  const porLabel = new Map();
  for (const p of PRODUCTO_OPTIONS) porLabel.set(p.label, p.val);
  for (const [labelEs, entrada] of Object.entries(CATALOGO_EN_PARA_PRUEBAS() ?? {})) {
    const val = porLabel.get(labelEs) ?? (/dashboard/i.test(labelEs) ? "panel" : null);
    const ficha = val ? IDIOMAS_DE_PIEZA[val] : null;
    if (!ficha) continue;
    revisar(`acuerdo · en · ${labelEs} · alcance`, entrada.alcance, ficha.idiomas);
    revisar(`acuerdo · en · ${labelEs} · label`, entrada.label, ficha.principales, ficha.idiomas);
  }
}

// ── 4 · Que el propio inventario esté sostenido ──────────────────────────────
// Una ficha sin prueba escrita es una promesa sin respaldo, que es como se le
// acaba diciendo a un cliente algo que el producto no hace.
for (const [val, ficha] of Object.entries(IDIOMAS_DE_PIEZA)) {
  if (!ficha.idiomas?.length) marca(`idiomas-producto · ${val}`, "no declara ningún idioma");
  if (!ficha.principales?.length) marca(`idiomas-producto · ${val}`, "no declara con cuáles se vende");
  for (const p of ficha.principales ?? []) {
    if (!ficha.idiomas.includes(p)) {
      marca(`idiomas-producto · ${val}`, `promete ${nombre[p]} como principal y no está en los idiomas que atiende`);
    }
  }
  if (!ficha.prueba || ficha.prueba.length < 40) {
    marca(`idiomas-producto · ${val}`, "no dice DÓNDE se comprobó: sin prueba no se puede afirmar");
  }
  if (!/20\d\d-\d\d-\d\d/.test(ficha.prueba ?? "")) {
    marca(`idiomas-producto · ${val}`, "su prueba no lleva fecha");
  }
}

if (fallos.length) {
  console.error(`❌ Los idiomas del producto no cuadran (${fallos.length}):\n`);
  for (const f of fallos) {
    console.error(`   ${f.donde}`);
    if (f.txt) console.error(`      "${f.txt}"`);
    console.error(`      → ${f.porque}\n`);
  }
  process.exit(1);
}

const resumen = Object.entries(IDIOMAS_DE_PIEZA)
  .map(([val, f]) => `${val}=${f.idiomas.join("/")}`)
  .join(" · ");
console.log(`✅ Todas las pantallas dicen los mismos idiomas por pieza: ${resumen}`);
