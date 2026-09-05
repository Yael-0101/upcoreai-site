// Guardián del chat del sitio (2026-09-05). Corre en el prebuild, sin red.
//
//  · Las reglas puras de lib/chat-web.ts: qué sesión y qué texto se aceptan, y el limitador de
//    ráfagas (probado con el caso que DEBE fallar: la petición de más).
//  · Los textos del cascarón existen en los dos idiomas y ninguno queda vacío.
//  · El cascarón está montado en el layout raíz y la burbuja vieja ya no existe (dos lanzadores
//    flotantes se estorban).
//  · Contraste de los tokens que usa el panel, medido (WCAG): texto ≥ 4.5:1, iconos ≥ 3:1.
//  · El chat NO tiene textos del asistente escritos a mano: lo que dice viene del cerebro.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createRequire(path.join(RAIZ, "package.json"))("jiti")(path.join(RAIZ, "x.js"), { alias: { "@": RAIZ } });
const C = jiti(path.join(RAIZ, "lib", "chat-web.ts"));
const T = jiti(path.join(RAIZ, "lib", "site-textos.ts"));

let fallos = 0;
const ok = (que, cond, detalle = "") => {
  console.log(`  ${cond ? "✅" : "❌"} ${que}${cond ? "" : `   (${detalle})`}`);
  if (!cond) fallos++;
};

console.log("\nChat del sitio · reglas puras");
{
  ok("acepta un uuid como sesión", C.sesionValida("3f2a9c1e-7b4d-4e0a-9f11-2c5d8e7a6b90"));
  ok("acepta un id de 32 letras y dígitos", C.sesionValida("abcdefghijklmnopqrstuvwxyz012345"));
  ok("rechaza una sesión corta", !C.sesionValida("abc123"));
  ok("rechaza una sesión con caracteres raros", !C.sesionValida("abcdefghijklmnop<script>"));
  ok("rechaza una sesión que no es texto", !C.sesionValida(12345678901234567));
  ok("limpia espacios repetidos del texto", C.textoValido("  hola   mundo \n ") === "hola mundo");
  ok("rechaza texto vacío", C.textoValido("   ") === null);
  ok("rechaza texto más largo que el tope", C.textoValido("a".repeat(C.CHAT_LIMITES.maxCaracteres + 1)) === null);
  ok("acepta texto justo en el tope", C.textoValido("a".repeat(C.CHAT_LIMITES.maxCaracteres)) !== null);
  C._reiniciarLimites();
  const t0 = 1_000_000;
  let pasan = 0;
  for (let i = 0; i < 5; i++) if (C.permitido("ip:x", 3, 60_000, t0 + i)) pasan++;
  ok("el limitador deja pasar 3 de 5 en la misma ventana (la 4ª y la 5ª se frenan)", pasan === 3, String(pasan));
  ok("pasada la ventana, vuelve a dejar pasar", C.permitido("ip:x", 3, 60_000, t0 + 61_000));
  ok("otra clave no se mezcla", C.permitido("ip:y", 3, 60_000, t0));
  ok("hay texto de respaldo y de tope en los dos idiomas", ["es", "en"].every((i) => C.CHAT_RESPALDO[i]?.length > 20 && C.CHAT_TOPE[i]?.length > 20));
  ok("el respaldo manda al WhatsApp (el canal principal), no deja al visitante colgado", /WhatsApp/.test(C.CHAT_RESPALDO.es) && /WhatsApp/.test(C.CHAT_RESPALDO.en));
}

console.log("\nChat del sitio · textos en los dos idiomas");
{
  const CLAVES = ["abrir", "cerrar", "titulo", "sub", "bienvenida", "placeholder", "enviar", "seguirWa", "seguirWaCorto", "pensando", "privacidad"];
  for (const idi of ["es", "en"]) {
    const c = T.contenido(idi).chatWeb;
    ok(`${idi}: chatWeb trae las ${CLAVES.length} claves con texto`, c && CLAVES.every((k) => typeof c[k] === "string" && c[k].trim().length > 1), JSON.stringify(Object.keys(c || {})));
  }
  ok("la bienvenida dice que es una IA (honestidad del producto)", /IA\b/.test(T.contenido("es").chatWeb.bienvenida) && /\bAI\b/.test(T.contenido("en").chatWeb.bienvenida));
  ok("es y en no son el mismo texto", T.contenido("es").chatWeb.bienvenida !== T.contenido("en").chatWeb.bienvenida);
}

console.log("\nChat del sitio · montaje");
{
  const layout = fs.readFileSync(path.join(RAIZ, "app", "layout.tsx"), "utf8");
  ok("el layout raíz monta <ChatWeb />", /<ChatWeb\s*\/>/.test(layout) && /components\/ChatWeb/.test(layout));
  ok("la burbuja vieja ya no existe (un solo lanzador flotante)", !fs.existsSync(path.join(RAIZ, "components", "BurbujaWhatsApp.tsx")) && !/BurbujaWhatsApp/.test(layout));
  const comp = fs.readFileSync(path.join(RAIZ, "components", "ChatWeb.tsx"), "utf8");
  ok("el componente lee sus textos de site-textos, no trae frases sueltas del asistente", /contenido\(idioma\)\.chatWeb/.test(comp) && !/Soy el asistente/.test(comp));
  ok("el componente lleva la salida a WhatsApp (linkWhatsApp)", /linkWhatsApp\(idioma\)/.test(comp));
  ok("se esconde en propuesta, acuerdo y arranque", /"\/p\/"/.test(comp) && /"\/acuerdo\/"/.test(comp) && /"\/arranque\/"/.test(comp));
  ok("el diálogo se cierra con Escape y tiene nombre accesible", /Escape/.test(comp) && /role="dialog"/.test(comp) && /aria-label=\{t\.titulo\}/.test(comp));
  const ruta = fs.readFileSync(path.join(RAIZ, "app", "api", "chat", "route.ts"), "utf8");
  ok("la ruta avisa a Yael cuando cae al respaldo", /avisarFallo\(/.test(ruta) && /fallo: motivo/.test(ruta));
  ok("la ruta lee la IP real detrás de Cloudflare", /cf-connecting-ip/.test(ruta));
}

console.log("\nChat del sitio · contraste medido de los tokens que usa");
{
  const lum = (h) => {
    const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const OBS = "#1A1512", CLAY = "#C8623D", SAND = "#F2E7DB", MOCHA = "#B7A08C", WA = "#25D366";
  const r1 = cr(OBS, CLAY), r2 = cr(SAND, OBS), r3 = cr(MOCHA, OBS), r4 = cr(OBS, WA);
  ok(`texto obsidiana sobre clay (lanzador, burbuja del visitante, botón enviar) ≥ 4.5:1 — mide ${r1.toFixed(2)}`, r1 >= 4.5);
  ok(`texto sand sobre obsidiana (burbujas del asistente) ≥ 4.5:1 — mide ${r2.toFixed(2)}`, r2 >= 4.5);
  ok(`texto mocha sobre obsidiana (notas chicas) ≥ 4.5:1 — mide ${r3.toFixed(2)}`, r3 >= 4.5);
  ok(`texto obsidiana sobre verde WhatsApp ≥ 4.5:1 — mide ${r4.toFixed(2)}`, r4 >= 4.5);
}

console.log(fallos ? `\n❌ ${fallos} fallo(s) en el chat del sitio.\n` : "\n✅ Chat del sitio: reglas, textos, montaje y contraste en orden.\n");
process.exit(fallos ? 1 : 0);
