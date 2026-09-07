// Le mete al guardián bilingüe los defectos de los DOS esqueletos y comprueba que truene
// por su propia regla.
//
//   node scripts/probar-bilingue-inyectar.mjs
//
// 🔴 El defecto que motiva todo esto (2026-09-07) es el primero: el árbol inglés
// declarándose como español. Vivió meses porque no se ve en la pantalla.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const GUARDIAN = path.join(AQUI, "probar-sitio-bilingue.mjs");
const RAIZ = path.join(AQUI, "..");
const EN = path.join(RAIZ, "app", "(en)", "layout.tsx");
const ES = path.join(RAIZ, "app", "(es)", "layout.tsx");
const RAIZ_LAYOUT = path.join(RAIZ, "app", "layout.tsx");

function corre() {
  try {
    return { codigo: 0, salida: execFileSync(process.execPath, [GUARDIAN], { encoding: "utf8" }) };
  } catch (e) {
    return { codigo: e.status ?? 1, salida: (e.stdout || "") + (e.stderr || "") };
  }
}

const CASOS = [
  {
    que: "el árbol inglés vuelve a declararse como español (EL defecto original)",
    archivo: EN,
    de: '<html lang="en-US"',
    a: '<html lang="es-MX"',
    espera: /deber[íi]a declarar "en-US"/i,
  },
  {
    que: "un esqueleto escribe su propio cuerpo en vez de compartirlo",
    archivo: ES,
    de: "<CuerpoRaiz>{children}</CuerpoRaiz>",
    a: '<body className="font-sans antialiased">{children}</body>',
    espera: /cuerpo propio|escribe su propio cuerpo/i,
  },
  {
    que: "un esqueleto se escribe su metadata por su cuenta",
    archivo: EN,
    de: 'metaRaiz("en")',
    a: '{ title: "Upcore AI" }',
    espera: /metadata suelta/i,
  },
];

let malos = 0;
for (const c of CASOS) {
  const original = fs.readFileSync(c.archivo);
  const texto = original.toString("utf8");
  if (!texto.includes(c.de)) {
    console.log(`⚠️  no encontré dónde inyectar «${c.que}»`);
    malos++;
    continue;
  }
  let r;
  try {
    fs.writeFileSync(c.archivo, texto.replace(c.de, () => c.a), "utf8");
    r = corre();
  } finally {
    fs.writeFileSync(c.archivo, original);
  }
  if (!r.codigo) {
    console.log(`❌ ${c.que}: el guardián NO se dio cuenta`);
    malos++;
  } else if (!c.espera.test(r.salida)) {
    console.log(`❌ ${c.que}: tronó, pero por otra cosa`);
    malos++;
  } else {
    console.log(`✅ ${c.que}`);
  }
}

// Y el que no es un cambio de texto sino un archivo de más: un esqueleto en la raíz
// volvería a envolver los dos idiomas.
{
  let r;
  try {
    fs.writeFileSync(RAIZ_LAYOUT, "export default function X({children}){return children;}\n", "utf8");
    r = corre();
  } finally {
    fs.rmSync(RAIZ_LAYOUT, { force: true });
  }
  if (!r.codigo || !/esqueleto en la ra[íi]z/i.test(r.salida)) {
    console.log("❌ vuelve un esqueleto en la raíz: el guardián NO se dio cuenta");
    malos++;
  } else {
    console.log("✅ vuelve un esqueleto en la raíz");
  }
}

if (malos) {
  console.log(`\n❌ ${malos} defecto(s) no se cazan como deberían.`);
  process.exit(1);
}
console.log("\n✅ El guardián de los dos esqueletos caza los 4 defectos, cada uno por su regla.");
