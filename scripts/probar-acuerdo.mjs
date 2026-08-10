// Prueba del generador de acuerdos: TODAS las combinaciones posibles de piezas y planes.
//
// Esto es lo que sostiene la promesa de "el bot arma el acuerdo sin errores". El acuerdo
// no lo redacta ninguna IA: se llena copiando campos de la propuesta congelada. Aquí se
// comprueba que ese llenado es correcto en los 124 casos que pueden llegar a existir.
//
// Correr con:  npm run probar:acuerdo
// Si un solo caso falla, sale con error y el acuerdo automático NO debe encenderse.

// El TypeScript real del sitio se carga con jiti (el mismo cargador que usa Next para
// sus configs): así la prueba corre EXACTAMENTE el código que verá el cliente, sin una
// segunda copia que se pueda desfasar.
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const jiti = require("jiti")(fileURLToPath(import.meta.url));

const { PRODUCTO_OPTIONS, calculate, precioFijo } = jiti(path.join(AQUI, "..", "lib", "calc.ts"));
const { datosAcuerdo } = jiti(path.join(AQUI, "..", "lib", "acuerdo.ts"));

// ── Construir un snapshot igual al que congela el panel ───────────────────────
// Espejo de snapshotDeLead() (upcore-panel/lib/propuesta.ts:272): mismos campos y misma
// forma de calcular llave/gestionado (calculate con operacion "yo" / "upcore").

function snapshotFalso(piezas, conPanel) {
  const base = {
    clinica: "dental",
    productos: piezas,
    modo: conPanel ? "sistema" : "normal",
    operacion: null,
    msgs: "40",
    leads: "30",
    email: "",
  };
  const llave = calculate({ ...base, operacion: "yo" });
  const gestionado = calculate({ ...base, operacion: "upcore" });

  // Las piezas que NO contrató se cotizan aparte: es lo que alimenta el "qué NO incluye".
  const opcionales = PRODUCTO_OPTIONS.filter((p) => !piezas.includes(p.val)).map((p) => ({
    val: p.val,
    label: p.label,
    alcance: p.alcance,
    precio: precioFijo(p.setupMXN),
    razon: "puede esperar",
  }));

  return {
    version: 3,
    fecha: new Date("2026-08-05T12:00:00Z").toISOString(),
    lead: {
      nombre: "Dr. Fernando Ramírez",
      clinica: "Clínica Dental Ejemplo",
      decisor: "director",
      tipo_clinica: "dental",
      tamano: "6-10",
    },
    diag: {
      volumen: "40-60",
      agenda_hoy: "papel",
      canales: "whatsapp",
      detalle: "se pierden citas",
      urgencia: "alta",
      mensaje: "",
      objetivo: "no-perder-citas",
      presencia: "solo-redes",
    },
    incluye: llave.incluye,
    opcionales,
    complejidad: llave.complejidad,
    llave,
    gestionado,
    recomendacion: llave.recomendacion || "",
  };
}

/** Todos los subconjuntos NO vacíos de las piezas del catálogo. */
function subconjuntos(lista) {
  const salida = [];
  for (let mascara = 1; mascara < 1 << lista.length; mascara++) {
    salida.push(lista.filter((_, i) => mascara & (1 << i)));
  }
  return salida;
}

const pesos = (s) => Number(String(s).replace(/[^0-9]/g, ""));

/** Recorre el documento y devuelve todo su texto, para poder buscar basura dentro. */
function textoCompleto(doc) {
  const partes = [doc.clinica, doc.contacto, doc.planLabel, doc.intro];
  for (const sec of doc.secciones) {
    partes.push(sec.titulo);
    for (const b of sec.bloques) {
      if (b.tipo === "texto") partes.push(b.texto);
      else if (b.tipo === "lista") partes.push(...b.items);
      else if (b.tipo === "tabla") partes.push(...b.filas.flat());
    }
  }
  return partes.join("\n");
}

// ── Las comprobaciones ────────────────────────────────────────────────────────

const fallos = [];
let casos = 0;

const VALS = PRODUCTO_OPTIONS.map((p) => p.val);

for (const piezas of subconjuntos(VALS)) {
  for (const conPanel of [false, true]) {
    const snap = snapshotFalso(piezas, conPanel);

    for (const plan of ["llave", "gestionado"]) {
      casos++;
      const etiqueta = `[${piezas.join("+")}${conPanel ? "+panel" : ""} · ${plan}]`;
      const doc = datosAcuerdo(snap, plan);

      if (!doc) {
        fallos.push(`${etiqueta} devolvió null (debería generar acuerdo)`);
        continue;
      }

      const texto = textoCompleto(doc);

      // 1. Nada sin llenar ni valores rotos.
      for (const basura of ["{{", "undefined", "NaN", "null", "[object"]) {
        if (texto.includes(basura)) fallos.push(`${etiqueta} contiene "${basura}"`);
      }

      // 2. Los dos pagos suman EXACTAMENTE el precio.
      const total = pesos(doc.precio);
      const suma = pesos(doc.anticipo) + pesos(doc.resto);
      if (suma !== total) {
        fallos.push(`${etiqueta} anticipo+resto = ${suma} pero el precio es ${total}`);
      }
      if (pesos(doc.anticipo) <= 0) fallos.push(`${etiqueta} anticipo en cero`);

      // 3. El precio es idéntico al de SU propuesta (no puede haber dos fuentes de verdad).
      if (doc.precio !== snap[plan].inversion.mxn) {
        fallos.push(
          `${etiqueta} el acuerdo dice ${doc.precio} y la propuesta ${snap[plan].inversion.mxn}`
        );
      }

      // 4. Ninguna pieza contratada puede aparecer también como "no incluida".
      const sec1 = doc.secciones.find((s) => s.n === 1);
      const noIncluye = (
        sec1.bloques.find((b) => b.tipo === "texto" && b.texto.includes("NO incluye"))?.texto || ""
      ).toLowerCase();
      for (const val of piezas) {
        const label = PRODUCTO_OPTIONS.find((p) => p.val === val).label.toLowerCase();
        if (noIncluye.includes(label)) {
          fallos.push(`${etiqueta} "${label}" está contratada Y listada como no incluida`);
        }
      }

      // 5. El alcance no puede venir vacío.
      const lista = sec1.bloques.find((b) => b.tipo === "lista");
      if (!lista || !lista.items.length) fallos.push(`${etiqueta} sin alcance en el punto 1`);

      // 6. El plazo de entrega tiene que estar escrito.
      if (!doc.entrega || !texto.includes(doc.entrega)) {
        fallos.push(`${etiqueta} el plazo de entrega no aparece en el documento`);
      }

      // 7. La mensualidad tiene que corresponder al plan.
      const filaMens = doc.secciones
        .find((s) => s.n === 3)
        .bloques.find((b) => b.tipo === "tabla")
        .filas.find(([k]) => k.startsWith("Mensualidad"));
      if (!filaMens) {
        fallos.push(`${etiqueta} falta la fila de mensualidad`);
      } else if (plan === "gestionado" && pesos(filaMens[1]) <= 0) {
        fallos.push(`${etiqueta} Gestionado con mensualidad en cero`);
      } else if (plan === "llave" && !filaMens[1].includes("$0")) {
        fallos.push(`${etiqueta} Llave en Mano debería ir sin mensualidad, dice "${filaMens[1]}"`);
      }

      // 8. La cláusula de accesos tiene que ser la del plan correcto.
      const sec9 = textoCompleto({ ...doc, secciones: [doc.secciones.find((s) => s.n === 9)] });
      const conserva = sec9.includes("conservo un acceso");
      if (plan === "gestionado" && !conserva) {
        fallos.push(`${etiqueta} Gestionado sin la cláusula de acceso acotado`);
      }
      if (plan === "llave" && conserva) {
        fallos.push(`${etiqueta} Llave en Mano dice que Upcore conserva accesos`);
      }

      // 9. Las 12 secciones, completas y en orden.
      const numeros = doc.secciones.map((s) => s.n).join(",");
      if (numeros !== "1,2,3,4,5,6,7,8,9,10,11,12") {
        fallos.push(`${etiqueta} secciones incompletas o desordenadas: ${numeros}`);
      }
    }
  }
}

// ── Casos feos: aquí SÍ debe negarse a generar ───────────────────────────────

const base = snapshotFalso(["agente"], false);
const debeSerNull = [
  ["precio ilegible", { ...base, llave: { ...base.llave, inversion: { mxn: "", usd: "" } } }],
  ["precio sin número", { ...base, llave: { ...base.llave, inversion: { mxn: "a convenir", usd: "" } } }],
  // Un precio tan bajo que la mitad redondea a cero: mejor no emitir acuerdo.
  ["precio de $1", { ...base, llave: { ...base.llave, inversion: precioFijo(1) } }],
  ["sin alcance", { ...base, incluye: [] }],
  ["sin clínica ni nombre", { ...base, lead: { ...base.lead, clinica: "", nombre: "" } }],
  [
    "gestionado sin mensualidad",
    { ...base, gestionado: { ...base.gestionado, mensualidadUpcore: { mxn: "", usd: "" } } },
    "gestionado",
  ],
];
for (const [nombre, snap, plan = "llave"] of debeSerNull) {
  casos++;
  if (datosAcuerdo(snap, plan) !== null) {
    fallos.push(`[${nombre}] generó acuerdo cuando debía negarse`);
  }
}
casos++;
if (datosAcuerdo(base, "inventado") !== null) {
  fallos.push("[plan inventado] generó acuerdo cuando debía negarse");
}

// ── El acuerdo también respeta las piezas (lección 2026-08-10) ────────────────
// A una web-sola no se le habla de cuentas de IA ni de WhatsApp en los costos
// variables; y el caso parecido correcto: con agente SÍ se nombran.
casos++;
{
  const doc = datosAcuerdo(snapshotFalso(["web"], false), "llave");
  const sec3 = textoCompleto({ ...doc, secciones: [doc.secciones.find((s) => s.n === 3)] });
  if (/inteligencia artificial/i.test(sec3))
    fallos.push("[web · llave] la sección 3 habla de cuentas de IA en un proyecto de solo-web");
  if (!/dominio y el hosting/i.test(sec3))
    fallos.push("[web · llave] la sección 3 no nombra el dominio y el hosting");
}
casos++;
{
  const doc = datosAcuerdo(snapshotFalso(["agente"], false), "llave");
  const sec3 = textoCompleto({ ...doc, secciones: [doc.secciones.find((s) => s.n === 3)] });
  if (!/inteligencia artificial/i.test(sec3))
    fallos.push("[agente · llave] la sección 3 perdió la mención legítima de las cuentas de IA");
}

// ── Veredicto ─────────────────────────────────────────────────────────────────

console.log(`Casos probados: ${casos}`);
if (fallos.length) {
  console.log(`\n❌ ${fallos.length} fallo(s):\n`);
  for (const f of fallos.slice(0, 25)) console.log("  ·", f);
  if (fallos.length > 25) console.log(`  ... y ${fallos.length - 25} más`);
  process.exit(1);
}
console.log("✅ Todos los acuerdos salen completos y cuadrados.");
