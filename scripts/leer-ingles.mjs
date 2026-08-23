// LEER EL SITIO INGLÉS PUBLICADO — la prueba que ninguna tabla puede sustituir.
//
//   npm run build && (arranca upcoreai-prod en el puerto 3100) && node scripts/leer-ingles.mjs
//
// NO va en el prebuild a propósito: necesita el sitio SIRVIÉNDOSE, y un guardián que
// no puede ver lo que verifica es peor que ninguno (lección del smoke test que llevaba
// semanas comprobando la página de login).
//
// Existe porque el mismo defecto apareció tres veces al traducir la propuesta, el
// acuerdo y el Portal: el guardián de las tablas salía VERDE y la página publicada
// tenía frases en español. Siempre en la capa que envuelve. Aquí se descarga el HTML
// ya renderizado y se lee lo que el visitante lee.
// Es la prueba que ninguna tabla puede sustituir: la lección de la propuesta y del
// Portal fue que el guardián salía verde y la página publicada tenía frases en español.
import path from "node:path";
import { fileURLToPath } from "node:url";
import createJiti from "jiti";

const BASE = process.argv[2] || "http://localhost:3100";

// ⚠️ Las rutas salen de RUTAS_INDEXABLES pasadas por `ruta()`, no de una lista a
// mano: la de antes se quedó obsoleta el mismo día en que las direcciones se
// tradujeron, y un lector apuntando a rutas viejas lee redirecciones y las da
// por buenas.
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..");
const jiti = createJiti(path.join(AQUI, "x.mjs"), {
  cache: false,
  requireCache: false,
  interopDefault: true,
});
const { RUTAS_INDEXABLES } = jiti(path.join(RAIZ, "lib", "seo.ts"));
const { ruta } = jiti(path.join(RAIZ, "lib", "rutas.ts"));

const RUTAS = [
  ...RUTAS_INDEXABLES.map((r) => ruta("en", r.path)),
  ruta("en", "/demo"),
].filter((v, i, a) => a.indexOf(v) === i);

if (RUTAS.length < 8) {
  console.error("❌ La lista de rutas salió casi vacía: el lector de lib/seo.ts falló.");
  process.exit(1);
}
const DELATORAS = ["que","para","con","los","las","una","por","más","cómo","qué","sin","también","cada","está","están","nuestro","nuestra","cliente","clientes","comprador","compradores","inmobiliaria","asesor","asesores","visita","visitas","gratis","precio","precios","diagnóstico","correo","llamada","llamadas","mensualidad","pago","pagos","prospecto","prospectos","seguimiento","sitio","agenda","empresa","meses","mes","días","semana","semanas","horario","equipo","firma","tu","tus","dónde","cuánto","hacer","desde","hasta","pero","como","este","esta","todo","toda"];
const frontera = (p) => new RegExp(`(?<![a-záéíóúüñ0-9])${p}(?![a-záéíóúüñ0-9])`, "i");

// ⚠️ EL CHAT DE LA DEMO SE QUEDA EN ESPAÑOL A PROPÓSITO: es el producto que se está
// enseñando (un asistente que atiende al comprador latinoamericano). Si saliera en
// inglés, el visitante entendería que vendemos atención en inglés — lo contrario del
// posicionamiento. Se quita ese texto ANTES de buscar, leyéndolo de su propia fuente
// para que no se desfase: si mañana cambia una burbuja, esto la sigue reconociendo.
// Un lector que siempre sale en rojo se deja de mirar, y entonces no sirve de nada.
// (`path`, `jiti` y `RAIZ` ya están arriba, donde se arma la lista de rutas.)
const { contenido } = jiti(path.join(RAIZ, "lib", "site-textos.ts"));
const { GIROS, demoGreeting, DEMO_DEFAULTS } = jiti(path.join(RAIZ, "lib", "demo-config.ts"));

const ESPERADO_EN_ESPANOL = [
  ...contenido("en").demoTeaser.burbujas.map((b) => b.texto),
  demoGreeting(DEMO_DEFAULTS.clinica),
  ...Object.values(GIROS).flatMap((g) => g.chips ?? []),
  // El NOMBRE de la inmobiliaria de la demo. Es un nombre propio, no texto sin
  // traducir: en Miami abundan las firmas con nombre en español. Y no se cambia
  // por gusto — es el centinela contra el que se compara el aviso de "un
  // prospecto probó tu demo" (app/api/demo/route.ts). Se whitelistea la cadena
  // EXACTA, nunca la palabra "inmobiliaria" suelta: eso taparía fugas de verdad.
  DEMO_DEFAULTS.clinica,
];

function visible(html) {
  // Fuera scripts, estilos y JSON-LD: solo lo que el visitante LEE.
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return s.replace(/&[a-z]+;|&#\d+;/gi, " ").replace(/\s+/g, " ");
}

let malas = 0;
for (const r of RUTAS) {
  const html = await (await fetch(BASE + r)).text();
  let txt = visible(html);
  // Fuera el diálogo de la demo (español por diseño) antes de buscar fugas.
  for (const frase of ESPERADO_EN_ESPANOL) {
    const limpia = visible(frase).trim();
    if (limpia) txt = txt.split(limpia).join(" ");
  }
  const hits = DELATORAS.filter((p) => frontera(p).test(txt));
  const t = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "(sin title)";
  const marca = hits.length ? "🔴" : "✅";
  if (hits.length) malas++;
  console.log(`${marca} ${r}\n     título: ${t}`);
  if (hits.length) {
    console.log(`     español: ${hits.join(", ")}`);
    for (const p of hits.slice(0, 3)) {
      const m = txt.match(new RegExp(`.{0,70}(?<![a-záéíóúüñ0-9])${p}(?![a-záéíóúüñ0-9]).{0,70}`, "i"));
      if (m) console.log(`       …${m[0].trim()}…`);
    }
  }
}
console.log(`\n${malas} de ${RUTAS.length} páginas con español.`);
