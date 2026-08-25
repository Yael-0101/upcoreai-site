// Le mete al guardián del Portal los defectos del paso «Tu equipo», y comprueba que
// truene POR SU REGLA.
//
//   node scripts/probar-arranque-inyectar.mjs
//
// 🔴 Un guardián en verde desde el primer intento no prueba nada. Y exigir que
// truene no basta: hay que exigir que truene por ESO, o acabas aprobando un acierto
// por casualidad.
//
// ⚠️ El archivo se restaura desde su BUFFER original, byte a byte: los .ts con texto
// en español no se tocan con herramientas de texto de la terminal.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const OBJETIVO = path.join(AQUI, "..", "lib", "arranque.ts");
const GUARDIAN = path.join(AQUI, "probar-arranque.mjs");

const ORIGINAL = fs.readFileSync(OBJETIVO);
const texto = ORIGINAL.toString("utf8");

const DEFECTOS = [
  {
    que: "al cliente del panel no se le pregunta por su equipo (el defecto original)",
    de: '  if (tiene("panel")) pasos.push("equipo");',
    a: "",
    espera: /NO se le pregunta quiénes son sus asesores/i,
  },
  {
    que: "el paso del equipo se le cuela a quien no compró el panel",
    de: '  if (tiene("panel")) pasos.push("equipo");',
    a: '  pasos.push("equipo");',
    espera: /se le pide su equipo de ventas y no compró el panel/i,
  },
  {
    que: "una fila sin sembrar deja de ver un paso",
    de: '  if (tiene("panel")) pasos.push("equipo");',
    a: '  if (p.includes("panel")) pasos.push("equipo");',
    espera: /no ve el paso "equipo"/i,
  },
];

let malos = 0;

for (const d of DEFECTOS) {
  if (!texto.includes(d.de)) {
    console.log(`🔴 NO SE PUDO INYECTAR «${d.que}» — el texto buscado ya no existe.`);
    console.log("   Un inyector que no inyecta da un APROBADO falso. Hay que actualizarlo.");
    malos++;
    continue;
  }
  fs.writeFileSync(OBJETIVO, texto.replace(d.de, d.a), "utf8");
  let salida = "";
  let trono = false;
  try {
    salida = execFileSync(process.execPath, [GUARDIAN], { encoding: "utf8" });
  } catch (e) {
    trono = true;
    salida = `${e.stdout || ""}${e.stderr || ""}`;
  } finally {
    fs.writeFileSync(OBJETIVO, ORIGINAL);
  }

  const porSuRegla = d.espera.test(salida.replace(/\s+/g, " "));
  const bien = trono && porSuRegla;
  if (!bien) malos++;
  console.log(`${bien ? "✅" : "🔴"} ${d.que}`);
  if (!trono) console.log("     …y el guardián lo dejó pasar.");
  else if (!porSuRegla) console.log("     …tronó, pero por OTRA regla.");
}

const igual = fs.readFileSync(OBJETIVO).equals(ORIGINAL);
console.log(`${igual ? "✅" : "🔴"} arranque.ts quedó byte a byte como estaba`);
if (!igual) malos++;

console.log(malos ? `\n🔴 ${malos} problema(s)` : "\n✅ el guardián caza los 3 defectos, cada uno por su regla");
process.exit(malos ? 1 : 0);
