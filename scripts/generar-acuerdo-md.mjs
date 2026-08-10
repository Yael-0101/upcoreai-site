// Genera plantillas/cierre/acuerdo.md desde lib/acuerdo.ts.
//
// Por qué existe: el acuerdo se entrega de dos formas —la página web y el .docx que
// arma la skill /cerrar-cliente— y un cliente podría recibir las dos. Si dijeran cosas
// distintas sería un problema serio, así que el .md NO se escribe a mano: sale de la
// misma fuente que la web.
//
//   npm run generar:acuerdo    → reescribe el .md
//   npm run verificar:acuerdo  → falla si el .md quedó desfasado (corre en el prebuild)
//
// Si la carpeta plantillas/ no existe (Vercel solo sube upcoreai-site/), el verificador
// se omite solo en vez de tumbar el despliegue.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SITIO = path.join(AQUI, "..");
const FUENTE = path.join(SITIO, "lib", "acuerdo.ts");
const DESTINO = path.join(SITIO, "..", "plantillas", "cierre", "acuerdo.md");

const require = createRequire(import.meta.url);
const jiti = require("jiti")(fileURLToPath(import.meta.url));
const { datosAcuerdo } = jiti(FUENTE);
const { calculate, precioFijo } = jiti(path.join(SITIO, "lib", "calc.ts"));

// ── Snapshot centinela ────────────────────────────────────────────────────────
// Los textos libres van como {{PLACEHOLDER}} directo. Los importes tienen que ser
// números de verdad (se parsean para partirlos en dos pagos), así que se usa un precio
// IMPAR: así el total, el anticipo y el resto salen distintos entre sí y se pueden
// sustituir de vuelta sin confundirse uno con otro.
const PRECIO_CENTINELA = 37777;
const MENSUALIDAD_CENTINELA = 4321;

function plantilla(plan) {
  const base = {
    clinica: "dental",
    productos: ["agente"],
    modo: "normal",
    operacion: null,
    msgs: "40",
    leads: "30",
    email: "",
  };
  const calcLlave = calculate({ ...base, operacion: "yo" });
  const calcGest = calculate({ ...base, operacion: "upcore" });

  const snap = {
    version: 3,
    fecha: new Date(0).toISOString(),
    lead: {
      nombre: "{{NOMBRE_CONTACTO}}",
      clinica: "{{CLINICA}}",
      decisor: "{{PUESTO}}",
      tipo_clinica: "",
      tamano: "",
    },
    diag: { volumen: "", agenda_hoy: "", canales: "", detalle: "", urgencia: "", mensaje: "" },
    incluye: ["{{ALCANCE_INCLUYE}}"],
    opcionales: [],
    complejidad: "{{COMPLEJIDAD}}", // no existe en TIEMPOS → cae al plazo por defecto
    llave: { ...calcLlave, inversion: precioFijo(PRECIO_CENTINELA) },
    gestionado: {
      ...calcGest,
      inversion: precioFijo(PRECIO_CENTINELA),
      mensualidadUpcore: precioFijo(MENSUALIDAD_CENTINELA, true),
    },
    recomendacion: "",
  };

  const doc = datosAcuerdo(snap, plan);
  if (!doc) throw new Error(`datosAcuerdo devolvió null para el plan "${plan}"`);
  return doc;
}

// ── Volcar a markdown ─────────────────────────────────────────────────────────

function aMarkdown(doc) {
  const l = [];
  l.push("# Acuerdo de servicio", "");
  l.push("**Upcore AI** (Yael López · upcoreai.com) — **{{CLINICA}}** ({{NOMBRE_CONTACTO}}{{PUESTO}})");
  l.push("Fecha: {{FECHA}} · Acordado a distancia (servicios 100% en línea)", "");
  l.push(`> ${doc.intro}`);
  l.push("> Se acepta contestando **“de acuerdo”** por WhatsApp o correo.", "");
  l.push("---", "");

  for (const sec of doc.secciones) {
    l.push(`## ${sec.n}. ${sec.titulo}`, "");
    for (const b of sec.bloques) {
      if (b.tipo === "texto") {
        l.push(b.texto, "");
      } else if (b.tipo === "lista") {
        for (const it of b.items) {
          // Un item que es solo un {{PLACEHOLDER}} va suelto, sin viñeta: ahí la skill
          // pega una lista entera y una viñeta de más rompería el formato.
          l.push(/^\{\{[A-Z_]+\}\}$/.test(it.trim()) ? it : `- ${it}`);
        }
        l.push("");
      } else {
        l.push("| Concepto | Monto |", "|---|---|");
        for (const [k, v] of b.filas) l.push(`| ${k} | ${v} |`);
        l.push("");
        l.push("**Transferencia a:** Titular: [TITULAR] · Banco: [BANCO] · CLABE: [CLABE]", "");
      }
    }
  }

  l.push("---", "");
  l.push("[[FIRMAS: Yael López | Upcore AI || {{NOMBRE_CONTACTO}} | {{CLINICA}}]]", "");
  l.push("---", "");
  l.push("*Documento generado por Upcore AI · upcoreai.com*", "");
  return l.join("\n");
}

/** Devuelve los importes centinela a su forma de {{PLACEHOLDER}}. */
function conPlaceholders(md, doc) {
  return md
    .split(doc.precio).join("{{PRECIO_TOTAL}}")
    .split(doc.anticipo).join("{{ANTICIPO}}")
    .split(doc.resto).join("{{RESTO}}")
    .split(precioFijo(MENSUALIDAD_CENTINELA, true).mxn).join("{{MENSUALIDAD}}")
    .split(doc.entrega).join("{{TIEMPO_ENTREGA}}");
}

function construir() {
  // El documento base es el de Llave en Mano; la sección del plan Gestionado se
  // deja anotada para que la skill sepa qué cambiar.
  const llave = plantilla("llave");
  const gestionado = plantilla("gestionado");

  let md = conPlaceholders(aMarkdown(llave), llave);

  const notaGestionado = [
    "",
    "<!-- ─────────────────────────────────────────────────────────────────────",
    "     SI EL PLAN ES GESTIONADO, cambian exactamente estas tres cosas",
    "     (el resto del documento es idéntico):",
    "",
    `     · Título del punto 2:  ${gestionado.planLabel}`,
    `     · Descripción:  ${gestionado.secciones[1].bloques[0].texto}`,
    `     · Cláusula de accesos (punto 9):  ${gestionado.secciones[8].bloques[2].texto}`,
    "     · Fila de mensualidad:  Mensualidad (operación y mantenimiento) | {{MENSUALIDAD}}",
    "     · Y se agrega al punto 8 la línea de cancelar la mensualidad con 30 días.",
    "     ───────────────────────────────────────────────────────────────────── -->",
  ].join("\n");

  const hash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(FUENTE, "utf8"))
    .digest("hex")
    .slice(0, 16);

  const cabecera = [
    "<!-- ⚠️ ARCHIVO GENERADO — NO EDITAR A MANO.",
    "     Fuente: upcoreai-site/lib/acuerdo.ts",
    "     Regenerar con: npm run generar:acuerdo  (dentro de upcoreai-site)",
    `     hash-fuente: ${hash} -->`,
    "",
  ].join("\n");

  return cabecera + md + notaGestionado + "\n";
}

// ── Modo generar / verificar ──────────────────────────────────────────────────

const verificar = process.argv.includes("--verificar");
const carpeta = path.dirname(DESTINO);

if (!fs.existsSync(carpeta)) {
  // Pasa en Vercel: solo se sube upcoreai-site/. No es un error.
  console.log("plantillas/cierre/ no está aquí (despliegue) — se omite.");
  process.exit(0);
}

const nuevo = construir();

if (verificar) {
  const actual = fs.existsSync(DESTINO) ? fs.readFileSync(DESTINO, "utf8") : "";
  if (actual !== nuevo) {
    console.error(
      "❌ plantillas/cierre/acuerdo.md está desfasado de lib/acuerdo.ts.\n" +
        "   Corre:  npm run generar:acuerdo\n" +
        "   (el .docx que firma el cliente no puede decir algo distinto a la página web)"
    );
    process.exit(1);
  }
  console.log("✅ El acuerdo en Word coincide con el de la web.");
} else {
  fs.writeFileSync(DESTINO, nuevo, "utf8");
  console.log("✅ Escrito:", path.relative(process.cwd(), DESTINO));
}
