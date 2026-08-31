// GUARDIÁN DE METADATA SEO — longitudes y duplicados de <title> y meta description.
//
//   node scripts/probar-seo-meta.mjs
//
// 🔴 POR QUÉ EXISTE (2026-08-31). El sitio tiene ~22 pares de title/description
// escritos a mano en dos idiomas y NINGUNA regla los medía: un título que Google
// trunca ("...") o dos páginas con la misma description compitiendo entre sí no
// dan error ni se ven en pantalla — solo pierden clics en el buscador.
//
// Qué mide, por idioma, sobre el título FINAL (el que sale en la pestaña):
//   · title ≤ LIMITE_TITLE — contando el " | Upcore AI" que agrega el template
//     del layout, y respetando los títulos absolutos (la portada YA trae la
//     marca; medir el título "a secas" repetiría el bug del 2026-08-22).
//   · metaDescription entre LIMITE_DESC_MIN y LIMITE_DESC_MAX.
//   · Cero titles duplicados y cero descriptions duplicadas dentro del idioma.
//   · Toda ruta de RUTAS_INDEXABLES tiene su meta conocida por este guardián —
//     si alguien agrega una página nueva, esto truena y pide mapearla aquí
//     (el hueco contrario: un guardián que no conoce la página no la vigila).
//
// Las metas se leen DE LAS MISMAS FUENTES que usan las páginas (site-textos,
// paginas-textos, empezar-textos, legal-textos, soluciones, blog), no de una
// copia: regla de la casa — el verificador y la pantalla leen la misma función.

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

const { RUTAS_INDEXABLES, SITE_NAME } = jiti(path.join(RAIZ, "lib", "seo.ts"));
const { ARTICULOS } = jiti(path.join(RAIZ, "lib", "blog.ts"));
const { SOLUCIONES } = jiti(path.join(RAIZ, "lib", "soluciones.ts"));
const { contenido } = jiti(path.join(RAIZ, "lib", "site-textos.ts"));
const { paginas } = jiti(path.join(RAIZ, "lib", "paginas-textos.ts"));
const { empezar } = jiti(path.join(RAIZ, "lib", "empezar-textos.ts"));
const { legal } = jiti(path.join(RAIZ, "lib", "legal-textos.ts"));

// Los límites viven en lib/verificacion-seo.ts — la ÚNICA copia, compartida
// con la verificación en vivo. Dos números iguales en dos archivos se separan.
const { LIMITES_META } = jiti(path.join(RAIZ, "lib", "verificacion-seo.ts"));
const LIMITE_TITLE = LIMITES_META.title;
const LIMITE_DESC_MIN = LIMITES_META.descMin;
const LIMITE_DESC_MAX = LIMITES_META.descMax;

// Permite inyectar un defecto para probar el guardián: --inyectar=title|desc|dup
const INYECTAR = (process.argv.find((a) => a.startsWith("--inyectar=")) || "").split("=")[1];

const IDIOMAS = ["es", "en"];
const fallos = [];

/** Lista de {ruta, idioma, title (FINAL, con marca), desc} — misma fuente que las páginas. */
function metasDe(idioma) {
  const conMarca = (t) => `${t} | ${SITE_NAME}`;
  const p = paginas(idioma);
  const e = empezar(idioma);
  const l = legal(idioma);
  const m = contenido(idioma).meta;
  const lista = [
    // La portada usa tituloAbsoluto: el título YA trae la marca, se mide tal cual.
    { ruta: "/", title: m.title, desc: m.description },
    { ruta: "/empezar", title: conMarca(e.h1), desc: e.subA + e.subFuerte + e.subB },
    { ruta: "/demo", title: conMarca(p.demo.metaTitle), desc: p.demo.metaDescription },
    { ruta: "/precios", title: conMarca(p.precios.metaTitle), desc: p.precios.metaDescription },
    { ruta: "/nosotros", title: conMarca(p.nosotros.metaTitle), desc: p.nosotros.metaDescription },
    { ruta: "/blog", title: conMarca(p.blog.metaTitle), desc: p.blog.metaDescription },
    { ruta: "/privacidad", title: conMarca(l.privacidad.metaTitle), desc: l.privacidad.metaDescription },
    { ruta: "/terminos", title: conMarca(l.terminos.metaTitle), desc: l.terminos.metaDescription },
    ...SOLUCIONES.map((s) => ({
      ruta: `/soluciones/${s.slug}`,
      title: conMarca(s.t[idioma].title),
      desc: s.t[idioma].metaDescription,
    })),
    ...ARTICULOS.map((a) => ({
      ruta: `/blog/${a.slug}`,
      title: conMarca(a.t[idioma].title),
      desc: a.t[idioma].metaDescription,
    })),
  ];
  if (INYECTAR === "title") {
    lista[3] = { ...lista[3], title: lista[3].title + " y además un pegote larguísimo que Google va a truncar sin piedad" };
  }
  if (INYECTAR === "desc") {
    lista[4] = { ...lista[4], desc: "Demasiado corta." };
  }
  if (INYECTAR === "dup") {
    lista[5] = { ...lista[5], desc: lista[2].desc };
  }
  return lista.map((x) => ({ ...x, idioma }));
}

// ── 1) Cobertura: toda ruta indexable tiene meta conocida ────────────────────
const rutasConMeta = new Set(metasDe("es").map((m) => m.ruta));
for (const r of RUTAS_INDEXABLES) {
  if (!rutasConMeta.has(r.path)) {
    fallos.push(
      `${r.path} está en RUTAS_INDEXABLES pero este guardián no sabe de dónde sale su metadata — mapéala en metasDe()`
    );
  }
}
if (rutasConMeta.size < 10) {
  fallos.push("La lista de metas salió casi vacía: el lector de las fuentes falló.");
}

// ── 2) Longitudes y 3) duplicados, por idioma ────────────────────────────────
for (const idioma of IDIOMAS) {
  const metas = metasDe(idioma);
  const porTitle = new Map();
  const porDesc = new Map();

  for (const m of metas) {
    if (!m.title || !m.title.trim()) fallos.push(`[${idioma}] ${m.ruta}: title vacío`);
    if (!m.desc || !m.desc.trim()) fallos.push(`[${idioma}] ${m.ruta}: description vacía`);

    if (m.title.length > LIMITE_TITLE) {
      fallos.push(
        `[${idioma}] ${m.ruta}: title de ${m.title.length} caracteres (máx ${LIMITE_TITLE}, contando la marca) — "${m.title}"`
      );
    }
    if (m.desc.length > LIMITE_DESC_MAX) {
      fallos.push(
        `[${idioma}] ${m.ruta}: description de ${m.desc.length} caracteres (máx ${LIMITE_DESC_MAX}) — Google la corta con "…"`
      );
    }
    if (m.desc.length < LIMITE_DESC_MIN) {
      fallos.push(
        `[${idioma}] ${m.ruta}: description de ${m.desc.length} caracteres (mín ${LIMITE_DESC_MIN}) — desperdicia el espacio del resultado`
      );
    }

    const yaT = porTitle.get(m.title);
    if (yaT) fallos.push(`[${idioma}] title duplicado entre ${yaT} y ${m.ruta}: "${m.title}"`);
    else porTitle.set(m.title, m.ruta);

    const yaD = porDesc.get(m.desc);
    if (yaD) fallos.push(`[${idioma}] description duplicada entre ${yaD} y ${m.ruta}`);
    else porDesc.set(m.desc, m.ruta);
  }
}

if (fallos.length) {
  console.error(`❌ Metadata SEO con ${fallos.length} problema(s):\n`);
  for (const f of fallos) console.error("   ·", f);
  process.exit(1);
}
console.log(
  `✅ Metadata SEO: ${rutasConMeta.size} páginas × 2 idiomas con title ≤ ${LIMITE_TITLE}, description ${LIMITE_DESC_MIN}–${LIMITE_DESC_MAX} y sin duplicados.`
);
