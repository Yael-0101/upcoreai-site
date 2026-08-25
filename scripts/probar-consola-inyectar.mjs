// Le enseña a `probar-consola.mjs` los defectos que debe cazar en la frontera
// panel ↔ consola, y comprueba que truene POR SU REGLA.
//
//   node scripts/probar-consola-inyectar.mjs
//
// 🔴 POR QUÉ (2026-08-25)
// El §6 de ese guardián llevaba desde el 24 de agosto vigilando una sola dirección:
// exigía que la CONSOLA no prometiera métricas, y jamás que el PANEL no prometiera
// mandos. Por ese hueco pasó en verde la frase que cobraba $3,000 por "cómo va cada
// comprador y a quién hay que llamar hoy" — dos pantallas que ya van incluidas.
// La regla nueva se prueba metiéndole justo esa frase.
//
// ⚠️ El archivo se restaura desde el BUFFER original, byte a byte.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const OBJETIVO = path.join(AQUI, "..", "lib", "calc-textos.ts");
const GUARDIAN = path.join(AQUI, "probar-consola.mjs");

const ORIGINAL = fs.readFileSync(OBJETIVO);
const texto = ORIGINAL.toString("utf8");

const DEFECTOS = [
  {
    que: "el panel en español vuelve a cobrar «a quién hay que llamar hoy»",
    de: "Panel del director comercial — en español e inglés: cada asesor con su propio acceso, cómo va cada uno y el camino de cada comprador hasta la venta, con tu retorno real a la vista",
    a: "Panel del director comercial — además de tus controles: cómo va cada comprador, a quién hay que llamar hoy y tu retorno a la vista",
    espera: /COBRA algo que ya va incluido.*a qui[ée]n llamar hoy/i,
  },
  {
    que: "el panel en inglés vuelve a cobrar «who to call today»",
    de: "Sales director's dashboard — in Spanish and English: every agent with their own login, how each one is doing and every buyer's path all the way to the sale, with your real return in plain view",
    a: "Sales director's dashboard — on top of your controls: how every buyer is doing, who to call today and your return in plain view",
    espera: /COBRA algo que ya va incluido.*who to call today/i,
  },
  {
    que: "el panel deja de nombrar el retorno y se confunde con la consola",
    de: "cómo va cada uno y el camino de cada comprador hasta la venta, con tu retorno real a la vista",
    a: "cómo va cada uno y el camino de cada comprador hasta la venta",
    espera: /no nombra lo que de verdad añade/i,
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
console.log(`${igual ? "✅" : "🔴"} calc-textos.ts quedó byte a byte como estaba`);
if (!igual) malos++;

console.log(malos ? `\n🔴 ${malos} problema(s)` : "\n✅ el §6 caza los 3 defectos, cada uno por su regla");
process.exit(malos ? 1 : 0);
