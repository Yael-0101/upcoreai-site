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
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const jiti = require("jiti")(fileURLToPath(import.meta.url));

const { PRODUCTO_OPTIONS, calculate, precioFijo } = jiti(path.join(AQUI, "..", "lib", "calc.ts"));
const { datosAcuerdo } = jiti(path.join(AQUI, "..", "lib", "acuerdo.ts"));
const { bonos, piezasDeSnapshot, lineaSeo } = jiti(path.join(AQUI, "..", "lib", "propuesta-copy.ts"));

// ── Construir un snapshot igual al que congela el panel ───────────────────────
// Espejo de snapshotDeLead() (upcore-panel/lib/propuesta.ts:272): mismos campos y misma
// forma de calcular llave/gestionado (calculate con operacion "yo" / "upcore").

function snapshotFalso(piezas, conPanel) {
  const base = {
    // ⚠️ Decía "dental" — un giro del nicho anterior que ya no existe en
    // lib/nicho.json, así que los 133 casos se probaban con un valor inválido que
    // caía al de por defecto sin avisar. Mismo dato viejo que tenían los cuatro
    // portales de prueba: una prueba con datos muertos no prueba el producto vivo.
    clinica: "comercializadora",
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
    precio: precioFijo(p.setupUSD),
    razon: "puede esperar",
  }));

  return {
    version: 3,
    fecha: new Date("2026-08-05T12:00:00Z").toISOString(),
    lead: {
      nombre: "Fernando Ramírez",
      clinica: "Brickell Preventa Realty", // ⚪ `clinica` es columna de n8n: hoy guarda la inmobiliaria
      decisor: "director",
      tipo_clinica: "comercializadora", // ⚪ idem: guarda el giro
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
      if (doc.precio !== snap[plan].inversion.principal) {
        fallos.push(
          `${etiqueta} el acuerdo dice ${doc.precio} y la propuesta ${snap[plan].inversion.principal}`
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

      // 5b. TODO bono que la propuesta le prometió tiene que estar también aquí.
      // Si no, el cliente acaba con dos textos del mismo trato diciendo cosas
      // distintas — el error del dominio (2026-08-16), que la propuesta regalaba
      // y el portal cobraba. Se calcula con la MISMA función que la propuesta.
      const bonosEsperados = bonos(
        piezasDeSnapshot({ piezas: snap.piezas, incluye: snap.incluye }),
        snap.diag.agenda_hoy
      );
      for (const bono of bonosEsperados) {
        if (!(lista?.items || []).some((i) => i.includes(bono.titulo))) {
          fallos.push(`${etiqueta} la propuesta promete el bono "${bono.titulo}" y el acuerdo no lo nombra`);
        }
      }

      // 5c. Lo mismo con el SEO incluido: si la propuesta lo promete, el
      // contrato lo dice. Misma función, para que no se desfasen.
      const seoEsperado = lineaSeo(
        piezasDeSnapshot({ piezas: snap.piezas, incluye: snap.incluye })
      );
      if (seoEsperado && !(lista?.items || []).some((i) => i === seoEsperado)) {
        fallos.push(`${etiqueta} la propuesta promete el SEO y el acuerdo no lo nombra`);
      }

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

      // 10. 🔴 LA LÍNEA ROJA DEL NICHO, dentro del contrato.
      //
      // La sección 11 decía: "La información que el sistema le da a tus compradores
      // es la que tú validas (precios, disponibilidad, fechas de entrega, planes de
      // pago)". Es lo CONTRARIO de la regla nº1 de los cuatro productos — en preventa
      // esos tres datos caducan solos y por eso el sistema no los dice. O sea que el
      // contrato prometía por escrito justo lo que el producto se niega a hacer.
      //
      // ⚠️ Se revisa ORACIÓN POR ORACIÓN y se exige que la señal mala aparezca JUNTO a
      // lo que la vuelve mala: nombrar esos datos está bien —hace falta para negarlos—;
      // lo que no se vale es afirmarlos. Un verificador que marcara la palabra suelta
      // tumbaría la frase correcta, que es el error del "cuántas" del 6 de agosto.
      // 🔄 ACTUALIZADA EL 2026-08-25, porque la regla vieja pasó a ENCODEAR el defecto.
      //
      // Desde esa fecha el cliente elige qué hace su asistente con esos datos, así que
      // exigir que el contrato lo NIEGUE ya no protege a nadie: obligaría al acuerdo a
      // prometer lo contrario de lo que el cliente compró. Cuando una medida se pone roja
      // por un cambio que sabes correcto, se comprueba cuál de los dos tiene razón — y
      // aquí el equivocado era el guardián.
      //
      // Lo que sí se sigue vigilando, y es lo que de verdad importa: que el contrato no
      // prometa esos datos **a secas**. Si dice que el sistema los da, tiene que decir en
      // la misma oración que lo elige el cliente o que él responde por la fuente. Sin eso,
      // el contrato estaría asumiendo por escrito una responsabilidad que no es nuestra.
      for (const oracion of texto.split(/(?<=[.;])\s+/)) {
        const nombraDatos =
          /precios?/i.test(oracion) &&
          /(disponibilidad|fechas? de entrega|inventario)/i.test(oracion);
        const loNiega = /\bno\s+(da|dice|publica|promete|cotiza|maneja)\b/i.test(oracion);
        const loEligeElCliente =
          /(eliges|defines|elijes|t[úu] decides|si eliges|salvo que t[úu]|respondes por|mantengas|apruebes)/i.test(
            oracion
          );
        const esSobreElSistema = /(sistema|asistente|sitio|p[áa]gina)/i.test(oracion);
        if (nombraDatos && esSobreElSistema && !loNiega && !loEligeElCliente) {
          fallos.push(
            `${etiqueta} promete precios/disponibilidad/entregas sin decir que los elige el cliente: "${oracion.trim().slice(0, 80)}"`
          );
        }
      }

      // 10b. 🔒 EL SUELO tiene que estar en el contrato, siempre.
      //
      // Es lo único que el cliente NO puede quitar, y las dos primeras son de ley de
      // EE.UU. Si desaparecen del acuerdo, el documento deja de decir lo que de verdad
      // no se negocia — y ahí es donde antes vivía la protección que daba la línea roja.
      // ⚠️ Y se comprueba POR PIEZAS, no "siempre a secas". La primera versión de esta
      // regla exigía el aviso de grabación en TODOS los contratos, y saltó en los de
      // solo-web: ahí no hay nada que hable ni llamada que grabar, así que nombrarlo sería
      // hablarle de una pieza que no compró. Un guardián que exige de más obliga a meter
      // texto falso para callarlo — que es peor que el defecto que vigila.
      const conAsistente = piezas.includes("agente") || piezas.includes("voz");
      const delSuelo = [
        ["vivienda justa", /vivienda justa|fair housing/i, true],
        ["que no inventa", /nunca inventa|never makes anything up/i, true],
        ["el aviso de grabación", /grabars?e|grabaci[óo]n|recorded/i, conAsistente],
      ];
      for (const [que, re, aplica] of delSuelo) {
        if (aplica && !re.test(texto)) {
          fallos.push(`${etiqueta} ya no menciona ${que} (es del suelo, no se puede quitar)`);
        }
        // Y la dirección contraria: no colar el aviso de grabación a quien no compró
        // nada que hable. Las dos direcciones, siempre.
        if (!aplica && que === "el aviso de grabación" && /avisa si la llamada|call may be recorded/i.test(texto)) {
          fallos.push(`${etiqueta} habla de grabar llamadas y no compró asistente`);
        }
      }

      // 11. Piezas que NO compró, nombradas en su contrato.
      //
      // La sección 3 filtraba por pieza desde agosto, pero la 4, la 7 y la 11 eran
      // texto fijo: a un cliente de solo-web el contrato le hablaba del asistente,
      // de Meta, de WhatsApp y de los proveedores de IA. Mismo defecto que Yael cazó
      // en el Portal de Arranque, aquí dentro de un documento que se firma.
      const AJENO = [
        { palabra: /\bWhatsApp\b/, si: ["agente", "auto", "reactivacion"] },
        { palabra: /\bMeta\b/, si: ["agente", "auto", "reactivacion"] },
        { palabra: /inteligencia artificial/i, si: ["agente", "voz", "auto", "reactivacion", "panel"] },
        { palabra: /\basistente\b/i, si: ["agente", "voz"] },
        { palabra: /l[íi]nea telef[óo]nica/i, si: ["voz"] },
      ];
      // ⚠️ Las piezas se leen con la MISMA función que usa el acuerdo, no contando
      // el array de la prueba: `conPanel` no viaja en `piezas` y por eso la primera
      // versión marcó "web+panel" por nombrar la IA, que ahí es legítima. El
      // verificador y el documento tienen que leer de la misma fuente.
      const piezasReales = piezasDeSnapshot({ piezas: snap.piezas, incluye: snap.incluye });

      // Dos frases nombran estas palabras con OTRO significado y son correctas:
      //   · el punto 1 lista a propósito lo que NO compró — es su razón de ser;
      //   · el punto 5 dice que un WhatsApp a Yael cuenta como "por escrito", que
      //     es el canal entre nosotros, no una pieza del producto.
      // Sin esta salvedad el guardián marca trabajo bueno, y un guardián que marca
      // lo bueno se deja de leer.
      const revisables = texto
        .split("\n")
        .filter((l) => !l.includes("NO incluye") && !l.includes("por escrito"))
        .join("\n");

      for (const { palabra, si } of AJENO) {
        if (palabra.test(revisables) && !si.some((v) => piezasReales.includes(v))) {
          fallos.push(
            `${etiqueta} nombra "${palabra.source}" y el cliente no compró ninguna pieza que lo use`
          );
        }
      }

      // 12. Español que se pueda leer. Un dato interpolado tiene que CABER en la
      // frase: "caídas de el hosting y el registrador y tu internet" compila igual
      // de bien que la frase correcta, y ningún guardián de contenido lo mira.
      // (Frontera a mano: `\b` no funciona después de vocal acentuada.)
      if (/(?<![a-záéíóúüñ])(de|a) el(?![a-záéíóúüñ])/i.test(texto)) {
        fallos.push(`${etiqueta} dice "de el"/"a el" — en español es "del"/"al"`);
      }
      const listaTerceros = texto.match(/servicios de terceros:\*\*([^.]*)\./);
      if (listaTerceros && (listaTerceros[1].match(/ y /g) || []).length > 1) {
        fallos.push(`${etiqueta} la lista de terceros tiene dos "y": "${listaTerceros[1].trim()}"`);
      }

      // 13. Ningún porcentaje que no cuadre con su propia cifra. `partirEnDosPagos`
      // redondea a centenas, así que $4,500 se parte en $2,300 y $2,200 — y la tabla
      // decía "(50%)" en las dos filas. En un documento que se firma, un número
      // etiquetado con un porcentaje que no es, es exactamente lo que se reclama.
      for (const [concepto, monto] of doc.secciones
        .find((s) => s.n === 3)
        .bloques.find((b) => b.tipo === "tabla").filas) {
        const pct = concepto.match(/\((\d+)%\)/);
        if (!pct) continue;
        const real = (pesos(monto) / total) * 100;
        if (Math.abs(real - Number(pct[1])) > 0.5) {
          fallos.push(
            `${etiqueta} "${concepto}" dice ${pct[1]}% pero ${monto} es el ${real.toFixed(1)}% de ${doc.precio}`
          );
        }
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
  // Se comprueban los DOS conceptos por separado, no la frase "dominio y el
  // hosting": exigir una redacción exacta rompe el guardián en cuanto alguien
  // reescribe el párrafo por un motivo legítimo, que es justo lo que pasó al
  // corregir quién paga el dominio (2026-08-16).
  if (!/dominio/i.test(sec3)) fallos.push("[web · llave] la sección 3 no nombra el dominio");
  if (!/hosting/i.test(sec3)) fallos.push("[web · llave] la sección 3 no nombra el hosting");
  // El dominio del PRIMER año lo paga Upcore y va dentro del precio. Si el
  // acuerdo vuelve a decir que va a la tarjeta del cliente, contradice a la
  // propuesta que acaba de aceptar — y eso se descubre firmando, no antes.
  if (/dominio[^.]{0,80}(directo a tu tarjeta|tú pagas)/i.test(sec3))
    fallos.push("[web · llave] la sección 3 dice que el cliente paga el dominio: el primer año lo pone Upcore");
}
casos++;
{
  const doc = datosAcuerdo(snapshotFalso(["agente"], false), "llave");
  const sec3 = textoCompleto({ ...doc, secciones: [doc.secciones.find((s) => s.n === 3)] });
  if (!/inteligencia artificial/i.test(sec3))
    fallos.push("[agente · llave] la sección 3 perdió la mención legítima de las cuentas de IA");
}

// ── El PDF: que se pueda escribir SIEMPRE, en todas las combinaciones ────────
//
// El PDF usa fuentes base-14 con WinAnsiEncoding, que cubre el español completo
// pero no todo: "≈" no existe, y el documento lo usa en los plazos. Si algún día
// alguien mete un carácter nuevo en un texto del acuerdo (una flecha, un emoji,
// una comilla rara), el PDF imprimiría un cuadrito **en un contrato** — o peor, se
// lo comería en silencio. Esto lo caza antes de publicar, no delante del cliente.
{
  const { pdfDeAcuerdo, noRepresentables, textoDelPdf } = jiti(
    path.join(AQUI, "..", "lib", "acuerdo-pdf.ts")
  );

  for (const piezas of subconjuntos(VALS)) {
    for (const plan of ["llave", "gestionado"]) {
      casos++;
      const doc = datosAcuerdo(snapshotFalso(piezas, true), plan);
      const malos = noRepresentables(textoDelPdf(doc));
      if (malos.length) {
        fallos.push(
          `[${piezas.join("+")} · ${plan}] el PDF no puede escribir: ${malos.map((c) => `"${c}" (U+${c.codePointAt(0).toString(16).toUpperCase()})`).join(", ")}`
        );
      }
    }
  }

  // Y que el archivo salga bien formado y con el contenido dentro. Se comprueba
  // leyendo los strings del PDF como los leería un lector, no confiando en que la
  // función no truene: generar sin error no prueba que se pueda abrir.
  casos++;
  const doc = datosAcuerdo(snapshotFalso(["agente", "web"], false), "llave");
  const bytes = pdfDeAcuerdo(doc, {
    fecha: "21 de agosto de 2026",
    aceptadoPor: "Fernando Ramírez Núñez",
    aceptadoEl: "21 de agosto de 2026 a las 04:15 p.m.",
    correo: "fernando@ejemplo.com",
    ip: "72.14.201.55",
  });
  const crudo = Buffer.from(bytes).toString("latin1");
  if (!crudo.startsWith("%PDF-")) fallos.push("el PDF no empieza con %PDF-");
  if (!crudo.trimEnd().endsWith("%%EOF")) fallos.push("el PDF no termina con %%EOF");
  if (!/\/Type \/Catalog/.test(crudo)) fallos.push("al PDF le falta el catálogo");
  if (!/\bstartxref\b/.test(crudo)) fallos.push("al PDF le falta la tabla xref");

  const extraido = [...crudo.matchAll(/\(((?:\\.|[^()\\])*)\)\s*Tj/g)]
    .map((m) =>
      m[1]
        .replace(/\\([0-7]{3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)))
        .replace(/\\([()\\])/g, "$1")
    )
    .join(" ");
  // Lo que un lector de PDF va a mostrar tiene que incluir lo que de verdad importa:
  // quién firma, cuánto, la ley, la línea roja del producto y el sello de aceptación.
  const imprescindibles = [
    doc.clinica,
    doc.precio,
    "Florida",
    "Miami-Dade",
    // 🔄 Antes se exigía literalmente "no da precios". Desde el 2026-08-25 eso lo elige
    // el cliente, así que el imprescindible pasa a ser lo que de verdad no se negocia:
    // la regla de vivienda justa, que es ley federal y va en todos los contratos.
    "vivienda justa",
    "Ramírez Núñez",
    "E-SIGN",
    "72.14.201.55",
  ];
  for (const t of imprescindibles) {
    if (!extraido.includes(t)) fallos.push(`el PDF no imprime "${t}"`);
  }
  // Los acentos tienen que sobrevivir al escapado octal.
  if (!/[áéíóúñ]/.test(extraido)) fallos.push("el PDF perdió los acentos");
}

// ── PARIDAD ENTRE ESPAÑOL E INGLÉS ───────────────────────────────────────────
//
// El cliente habla los dos idiomas y su contador puede pedir el inglés. Lo peligroso
// no es traducir mal una frase: es que las dos versiones acaben diciendo cosas
// distintas sin que nadie se entere — el error del generador contra n8n, ahora dentro
// de un contrato.
//
// TypeScript ya obliga a que los dos idiomas tengan las mismas CLAVES (Record<Idioma,
// Textos>): si alguien agrega una cláusula en español y no la traduce, no compila.
// Lo que eso NO puede comprobar es lo de aquí abajo: misma estructura, mismos números,
// y que no se cuele un idioma dentro del otro.
{
  const { IDIOMAS, sinTraducir } = jiti(path.join(AQUI, "..", "lib", "acuerdo-textos.ts"));

  // 0. TODO renglón del catálogo tiene que tener traducción. Este es el candado: si
  //    mañana se agrega una pieza a lib/calc.ts y nadie la traduce, el build truena
  //    en vez de mandarle al cliente un contrato a medio traducir.
  casos++;
  {
    const todos = new Set();
    for (const piezas of subconjuntos(VALS)) {
      for (const conPanel of [false, true]) {
        const snap = snapshotFalso(piezas, conPanel);
        for (const i of snap.incluye) todos.add(i);
        for (const o of snap.opcionales) todos.add(o.label);
        const p = piezasDeSnapshot({ piezas: snap.piezas, incluye: snap.incluye });
        const seo = lineaSeo(p);
        if (seo) todos.add(seo);
        for (const b of bonos(p, snap.diag.agenda_hoy)) todos.add(b.titulo);
      }
    }
    const faltan = sinTraducir([...todos]);
    if (faltan.length) {
      fallos.push(
        `faltan ${faltan.length} traducción(es) del catálogo al inglés:\n      ` +
          faltan.map((f) => `"${f.slice(0, 70)}"`).join("\n      ")
      );
    }
  }

  /** Palabras que solo existen en un idioma y delatan una traducción a medias.
   *  Se comparan como PALABRAS COMPLETAS, con la frontera escrita a mano: `\b` no
   *  funciona después de una vocal acentuada en JavaScript. */
  const SOLO_ES = ["que", "para", "los", "las", "tu", "por", "con", "del", "una", "está"];
  const SOLO_EN = ["the", "your", "for", "with", "and", "this", "that", "from"];
  const palabra = (w) =>
    new RegExp(`(?<![a-záéíóúüñ0-9])${w}(?![a-záéíóúüñ0-9])`, "i");

  for (const piezas of subconjuntos(VALS)) {
    for (const plan of ["llave", "gestionado"]) {
      casos++;
      const snap = snapshotFalso(piezas, false);
      const es = datosAcuerdo(snap, plan, "es");
      const en = datosAcuerdo(snap, plan, "en");
      const etiqueta = `[${piezas.join("+")} · ${plan}]`;

      if (!es || !en) {
        fallos.push(`${etiqueta} un idioma generó acuerdo y el otro no (es=${!!es}, en=${!!en})`);
        continue;
      }

      // 1. MISMA ESTRUCTURA. Si el inglés tuviera una cláusula de más o de menos,
      //    serían dos contratos distintos, no una traducción.
      const forma = (d) =>
        d.secciones
          .map(
            (s) =>
              `${s.n}:${s.bloques
                .map((b) =>
                  b.tipo === "lista"
                    ? `l${b.items.length}`
                    : b.tipo === "tabla"
                      ? `t${b.filas.length}`
                      : "p"
                )
                .join("")}`
          )
          .join("|");
      if (forma(es) !== forma(en)) {
        fallos.push(`${etiqueta} las dos versiones no tienen la misma forma:\n      es ${forma(es)}\n      en ${forma(en)}`);
      }

      // 2. MISMOS NÚMEROS. Un precio distinto entre versiones es lo peor que puede
      //    pasar aquí, y es exactamente lo que nadie revisaría.
      for (const campo of ["precio", "anticipo", "resto"]) {
        if (es[campo] !== en[campo]) {
          fallos.push(`${etiqueta} ${campo}: español dice ${es[campo]} e inglés ${en[campo]}`);
        }
      }
      const cifras = (d) => (textoCompleto(d).match(/\$[\d,]+/g) || []).sort().join(" ");
      if (cifras(es) !== cifras(en)) {
        fallos.push(`${etiqueta} las cifras no coinciden entre idiomas`);
      }

      // 3. NADA DE MEZCLA. El inglés no puede traer frases en español ni al revés.
      //
      //    🔴 La primera versión EXCLUÍA el punto 1 "a propósito", y por ese hueco se
      //    coló el defecto más grande de la traducción: la sección que dice qué recibe
      //    el cliente salía entera en español. El guardián estaba verde. Ahora se
      //    revisa TODO; solo se salta la cláusula de idioma, que es bilingüe por diseño.
      const revisables = (d) =>
        d.secciones
          .flatMap((s) => [
            s.titulo,
            ...s.bloques.flatMap((b) =>
              b.tipo === "texto" ? [b.texto] : b.tipo === "lista" ? b.items : b.filas.flat()
            ),
          ])
          .filter((x) => !/Spanish version governs|manda la versión en español/i.test(x));

      for (const linea of revisables(en)) {
        const intrusas = SOLO_ES.filter((w) => palabra(w).test(linea));
        if (intrusas.length >= 2) {
          fallos.push(
            `${etiqueta} español dentro de la versión en inglés ("${intrusas.join(", ")}"): "${linea.slice(0, 70)}"`
          );
        }
      }
      for (const linea of revisables(es)) {
        const intrusas = SOLO_EN.filter((w) => palabra(w).test(linea));
        if (intrusas.length >= 2) {
          fallos.push(
            `${etiqueta} inglés dentro de la versión en español ("${intrusas.join(", ")}"): "${linea.slice(0, 70)}"`
          );
        }
      }

      // 4. Las dos dicen que MANDA EL ESPAÑOL. Sin esto, la traducción sería un
      //    segundo contrato y no una cortesía.
      if (!/manda la versión en español/i.test(textoCompleto(es))) {
        fallos.push(`${etiqueta} la versión en español no dice que ella gobierna`);
      }
      if (!/the Spanish version governs/i.test(textoCompleto(en))) {
        fallos.push(`${etiqueta} la versión en inglés no dice que gobierna la española`);
      }
    }
  }

  // 5. Un idioma inventado cae al español, nunca revienta ni deja el documento vacío.
  casos++;
  const raro = datosAcuerdo(snapshotFalso(["agente"], false), "llave", "fr");
  if (!raro || raro.idioma !== "fr") {
    // `idiomaDe` es quien valida; `datosAcuerdo` con un idioma inexistente debe
    // devolver null en vez de un documento a medias.
    if (raro !== null) fallos.push("un idioma inexistente produjo un documento en vez de null");
  }
  casos++;
  if (IDIOMAS.join(",") !== "es,en") {
    fallos.push(`la lista de idiomas cambió sin actualizar las pruebas: ${IDIOMAS.join(",")}`);
  }
}

// ── La firma dentro del PDF ──────────────────────────────────────────────────
//
// Dos pruebas distintas, y la primera es la que importa:
//
//   1. El LECTOR de PNG, contra una imagen fabricada aquí con píxeles conocidos.
//      Corre siempre, en cualquier máquina, sin depender de ninguna variable. Un
//      decodificador escrito a mano falla en silencio: no truena, dibuja un borrón —
//      y un borrón donde va una firma es lo peor que puede salir de un contrato.
//   2. La firma DE VERDAD, solo si la variable está (en Vercel sí, en una copia
//      recién clonada no). Si no está, se omite; si está y viene rota, TRUENA.
{
  const zlib = await import("node:zlib");
  const { leerPng } = jiti(path.join(AQUI, "..", "lib", "png.ts"));
  const { pdfDeAcuerdo } = jiti(path.join(AQUI, "..", "lib", "acuerdo-pdf.ts"));

  /** Fabrica un PNG RGBA de 3x2 con filtro por línea, para probar el lector. */
  function pngDePrueba(pixeles, filtro = 0) {
    const ancho = 3;
    const alto = 2;
    const crudo = Buffer.alloc((ancho * 4 + 1) * alto);
    for (let y = 0; y < alto; y++) {
      crudo[y * (ancho * 4 + 1)] = filtro;
      for (let x = 0; x < ancho; x++) {
        const p = pixeles[y * ancho + x];
        const o = y * (ancho * 4 + 1) + 1 + x * 4;
        // Con filtro 2 (arriba) los bytes son la DIFERENCIA con la línea de arriba.
        const arriba = y > 0 ? pixeles[(y - 1) * ancho + x] : [0, 0, 0, 0];
        for (let c = 0; c < 4; c++) {
          crudo[o + c] = filtro === 2 ? (p[c] - arriba[c]) & 0xff : p[c];
        }
      }
    }
    const idat = zlib.deflateSync(crudo);
    const chunk = (tag, cuerpo) => {
      const largo = Buffer.alloc(4);
      largo.writeUInt32BE(cuerpo.length);
      const crc = Buffer.alloc(4); // el lector no valida CRC
      return Buffer.concat([largo, Buffer.from(tag, "latin1"), cuerpo, crc]);
    };
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(ancho, 0);
    ihdr.writeUInt32BE(alto, 4);
    ihdr[8] = 8; // 8 bits
    ihdr[9] = 6; // RGBA
    // ⚠️ El IDAT va partido en DOS trozos a propósito. Un PNG puede traer los datos
    // repartidos en varios chunks, y muchas herramientas lo hacen; un lector que se
    // quede con el primero da una imagen cortada. La primera versión de esta prueba
    // usaba un solo IDAT —igual que la firma de Yael— así que ese defecto pasaba
    // limpio: se descubrió inyectándolo y viendo que el guardián no lo cazaba.
    const mitad = Math.ceil(idat.length / 2);
    return Buffer.concat([
      Buffer.from("89504e470d0a1a0a", "hex"),
      chunk("IHDR", ihdr),
      chunk("IDAT", idat.subarray(0, mitad)),
      chunk("IDAT", idat.subarray(mitad)),
      chunk("IEND", Buffer.alloc(0)),
    ]).toString("base64");
  }

  const PIX = [
    [255, 0, 0, 255], // rojo opaco
    [0, 255, 0, 255], // verde opaco
    [0, 0, 255, 0], // azul TRANSPARENTE -> debe salir blanco
    [0, 0, 0, 255], // negro opaco
    [0, 0, 0, 128], // negro a media tinta -> gris
    [255, 255, 255, 255], // blanco
  ];
  // ⚠️ El negro a media tinta da 127, no 128: alfa 128 sobre 255 no es exactamente la
  // mitad — 255 × (1 − 128/255) = 127.06. La primera versión de esta prueba esperaba
  // 128 y marcó como defectuoso un código correcto. Es el verificador fallando hacia
  // el otro lado: bloquear lo bueno, que desgasta igual que dejar pasar lo malo.
  const ESPERADO = [255, 0, 0, 0, 255, 0, 255, 255, 255, 0, 0, 0, 127, 127, 127, 255, 255, 255];

  // Se prueban los filtros por separado: el de Paeth y el de "arriba" son donde se
  // equivoca un lector escrito a mano, y un error ahí solo se ve mirando la imagen.
  for (const filtro of [0, 2]) {
    casos++;
    try {
      const img = leerPng(pngDePrueba(PIX, filtro));
      if (img.ancho !== 3 || img.alto !== 2) {
        fallos.push(`[png filtro ${filtro}] tamaño mal leído: ${img.ancho}x${img.alto}`);
      }
      const salio = [...img.rgb];
      if (salio.join(",") !== ESPERADO.join(",")) {
        fallos.push(
          `[png filtro ${filtro}] píxeles mal decodificados:\n      esperaba ${ESPERADO.join(",")}\n      salió    ${salio.join(",")}`
        );
      }
    } catch (e) {
      fallos.push(`[png filtro ${filtro}] el lector reventó: ${e.message}`);
    }
  }

  // Lo que NO se puede leer tiene que fallar RUIDOSO, no devolver una imagen rota.
  casos++;
  let tronó = false;
  try {
    leerPng("data:image/png;base64,aGVsbG8gbXVuZG8=");
  } catch {
    tronó = true;
  }
  if (!tronó) fallos.push("[png] aceptó un archivo que no es PNG en vez de fallar");

  // Y la firma de verdad, si está disponible en este entorno.
  const firma = process.env.FIRMA_YAEL_BASE64 || "";
  if (!firma) {
    console.log(
      "   ⏭️  FIRMA_YAEL_BASE64 no está en este entorno: se omite la prueba de la firma real."
    );
  } else {
    casos++;
    try {
      const img = leerPng(firma);
      const medio = (o) => (img.rgb[o] + img.rgb[o + 1] + img.rgb[o + 2]) / 3;
      let oscuros = 0;
      for (let i = 0; i < img.rgb.length; i += 3) if (medio(i) < 128) oscuros++;
      const total = img.ancho * img.alto;
      // Una firma tiene tinta, pero no es una mancha: entre 1% y 60% de píxeles
      // oscuros. Fuera de ahí, o se decodificó mal o alguien cambió la imagen.
      const pct = (100 * oscuros) / total;
      if (pct < 1 || pct > 60) {
        fallos.push(`[firma] ${pct.toFixed(1)}% de píxeles oscuros: no parece una firma`);
      }
      if (medio(0) < 200) {
        fallos.push("[firma] la esquina de arriba no salió blanca: el fondo se decodificó mal");
      }

      const doc = datosAcuerdo(snapshotFalso(["agente"], false), "llave");
      const crudo = Buffer.from(
        pdfDeAcuerdo(doc, { fecha: "21 de agosto de 2026", firmaPng: firma })
      ).toString("latin1");
      if (!/\/Subtype \/Image/.test(crudo)) fallos.push("[firma] el PDF no lleva la imagen");
      if (!/\/IMFIRMA Do/.test(crudo)) fallos.push("[firma] el PDF no dibuja la firma");
      if (!/\/XObject << \/IMFIRMA/.test(crudo)) {
        fallos.push("[firma] la página no declara la imagen en sus recursos");
      }
    } catch (e) {
      fallos.push(`[firma] no se pudo leer la firma real: ${e.message}`);
    }
  }
}

// ── La ley que rige: una sola, y la misma en los dos documentos ──────────────
//
// Decisión de Yael (2026-08-21): el acuerdo se rige por ley de Estados Unidos, no
// mexicana. El riesgo aquí no es escribirlo mal una vez, es que se desfase: el
// acuerdo REMITE a upcoreai.com/terminos, así que si esa página siguiera diciendo
// "leyes de los Estados Unidos Mexicanos", el contrato remitiría a unos términos
// regidos por otra ley — sin dar un solo error. Es el defecto del dominio
// (2026-08-16), donde la propuesta regalaba lo que el portal cobraba.
casos++;
{
  const { LEY_APLICABLE, FORO } = jiti(path.join(AQUI, "..", "lib", "acuerdo.ts"));
  const { TEXTOS: TXT } = jiti(path.join(AQUI, "..", "lib", "acuerdo-textos.ts"));
  const CLAUSULA_IDIOMA = TXT.es.clausulaIdioma;
  const doc = datosAcuerdo(snapshotFalso(["agente"], false), "llave");
  const texto = textoCompleto(doc);
  // ⚠️ El texto de /terminos se MUDÓ el 2026-08-22, al hacer el sitio bilingüe: la
  // página quedó como un envoltorio de diez líneas y las cláusulas viven en
  // `lib/legal-textos.ts`, en los dos idiomas. Este guardián sigue exigiendo lo
  // mismo —que la ley se LEA de su fuente única y no se escriba a mano— solo que
  // ahora mira donde de verdad está. Aflojar la regla habría sido lo fácil y lo
  // equivocado: el acuerdo REMITE a estos Términos.
  const terminos =
    fs.readFileSync(path.join(AQUI, "..", "app", "terminos", "page.tsx"), "utf8") +
    fs.readFileSync(path.join(AQUI, "..", "lib", "legal-textos.ts"), "utf8");

  if (!texto.includes(LEY_APLICABLE)) {
    fallos.push(`el acuerdo no nombra la ley aplicable ("${LEY_APLICABLE}")`);
  }
  if (!texto.includes(FORO)) {
    fallos.push(`el acuerdo no dice ante qué foro se resuelve ("${FORO}")`);
  }

  // La cláusula de idioma tiene que estar SIEMPRE. Es lo único que protege a Yael de
  // una traducción al inglés que diga otra cosa — un texto legal que él no puede leer
  // no puede ser el que lo obliga.
  if (!texto.includes(CLAUSULA_IDIOMA)) {
    fallos.push("el acuerdo no dice qué versión manda si hay traducción al inglés");
  }
  // Y el aviso en inglés va en inglés a propósito: quien lo necesita es justamente
  // quien no lee español.
  if (!/the Spanish version governs/i.test(texto)) {
    fallos.push("falta el aviso en inglés de que manda la versión en español");
  }
  // /terminos tiene que LEER la constante, no escribir su propia versión: una copia
  // a mano se desfasa el día que alguien cambie la de arriba.
  // Se acepta cualquiera de las dos formas de leerla —la constante suelta o la
  // tabla por idioma—, pero SIEMPRE leída, nunca escrita a mano.
  const leeLaLey =
    (/\{\s*LEY_APLICABLE\s*\}/.test(terminos) && /\{\s*FORO\s*\}/.test(terminos)) ||
    (/LEY_POR_IDIOMA\.\w+\.ley/.test(terminos) && /LEY_POR_IDIOMA\.\w+\.foro/.test(terminos));
  if (!leeLaLey) {
    fallos.push(
      "los Términos no leen la ley de su fuente única (LEY_APLICABLE/FORO o LEY_POR_IDIOMA): una copia a mano se desfasa del acuerdo que remite a ellos"
    );
  }
  // Y que no quede ningún resto de la ley anterior en ninguno de los dos.
  for (const [donde, txt] of [
    ["el acuerdo", texto],
    ["/terminos", terminos],
  ]) {
    if (/Estados Unidos Mexicanos|tribunales[^.]{0,40}M[ée]xico/i.test(txt)) {
      fallos.push(`${donde} sigue diciendo que se rige por ley mexicana`);
    }
  }
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
