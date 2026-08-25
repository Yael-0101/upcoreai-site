// Prueba del Portal de Arranque POR PIEZA: todas las combinaciones.
//
// LECCIÓN 2026-08-16: el portal ya filtraba QUÉ PASOS ve cada cliente, pero los
// textos de adentro seguían escritos para el chatbot. A un cliente que solo
// compró su sitio web le decía "con esto tu asistente responde con TU
// información real" y "¿cómo debe sonar tu asistente?". Lo cachó Yael mirando la
// pantalla — ningún verificador lo miraba, porque el de la propuesta revisa la
// PROPUESTA y nadie escribió el del portal.
//
// Aquí se comprueba, para cada combinación de piezas:
//   1. que ningún texto nombre un producto que ese cliente NO compró
//   2. que el texto legítimo de cada pieza SÍ aparezca cuando la pieza está
//      (si no, alguien podría "arreglar" el guardián vaciando frases buenas)
//   3. que los pasos que se le muestran sean los suyos
//   4. que su arranque SEA COMPLETABLE: pidiéndole solo lo que se le pide,
//      tiene que poder llegar a "completado" — si no, quedaría esperando algo
//      que nunca se le muestra (el fallo silencioso de siempre)
//
// Correr con:  node scripts/probar-arranque.mjs   (corre en el prebuild)

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const jiti = require("jiti")(fileURLToPath(import.meta.url));

const C = jiti(path.join(AQUI, "..", "lib", "arranque-copy.ts"));
const A = jiti(path.join(AQUI, "..", "lib", "arranque.ts"));
// Los textos sueltos del paso 3 (los que no pasan por copyHorarios) viven aquí.
const TA = jiti(path.join(AQUI, "..", "lib", "arranque-textos.ts")).TA;

const PIEZAS = ["agente", "voz", "web", "auto", "reactivacion", "panel"];

/** Todos los subconjuntos NO vacíos. */
function subconjuntos(lista) {
  const salida = [];
  for (let mascara = 1; mascara < 1 << lista.length; mascara++) {
    salida.push(lista.filter((_, i) => mascara & (1 << i)));
  }
  return salida;
}

// Literales que viven en el JSX del portal (no los genera el módulo). Se prueban
// aquí gateados por los MISMOS booleanos que los muestran en pantalla.
// ⚠️ TIENE QUE SER EL TEXTO EXACTO DEL JSX. Al portar el portal a Miami la
// pantalla pasó a decir "comprador"/"inmobiliaria" y este literal se quedó en
// "paciente"/"clínica": el guardián estaba comprobando una frase que NO está en
// pantalla — se inyectaba su propio texto viejo y luego se lo exigía a sí mismo,
// así que pasaba en verde sin mirar nada. Es "revisa EXACTAMENTE lo que el
// usuario ve, no un conjunto parecido", aplicado a un verificador.
const LITERAL_DEMO =
  "Juega a ser tu comprador · Prueba un asistente como el tuyo — así se sentirá escribirle a tu inmobiliaria.";
const LITERAL_ESTILO_WEB =
  "El estilo de tu sitio · Tu paleta de colores · Página que te gusta · https://";
const LITERAL_TEXTOS_PREP =
  "Tus textos están en preparación. Te avisaremos por WhatsApp cuando estén aquí para tu visto bueno.";

/** Todo el texto que el portal le armaría a un cliente con estas piezas. */
function textoDe(piezas) {
  const pasos = A.pasosVisibles(piezas);
  const ve = (id) => pasos.includes(id);
  const partes = [];

  const bien = C.copyBienvenida(piezas, pasos.length);
  partes.push(bien.intro, bien.duracion);

  const serv = C.copyServicios(piezas);
  partes.push(serv.q, serv.hint);

  const hor = C.copyHorarios(piezas);
  partes.push(hor.q, hor.hint);
  if (hor.pideTono) partes.push(hor.tonoLabel);
  if (hor.pideFaqs) partes.push(hor.faqsLabel);
  // 🔴 A quién avisamos cuando piden una persona. Solo con asistente: a un cliente
  // de solo-web le hablaría de un asistente que no compró, y además le pediría un
  // dato que su producto nunca usa.
  if (C.pideEscalacion(piezas)) {
    const h = TA.es.horarios;
    partes.push(
      h.escalacionTitulo,
      h.escalacionHint,
      h.escalacionNombre,
      h.escalacionTel,
      C.hayVoz(piezas) ? h.escalacionAvisoVoz : h.escalacionAvisoChat,
      h.escalacionVia
    );
  }

  if (ve("numero")) {
    const n = C.copyNumero(piezas);
    partes.push(n.q, n.hint, n.actual, n.nuevo, n.labelActual, n.labelNuevo);
    partes.push(C.etiquetaNumero(piezas));
  }
  if (ve("linea")) {
    const l = C.copyLinea();
    partes.push(l.q, l.hint, l.desvio, l.nuevo, l.labelDesvio, l.labelNuevo);
    partes.push("Cómo llegan tus llamadas");
  }
  if (ve("calendario")) {
    const cal = C.copyCalendario(piezas);
    partes.push(cal.q, cal.hint);
  }
  if (ve("demo")) {
    partes.push(LITERAL_DEMO, C.etiquetaDemo(piezas));
  }
  if (ve("textos")) {
    const t = C.copyTextos(piezas);
    partes.push(t.q, t.hint);
    if (C.hayWeb(piezas)) partes.push(LITERAL_ESTILO_WEB);
    if (C.hayMensajes(piezas)) partes.push(LITERAL_TEXTOS_PREP);
  }

  // Las cuentas: título, para qué es, sus pasos y su nota.
  for (const plan of ["llave", "gestionado"]) {
    for (const c of A.cuentasRequeridas({ productos: piezas, plan })) {
      partes.push(c.titulo, c.para, ...c.pasos, c.nota ?? "");
    }
  }

  partes.push(C.copyFinal(piezas).seguimos);
  return partes.join("\n");
}

/** Un cliente que hizo TODO lo que su portal le pidió — ni más, ni menos. */
function datosCompletos(piezas) {
  const pasos = A.pasosVisibles(piezas);
  const ve = (id) => pasos.includes(id);
  return A.normalizarDatos({
    config: { nombre: "Dr. Prueba", clinica: "Clínica Prueba", giro: "dental", productos: piezas, plan: "llave" },
    checklist: {
      servicios: [{ nombre: "Limpieza", precio: "800", duracion: "45 min" }],
      horarios: "L-V 9-19",
      tono: C.pideTono(piezas) ? "calido" : null,
      faqs: "",
      indicaciones: "",
      logoColores: "",
    },
    numero: { decision: ve("numero") ? "actual" : null },
    linea: { decision: ve("linea") ? "desvio" : null },
    // Modo concierge: su parte de cuentas termina en cuanto nos deja sus datos.
    // Lo único que la pantalla de hoy le pide: su teléfono.
    concierge: { telefono: "3312345678" },
    cuentas: {},
    calendario: { compartido: ve("calendario"), tipo: "google" },
    prueba: { hecha: ve("demo"), comentarios: "" },
    web: { paleta: "", referencias: [] },
    // Los borradores los sembramos NOSOTROS por cliente; el cliente los aprueba.
    // Se modela así porque es el único camino real a "completado" en los
    // proyectos que mandan mensajes: sin textos sembrados, su arranque no puede
    // cerrarse — y eso es correcto, falta nuestra parte, no la suya.
    textos: C.hayMensajes(piezas)
      ? [{ id: "t1", titulo: "Recordatorio de cita", borrador: "…", estado: "aprobado", comentario: "" }]
      : [],
    avances: [],
    progreso: { pasoActual: 1 },
  });
}

const fallos = [];
let casos = 0;

// ── 1 · Ninguna combinación nombra una pieza ausente ─────────────────────────
for (const piezas of subconjuntos(PIEZAS)) {
  casos++;
  const etiqueta = `[${piezas.join("+")}]`;
  const bajo = textoDe(piezas).toLowerCase();
  const t = (...c) => c.some((x) => piezas.includes(x));

  const prohibidos = [];
  // "asistente" es LA palabra del caso que se coló: solo la pueden leer quienes
  // compraron una pieza que conversa.
  if (!t("agente", "voz")) prohibidos.push("asistente");
  if (!t("agente", "auto", "reactivacion")) prohibidos.push("whatsapp", "número de whatsapp");
  // ⚠️ "llamada" va con frontera escrita a mano: sin ella marcaba "videoLLAMADA"
  // —que es CORRECTO en cualquier proyecto, es como acompañamos al cliente— y
  // tumbaba 28 combinaciones buenas. Es la regla de la casa: en español las
  // palabras se comparan completas y nunca con \b (falla con acentos).
  if (!t("voz")) prohibidos.push("desvi", /(?<![a-záéíóúüñ])llamada/, "minuto hablado");
  if (!t("web")) prohibidos.push("tu sitio", "paleta", "dominio", "tuinmobiliaria.com");
  if (!t("agente")) prohibidos.push("juega a ser tu comprador");
  if (!t("panel")) prohibidos.push("tu panel");

  for (const p of prohibidos) {
    const pega = typeof p === "string" ? bajo.includes(p) : p.test(bajo);
    if (pega) fallos.push(`${etiqueta} nombra algo que NO compró: "${p}"`);
  }

  // 🔴 La pregunta de escalación, en las DOS direcciones.
  //
  // Antes del 2026-08-24 no se preguntaba en ninguna pantalla, así que
  // {{TELEFONO_HUMANO_ESCALACION}} era un placeholder que alguien resolvía a mano
  // antes de construir — o no. Ahora que existe, hay que vigilar los dos fallos:
  // que no le llegue a quien no compró asistente, y que no se pierda para quien sí.
  const preguntaEscalacion = /le avisamos cuando alguien pide hablar/i.test(bajo);
  if (t("agente", "voz") && !preguntaEscalacion)
    fallos.push(`${etiqueta} compró asistente y NO se le pregunta a quién avisar cuando piden una persona`);
  if (!t("agente", "voz") && preguntaEscalacion)
    fallos.push(`${etiqueta} no compró asistente y aun así se le pide a quién escalar`);

  // Y que el checklist se pueda TERMINAR: si la escalación fuera requisito para
  // alguien a quien no se le pregunta, su portal se quedaría incompleto para
  // siempre, sin dar ningún error.
  if (C.pideEscalacion(piezas) !== preguntaEscalacion)
    fallos.push(`${etiqueta} el requisito de escalación y la pregunta en pantalla no coinciden`);

  // 🔴 Las FASES del avance también se filtran por piezas (lección 2026-08-24).
  //
  // Eran una lista fija, así que un cliente de solo-voz veía "WhatsApp oficial con
  // Meta" en su propio avance: un trámite que su proyecto nunca va a tener. Se
  // encontró abriendo un portal de prueba y LEYÉNDOLO — este guardián revisaba el
  // copy de los pasos y las fases no las miraba nadie.
  const fases = A.fasesDe(piezas).map((f) => f.fase);
  const tieneMeta = fases.some((f) => /whatsapp/i.test(f));
  const deberiaMeta = t("agente", "auto", "reactivacion");
  if (tieneMeta && !deberiaMeta)
    fallos.push(`${etiqueta} su avance anuncia el trámite de WhatsApp con Meta, que no le toca`);
  if (!tieneMeta && deberiaMeta)
    fallos.push(`${etiqueta} escribe por WhatsApp y su avance NO incluye el trámite con Meta`);
  // Nadie se queda sin las fases comunes: un avance vacío no le dice nada al cliente.
  for (const comun of ["Preparación", "Construcción", "Pruebas", "Entrega"]) {
    if (!fases.some((f) => f.includes(comun)))
      fallos.push(`${etiqueta} perdió la fase común "${comun}"`);
  }
}

// ── 2 · Cada pieza conserva su texto legítimo ────────────────────────────────
const DEBE_DECIR = {
  agente: ["asistente", "whatsapp", "juega a ser tu comprador"],
  voz: ["desvi", "llamada", "línea"],
  web: ["tu sitio", "dominio", "paleta"],
  auto: ["whatsapp"],
  reactivacion: ["whatsapp"],
  panel: ["tu panel"],
};
for (const pieza of PIEZAS) {
  casos++;
  const bajo = textoDe([pieza]).toLowerCase();
  for (const debe of DEBE_DECIR[pieza]) {
    if (!bajo.includes(debe)) fallos.push(`[${pieza}] perdió su texto legítimo: "${debe}"`);
  }
}

// ── 3 · Los pasos que ve cada quien ──────────────────────────────────────────
casos++;
{
  const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const web = A.pasosVisibles(["web"]);
  if (!igual(web, ["bienvenida", "servicios", "horarios", "cuentas", "calendario", "textos", "resumen"]))
    fallos.push(`[web] pasos inesperados: ${web.join(",")}`);

  const voz = A.pasosVisibles(["voz"]);
  if (!voz.includes("linea")) fallos.push("[voz] NO se le pregunta qué pasa con su teléfono");
  if (voz.includes("numero")) fallos.push("[voz] se le pide decidir un número de WhatsApp");
  if (voz.includes("demo")) fallos.push("[voz] se le manda a probar el chat");
  if (voz.includes("textos")) fallos.push("[voz] ve el paso de textos, que le saldría vacío");

  const panel = A.pasosVisibles(["panel"]);
  if (panel.includes("calendario")) fallos.push("[panel] se le pide compartir calendario");
  if (panel.includes("textos")) fallos.push("[panel] ve el paso de textos, que le saldría vacío");

  const agente = A.pasosVisibles(["agente"]);
  if (agente.includes("linea")) fallos.push("[agente] se le pregunta por el desvío del teléfono");

  // Fila vieja sin sembrar: se le muestra TODO (misma regla que en el copy).
  const vacio = A.pasosVisibles([]);
  if (vacio.length !== 10) fallos.push(`[sin piezas] debería ver los 10 pasos, ve ${vacio.length}`);
  if (C.normalizarPiezas([]).length !== 6)
    fallos.push("[sin piezas] el copy no lo trata como 'todas', y se desalinea con los pasos");
}

// ── 3b · Ni el portal ni sus literales hablan del nicho anterior ────────────
//
// 🔴 EL DEFECTO QUE ESTO CAZA, Y QUE ESTUVO VIVO:
// Arriba se declaran a mano las frases del JSX del portal (no las genera el
// módulo). Al portar el portal a Miami, la PANTALLA pasó a decir "comprador" e
// "inmobiliaria" y esas constantes se quedaron en "paciente" y "clínica". El
// guardián seguía en verde: se inyectaba su propio texto viejo y luego se lo
// exigía a sí mismo. Comprobado rompiendo el JSX a propósito — no se enteraba.
//
// ⚠️ Lo que NO se puede comprobar: que el literal sea una CITA EXACTA del JSX.
// Nunca lo fue — son versiones resumidas a propósito (la pantalla mete paréntesis
// y etiquetas en medio). Exigir la cita literal daba falsos positivos, que es la
// otra forma de romper un verificador.
//
// Lo que sí se comprueba, y es justo donde estaba el fallo: que **ni la pantalla
// ni los literales** usen vocabulario del nicho anterior. Si uno de los dos se
// queda atrás, salta.
// ⚠️ Se comprueban SOLO los literales, no el JSX entero. Barrer el .tsx desde
// aquí producía falsos positivos —al quitar las etiquetas, el código queda
// mezclado con el texto y `d.clinica` se lee como si fuera una frase— y de eso ya
// se encarga `upcore-panel/scripts/auditar-nicho.mjs`, que sabe distinguir un
// nombre de campo de una frase. Cada guardián comprueba lo que de verdad puede.
casos++;
{
  const VIEJO =
    /(?<![a-záéíóúüñ])(pacientes?|cl[íi]nicas?|dentistas?|odontolog\w*|consultorios?)(?![a-záéíóúüñ])/i;
  for (const [nombre, literal] of [
    ["LITERAL_DEMO", LITERAL_DEMO],
    ["LITERAL_ESTILO_WEB", LITERAL_ESTILO_WEB],
    ["LITERAL_TEXTOS_PREP", LITERAL_TEXTOS_PREP],
  ]) {
    const m = VIEJO.exec(literal);
    if (m) {
      fallos.push(
        `${nombre} sigue diciendo "${m[0]}" — se quedó atrás de lo que dice la pantalla, ` +
          "así que este guardián estaría vigilando una frase que ya no existe"
      );
    }
  }
}

// ── 4 · Las cuentas que le tocan ────────────────────────────────────────────
casos++;
{
  const ids = (piezas, plan = "llave") =>
    A.cuentasRequeridas({ productos: piezas, plan }).map((c) => c.id);

  const web = ids(["web"]);
  if (!web.includes("dominio")) fallos.push("[web] no se le pide su dominio");
  if (web.includes("meta")) fallos.push("[web] se le pide crear WhatsApp con Meta");

  const voz = ids(["voz"]);
  if (!voz.includes("telefonia")) fallos.push("[voz] no se le crea su línea de voz");
  if (!voz.includes("ia")) fallos.push("[voz] se queda sin el cerebro que hace hablar al asistente");
  if (voz.includes("meta")) fallos.push("[voz] se le pide WhatsApp oficial sin haberlo comprado");

  const agente = ids(["agente"]);
  if (!agente.includes("meta") || !agente.includes("ia"))
    fallos.push("[agente] perdió alguna de sus cuentas");
  if (agente.includes("telefonia")) fallos.push("[agente] se le crea una línea de voz que no compró");

  // El dominio lo pagamos NOSOTROS (decisión 2026-08-16). Si el portal vuelve a
  // decirle que lo compre él, contradice su propuesta y su acuerdo.
  const dom = A.cuentasRequeridas({ productos: ["web"], plan: "llave" }).find((c) => c.id === "dominio");
  const domTexto = [...dom.pasos, dom.nota ?? ""].join(" ").toLowerCase();
  if (!domTexto.includes("nosotros"))
    fallos.push("[web] el dominio ya no dice que lo compramos nosotros");
  if (/lo compramos juntos|con nuestra guía \(~?\$/i.test(domTexto))
    fallos.push("[web] el portal le pide comprar el dominio: contradice la propuesta");
  const domGest = A.cuentasRequeridas({ productos: ["web"], plan: "gestionado" }).find((c) => c.id === "dominio");
  if (!(domGest.nota ?? "").toLowerCase().includes("mensualidad"))
    fallos.push("[web·gestionado] no dice que el dominio va en su mensualidad");
}

// ── 4b · Las cuentas las crea UPCORE: el cliente no abre ninguna ────────────
// (Decisión de Yael, 2026-08-16.) El portal ofrecía un botón de "Yo las creo"
// que contradecía el arranque concierge y le regalaba una tarde de trámites.
casos++;
{
  // Su parte termina en cuanto nos deja su teléfono: NADA de marcar cuentas, y
  // sin elegir tipo de correo (el del proyecto siempre se crea nuevo, 2026-08-16).
  // Este es el caso EXACTO que llena la pantalla de hoy: solo el teléfono.
  const soloTelefono = A.normalizarDatos({
    concierge: { telefono: "3312345678" },
  }).concierge;
  if (!A.conciergeListo(soloTelefono))
    fallos.push("con su teléfono ya dado, su parte de cuentas sigue sin darse por lista");
  if (!A.conciergeListo({ ...soloTelefono, modo: null }))
    fallos.push("conciergeListo volvió a exigir el `modo` que la pantalla ya no pregunta");
  if (!A.conciergeListo({ ...soloTelefono, correoTipo: null }))
    fallos.push("conciergeListo volvió a exigir el `correoTipo` que la pantalla ya no pregunta");
  // Sin teléfono no está listo — si no, nunca sabríamos a dónde escribirle.
  if (A.conciergeListo({ ...soloTelefono, telefono: "" }))
    fallos.push("da por listas las cuentas sin tener un teléfono donde contestarnos");
  // Y las filas VIEJAS que eligieron "con un correo mío" se siguen midiendo con
  // lo que a ellas se les pidió: sin ese correo, su parte no está completa.
  if (A.conciergeListo({ ...soloTelefono, correoTipo: "mio", correo: "" }))
    fallos.push("una fila vieja de 'correo mío' se da por lista sin el correo que se le pidió");

  for (const piezas of [["web"], ["agente"], ["voz"], ["agente", "web", "auto"]]) {
    for (const c of A.cuentasRequeridas({ productos: piezas, plan: "llave" })) {
      const texto = [c.para, ...c.pasos, c.nota ?? ""].join(" ").toLowerCase();
      // Meta es la ÚNICA excepción (el proveedor exige los clics del dueño) y
      // tiene que venir marcada, para poder avisárselo en vez de sorprenderlo.
      if (c.id === "meta") {
        if (!c.tusManos) fallos.push("[meta] no viene marcada como la que necesita sus manos");
        if (!texto.includes("facebook"))
          fallos.push("[meta] no explica POR QUÉ necesita sus manos");
        continue;
      }
      if (c.tusManos) fallos.push(`[${c.id}] se marcó como que necesita sus manos, y no es Meta`);
      // La TARJETA es del cliente y entra al ABRIR la cuenta, no al entregar:
      // el sistema consume desde que se construye y se prueba. Posponerla haría
      // que Upcore adelante su consumo — la regla de oro del manual. (El dominio
      // es la única excepción: ese primer año lo pagamos nosotros a propósito.)
      if (c.id !== "dominio" && /al entregar|al final|cuando te entreguemos/i.test(texto))
        fallos.push(`[${c.id}] deja la tarjeta del cliente para el final: Upcore adelantaría su consumo`);
      if (/\bcrea tu cuenta|creas tú|con nuestra guía|siguiendo un video|creamos juntos/i.test(texto))
        fallos.push(`[${c.id}] le pide al cliente abrir la cuenta: contradice el arranque concierge`);
      if (!/abrimos|compramos|creamos/i.test(texto))
        fallos.push(`[${c.id}] no le dice que la abrimos nosotros`);
    }
  }
}

// ── 5 · Todo arranque tiene que poder llegar a "completado" ─────────────────
for (const piezas of subconjuntos(PIEZAS)) {
  casos++;
  const estado = A.estadoDe(datosCompletos(piezas));
  if (estado !== "completado") {
    fallos.push(
      `[${piezas.join("+")}] hizo todo lo que se le pidió y su arranque quedó en "${estado}"`
    );
  }
}

// ── 6 · El caso exacto que Yael vio en pantalla ─────────────────────────────
casos++;
{
  const web = textoDe(["web"]);
  for (const frase of ["tu asistente responde", "sonar tu asistente", "atenderá tu asistente"]) {
    if (web.toLowerCase().includes(frase))
      fallos.push(`[web] la pantalla que salió mal seguiría saliendo: "${frase}"`);
  }
  const serv = C.copyServicios(["web"]);
  if (!serv.hint.toLowerCase().includes("sitio"))
    fallos.push("[web] el paso de servicios no le dice para qué son sus precios");
  // Y el caso PARECIDO que sí es correcto: al del chat no se le puede vaciar.
  const servAgente = C.copyServicios(["agente"]);
  if (!servAgente.hint.toLowerCase().includes("asistente"))
    fallos.push("[agente] perdió la frase que explica para qué son sus precios");
}

// ── 6 · Promesas que NO podemos cumplir ─────────────────────────────────────
//
// 🔴 2026-08-23. El portal le decía al cliente: "Al entregarte el proyecto te pasamos su
// acceso EN PERSONA o por videollamada". Upcore opera en remoto desde México y el cliente
// está en Florida: ir en persona no es algo que se pueda cumplir. Lo cachó Yael leyendo su
// propio portal.
//
// Una promesa rota duele más aquí que en cualquier otra pantalla, porque es justo donde le
// pedimos confianza para manejar sus cuentas.
//
// Se revisan LOS DOS IDIOMAS y TODAS las cadenas de la tabla, no solo las que arma el copy:
// esta frase vive en `arranque-textos.ts` y no pasa por ninguna de las funciones de arriba,
// así que las secciones 1-5 no la veían.
{
  const { TA } = jiti(path.join(AQUI, "..", "lib", "arranque-textos.ts"));

  // Fronteras a mano, nunca \b (en español falla junto a una vocal acentuada).
  const PROHIBIDO = [
    { re: /(?<![a-záéíóúüñ])en persona(?![a-záéíóúüñ])/i, que: "promete entrega EN PERSONA" },
    { re: /(?<![a-záéíóúüñ])presencial(?:es|mente)?(?![a-záéíóúüñ])/i, que: "promete algo PRESENCIAL" },
    { re: /(?<![a-z])in person(?![a-z])/i, que: 'promete entrega "in person"' },
  ];

  // ⚠️ RECORRIDO RECURSIVO, no `Object.entries` a secas. La primera versión de este bloque
  // solo miraba el primer nivel y la frase vive anidada en `prosa`, así que NO la veía —
  // habría salido en verde con el defecto puesto. Lo delató la mitad gemela de abajo.
  const cadenas = (obj, ruta = []) =>
    Object.entries(obj || {}).flatMap(([k, v]) =>
      typeof v === "string"
        ? [[[...ruta, k].join("."), v]]
        : v && typeof v === "object"
          ? cadenas(v, [...ruta, k])
          : []
    );

  for (const idioma of ["es", "en"]) {
    const tabla = TA[idioma];
    if (!tabla) {
      fallos.push(`falta la tabla de textos del portal en "${idioma}"`);
      continue;
    }
    const todas = cadenas(tabla);
    // Si el recorrido no encuentra nada, es que la tabla cambió de forma y este guardián
    // se quedó mirando al vacío. Falla ruidoso en vez de dar el visto bueno.
    if (todas.length < 50) {
      fallos.push(`[${idioma}] solo se leyeron ${todas.length} textos del portal — ¿cambió la forma de la tabla?`);
      continue;
    }
    for (const [clave, valor] of todas) {
      casos++;
      for (const p of PROHIBIDO) {
        if (p.re.test(valor)) {
          fallos.push(`[${idioma}] ${clave} ${p.que}: "${valor.trim().slice(0, 70)}…"`);
        }
      }
    }
  }

  // La mitad gemela: que NO se haya "arreglado" vaciando la frase. Se sigue diciendo por
  // dónde se entrega el acceso — solo que por videollamada.
  for (const idioma of ["es", "en"]) {
    casos++;
    const t = String(TA[idioma]?.prosa?.correoFinal || "").toLowerCase();
    const dice = idioma === "es" ? "videollamada" : "video call";
    if (!t.includes(dice)) {
      fallos.push(`[${idioma}] prosa.correoFinal ya no dice cómo se entrega el acceso ("${dice}")`);
    }
  }
}

// ── 9 · Los precios los elige el cliente, y su checklist se puede TERMINAR ───
//
// 🔄 Desde el 2026-08-25 el cliente decide qué hace su asistente con precios,
// disponibilidad y fechas. Aquí se vigila lo mismo que en el resto del portal, en las
// DOS direcciones: que no se le pregunte a quien no compró asistente, y que sí se le
// pregunte a quien sí. Y sobre todo, que cada modo se pueda completar: un requisito
// que nadie le pide deja el checklist incompleto para siempre, sin dar error.
for (const piezas of subconjuntos(PIEZAS)) {
  casos++;
  const hayAsistente = piezas.includes("agente") || piezas.includes("voz");
  if (C.pidePrecios(piezas) !== hayAsistente) {
    fallos.push(
      `pidePrecios([${piezas}]) = ${C.pidePrecios(piezas)}; una web o un panel no conversan con nadie`
    );
  }
  // Y la voz solo se elige si compró voz.
  if (C.pideVoz(piezas) !== piezas.includes("voz")) {
    fallos.push(`pideVoz([${piezas}]) no coincide con haber comprado el agente de voz`);
  }
}

// Cada modo tiene que poder quedar completo. Se replica la MISMA condición que usa la
// pantalla; si algún día se separan, esta prueba deja de valer — por eso se comprueban
// los tres modos y también el caso de no elegir ninguno.
const listo = (modo, publicado, fuente) =>
  modo === "transfiere" ||
  (modo === "publicado" && publicado.trim() !== "") ||
  (modo === "en-vivo" && fuente.trim() !== "");

for (const [modo, pub, fue, esperado] of [
  ["transfiere", "", "", true],
  ["publicado", "Preventa desde $230,000 — x.com", "", true],
  ["publicado", "", "", false],
  ["en-vivo", "", "Follow Up Boss", true],
  ["en-vivo", "", "", false],
  [null, "", "", false],
]) {
  casos++;
  if (listo(modo, pub, fue) !== esperado) {
    fallos.push(`modo de precios "${modo}" con detalle "${pub}${fue}": debería quedar ${esperado ? "completo" : "incompleto"}`);
  }
}

// ── 10 · Los `val` NO se traducen, y el suelo está en los dos idiomas ────────
//
// El `val` es lo que se guarda y lo que lee el sistema: si cambiara con el idioma, el
// cliente elegiría una cosa en inglés y se guardaría otra.
casos++;
const valsEs = (TA.es.modosPrecio || []).map((m) => m.val).join("|");
const valsEn = (TA.en.modosPrecio || []).map((m) => m.val).join("|");
if (valsEs !== valsEn || !valsEs) {
  fallos.push(`los modos de precio no coinciden entre idiomas: es="${valsEs}" en="${valsEn}"`);
}

// 🔒 El suelo tiene que existir en los dos idiomas y nombrar sus dos motivos legales.
// Si alguien lo vacía "para simplificar", el cliente deja de ver lo único que no puede
// quitar — y el día que pregunte por qué su asistente dijo algo, no tiene dónde mirarlo.
for (const idioma of ["es", "en"]) {
  casos++;
  const suelo = TA[idioma]?.suelo || [];
  if (suelo.length < 3) {
    fallos.push(`[${idioma}] el suelo no editable tiene ${suelo.length} reglas; deberían ser 3`);
    continue;
  }
  // Se comprueba por ID, no buscando palabras en el bloque entero.
  //
  // 🔴 La primera versión juntaba título + qué + porqué y buscaba "fair housing" ahí
  // dentro. Al cambiar el TÍTULO de la regla por su contrario ("responde lo que quieras
  // sobre la zona") pasaba limpia, porque la palabra seguía apareciendo en el motivo.
  // Buscar una palabra en un montón no comprueba nada: hay que mirar la pieza concreta.
  const ids = suelo.map((s) => s.id).sort().join("|");
  if (ids !== "no-inventa|se-identifica|vivienda-justa") {
    fallos.push(`[${idioma}] los ids del suelo son "${ids}"; deberían ser los tres de siempre`);
  }
  // Y las dos prohibiciones tienen que seguir siendo PROHIBICIONES en su título: es
  // exactamente por ahí por donde se convertiría una regla en su contraria.
  for (const id of ["vivienda-justa", "no-inventa"]) {
    casos++;
    const r = suelo.find((s) => s.id === id);
    if (!r) continue;
    const niega = idioma === "es" ? /\bnunca\b/i : /\bnever\b/i;
    if (!niega.test(r.titulo)) {
      fallos.push(`[${idioma}] la regla "${id}" dejó de estar redactada como prohibición: "${r.titulo}"`);
    }
  }
  // La de identificarse es una obligación, no una prohibición: se comprueba al revés.
  casos++;
  const ident = suelo.find((s) => s.id === "se-identifica");
  const afirma = idioma === "es" ? /\bsiempre\b/i : /\balways\b/i;
  if (ident && !afirma.test(ident.titulo)) {
    fallos.push(`[${idioma}] la regla "se-identifica" dejó de decir que SIEMPRE lo hace: "${ident.titulo}"`);
  }
  // Cada regla dice POR QUÉ. Una prohibición sin motivo se lee como capricho nuestro.
  casos++;
  if (suelo.some((s) => !String(s.porque || "").trim())) {
    fallos.push(`[${idioma}] alguna regla del suelo se quedó sin su motivo`);
  }
}

// ── Veredicto ───────────────────────────────────────────────────────────────
console.log(`Casos probados: ${casos}`);
if (fallos.length) {
  console.log(`\n❌ ${fallos.length} fallo(s):\n`);
  for (const f of fallos.slice(0, 25)) console.log("  ·", f);
  if (fallos.length > 25) console.log(`  ... y ${fallos.length - 25} más`);
  process.exit(1);
}
console.log("✅ El Portal de Arranque respeta las piezas de cada cliente en todas las combinaciones.");
