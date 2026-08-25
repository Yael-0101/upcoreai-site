// Guardián del SITIO BILINGÜE: que la versión en inglés diga lo MISMO que la
// española, con la misma forma, y que ninguna de las dos se cuele en la otra.
//
//   node scripts/probar-sitio-bilingue.mjs   (corre en el prebuild)
//
// 🔴 POR QUÉ EXISTE, Y POR QUÉ MIRA LO QUE MIRA.
// Al hacer bilingües la propuesta, el acuerdo y el Portal de Arranque, el mismo
// defecto apareció TRES veces: el guardián revisaba las TABLAS de textos, salía
// verde, y al abrir la página publicada había frases en español. Siempre en la
// misma capa — la que envuelve: la página, no el copy.
//
// De ahí las reglas de este archivo:
//   1. No se revisan las tablas: se EJECUTAN las funciones y se revisa lo que
//      producen (`contenido(idioma)`, `calculate()`, `datosAcuerdo()`…).
//   2. Se recorren TODAS las claves de los dos idiomas comparando la forma
//      (mismas claves, mismo número de elementos en cada lista).
//   3. Se busca vocabulario español dentro del inglés, palabra completa.
//   4. Lo que se GUARDA (los `val` de las opciones, los slugs) tiene que ser
//      idéntico en los dos idiomas: si cambiara, el cliente elegiría una cosa en
//      inglés y se guardaría otra.
//
// Y una regla de método que ya costó cara: un guardián se prueba METIÉNDOLE el
// defecto a propósito. En verde desde el primer intento no prueba nada.

import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..");
const require = createRequire(import.meta.url);
const jiti = require("jiti")(fileURLToPath(import.meta.url), {
  cache: false,
  requireCache: false,
  interopDefault: true,
});

const problemas = [];
const marca = (donde, que, porque, txt = "") => problemas.push({ donde, que, porque, txt });

const { IDIOMAS, LOCALE } = jiti(path.join(RAIZ, "lib", "idioma.ts"));
const { ruta, alternativas, SEGMENTOS } = jiti(path.join(RAIZ, "lib", "rutas.ts"));
const { RUTAS_INDEXABLES } = jiti(path.join(RAIZ, "lib", "seo.ts"));
const { contenido } = jiti(path.join(RAIZ, "lib", "site-textos.ts"));
const { paginas } = jiti(path.join(RAIZ, "lib", "paginas-textos.ts"));
const { legal } = jiti(path.join(RAIZ, "lib", "legal-textos.ts"));
const { empezar } = jiti(path.join(RAIZ, "lib", "empezar-textos.ts"));
const { SOLUCIONES } = jiti(path.join(RAIZ, "lib", "soluciones.ts"));
const { ARTICULOS, fechaBonita } = jiti(path.join(RAIZ, "lib", "blog.ts"));
const calc = jiti(path.join(RAIZ, "lib", "calc.ts"));

// ── 1 · Misma FORMA en los dos idiomas ───────────────────────────────────────
// Recorre los dos árboles en paralelo. No compara el texto (obviamente cambia):
// compara que existan las mismas claves y que las listas tengan el mismo largo.
// Así, agregar una sección en español sin traducirla se caza aquí aunque
// TypeScript no lo vea (las listas y los `Record<string,...>` se le escapan).
function mismaForma(a, b, ruta_, donde) {
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      marca(donde, ruta_, "en un idioma es una lista y en el otro no");
      return;
    }
    if (a.length !== b.length) {
      marca(
        donde,
        ruta_,
        `la lista tiene ${a.length} en español y ${b.length} en inglés — falta traducir un elemento, o sobra`
      );
      return;
    }
    a.forEach((x, i) => mismaForma(x, b[i], `${ruta_}[${i}]`, donde));
    return;
  }
  if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    const soloEs = ka.filter((k) => !kb.includes(k));
    const soloEn = kb.filter((k) => !ka.includes(k));
    if (soloEs.length) marca(donde, ruta_, `solo en español: ${soloEs.join(", ")}`);
    if (soloEn.length) marca(donde, ruta_, `solo en inglés: ${soloEn.join(", ")}`);
    for (const k of ka.filter((k) => kb.includes(k))) {
      mismaForma(a[k], b[k], ruta_ ? `${ruta_}.${k}` : k, donde);
    }
    return;
  }
  if (typeof a !== typeof b) {
    marca(donde, ruta_, `en español es ${typeof a} y en inglés ${typeof b}`);
  }
}

mismaForma(contenido("es"), contenido("en"), "", "lib/site-textos.ts");
mismaForma(paginas("es"), paginas("en"), "", "lib/paginas-textos.ts");
mismaForma(legal("es"), legal("en"), "", "lib/legal-textos.ts");
mismaForma(empezar("es"), empezar("en"), "", "lib/empezar-textos.ts");
for (const s of SOLUCIONES) mismaForma(s.t.es, s.t.en, "", `solución ${s.slug}`);
for (const a of ARTICULOS) mismaForma(a.t.es, a.t.en, "", `artículo ${a.slug}`);

// ── 2 · Ni una palabra en español dentro del inglés ──────────────────────────
// ⚠️ Palabra COMPLETA, con la frontera escrita a mano: en JavaScript `\b` no
// funciona después de una vocal acentuada (lección de la casa, y ya bloqueó
// trabajo bueno una vez). Se excluyen los nombres propios y las palabras que en
// inglés también existen o que a propósito se quedan en español.
const DELATORAS = [
  "que", "para", "con", "los", "las", "una", "por", "más", "cómo", "qué", "tu", "tus",
  "sin", "según", "también", "cada", "está", "están", "hacer", "hacemos", "nuestro",
  "nuestra", "cliente", "clientes", "comprador", "compradores", "inmobiliaria",
  "asesor", "asesores", "visita", "visitas", "gratis", "precio", "precios",
  "diagnóstico", "correo", "llamada", "llamadas", "mensualidad", "pago", "pagos",
  "prospecto", "prospectos", "seguimiento", "sitio", "agenda", "empresa", "meses",
  "mes", "días", "semana", "semanas", "horario", "horarios", "equipo", "firma",
];
// Español que SE QUEDA a propósito en la versión inglesa, y por qué.
const PERMITIDO_EN_INGLES = new Set([
  // El diálogo de la demo y el saludo del bot: es el producto que se enseña.
  "burbujas",
  // Lo que se GUARDA no se traduce (viaja al webhook y lo lee Yael en español).
  "sinPreferenciaTexto",
  // ⚠️ Las RUTAS no son texto: son direcciones. Los slugs se quedan en español a
  // propósito (ver lib/idioma.ts) para que cada página sepa cuál es su pareja sin
  // ningún diccionario. La primera versión de este guardián marcó
  // "/soluciones/agente-de-voz-para-inmobiliarias" por la palabra "para" — un
  // guardián que no distingue una URL de una frase produce alarma falsa.
  "href",
  "slug",
  "val",
]);

const frontera = (p) =>
  new RegExp(`(?<![a-záéíóúüñ0-9])${p}(?![a-záéíóúüñ0-9])`, "i");

/** Recorre un objeto y entrega [ruta, texto] de cada cadena. */
function* cadenas(v, ruta_ = "") {
  if (typeof v === "string") {
    yield [ruta_, v];
    return;
  }
  if (typeof v === "function") return;
  if (Array.isArray(v)) {
    for (let i = 0; i < v.length; i++) yield* cadenas(v[i], `${ruta_}[${i}]`);
    return;
  }
  if (v && typeof v === "object") {
    for (const k of Object.keys(v)) yield* cadenas(v[k], ruta_ ? `${ruta_}.${k}` : k);
  }
}

function revisarIngles(obj, donde) {
  for (const [r, txt] of cadenas(obj)) {
    if ([...PERMITIDO_EN_INGLES].some((p) => r.includes(p))) continue;
    for (const palabra of DELATORAS) {
      if (frontera(palabra).test(txt)) {
        marca(donde, `«${palabra}» en ${r || "(raíz)"}`, "quedó texto en español dentro de la versión inglesa", txt.slice(0, 110));
        break;
      }
    }
  }
}

revisarIngles(contenido("en"), "lib/site-textos.ts");
revisarIngles(paginas("en"), "lib/paginas-textos.ts");
revisarIngles(legal("en"), "lib/legal-textos.ts");
revisarIngles(empezar("en"), "lib/empezar-textos.ts");
for (const s of SOLUCIONES) revisarIngles(s.t.en, `solución ${s.slug}`);
for (const a of ARTICULOS) revisarIngles(a.t.en, `artículo ${a.slug}`);

// ── 3 · Lo que PRODUCEN las funciones, no lo que dicen las tablas ────────────
// Es la lección de la propuesta: el guardián miraba la tabla, salía verde, y en
// la página publicada había seis frases en español que vivían en el motor.
{
  // La calculadora emite sus notas desde calc.ts. Se ejecuta de verdad.
  const estado = {
    ...calc.emptyState,
    idioma: "en",
    clinica: "comercializadora",
    productos: ["agente", "voz"],
    modo: "sistema",
    operacion: "upcore",
    msgs: "40",
    leads: "60",
  };
  const r = calc.calculate(estado);
  revisarIngles(
    {
      complejidad: r.complejidad,
      inversionNota: r.inversionNota,
      costosNota: r.costosNota,
      upcoreNota: r.upcoreNota,
      ahorroNota: r.ahorroNota,
      roiNota: r.roiNota,
      recomendacion: r.recomendacion,
      incluye: r.incluye,
    },
    "calculate() en inglés"
  );
  // El defecto concreto que existía: `complejidad` devolvía la clave española
  // porque la tabla de traducción estaba escrita y nunca se usaba.
  if (/Solución|Sistema a la medida|Infraestructura completa/.test(r.complejidad)) {
    marca(
      "lib/calc.ts",
      "complejidad",
      "devuelve la clave en español: la tabla T.complejidad existe y no se está usando",
      r.complejidad
    );
  }
  // Y las etiquetas de los selectores.
  for (const o of [...calc.PRODUCTO_OPTIONS, ...calc.MODO_OPTIONS, ...calc.OPERACION_OPTIONS, ...calc.CLINICA_OPTIONS]) {
    const en = calc.opcionEn(o, "en");
    if (en.val !== o.val) {
      marca("lib/calc.ts", `opcionEn("${o.val}")`, "el `val` cambió con el idioma: es lo que se guarda y NO se traduce");
    }
    revisarIngles({ label: en.label, desc: en.desc ?? "" }, `opción ${o.val}`);
  }

  // Las fechas del blog: en inglés van con el mes primero.
  const f = fechaBonita("2026-08-19", "en");
  if (!/^August 19, 2026$/.test(f)) {
    marca("lib/blog.ts", "fechaBonita(…, \"en\")", "la fecha no sale en formato inglés", f);
  }
  const fes = fechaBonita("2026-08-19", "es");
  if (!/19 de agosto de 2026/.test(fes)) {
    marca("lib/blog.ts", "fechaBonita(…, \"es\")", "la fecha en español se rompió", fes);
  }
}

// ── 4 · Las rutas y el hreflang ──────────────────────────────────────────────
{
  if (ruta("es", "/precios") !== "/precios") marca("lib/rutas.ts", "ruta es", "el español no vive en la raíz");
  if (ruta("en", "/precios") !== "/en/pricing") marca("lib/rutas.ts", "ruta en", "la ruta inglesa no se tradujo", ruta("en", "/precios"));
  if (ruta("en", "/") !== "/en") marca("lib/rutas.ts", "ruta en /", "la portada inglesa no es /en");

  // Lo que va detrás de `#` o de `?` tiene que sobrevivir: hay enlaces del sitio
  // que apuntan a un ancla (`#demo-voz`) y a la demo con un giro (`?g=`).
  const conAncla = ruta("en", "/soluciones/agente-de-voz-para-inmobiliarias#demo-voz");
  if (!conAncla.endsWith("#demo-voz") || conAncla.includes("agente-de-voz")) {
    marca("lib/rutas.ts", "ruta con ancla", "se perdió el ancla o no se tradujo el slug", conAncla);
  }

  // ⚠️ Una ruta que no sabe traducir tiene que TRONAR, no devolverse a medias.
  // Media traducción es un enlace roto publicado sin un solo error: la página
  // existiría en español y en inglés daría 404.
  let trono = false;
  try {
    ruta("en", "/una-ruta-que-no-existe");
  } catch {
    trono = true;
  }
  if (!trono) marca("lib/rutas.ts", "ruta desconocida", "se tragó una ruta que no sabe traducir en vez de tronar");

  const alt = alternativas("/precios");
  for (const clave of ["es-MX", "en-US", "x-default"]) {
    if (!alt.languages[clave]) marca("lib/rutas.ts", `hreflang ${clave}`, "falta en las alternativas");
  }
  if (alt.languages["x-default"] !== alt.languages["es-MX"]) {
    marca("lib/rutas.ts", "x-default", "no apunta al idioma original (español)");
  }
  if (!alt.languages["en-US"].endsWith("/en/pricing")) {
    marca("lib/rutas.ts", "hreflang en-US", "apunta a la dirección española", alt.languages["en-US"]);
  }

  // Cada página inglesa tiene que EXISTIR como archivo. Un `hreflang` que apunta
  // a un 404 es peor que no tenerlo: Google deja de confiar en el par.
  //
  // ⚠️ La lista NO se escribe a mano: sale de RUTAS_INDEXABLES, que es de donde
  // sale el sitemap. Así el guardián revisa exactamente lo que se publica, y no
  // se queda corto al agregar una página (lección del 2026-08-06).
  const carpetas = new Set();
  for (const r of RUTAS_INDEXABLES) {
    const en = ruta("en", r.path).replace(/^\/en\/?/, "");
    const tramos = en.split("/").filter(Boolean);
    // Un segundo tramo es un slug de contenido: el archivo es el de `[slug]`.
    carpetas.add(tramos.length >= 2 ? `${tramos[0]}/[slug]` : tramos[0] ?? "");
  }
  for (const c of carpetas) {
    const f = path.join(RAIZ, "app", "en", c, "page.tsx");
    if (!fs.existsSync(f)) {
      marca("app/en", `falta /${c}`, "el hreflang y el sitemap apuntan a una página que no existe");
    }
  }
  // La demo no está en el sitemap con su propia entrada en todos los casos, y
  // aun así el Nav enlaza a ella en los dos idiomas.
  if (!fs.existsSync(path.join(RAIZ, "app", "en", "demo", "page.tsx"))) {
    marca("app/en", "falta /demo", "el Nav inglés enlaza a una página que no existe");
  }
}

// ── 5 · Los slugs están traducidos de verdad ─────────────────────────────────
// Desde el 2026-08-22 el inglés tiene su propia dirección. Un `slugEn` copiado
// del español compila igual, pasa desapercibido, y deja la mitad del trabajo
// hecha justo donde el buscador mira. Aquí se comprueba que de verdad cambien,
// que no se repitan y que no arrastren palabras en español.
{
  const RASTRO_ES = /(^|-)(para|de|del|la|los|las|el|inmobiliarias?|preventa|agente|seguimiento|automatizacion|comprador(es)?)(-|$)/;
  for (const [seccion, lista] of [["soluciones", SOLUCIONES], ["blog", ARTICULOS]]) {
    const vistos = new Set();
    for (const x of lista) {
      const donde = `${seccion === "blog" ? "artículo" : "solución"} ${x.slug}`;
      if (!x.t.es || !x.t.en) marca(donde, "t", "le falta uno de los dos idiomas");
      if (!x.slugEn) {
        marca(donde, "slugEn", "no tiene slug en inglés");
        continue;
      }
      if (x.slugEn === x.slug) marca(donde, "slugEn", "es idéntico al español: no se tradujo");
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(x.slugEn)) {
        marca(donde, "slugEn", "no es un slug válido (solo minúsculas, números y guiones)", x.slugEn);
      }
      if (RASTRO_ES.test(x.slugEn)) {
        marca(donde, "slugEn", "trae una palabra en español", x.slugEn);
      }
      if (vistos.has(x.slugEn)) marca(donde, "slugEn", "está repetido: dos páginas en la misma dirección", x.slugEn);
      vistos.add(x.slugEn);
      // Y que la ruta salga de verdad por el camino bueno.
      const esperada = `/en/${SEGMENTOS[seccion]}/${x.slugEn}`;
      const real = ruta("en", `/${seccion}/${x.slug}`);
      if (real !== esperada) marca(donde, "ruta en", `debería ser ${esperada}`, real);
    }
  }
}

// ── 5b · Cada árbol de idioma tiene su propia imagen OG ──────────────────────
// Hasta el 2026-08-22 las páginas inglesas heredaban la imagen de la raíz, que
// está escrita en español: al compartir la página inglesa, la tarjeta salía en
// otro idioma que la página. No se ve navegando el sitio — solo al compartirlo.
for (const og of ["opengraph-image.tsx", "solutions/[slug]/opengraph-image.tsx", "blog/[slug]/opengraph-image.tsx"]) {
  const f = path.join(RAIZ, "app", "en", og);
  if (!fs.existsSync(f)) {
    marca("app/en", `falta ${og}`, "el inglés heredaría la imagen OG en español");
    continue;
  }
  const src = fs.readFileSync(f, "utf8");
  if (/\.t\.es\b/.test(src)) marca(`app/en/${og}`, "t.es", "la imagen del inglés lee los textos en español");
  // ⚠️ Y tiene que pasarle el idioma a la plantilla. La plantilla trae un PIE
  // propio ("Automatización con IA para inmobiliarias") que hasta el 2026-08-22
  // estaba fijo en español: la tarjeta inglesa salía con el título en inglés y
  // esa línea en español debajo. No lo vio ningún guardián —es texto dentro de
  // un PNG— ni se ve navegando: una tarjeta OG solo aparece al COMPARTIR el
  // enlace. Se descubrió descargando la imagen y mirándola.
  if (!/idioma=\{?["{]?(en|IDIOMA)/.test(src)) {
    marca(`app/en/${og}`, "idioma", "no le pasa el idioma a PlantillaOG: el pie de la tarjeta saldrá en español");
  }
}

// ── 6 · La línea roja se cumple en LOS DOS idiomas ───────────────────────────
// `probar-sitio.mjs` revisa el código fuente. Este la revisa en lo que sale por
// las funciones, en inglés — que es donde nadie mira.
{
  const AFIRMA_EN =
    /\b(prices?|pricing|availability|units? (?:left|available)|delivery dates?|completion dates?)\b/i;
  const NIEGA_EN =
    /\b(no|not|never|does not|do not|cannot|without)\b|hands? (?:it |them )?to your agent|changes? (?:daily|often)|expires?/i;
  const SUJETO_EN = /\b(assistant|agent|bot|system|site|website|dashboard)\b/i;
  // ⚠️ HACE FALTA UN VERBO DE DECIR, y este es el arreglo de un falso positivo
  // real: sin él, la FAQ "Each piece is sold separately and the price is fixed.
  // We recommend the full system…" quedaba marcada — porque tiene «price» y
  // «system» cerca. Pero ese precio es EL NUESTRO, y decirlo es justo lo que
  // hacemos a propósito. La línea roja es sobre lo que el ASISTENTE le dice al
  // comprador, no sobre lo que Upcore cobra. Sin este filtro el guardián bloquea
  // trabajo bueno, que desgasta igual que dejar pasar lo malo.
  const HABLA_EN =
    /\b(says?|tells?|gives?|answers?|replies|reply|mentions?|quotes?|confirms?|shares?|provides?|responds?|discloses?)\b/i;

  // 🔄 AMPLIADO EL 2026-08-25, igual que en probar-sitio.mjs: desde esa fecha el cliente
  // elige qué hace su asistente con esos datos, así que afirmarlos DICIENDO que lo elige
  // él —o de qué fuente salen— es exacto y tiene que poder decirse. Lo que se sigue
  // prohibiendo es prometerlos a secas, como si el número saliera de la nada.
  //
  // ⚠️ Este guardián es el tercero con esta misma regla (los otros: probar-sitio.mjs y
  // probar-acuerdo.mjs). Al cambiar la política hubo que perseguirla por los tres, y este
  // fue el último en aparecer — solo disparaba en INGLÉS, que es donde nadie mira.
  const LO_ELIGE_EN =
    /you decide|you choose|if you'?d rather|you'?d like it to|configured separately|the source you keep|you already publish|up to you/i;

  const revisarLinea = (obj, donde) => {
    for (const [r, txt] of cadenas(obj)) {
      const oraciones = txt.split(/(?<=[.;])\s+/);
      for (let i = 0; i < oraciones.length; i++) {
        // ⚠️ Se mira la oración Y LA SIGUIENTE. El defecto real que se coló en
        // lib/soluciones.ts nombraba el dato en una oración ("Precios, planes de
        // pago, fechas de entrega.") y al sistema en la de al lado ("…que un
        // asistente bien configurado responde igual."). Oración por oración
        // suelta, ninguna de las dos disparaba.
        const par = [oraciones[i], oraciones[i + 1] ?? ""].join(" ");
        if (
          AFIRMA_EN.test(par) &&
          SUJETO_EN.test(par) &&
          HABLA_EN.test(par) &&
          !NIEGA_EN.test(par) &&
          !LO_ELIGE_EN.test(par)
        ) {
          marca(donde, `promete precio/disponibilidad/fecha en ${r}`, "línea roja nº1 del producto", par.slice(0, 120));
        }
      }
    }
  };
  for (const s of SOLUCIONES) revisarLinea(s.t.en, `solución ${s.slug} (en)`);
  revisarLinea(contenido("en"), "site-textos (en)");
  revisarLinea(paginas("en"), "paginas-textos (en)");
}

// ── 7 · La ley del contrato es la misma en /terminos, en los dos idiomas ─────
{
  const { LEY_POR_IDIOMA } = jiti(path.join(RAIZ, "lib", "acuerdo-textos.ts"));
  for (const i of IDIOMAS) {
    const seccion = legal(i).terminos.secciones.find((s) => /ley aplicable|governing law/i.test(s.titulo));
    if (!seccion) {
      marca(`legal ${i}`, "ley aplicable", "no existe la sección de ley aplicable en los Términos");
      continue;
    }
    const txt = seccion.bloques.map((b) => ("p" in b ? b.p.join("") : "")).join(" ");
    if (!txt.includes(LEY_POR_IDIOMA[i].ley) || !txt.includes(LEY_POR_IDIOMA[i].foro)) {
      marca(
        `legal ${i}`,
        "ley aplicable",
        "los Términos no leen la constante de acuerdo-textos: el acuerdo REMITE aquí y podrían acabar diciendo leyes distintas",
        txt.slice(0, 120)
      );
    }
    if (/Estados Unidos Mexicanos|leyes de M[eé]xico/i.test(txt)) {
      marca(`legal ${i}`, "ley aplicable", "quedó rastro de la ley anterior (México)", txt.slice(0, 120));
    }
  }
}

// ── 8 · La marca no puede salir DOS VECES en el título ───────────────────────
// 🔴 Defecto real (2026-08-22): la portada quedó con
// "Upcore AI | AI automation for real estate firms | Upcore AI" — el título de la
// marca lleva "Upcore AI" al principio y el template del layout se lo pegaba otra
// vez al final. Se vio abriendo la página; ninguna prueba lo miraba. Se comprueba
// el título FINAL (el que sale al navegador), no el que se escribe en la tabla.
{
  const { metaPagina, SITE_NAME } = jiti(path.join(RAIZ, "lib", "seo.ts"));
  const casos = [];
  for (const i of IDIOMAS) {
    const c = contenido(i);
    const pg = paginas(i);
    casos.push(["portada", metaPagina({ title: c.meta.title, description: c.meta.description, path: "/", idioma: i, tituloAbsoluto: true })]);
    casos.push(["precios", metaPagina({ title: pg.precios.metaTitle, description: pg.precios.metaDescription, path: "/precios", idioma: i })]);
    casos.push(["nosotros", metaPagina({ title: pg.nosotros.metaTitle, description: pg.nosotros.metaDescription, path: "/nosotros", idioma: i })]);
    casos.push(["blog", metaPagina({ title: pg.blog.metaTitle, description: pg.blog.metaDescription, path: "/blog", idioma: i })]);
    for (const s of SOLUCIONES) {
      casos.push([`solución ${s.slug}`, metaPagina({ title: s.t[i].title, description: s.t[i].metaDescription, path: `/soluciones/${s.slug}`, idioma: i })]);
    }
  }
  for (const [nombre, m] of casos) {
    // El título final es el `absolute` si lo hay, o el título + el template.
    const base = typeof m.title === "object" ? m.title.absolute : m.title;
    const final = typeof m.title === "object" ? base : `${base} | ${SITE_NAME}`;
    const veces = final.split(SITE_NAME).length - 1;
    if (veces > 1) {
      marca(nombre, "título", `la marca «${SITE_NAME}» sale ${veces} veces`, final);
    }
    // Y el og:title tiene que coincidir con lo que ve el navegador.
    if (m.openGraph?.title && m.openGraph.title.split(SITE_NAME).length - 1 > 1) {
      marca(nombre, "og:title", `la marca «${SITE_NAME}» sale dos veces`, m.openGraph.title);
    }
  }
}

// ── 9 · El `<html lang>` de cada idioma ──────────────────────────────────────
if (LOCALE.es.html !== "es-MX" || LOCALE.en.html !== "en-US") {
  marca("lib/idioma.ts", "LOCALE", "los códigos de idioma no son los esperados");
}

if (problemas.length) {
  console.error(`❌ El sitio bilingüe tiene ${problemas.length} problema(s):\n`);
  for (const p of problemas) {
    console.error(`   ${p.donde}  ${p.que}`);
    if (p.txt) console.error(`      "${p.txt}"`);
    console.error(`      → ${p.porque}\n`);
  }
  process.exit(1);
}
console.log("✅ Español e inglés tienen la misma forma, no se mezclan y respetan la línea roja.");
