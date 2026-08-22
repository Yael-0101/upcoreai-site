// Guardián del VOCABULARIO Y DE LAS CIFRAS de la propuesta y del formulario.
//
//   node scripts/probar-propuesta-vocabulario.mjs   (corre en el prebuild)
//
// `probar-propuesta.mjs` comprueba que a cada cliente le salga el copy de SUS piezas.
// Esto es distinto: comprueba que lo que LEE no venga del nicho anterior, y que los
// números con los que se calcula su diagnóstico sean de este mercado.
//
// 🔴 POR QUÉ EXISTE. El 2026-08-22, leyendo la propuesta entera como la lee el
// prospecto, aparecieron cinco cosas que ningún guardián veía:
//
//   · «agenda de citas» y «dónde te caen las citas» — en este nicho son VISITAS.
//   · «Tus proyectos con precios — los que quieras mostrar» y «Los precios … son de
//     ejemplo hasta que nos pase los suyos»: el sitio NO publica precios (línea roja
//     nº1 del producto) y el config ni siquiera tiene dónde escribirlos.
//   · El formulario escribía «… MXN por cita» en los datos del lead.
//   · Los rangos de comisión seguían siendo los de clínicas ($150–$2,000): contestar
//     con honestidad hacía que el diagnóstico saliera 9 VECES MÁS BARATO que no
//     contestar, porque el motor tiene $18,000 por defecto.
//   · Las secciones se numeraban a mano y, sin la 2, el prospecto veía 1, 3, 4, 5…
//
// Los tres primeros son palabras. Los otros dos NO los ve ningún auditor de
// vocabulario: son números y son estructura. Por eso este guardián mira las tres cosas.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { soloVivo, textosVisibles, palabraCompleta } from "./lib-textos-visibles.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..");
const require = createRequire(import.meta.url);
// ⚠️ SIN CACHÉ, A PROPÓSITO. jiti guarda el TypeScript ya compilado en disco, y al
// probar este guardián inyectándole un defecto salió VERDE dos veces: estaba leyendo
// la versión anterior del archivo. Un guardián que revisa código viejo es peor que no
// tenerlo — da una luz verde falsa justo cuando acabas de romper algo. Se descubrió
// porque el mismo defecto sí saltaba al tocar también este archivo, y no al tocar solo
// el otro.
const jiti = require("jiti")(fileURLToPath(import.meta.url), { cache: false, requireCache: false });

const ARCHIVOS = [
  "lib/propuesta-copy.ts",
  "app/p/[token]/page.tsx",
  "components/EmpezarForm.tsx",
  "lib/calc.ts",
];

const REGLAS = [
  {
    id: "moneda",
    patron: palabraCompleta("MXN|pesos"),
    porque: "el cliente cotiza en dólares: un peso aquí es del mercado anterior",
    // ⚠️ `lib/calc.ts` es el ÚNICO que puede nombrar las dos monedas: es el módulo del
    // dinero y está parametrizado por `nicho.json`. Sus ramas en pesos son código
    // muerto mientras la moneda sea USD, y marcarlas es una alarma falsa. A cambio, la
    // moneda del nicho se comprueba directo más abajo, que es lo que de verdad decide.
    salvo: ["lib/calc.ts"],
  },
  {
    id: "vocabulario-clinicas",
    patron: palabraCompleta("paciente|pacientes|cl[ií]nica|cl[ií]nicas|consultorio|dentista|doctora?"),
    porque: "vocabulario del nicho de clínicas",
  },
  {
    id: "citas",
    patron: palabraCompleta("citas?"),
    porque: 'en este nicho el comprador agenda una VISITA, no una cita',
  },
  {
    id: "plural-de-plantilla",
    // "prospecto(s)", "día(s)", "unidad(es)": el paréntesis delata que el texto lo
    // armó una máquina, justo en el renglón que resume el beneficio.
    patron: /\w\(e?s\)/,
    porque: 'el "(s)" delata la plantilla — hay que resolver el plural',
  },
];

/** Frases que PROMETEN publicar precios. El sitio no los publica, por diseño. */
const PROMESA_PRECIOS =
  /precios?[^.]{0,60}(que quieras mostrar|para mostrar|son de ejemplo|aparecen)|(mostrar|publicar|se ven)[^.]{0,30}precios?/i;

let problemas = [];

// La moneda del nicho es la que de verdad decide. Se comprueba aqui, en su fuente,
// en vez de perseguir la palabra "MXN" por el modulo del dinero.
{
  const nicho = JSON.parse(fs.readFileSync(path.join(RAIZ, "lib", "nicho.json"), "utf8"));
  if (nicho.moneda !== "USD") {
    problemas.push({
      rel: "lib/nicho.json",
      linea: 0,
      palabra: nicho.moneda,
      txt: "",
      porque: "el nicho de Miami cobra en USD: con otra moneda toda la propuesta cambia de significado",
    });
  }
}

for (const rel of ARCHIVOS) {
  const ruta = path.join(RAIZ, rel);
  if (!fs.existsSync(ruta)) continue;
  for (const { linea, txt } of textosVisibles(soloVivo(fs.readFileSync(ruta, "utf8")))) {
    for (const r of REGLAS) {
      if (r.salvo?.includes(rel)) continue;
      const m = txt.match(r.patron);
      if (m) problemas.push({ rel, linea, txt: txt.slice(0, 85), palabra: m[0], porque: r.porque });
    }
    if (PROMESA_PRECIOS.test(txt)) {
      problemas.push({
        rel,
        linea,
        txt: txt.slice(0, 85),
        palabra: "promesa de precios",
        porque:
          "el sitio NO publica precios (línea roja del producto): prometerlos aquí es un reclamo el día de la entrega",
      });
    }
  }
}

// ── Las cifras del formulario tienen que servirle a ESTE mercado ─────────────
// La comisión que el prospecto elige es lo que multiplica toda la sección de
// "lo que te está costando". Si los rangos no abarcan el valor por defecto del
// motor, contestar la pregunta da un diagnóstico PEOR que no contestarla.
{
  const { PRODUCTO_OPTIONS } = jiti(path.join(RAIZ, "lib", "calc.ts"));
  if (!PRODUCTO_OPTIONS?.length) problemas.push({ rel: "lib/calc.ts", linea: 0, palabra: "catálogo vacío", txt: "", porque: "no se pudo leer el catálogo" });

  const form = fs.readFileSync(path.join(RAIZ, "components", "EmpezarForm.tsx"), "utf8");
  const bloque = form.match(/const TICKET_OPTIONS[\s\S]*?\];/)?.[0] || "";
  const numeros = [...bloque.matchAll(/val:\s*"([\d-]+)"/g)].flatMap((m) =>
    m[1].split("-").map(Number)
  );
  const DEFECTO = 18000; // COMISION_POR_GIRO en upcore-panel/lib/propuesta.ts

  if (!numeros.length) {
    problemas.push({
      rel: "components/EmpezarForm.tsx",
      linea: 0,
      palabra: "TICKET_OPTIONS",
      txt: "",
      porque: "no se pudieron leer los rangos de comisión",
    });
  } else if (Math.max(...numeros) < DEFECTO) {
    problemas.push({
      rel: "components/EmpezarForm.tsx",
      linea: 0,
      palabra: `tope $${Math.max(...numeros).toLocaleString("en-US")}`,
      txt: "",
      porque:
        `el motor usa $${DEFECTO.toLocaleString("en-US")} cuando el cliente NO contesta, y aquí ` +
        `lo más alto que puede elegir es menos que eso: responder empeoraría su diagnóstico`,
    });
  }
}

// ── Las secciones se numeran solas ───────────────────────────────────────────
// Dos de ellas son condicionales. Con los números escritos a mano, el prospecto veía
// 1, 3, 4, 5 — parece que la página se cargó mal, en el documento con el que le estás
// pidiendo que confíe.
{
  const pagina = fs.readFileSync(path.join(RAIZ, "app", "p", "[token]", "page.tsx"), "utf8");
  // ⚠️ El `\{?` no sobra: un número fijo puede venir como `titulo="5 · …"` pero
  // también como `titulo={`5 · …`}`. La primera versión solo miraba la forma con
  // comillas y se le escapó la del template literal — que es justo la que queda
  // cuando alguien "arregla" una sección y le vuelve a escribir el número a mano.
  const aMano = [...pagina.matchAll(/<Seccion titulo=\{?["'`]\s*(\d+)\s*·/g)];
  if (aMano.length) {
    problemas.push({
      rel: "app/p/[token]/page.tsx",
      linea: 0,
      palabra: `${aMano.length} sección(es) con número fijo`,
      txt: aMano.map((m) => m[1]).join(", "),
      porque: "las secciones condicionales dejan huecos: el número se calcula con num()",
    });
  }
}


// ── PARIDAD ENTRE ESPAÑOL E INGLÉS ───────────────────────────────────────────
//
// La propuesta se lee en los dos idiomas desde el 2026-08-22. Lo peligroso no es
// traducir mal una frase: es que las dos versiones acaben diciendo cosas distintas
// sin que nadie se entere. TypeScript ya obliga a que los dos idiomas tengan las
// mismas CLAVES (Record<Idioma, TextosProp>): si alguien agrega una frase en español
// y no la traduce, no compila. Lo que eso NO puede comprobar es lo de aquí abajo.
{
  const { TP } = jiti(path.join(RAIZ, "lib", "propuesta-textos.ts"));
  const { CALC_TEXTOS } = jiti(path.join(RAIZ, "lib", "calc-textos.ts"));
  const copy = jiti(path.join(RAIZ, "lib", "propuesta-copy.ts"));
  const { calculate } = jiti(path.join(RAIZ, "lib", "calc.ts"));

  const marca = (m) => problemas.push({ rel: "propuesta bilingüe", linea: 0, txt: "", ...m });

  // 1. Ningún texto puede quedarse SIN traducir: si el inglés es idéntico al
  //    español, o alguien lo copió y olvidó traducirlo, o falta.
  const recorre = (a, b, ruta = "") => {
    if (typeof a === "string") {
      // Se permiten los que son iguales por naturaleza: vacíos, muy cortos, o los
      // que solo llevan nombres propios y cifras (WhatsApp, Meta, "$0").
      const soloNombres = /^[^a-záéíóúñ]*$/i.test(a.replace(/WhatsApp|Meta|Upcore|Google|USD|IA|AI/g, ""));
      if (a && b && a === b && a.length > 25 && !soloNombres) {
        marca({ palabra: ruta, porque: `el inglés es idéntico al español: "${a.slice(0, 60)}"` });
      }
      return;
    }
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) {
        marca({ palabra: ruta, porque: `la lista tiene ${a.length} en español y ${b?.length} en inglés` });
        return;
      }
      a.forEach((x, i) => recorre(x, b[i], `${ruta}[${i}]`));
      return;
    }
    if (a && typeof a === "object") {
      for (const k of Object.keys(a)) {
        if (typeof a[k] === "function") continue; // las funciones se prueban ejecutándolas
        recorre(a[k], b?.[k], ruta ? `${ruta}.${k}` : k);
      }
    }
  };
  recorre(TP.es, TP.en);
  recorre(CALC_TEXTOS.es, CALC_TEXTOS.en);

  // 1b. Y que NO se cuele español dentro de la versión en inglés. El punto 1 solo
  //     cazaba el texto copiado TAL CUAL; si alguien escribe una frase nueva en
  //     español dentro de la tabla inglesa, son cadenas distintas y pasaba limpio.
  //     Se descubrió inyectando ese defecto exacto y viendo que el guardián callaba.
  const SOLO_ES = ["que", "para", "los", "las", "tu", "por", "con", "del", "una", "está", "todo"];
  const textosDe = (v, ruta = "", out = []) => {
    if (typeof v === "string") { if (v.length > 12) out.push([ruta, v]); return out; }
    if (typeof v === "function") {
      // Se EJECUTA con datos de mentira: media tabla son funciones y dejarlas fuera
      // es dejar fuera media revisión.
      try {
        const r = v(1, "X", "Y");
        if (typeof r === "string") out.push([ruta + "()", r]);
        else if (Array.isArray(r)) r.forEach((x, i) => textosDe(x, `${ruta}()[${i}]`, out));
      } catch { /* firmas que no aceptan estos argumentos: se saltan */ }
      return out;
    }
    if (v && typeof v === "object") for (const k of Object.keys(v)) textosDe(v[k], ruta ? `${ruta}.${k}` : k, out);
    return out;
  };
  for (const [ruta, txt] of [...textosDe(TP.en), ...textosDe(CALC_TEXTOS.en)]) {
    const intrusas = SOLO_ES.filter((w) => palabraCompleta(w).test(txt));
    if (intrusas.length >= 2) {
      marca({ palabra: ruta, porque: `español dentro de la tabla en inglés ("${intrusas.join(", ")}"): "${txt.slice(0, 60)}"` });
    }
  }

  // 2. MISMA ESTRUCTURA por pieza: si el inglés listara un punto de más o de menos,
  //    serían dos propuestas distintas, no una traducción.
  const PIEZAS = ["web", "agente", "voz", "auto", "reactivacion", "panel"];
  const combos = [];
  for (let m = 1; m < 1 << PIEZAS.length; m++) combos.push(PIEZAS.filter((_, i) => m & (1 << i)));
  for (const piezas of combos) {
    for (const agenda of ["papel", "software (Salesforce)", ""]) {
      const es = {
        parte: copy.tuParte(piezas, "es"),
        nuestra: copy.nuestraParte(piezas, copy.lineaAgendaPorPieza(agenda, piezas, "es"), "es"),
        no: copy.noNecesitas(piezas, "es"),
        faq: copy.faq(piezas, true, "es"),
        bonos: copy.bonos(piezas, agenda, "es"),
      };
      const en = {
        parte: copy.tuParte(piezas, "en"),
        nuestra: copy.nuestraParte(piezas, copy.lineaAgendaPorPieza(agenda, piezas, "en"), "en"),
        no: copy.noNecesitas(piezas, "en"),
        faq: copy.faq(piezas, true, "en"),
        bonos: copy.bonos(piezas, agenda, "en"),
      };
      for (const k of Object.keys(es)) {
        if (es[k].length !== en[k].length) {
          marca({
            palabra: `${piezas.join("+")} · ${k}`,
            porque: `español tiene ${es[k].length} y el inglés ${en[k].length}`,
          });
        }
      }
      // Los minutos de "Tu parte" son datos, no texto: tienen que coincidir.
      es.parte.forEach((x, i) => {
        if (en.parte[i] && x.min !== en.parte[i].min) {
          marca({ palabra: `${piezas.join("+")} · tuParte[${i}]`, porque: `los minutos no coinciden: ${x.min} vs ${en.parte[i].min}` });
        }
      });
    }
  }

  // 2b. 🔴 LO QUE SE RENDERIZA, NO SOLO LA TABLA.
  //
  //     La primera versión revisaba TP.en y CALC_TEXTOS.en, y salió verde con SEIS
  //     frases en español dentro de la página en inglés: las descripciones de los
  //     planes, el "/mes" pegado a los precios, y los plazos ("Días 2–14", "≈ Día 20",
  //     "3–4 semanas"). Ninguna vivía en la tabla — estaban en la página, en calc.ts y
  //     en acuerdo.ts. Se cazaron LEYENDO la propuesta publicada.
  //
  //     Así que aquí se revisa lo que de verdad SALE: cada cadena que producen las
  //     funciones de copy y el motor de cálculo, en inglés.
  {
    const { plazosSinTraducir, plazoEn, TIEMPOS } = jiti(path.join(RAIZ, "lib", "acuerdo.ts"));
    const faltan = plazosSinTraducir();
    if (faltan.length) {
      marca({ palabra: "plazos", porque: `sin traducción al inglés: ${faltan.join(", ")}` });
    }
    for (const t of Object.values(TIEMPOS)) {
      for (const v of [t.construccion, t.pruebas, t.entrega, t.total]) {
        const en = plazoEn(v, "en");
        if (/(d[ií]as?|semanas?|mes(es)?)/i.test(en)) {
          marca({ palabra: `plazo "${v}"`, porque: `en inglés sigue diciendo "${en}"` });
        }
      }
    }

    // El sufijo del dinero, comprobado DIRECTO sobre la función que lo produce.
    // Antes se buscaba "/mes" dentro del montón de cadenas que devuelve el motor y
    // la comprobación no era fiable; una aserción sobre `money()` y `precioFijo()`
    // no depende de que el agregado esté bien armado. Probar la función, no el bulto.
    {
      const { money, precioFijo } = jiti(path.join(RAIZ, "lib", "calc.ts"));
      const casos = [
        ["money", money(90, 250, true, "en").principal],
        ["money(igual)", money(600, 600, true, "en").principal],
        ["precioFijo", precioFijo(600, true, "en").principal],
      ];
      for (const [quien, v] of casos) {
        if (!v.endsWith("/month")) {
          marca({ palabra: quien, porque: `un precio mensual en inglés terminó en "${v}"` });
        }
      }
      if (!money(90, 250, true, "es").principal.endsWith("/mes")) {
        marca({ palabra: "money(es)", porque: "el precio mensual en español perdió su /mes" });
      }
    }

    // Todo lo que produce el motor en inglés, revisado palabra por palabra.
    const combos2 = [["web"], ["agente", "voz"], ["agente", "voz", "web", "auto", "reactivacion"]];
    for (const piezas of combos2) {
      for (const operacion of ["yo", "upcore"]) {
        const r = calculate({
          clinica: "comercializadora", productos: piezas, modo: "normal", operacion,
          msgs: "40", leads: "30", email: "", valorProspecto: 1800, idioma: "en",
        });
        const salidas = [
          r.inversionNota, r.costosNota, r.upcoreNota, r.ahorroNota, r.roiNota,
          r.recomendacion, r.inversion.principal, r.costosCliente.principal,
          r.mensualidadUpcore.principal, r.ahorro.principal,
          ...copy.tuParte(piezas, "en").map((x) => `${x.t} ${x.min}`),
          ...copy.nuestraParte(piezas, copy.lineaAgendaPorPieza("papel", piezas, "en"), "en"),
          ...copy.noNecesitas(piezas, "en"),
          ...copy.faq(piezas, true, "en").flatMap((f) => [f.q, f.a]),
          ...copy.bonos(piezas, "papel", "en").flatMap((b) => [b.titulo, b.desc]),
          copy.dia1Desc(piezas, "en"), copy.pruebasDesc(piezas, "en"),
          copy.entregaDesc(piezas, "en"), copy.filaCostos(piezas, "en").k,
          copy.filaCostos(piezas, "en").n, copy.invitacionRecortar(piezas, "en").texto,
          copy.copyBoceto(piezas, "Brickell", "en").intro,
          copy.copyBoceto(piezas, "Brickell", "en").esBoceto,
        ].filter(Boolean);
        for (const txt of salidas) {
          const intrusas = SOLO_ES.filter((w) => palabraCompleta(w).test(txt));
          // "/mes" no tiene espacios alrededor y se le escapa a la frontera de palabra:
          // se busca aparte, que es exactamente como se coló en los precios.
          if (/\/mes/.test(txt)) {
            marca({ palabra: `${piezas.join("+")}`, porque: `precio en inglés con "/mes": "${txt}"` });
          }
          if (intrusas.length >= 2) {
            marca({ palabra: `${piezas.join("+")}`, porque: `español en la salida inglesa ("${intrusas.join(", ")}"): "${txt.slice(0, 60)}"` });
          }
        }
      }
    }
  }

  // 3. MISMOS NÚMEROS. Que el idioma cambie una cifra es lo peor que puede pasar
  //    aquí, y es exactamente lo que nadie revisaría.
  for (const piezas of combos.slice(0, 12)) {
    for (const operacion of ["yo", "upcore"]) {
      const base = { clinica: "comercializadora", productos: piezas, modo: "normal", operacion, msgs: "40", leads: "30", email: "", valorProspecto: 1800 };
      const a = calculate({ ...base, idioma: "es" });
      const b = calculate({ ...base, idioma: "en" });
      // ⚠️ Se comparan las CIFRAS, no la frase: el sufijo cambia de idioma a
      //    propósito ("/mes" vs "/month") y compararlo entero marcaba como defecto
      //    justo la traducción correcta. Un guardián que marca lo bueno se deja de leer.
      const soloCifras = (v) => v.replace(/[^\d.,–-]/g, "");
      for (const campo of ["inversion", "costosCliente", "mensualidadUpcore", "ahorro"]) {
        if (soloCifras(a[campo].principal) !== soloCifras(b[campo].principal)) {
          marca({ palabra: `${piezas.join("+")} · ${campo}`, porque: `español ${a[campo].principal} vs inglés ${b[campo].principal}` });
        }
      }
      if (a.roi !== b.roi) marca({ palabra: `${piezas.join("+")} · roi`, porque: `${a.roi} vs ${b.roi}` });
      // Las CIFRAS que aparecen dentro de las notas también tienen que coincidir. El
      // primer intento solo comparaba los campos de dinero y se le escapó que una
      // nota (`roiNota`) dijera otro número según el idioma — que es justo el error
      // que nadie revisaría, porque va enterrado en una frase.
      const cifras = (r) =>
        [r.inversionNota, r.costosNota, r.upcoreNota, r.ahorroNota, r.roiNota]
          .join(" ")
          .match(/[\d][\d,.]*/g)
          ?.sort()
          .join(" ") ?? "";
      if (cifras(a) !== cifras(b)) {
        marca({
          palabra: `${piezas.join("+")} · cifras dentro de las notas`,
          porque: `español "${cifras(a)}" vs inglés "${cifras(b)}"`,
        });
      }
      if (a.incluye.length !== b.incluye.length) {
        marca({ palabra: `${piezas.join("+")} · incluye`, porque: "distinto número de piezas listadas" });
      }
    }
  }
}

if (problemas.length) {
  console.error(`❌ La propuesta le muestra al prospecto ${problemas.length} problema(s):\n`);
  for (const p of problemas) {
    console.error(`   ${p.rel}${p.linea ? ":" + p.linea : ""}  «${p.palabra}»`);
    if (p.txt) console.error(`      "${p.txt}"`);
    console.error(`      → ${p.porque}\n`);
  }
  process.exit(1);
}
console.log("✅ La propuesta habla el idioma del nicho y sus cifras son de este mercado.");
