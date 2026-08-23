// Prueba del pegado de desarrollos del Portal de Arranque.
//
//   node scripts/probar-pegar-desarrollos.mjs   (corre en el prebuild)
//
// Lo que se cuida aquí es que el atajo NO meta basura en los datos del cliente. Cada caso
// está escrito como lo pegaría alguien de verdad: desde una hoja de cálculo, desde un correo,
// desde una lista con viñetas.
//
// ⚠️ El caso que más importa es el de la COMA: los precios la llevan dentro
// ("desde 480,000"), así que partir por coma convertiría un precio en dos columnas. Se prueba
// a propósito porque es el error que se vería bonito y metería datos falsos.

import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const jiti = require("jiti")(fileURLToPath(import.meta.url));

const { pegarDesarrollos, MAX_PEGADAS } = jiti(path.join(AQUI, "..", "lib", "pegar-desarrollos.ts"));

let fallos = 0;
let casos = 0;

function comprobar(que, real, esperado) {
  casos++;
  const a = JSON.stringify(real);
  const b = JSON.stringify(esperado);
  if (a === b) {
    console.log(`  ✓ ${que}`);
  } else {
    fallos++;
    console.log(`  ✗ ${que}\n      esperaba ${b}\n      dio      ${a}`);
  }
}

const filas = (t) => pegarDesarrollos(t).filas;

console.log("\n── Lo más común: una lista de nombres a secas ──");
comprobar(
  "tres renglones sin separador → tres nombres, sin inventar precio ni tamaño",
  filas("Torre Brickell\nAventura Park\nDoral Towers"),
  [
    { nombre: "Torre Brickell", precio: "", duracion: "" },
    { nombre: "Aventura Park", precio: "", duracion: "" },
    { nombre: "Doral Towers", precio: "", duracion: "" },
  ]
);

console.log("\n── Pegado desde una hoja de cálculo (tabulaciones) ──");
comprobar(
  "tres columnas separadas por TAB",
  filas("Torre Brickell\tdesde 480,000\t2 rec · 1,100 ft²"),
  [{ nombre: "Torre Brickell", precio: "desde 480,000", duracion: "2 rec · 1,100 ft²" }]
);
comprobar(
  "el encabezado de la hoja NO se cuela como desarrollo",
  filas("Desarrollo\tPrecio\tRecámaras\nTorre Brickell\tdesde 480,000\t2 rec"),
  [{ nombre: "Torre Brickell", precio: "desde 480,000", duracion: "2 rec" }]
);
comprobar(
  "…pero un desarrollo que se PARECE a un encabezado sí entra (lleva número)",
  filas("Torre 1\nTorre 2"),
  [
    { nombre: "Torre 1", precio: "", duracion: "" },
    { nombre: "Torre 2", precio: "", duracion: "" },
  ]
);

console.log("\n── 🔴 La coma NO parte columnas (los precios la llevan dentro) ──");
comprobar(
  "un precio con coma se queda entero",
  filas("Torre Brickell | desde 480,000 | 2 rec"),
  [{ nombre: "Torre Brickell", precio: "desde 480,000", duracion: "2 rec" }]
);
comprobar(
  "un nombre con coma y sin separador NO se parte en dos",
  filas("Torre Brickell, Miami"),
  [{ nombre: "Torre Brickell, Miami", precio: "", duracion: "" }]
);

console.log("\n── Listas escritas a mano ──");
comprobar(
  "viñetas y numeración se quitan",
  filas("- Torre Brickell\n• Aventura Park\n1. Doral Towers\n2) Coral Bay"),
  [
    { nombre: "Torre Brickell", precio: "", duracion: "" },
    { nombre: "Aventura Park", precio: "", duracion: "" },
    { nombre: "Doral Towers", precio: "", duracion: "" },
    { nombre: "Coral Bay", precio: "", duracion: "" },
  ]
);
comprobar(
  "separador con raya larga",
  filas("Torre Brickell — desde 480,000 — 2 rec"),
  [{ nombre: "Torre Brickell", precio: "desde 480,000", duracion: "2 rec" }]
);
comprobar(
  "…pero una raya PEGADA al texto es parte del nombre, no un separador",
  filas("Torre Brickell—Fase 2"),
  [{ nombre: "Torre Brickell—Fase 2", precio: "", duracion: "" }]
);
comprobar(
  "renglones vacíos y espacios de más no ensucian",
  filas("  Torre Brickell  \n\n\n   \nAventura Park"),
  [
    { nombre: "Torre Brickell", precio: "", duracion: "" },
    { nombre: "Aventura Park", precio: "", duracion: "" },
  ]
);

console.log("\n── Bordes ──");
comprobar("vacío no devuelve nada", filas(""), []);
comprobar("solo espacios no devuelve nada", filas("   \n  \n"), []);
casos++;
{
  const muchas = Array.from({ length: MAX_PEGADAS + 25 }, (_, i) => `Torre ${i + 1}`).join("\n");
  const r = pegarDesarrollos(muchas);
  if (r.filas.length === MAX_PEGADAS && r.recortado) {
    console.log(`  ✓ se recorta en ${MAX_PEGADAS} y lo AVISA (recortado=true)`);
  } else {
    fallos++;
    console.log(`  ✗ el tope falló: ${r.filas.length} filas, recortado=${r.recortado}`);
  }
}
casos++;
{
  const r = pegarDesarrollos("Desarrollo\tPrecio\nTorre Brickell\tdesde 480,000");
  if (r.ignorados === 1) console.log("  ✓ cuenta el encabezado como ignorado (para poder decirlo)");
  else {
    fallos++;
    console.log(`  ✗ ignorados=${r.ignorados}, esperaba 1`);
  }
}

console.log(`\nCasos probados: ${casos}`);
if (fallos) {
  console.log(`❌ ${fallos} fallo(s)`);
  process.exit(1);
}
console.log("✅ El pegado de desarrollos no inventa columnas ni se traga renglones buenos.");
