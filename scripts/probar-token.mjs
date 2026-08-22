// Guardián: los tokens de los links que se le mandan al cliente POR WHATSAPP
// tienen que sobrevivir a WhatsApp.
//
// 🔴 DE DÓNDE SALE (2026-08-19). La lección ya existía y ya tenía guardián… pero solo en
// `upcore-panel`. Esta ruta —`app/api/acuerdo-auto/route.ts`, la que genera el link del
// ACUERDO, el documento más importante que se le manda a un cliente— seguía usando
// `randomBytes(18).toString("base64url")`, que mete "_" y "-". En WhatsApp, `_texto_` es
// cursiva: la app se come los guiones bajos, el link llega mutilado y el cliente ve
// "este documento ya no está disponible". Sin error en ningún lado.
// Lo encontró la auditoría de seguridad al revisar el diff antes de publicar.
//
// Por eso este guardián comprueba DOS cosas, y la segunda es la que importa:
//   1. Que `nuevoToken()` genere solo letras y números.
//   2. Que NINGUNA ruta del proyecto se fabrique su propio token por otro lado.
//      Sin esa segunda prueba, mañana alguien vuelve a escribir `base64url` en una
//      ruta nueva y el guardián sigue en verde mientras el cliente recibe un link roto.
//
// Correr con:  node scripts/probar-token.mjs   (corre en el prebuild)

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..");
const require = createRequire(import.meta.url);
const jiti = require("jiti")(fileURLToPath(import.meta.url));

const { nuevoToken, tokenSeguro } = jiti(path.join(RAIZ, "lib", "token.ts"));

const fallos = [];

// ── 1. Los tokens que genera sobreviven a WhatsApp ───────────────────────────
const CUANTOS = 3000;
const vistos = new Set();
for (let i = 0; i < CUANTOS; i++) {
  const t = nuevoToken();
  if (!tokenSeguro(t)) fallos.push(`token con caracteres que WhatsApp rompe: "${t}"`);
  if (t.length !== 22) fallos.push(`token de largo ${t.length}, se esperaban 22: "${t}"`);
  vistos.add(t);
}
if (vistos.size !== CUANTOS) {
  fallos.push(`${CUANTOS - vistos.size} token(s) repetido(s) de ${CUANTOS} — el generador no es aleatorio`);
}

// Y que la comprobación no sea complaciente: tiene que RECHAZAR lo que rompe.
for (const malo of ["abc_def", "abc-def", "vnSKiz2_FjMGAKKiNzh30-m_", "abc.def", "abc def"]) {
  if (tokenSeguro(malo)) fallos.push(`tokenSeguro() acepta "${malo}", que WhatsApp mutila`);
}

// ── 2. Nadie más se fabrica tokens por su cuenta ─────────────────────────────
// Esta es la prueba que habría cazado el fallo: el generador estaba bien, pero una
// ruta no lo usaba.
// ⚠️ La primera versión de esta regla marcaba `Math.random()` en cualquier parte, y
// tumbó código CORRECTO: `lib/demo.ts` arma un folio FICTICIO para la demo
// (`DEMO-1234`) que nunca viaja en una URL. Es la lección de la casa sobre el
// verificador demasiado bruto — uno que bloquea lo bueno se deja de usar igual que uno
// que deja pasar lo malo.
//
// Ahora se separa:
//   · `base64url` / `randomBytes` / `randomUUID` → generación de token, siempre se marca.
//   · `Math.random()` → solo se marca si en esa misma línea se habla de un TOKEN, que es
//     lo que lo vuelve peligroso (un token adivinable), no el `Math.random` en sí.
const GENERA_TOKEN = /base64url|randomBytes|randomUUID/;
const RANDOM_DEBIL = /Math\.random\s*\(/;
const ES_TOKEN = /token/i;
const esSospechosa = (l) => GENERA_TOKEN.test(l) || (RANDOM_DEBIL.test(l) && ES_TOKEN.test(l));
function recorrer(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      recorrer(p);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(e.name)) continue;
    // lib/token.ts es el ÚNICO que puede usar randomBytes: es el dueño.
    if (path.relative(RAIZ, p) === path.join("lib", "token.ts")) continue;
    fs.readFileSync(p, "utf8")
      .split(/\r?\n/)
      .forEach((linea, i) => {
        if (/^\s*(\/\/|\*|\/\*)/.test(linea)) return; // comentarios no generan nada
        if (esSospechosa(linea)) {
          fallos.push(
            `${path.relative(RAIZ, p)}:${i + 1} se fabrica un token por su cuenta:\n` +
              `      ${linea.trim()}\n` +
              `      Remedio: usar nuevoToken() de lib/token.ts.`,
          );
        }
      });
  }
}
for (const d of ["app", "lib", "components"]) {
  const full = path.join(RAIZ, d);
  if (fs.existsSync(full)) recorrer(full);
}

if (fallos.length) {
  console.error(`❌ Guardián de tokens: ${fallos.length} problema(s)\n`);
  fallos.forEach((f) => console.error("• " + f + "\n"));
  process.exit(1);
}

console.log(
  `✅ Los tokens sobreviven a WhatsApp: ${CUANTOS} probados, solo letras y números, sin repetidos, y nadie se fabrica los suyos aparte.`,
);
