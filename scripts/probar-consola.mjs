// Guardián: LA CONSOLA — que lo que la propuesta promete sea lo que el panel enseña.
//
//   node scripts/probar-consola.mjs   (corre en el prebuild)
//
// ─────────────────────────────────────────────────────────────────────────────
// 🔴 POR QUÉ EXISTE
//
// Desde el 2026-08-24 las piezas incluyen "tus controles": ver las conversaciones,
// tomar un chat, elegir qué desarrollos se ofrecen, apagar el asistente, aprobar
// los textos. Esa promesa se escribe en DOS proyectos distintos que no se pueden
// importar entre sí:
//
//   · aquí, en `lib/calc.ts` → MANDOS_DE_PIEZA, que es lo que el cliente LEE en su
//     propuesta y firma en su acuerdo;
//   · en `productos/panel-inmobiliaria/app/lib/piezas.ts`, que es lo que de verdad
//     se MUESTRA o se esconde en su panel.
//
// Si se separan, no da ningún error: simplemente la propuesta le promete un botón
// que no existe, o le esconde uno que pagó. Es la lección de siempre —"si algo se
// puede editar en dos sitios, se pone un guardián que compare las copias"— aplicada
// al eje nuevo: no dos idiomas, sino dos repositorios.
// ─────────────────────────────────────────────────────────────────────────────

import fs from "node:fs";
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

const { PRODUCTO_OPTIONS, MANDOS_DE_PIEZA, mandosDe, lineaConsola, calculate, emptyState } = jiti(
  path.join(RAIZ, "lib", "calc.ts")
);
const { CALC_TEXTOS, MANDOS } = jiti(path.join(RAIZ, "lib", "calc-textos.ts"));
const { traducirRenglon, CATALOGO_EN_PARA_PRUEBAS } = jiti(path.join(RAIZ, "lib", "acuerdo-textos.ts"));

const fallos = [];
const marca = (donde, porque, txt = "") => fallos.push({ donde, porque, txt });
const avisos = [];

const VALS = PRODUCTO_OPTIONS.map((p) => p.val);

/** Todas las combinaciones de piezas que un cliente puede comprar (sin la vacía). */
function combinaciones(xs) {
  const out = [];
  for (let m = 1; m < 1 << xs.length; m++) {
    out.push(xs.filter((_, i) => m & (1 << i)));
  }
  return out;
}
const COMBOS = combinaciones(VALS);

// ── 1 · Las dos copias de la decisión tienen que coincidir ───────────────────
//
// Se lee el TEXTO de piezas.ts, no se importa: ese archivo arranca importando la
// config del cliente y el transporte de n8n, y un guardián no importa módulos que
// trabajan al importarse. Si alguien reestructura esas funciones, esto TRUENA en
// vez de pasar en verde — que es lo correcto: significa que la decisión se movió.
{
  const carpetaProductos = path.resolve(RAIZ, "..", "productos");
  const rutaPanel = path.join(carpetaProductos, "panel-inmobiliaria", "app", "lib", "piezas.ts");

  if (!fs.existsSync(carpetaProductos)) {
    // Vercel solo sube la carpeta del sitio: allá `productos/` no existe ni puede.
    // Se omite SOLO esta comprobación y se sigue con las demás.
    avisos.push("no se comparó contra el panel: esta copia del repo no trae productos/");
  } else if (!fs.existsSync(rutaPanel)) {
    // La carpeta SÍ está y el archivo no: eso no es "otro build", es un fallo.
    marca(
      "panel-inmobiliaria",
      "existe productos/ pero no encuentro los mandos del panel. Si el archivo se movió, " +
        "corregir la ruta AQUÍ — si no, este guardián se calla para siempre",
      rutaPanel
    );
  } else {
    const txt = fs.readFileSync(rutaPanel, "utf8");
    const EQUIVALE = {
      veConversaciones: "conversaciones",
      veDesarrollos: "desarrollos",
      veInterruptorAsistente: "asistente",
      veTextos: "textos",
    };
    const delPanel = {};
    const re =
      /export const (veConversaciones|veDesarrollos|veInterruptorAsistente|veTextos)\s*=\s*\([^)]*\)\s*=>\s*tiene\(p,([^)]*)\)/g;
    let m;
    while ((m = re.exec(txt)) !== null) {
      // ⚠️ El guion FORMA PARTE del nombre de la pieza (2026-08-28). Esto era `[a-z]+`, que
      // no lo acepta, así que al crear `agente-basico` el guardián dejó de verla y reclamaba
      // que el panel no la mostrara cuando sí lo hacía. Un patrón escrito para los datos de
      // ayer no avisa de que se quedó corto: simplemente deja de reconocer lo nuevo.
      const piezas = [...m[2].matchAll(/"([a-z-]+)"/g)].map((x) => x[1]);
      delPanel[EQUIVALE[m[1]]] = new Set(piezas);
    }

    for (const mando of MANDOS) {
      const suyas = delPanel[mando];
      if (!suyas) {
        marca(
          `mando "${mando}"`,
          "no lo encontré en piezas.ts del panel. O se renombró la función, o se cambió su forma: " +
            "en cualquier caso las dos copias ya no se pueden comparar"
        );
        continue;
      }
      const aqui = new Set(VALS.filter((v) => (MANDOS_DE_PIEZA[v] ?? []).includes(mando)));
      const soloAqui = [...aqui].filter((v) => !suyas.has(v));
      const soloAlla = [...suyas].filter((v) => aqui.has(v) === false && VALS.includes(v));
      if (soloAqui.length) {
        marca(
          `mando "${mando}"`,
          `la propuesta se lo promete a ${soloAqui.join(", ")} y el panel NO se lo muestra`
        );
      }
      if (soloAlla.length) {
        marca(
          `mando "${mando}"`,
          `el panel se lo muestra a ${soloAlla.join(", ")} y la propuesta no se lo promete — lo pagó y no lo sabe`
        );
      }
    }
  }
}

// ── 2 · Toda pieza trae algún mando ──────────────────────────────────────────
// Si una pieza no trae ninguno, su cliente compraría un asistente sin volante,
// que es exactamente la objeción que la consola vino a contestar.
for (const val of VALS) {
  if (!(MANDOS_DE_PIEZA[val] ?? []).length) {
    marca(`pieza "${val}"`, "no trae ningún mando: su cliente no podría controlarla desde ningún lado");
  }
}

// ── 3 · El renglón sale, en los dos idiomas, y dice EXACTAMENTE lo suyo ──────
for (const idioma of ["es", "en"]) {
  const T = CALC_TEXTOS[idioma];
  for (const combo of COMBOS) {
    const linea = lineaConsola(combo, idioma);
    const suyos = mandosDe(combo);
    const etiqueta = `${idioma} · ${combo.join("+")}`;

    if (!linea) {
      marca(etiqueta, "no sale el renglón de la consola, y estas piezas sí traen mandos");
      continue;
    }
    // Las dos direcciones, que es la mitad que siempre se olvida.
    for (const mando of MANDOS) {
      const deberia = suyos.includes(mando);
      const aparece = linea.includes(T.consola.mandos[mando]);
      if (deberia && !aparece) {
        marca(etiqueta, `compró el mando "${mando}" y el renglón no lo nombra`, linea.slice(0, 110));
      }
      if (!deberia && aparece) {
        marca(
          etiqueta,
          `le promete el mando "${mando}", que estas piezas NO traen`,
          linea.slice(0, 110)
        );
      }
    }
    // Un renglón que empieza en minúscula o acaba en punto delata la plantilla.
    if (/^[a-záéíóúñ]/.test(linea)) marca(etiqueta, "el renglón empieza en minúscula", linea.slice(0, 60));
    if (/\.$/.test(linea)) {
      marca(etiqueta, "acaba en punto y los demás renglones del punto 1 no", linea.slice(-60));
    }
  }
}

// ── 4 · Y aparece de verdad en lo que devuelve el motor ──────────────────────
// No basta con que la función exista: la lección de agosto es que una traducción
// escrita y nunca llamada parece hecha. Se ejecuta `calculate()` y se lee.
for (const idioma of ["es", "en"]) {
  for (const combo of COMBOS) {
    const r = calculate({ ...emptyState, productos: combo, idioma });
    const esperado = lineaConsola(combo, idioma);
    if (!r.incluye.includes(esperado)) {
      marca(
        `motor · ${idioma} · ${combo.join("+")}`,
        "lineaConsola() devuelve el renglón pero calculate() no lo mete en `incluye`: el cliente no lo lee"
      );
    }
  }
}

// ── 5 · El acuerdo lo traduce entero ─────────────────────────────────────────
// El punto 1 del contrato se arma traduciendo el snapshot, que se congeló en
// español. Un renglón sin traducir deja media frase en español dentro del
// contrato en inglés — ya pasó una vez con el catálogo de piezas.
{
  const esMandos = Object.values(CALC_TEXTOS.es.consola.mandos);
  for (const combo of COMBOS) {
    const enEspanol = lineaConsola(combo, "es");
    const traducido = traducirRenglon(enEspanol);
    const etiqueta = `acuerdo · ${combo.join("+")}`;
    if (!traducido) {
      marca(etiqueta, "el acuerdo en inglés NO sabe traducir el renglón de la consola", enEspanol.slice(0, 90));
      continue;
    }
    if (traducido !== lineaConsola(combo, "en")) {
      marca(etiqueta, "lo traduce, pero distinto a como lo dice la propuesta en inglés", traducido.slice(0, 90));
    }
    for (const frag of esMandos) {
      if (traducido.includes(frag)) {
        marca(etiqueta, "quedó un trozo en español dentro del contrato en inglés", frag);
      }
    }
  }
}

// ── 6 · Panel y consola no se pisan ──────────────────────────────────────────
// Son dos cosas distintas y el cliente paga por una sola: si la consola prometiera
// métricas, estaríamos regalando el panel; si el panel fuera el único sitio donde
// se nombran los controles, estaríamos cobrando lo que va incluido.
{
  for (const idioma of ["es", "en"]) {
    const T = CALC_TEXTOS[idioma];
    const consola = lineaConsola(VALS, idioma);
    const metricas = idioma === "es" ? /retorno|ROI|métricas|reporte/i : /return|ROI|metrics|report/i;
    if (metricas.test(consola)) {
      marca(
        `consola · ${idioma}`,
        "la consola promete métricas o retorno, que es lo que se cobra en el panel"
      );
    }
    if (!/(control|mando)/i.test(consola)) {
      marca(`consola · ${idioma}`, "el renglón no dice que son TUS controles: se lee como una función más");
    }
    if (!metricas.test(T.panelIncluye)) {
      marca(
        `panel · ${idioma}`,
        "el renglón del panel no nombra lo que de verdad añade (métricas / retorno), así que se confunde con la consola",
        T.panelIncluye.slice(0, 90)
      );
    }

    // 🔴 LA MITAD QUE FALTABA (2026-08-25).
    //
    // La comprobación de arriba solo exigía que el panel NOMBRARA el retorno. Con eso
    // pasaba en verde una frase que además prometía "cómo va cada comprador y a quién
    // hay que llamar hoy" — que son literalmente dos pantallas de la consola INCLUIDA
    // (Compradores y Pendientes). O sea: el guardián vigilaba que la consola no se
    // metiera en el terreno del panel, y nunca al revés. Cobrábamos $3,000 por algo
    // que el cliente ya tenía abierto en otra pestaña.
    //
    // Es el mismo defecto que ya conocemos en otro eje: una medida que solo mira una
    // dirección da la falsa sensación de estar cubierto.
    const PISA_LA_CONSOLA =
      idioma === "es"
        ? [
            [/a qui[ée]n\s+(hay que\s+)?(llamar|escribir)/i, "a quién llamar hoy → pantalla Pendientes"],
            [/pendientes?\s+de\s+seguimiento/i, "pendientes de seguimiento → pantalla Pendientes"],
            [/c[oó]mo va cada comprador/i, "cómo va cada comprador → pantalla Compradores"],
            [/tomar el chat|cada conversaci[oó]n/i, "las conversaciones → pantalla Conversaciones"],
            [/apagar(lo)? (el asistente|en un toque)/i, "apagar el asistente → mando incluido"],
            [/qu[ée] desarrollos? (se ofrecen|ofrece)/i, "elegir desarrollos → mando incluido"],
          ]
        : [
            [/who to (call|message|contact)/i, "who to call today → Pendientes screen"],
            [/follow-?ups? pending|pending follow-?ups?/i, "pending follow-ups → Pendientes screen"],
            [/how every buyer is doing/i, "how every buyer is doing → Compradores screen"],
            [/take over any chat|every conversation/i, "the conversations → Conversaciones screen"],
            [/turn it off/i, "turning it off → included control"],
            [/which developments? it offers/i, "choosing developments → included control"],
          ];
    for (const [re, que] of PISA_LA_CONSOLA) {
      if (re.test(T.panelIncluye)) {
        marca(
          `panel · ${idioma}`,
          "el panel COBRA algo que ya va incluido en la consola: " + que,
          T.panelIncluye.slice(0, 120)
        );
      }
    }
  }

  // Y las dos copias de la frase del panel tienen que decir lo mismo.
  const cat = CATALOGO_EN_PARA_PRUEBAS();
  const [labelEs, alcanceEs] = CALC_TEXTOS.es.panelIncluye.split(" — ");
  const entrada = cat[labelEs];
  if (!entrada) {
    marca("acuerdo · panel", "el renglón del panel no está en el catálogo en inglés del acuerdo", labelEs);
  } else {
    const rehecho = `${entrada.label} — ${entrada.alcance}`;
    if (rehecho !== CALC_TEXTOS.en.panelIncluye) {
      marca(
        "acuerdo · panel",
        "el acuerdo y la propuesta describen el panel con frases distintas",
        `acuerdo: "${rehecho.slice(0, 70)}…" / propuesta: "${CALC_TEXTOS.en.panelIncluye.slice(0, 70)}…"`
      );
    }
  }
  if (!alcanceEs) marca("panel · es", "el renglón del panel ya no tiene la forma \"nombre — alcance\"");
}

// ── 7 · La lista del sitio solo nombra controles que EXISTEN ─────────────────
//
// 🔴 EL DEFECTO QUE LA TRAJO. La portada listaba, bajo "Y ajustas lo esencial tú
// mismo", el renglón *"Cómo responde tu asistente (su tono y qué dice)"*. Eso no
// se puede tocar desde el panel — y no es un pendiente, es una decisión: dejar que
// el cliente reescriba el guion sería dejarle borrar el bloque de vivienda justa o
// la regla de no dar precios, que son justo las que lo protegen a él. El tono se
// define una vez, en el arranque.
//
// La comprobación es estrecha a propósito: se mira SOLO la lista de ajustes y SOLO
// la palabra que delata esa promesa. Un guardián que intentara adivinar si cada
// renglón existe marcaría trabajo bueno, que es la otra mitad de la lección.
{
  const { TS: SITE_TEXTOS } = jiti(path.join(RAIZ, "lib", "site-textos.ts"));
  const prohibido = {
    // Sin \b: en JavaScript no reconoce vocales acentuadas y falla en silencio.
    es: /(?<![a-záéíóúüñ])(tono|gui[oó]n)(?![a-záéíóúüñ])/i,
    en: /\b(tone|script)\b/i,
  };
  const incluido = { es: /(inclu|vienen con)/i, en: /(included|come with)/i };

  for (const idioma of ["es", "en"]) {
    const d = SITE_TEXTOS?.[idioma]?.sistema?.dashboard;
    if (!d) {
      marca(`sitio · ${idioma}`, "no encuentro el bloque del panel en site-textos: si se movió, corregir la ruta aquí");
      continue;
    }
    for (const renglon of d.ajustes ?? []) {
      if (prohibido[idioma].test(renglon)) {
        marca(
          `sitio · ${idioma} · ajustes`,
          "promete ajustar el tono o el guion del asistente, y eso NO se puede desde el panel (ni debe: ahí viven las reglas que protegen al cliente)",
          renglon
        );
      }
    }
    if (!incluido[idioma].test(d.ajustesTitle ?? "")) {
      marca(
        `sitio · ${idioma} · ajustes`,
        "el encabezado no dice que los controles van INCLUIDOS, así que se leen como parte del panel de pago",
        d.ajustesTitle
      );
    }
  }
}

// ── 8 · El Portal solo le promete el interruptor a quien lo tiene ────────────
//
// El Portal le dice al cliente, mientras llena sus desarrollos, que después podrá
// pausarlos él mismo. Es verdad para las piezas que los OFRECEN (agente, voz, web)
// y mentira para las demás: un cliente de solo seguimiento no tiene esa pantalla.
// Es el fallo del Portal de agosto —hablarle de un producto que no compró— en el
// renglón nuevo.
{
  const { TA } = jiti(path.join(RAIZ, "lib", "arranque-textos.ts"));
  const promesa = { es: /pausas t[uú]/i, en: /you pause it yourself/i };
  const conInterruptor = ["hintAsistente", "hintWeb"];
  const sinInterruptor = ["hintMensajes", "hintPanel"];

  for (const idioma of ["es", "en"]) {
    const d = TA?.[idioma]?.desarrollos;
    if (!d) {
      marca(`arranque · ${idioma}`, "no encuentro los hint de desarrollos: si se movieron, corregir la ruta aquí");
      continue;
    }
    for (const k of conInterruptor) {
      if (!promesa[idioma].test(d[k] ?? "")) {
        marca(`arranque · ${idioma} · ${k}`, "estas piezas SÍ traen el interruptor y el Portal no se lo dice");
      }
    }
    for (const k of sinInterruptor) {
      if (promesa[idioma].test(d[k] ?? "")) {
        marca(
          `arranque · ${idioma} · ${k}`,
          "le promete pausar desarrollos a un cliente que NO tiene esa pantalla",
          (d[k] ?? "").slice(0, 90)
        );
      }
    }
  }
}

// ── Salida ───────────────────────────────────────────────────────────────────
if (fallos.length) {
  console.error(`❌ La consola no cuadra (${fallos.length}):\n`);
  for (const f of fallos) {
    console.error(`   ${f.donde}`);
    if (f.txt) console.error(`      "${f.txt}"`);
    console.error(`      → ${f.porque}\n`);
  }
  process.exit(1);
}

for (const a of avisos) console.log(`ℹ️  ${a}`);
const resumen = VALS.map((v) => `${v}=${(MANDOS_DE_PIEZA[v] ?? []).length}`).join(" · ");
console.log(
  `✅ Los controles que promete la propuesta son los que enseña el panel. ` +
    `${COMBOS.length} combinaciones × 2 idiomas. Mandos por pieza: ${resumen}`
);
