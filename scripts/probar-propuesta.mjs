// Prueba del copy POR PIEZA de la propuesta pública: TODAS las combinaciones.
//
// LECCIÓN 2026-08-10: una propuesta de "solo sitio web" salió con la fila de
// "Costos de APIs", el paso de "la decisión de tu número" y la invitación a la
// demo del agente — bloques fijos que salían siempre. Aquí se comprueba, para
// cada combinación de piezas, que NINGÚN texto de una pieza ausente se cuele, y
// (los dos casos de la lección de los verificadores) que los textos LEGÍTIMOS de
// cada pieza sí aparecen cuando la pieza está cotizada — un guardián demasiado
// bruto que se "arreglara" borrando textos buenos también fallaría aquí.
//
// Correr con:  node scripts/probar-propuesta.mjs   (corre en el prebuild)

import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const jiti = require("jiti")(fileURLToPath(import.meta.url));

const C = jiti(path.join(AQUI, "..", "lib", "propuesta-copy.ts"));

/** Todos los subconjuntos NO vacíos. */
function subconjuntos(lista) {
  const salida = [];
  for (let mascara = 1; mascara < 1 << lista.length; mascara++) {
    salida.push(lista.filter((_, i) => mascara & (1 << i)));
  }
  return salida;
}

// Literales de la página que el módulo no genera (viven en el JSX): se prueban
// aquí tal cual, gateados por los mismos booleanos que usa la página.
const LITERAL_DEMO =
  "¿Quieres ver el agente en acción antes de decidir? Pruébalo tú mismo aquí — juega a ser tu propio comprador.";
const LITERAL_PERDIDA = "Lo que te está costando seguir igual · que hoy se van cada mes";

const DECLARADOS = { perdidaMensual: 12124, citasEstimado: false, ticketEstimado: false };
const ESTIMADOS = { perdidaMensual: 12124, citasEstimado: true, ticketEstimado: false };

/** Todo el texto visible que la página armaría para estas piezas. */
function textoDe(piezas, numeros) {
  const partes = [];
  const fc = C.filaCostos(piezas);
  partes.push(fc.k, fc.n);
  for (const f of C.faq(piezas)) partes.push(f.q, f.a);
  partes.push(C.dia1Desc(piezas), C.pruebasDesc(piezas));
  // Las tres variantes de agenda, para cubrir todas las ramas de la línea.
  for (const agenda of ["", "Un software o sistema (HubSpot)", "papel y libreta"]) {
    partes.push(...C.nuestraParte(piezas, C.lineaAgendaPorPieza(agenda, piezas)));
  }
  partes.push(...C.noNecesitas(piezas));
  // El bloque del boceto solo sale cuando hay uno, pero su texto también tiene
  // que respetar las piezas: si describe una agenda en línea a un cliente que
  // compró un asistente de voz, le está enseñando algo que no es lo suyo.
  const b = C.copyBoceto(piezas, "Inmobiliaria Prueba");
  partes.push(b.etiqueta, b.titulo, b.intro, ...b.queLleva, b.esBocetoTitulo, b.esBoceto, b.cta);
  // Los bonos, con las tres formas de contestar "cómo llevas la agenda": así las
  // reglas de "no nombres lo que no compró" también los cubren.
  for (const agenda of ["", "papel y libreta", "Un software o sistema (HubSpot)"]) {
    for (const bono of C.bonos(piezas, agenda)) partes.push(bono.titulo, bono.desc);
  }
  for (const it of C.tuParte(piezas)) partes.push(it.t);
  if (C.mostrarDemo(piezas)) partes.push(LITERAL_DEMO);
  if (C.mostrarPerdida(piezas, numeros)) partes.push(LITERAL_PERDIDA);
  return partes.join("\n");
}

const fallos = [];
let casos = 0;

// ── 0. Los literales de arriba no se quedaron atrás de la página ─────────────
// Este guardián INYECTA sus propios literales en el texto que después revisa. Si el
// JSX cambia y el literal no, la prueba sigue en verde vigilando una frase que ya no
// existe — que es justo lo que pasó: LITERAL_DEMO decía "juega a ser tu propio
// paciente" cuando la página ya decía "comprador". Aquí se caza el caso general:
// un literal con vocabulario del nicho anterior es un literal desfasado.
casos++;
{
  const VIEJO =
    /(?<![a-záéíóúüñ])(pacientes?|cl[íi]nicas?|dentistas?|odontolog\w*|consultorios?|doctor(?:es|a|as)?)(?![a-záéíóúüñ])/i;
  for (const [nombre, literal] of [
    ["LITERAL_DEMO", LITERAL_DEMO],
    ["LITERAL_PERDIDA", LITERAL_PERDIDA],
  ]) {
    const m = VIEJO.exec(literal);
    if (m)
      fallos.push(
        `${nombre} sigue diciendo "${m[0]}" — se quedó atrás de lo que dice la página, ` +
          "así que este guardián estaría vigilando una frase que ya no existe"
      );
  }
}

// ── 1. Ninguna combinación deja pasar texto de una pieza ausente ──────────────
for (const sub of subconjuntos(["web", "agente", "voz", "auto", "reactivacion"])) {
  for (const conPanel of [false, true]) {
    casos++;
    const piezas = conPanel ? [...sub, "panel"] : sub;
    const etiqueta = `[${piezas.join("+")}]`;
    const texto = textoDe(piezas, DECLARADOS);
    const bajo = texto.toLowerCase();
    const t = (...c) => c.some((x) => piezas.includes(x));

    const prohibidos = [];
    if (!t("agente")) prohibidos.push("juega a ser tu propio comprador", "agente en acción");
    if (!t("agente", "auto", "reactivacion"))
      prohibidos.push("número de whatsapp", "decisión de tu número");
    if (!C.usaApis(piezas)) prohibidos.push("costos de apis", "crear tus cuentas");
    if (!t("voz")) prohibidos.push("desvío");
    if (!t("web")) prohibidos.push("paleta", "tu dominio", "dominio y hosting", "páginas web que te gusten");

    for (const p of prohibidos) {
      if (bajo.includes(p)) fallos.push(`${etiqueta} contiene texto de pieza ausente: "${p}"`);
    }
  }
}

// ── 2. El caso que Yael VIO salir mal: web-sola con números estimados ─────────
casos++;
{
  const texto = textoDe(["web"], ESTIMADOS).toLowerCase();
  for (const p of ["costos de apis", "decisión de tu número", "juega a ser tu propio comprador"]) {
    if (texto.includes(p)) fallos.push(`[web·estimados] la propuesta que salió mal seguiría saliendo: "${p}"`);
  }
  if (C.mostrarPerdida(["web"], ESTIMADOS))
    fallos.push("[web·estimados] muestra la pérdida mensual armada con fallbacks");
  if (!texto.includes("dominio y hosting"))
    fallos.push("[web·estimados] no muestra la fila de dominio y hosting");
  if (!texto.includes("paleta"))
    fallos.push('[web·estimados] "Tu parte" de web no pide la paleta de colores');
  if (!texto.includes("páginas web que te gusten"))
    fallos.push('[web·estimados] "Tu parte" de web no pide las referencias');
}

// ── 3. El caso PARECIDO y correcto (que nadie "arregle" el guardián borrando) ─
casos++;
{
  if (!C.mostrarPerdida(["web"], DECLARADOS))
    fallos.push("[web·declarados] esconde la pérdida aunque los números son SUYOS");
  const agente = textoDe(["agente"], DECLARADOS).toLowerCase();
  for (const p of ["costos de apis", "número de whatsapp", "juega a ser tu propio comprador"]) {
    if (!agente.includes(p)) fallos.push(`[agente] perdió su texto legítimo: "${p}"`);
  }
}

// ── 4. Regresión voz vs agente (el startsWith que los confundía) ──────────────
casos++;
{
  const voz = C.tuParte(["voz"]).map((x) => x.t).join("\n").toLowerCase();
  if (voz.includes("número de whatsapp"))
    fallos.push('[voz] "Tu parte" le pide decidir un número de WhatsApp (bug del startsWith)');
  if (!voz.includes("desvío")) fallos.push('[voz] "Tu parte" no habla del desvío de llamadas');
  const inferVoz = C.inferPiezas(["Agente de voz 24/7 que contesta el teléfono"]);
  if (String(inferVoz) !== "voz") fallos.push(`inferPiezas confunde la voz: ${inferVoz}`);
  const inferAg = C.inferPiezas(["Agente de citas por WhatsApp"]);
  if (String(inferAg) !== "agente") fallos.push(`inferPiezas confunde al agente: ${inferAg}`);
}

// ── 5. piezasDeSnapshot: v4 manda; v3 infiere de labels ───────────────────────
casos++;
{
  const v4 = C.piezasDeSnapshot({ piezas: ["web"], incluye: ["Agente de citas"] });
  if (String(v4) !== "web") fallos.push(`v4 no manda sobre los labels: ${v4}`);
  const v3 = C.piezasDeSnapshot({ incluye: ["Sitio web con agenda", "Dashboard de control"] });
  if (String(v3) !== "web,panel") fallos.push(`v3 no infiere bien de los labels: ${v3}`);
}

// ── 6 · Las cuentas las abre Upcore, y eso lo dicen TODAS las pantallas ──────
// (Decisión 2026-08-16.) La propuesta prometía "o las creas tú con nuestro
// video" mientras el portal ya no lo ofrecía: dos textos del mismo trato
// diciendo cosas distintas. Aquí se comprueba que no vuelva a colarse.
casos++;
{
  for (const piezas of [["web"], ["agente"], ["voz"], ["agente", "web"]]) {
    const parte = C.tuParte(piezas).map((x) => x.t).join("\n");
    const dia1 = C.dia1Desc(piezas);
    const texto = `${parte}\n${dia1}`.toLowerCase();
    const etiqueta = `[${piezas.join("+")}]`;
    for (const p of ["las creas tú", "con tus propios clics", "crear tus cuentas"]) {
      if (texto.includes(p))
        fallos.push(`${etiqueta} le pide al cliente abrir sus cuentas: "${p}"`);
    }
    // Solo se le exige la línea a quien SÍ tiene cuentas que abrir. Un proyecto
    // de web sola no abre ninguna (su dominio lo compramos nosotros), y pedirle
    // esa frase era el guardián bruto de siempre: bloquear texto correcto.
    if (C.usaApis(piezas) && !/creamos nosotros|abrimos nosotros|a tu nombre/i.test(parte))
      fallos.push(`${etiqueta} "Tu parte" ya no dice quién crea las cuentas`);
  }
}

// ── 7 · El bloque del boceto dice QUÉ es y que TODO se puede cambiar ─────────
// (Lección 2026-08-16.) Decía solo "lo construimos con su información pública".
// El doctor abría el link sin saber qué miraba, y —peor— creyendo que eso era
// el producto final: un color que no le gustara le tumbaba la venta por algo
// que se cambia en un rato.
casos++;
{
  for (const piezas of [["web"], ["agente"], ["web", "agente"], ["voz"]]) {
    const b = C.copyBoceto(piezas, "Inmobiliaria Prueba");
    const etiqueta = `[${piezas.join("+")}]`;
    const todo = [b.titulo, b.intro, ...b.queLleva, b.esBocetoTitulo, b.esBoceto].join("\n");
    const bajo = todo.toLowerCase();

    // 1. Dice que es un boceto y que se cambia.
    if (!/boceto/i.test(`${b.esBocetoTitulo} ${b.esBoceto}`))
      fallos.push(`${etiqueta} el bloque del adelanto no dice que es un BOCETO`);
    if (!/se (puede[n]? )?cambia|se lo rehacemos|nada .{0,20}est[áa] cerrado/i.test(todo))
      fallos.push(`${etiqueta} no le dice que puede cambiarlo`);

    // 2. Describe lo que le construimos, no solo que existe.
    if (b.queLleva.length < 2)
      fallos.push(`${etiqueta} no describe qué lleva el adelanto (${b.queLleva.length} punto/s)`);

    // 3. Con sitio web, se nombran las cosas que el doctor va a poder cambiar y
    //    lo que el sitio trae. Sin esto volveríamos al texto vago de antes.
    if (piezas.includes("web")) {
      for (const debe of ["color", "tipografía", "animacion", "textos"]) {
        if (!bajo.includes(debe))
          fallos.push(`${etiqueta} no le dice que puede cambiar: "${debe}"`);
      }
      for (const debe of ["agenda en línea", "pantalla privada"]) {
        if (!bajo.includes(debe)) fallos.push(`${etiqueta} no describe el adelanto: "${debe}"`);
      }
      // Y lo que es de ejemplo se admite, no se disimula. La lista tiene que
      // nombrar TODO lo inventado que hay en el boceto de un sitio: si falta
      // uno, el doctor supone que ése sí salió de datos suyos.
      if (!/de ejemplo/i.test(b.esBoceto))
        fallos.push(`${etiqueta} no aclara que hay datos de ejemplo en el boceto`);
      // Y al revés: el aviso no puede nombrar PRECIOS, porque el boceto no enseña
      // ninguno. Decir "los precios que aparecen son de ejemplo" le hace creer que
      // los suyos van a aparecer — y el reclamo llega el día de la entrega.
      if (/precios?/i.test(b.esBoceto))
        fallos.push(`${etiqueta} el aviso del boceto habla de precios, y el sitio no publica ninguno`);
      // 🔴 "precios" estaba en esta lista y el guardián EXIGÍA la frase "los precios…
      // son de ejemplo". Venía del nicho de clínicas, donde el boceto sí estrenaba
      // precios. En inmobiliario el sitio NO publica ninguno —línea roja nº1, y el
      // config ni siquiera tiene el campo—, así que la regla obligaba a prometerle al
      // cliente que sus precios reemplazarían a unos de ejemplo que nunca existieron.
      // Una medida puede encodear el defecto: al quitar la frase, el guardián se puso
      // rojo y el equivocado era ÉL.
      for (const inventado of ["horarios", "fotos"]) {
        if (!b.esBoceto.toLowerCase().includes(inventado))
          fallos.push(`${etiqueta} no aclara que los ${inventado} del boceto son de ejemplo`);
      }
    }

    // 4. A quien NO compró sitio web no se le describe un sitio web.
    if (!piezas.includes("web")) {
      for (const prohibido of ["agenda en línea", "tipografía", "secciones"]) {
        if (bajo.includes(prohibido))
          fallos.push(`${etiqueta} el adelanto le describe algo de un sitio web: "${prohibido}"`);
      }
    }
  }
}

// ── 8 · Los bonos (decisión 2026-08-17) ─────────────────────────────────────
// Un bono solo vale si NO lo estamos vendiendo ya, si nos cuesta poco y si el
// doctor lo entiende sin explicación. Aquí se comprueba que no se cuele el bono
// equivocado y que no se prometa lo que no controlamos.
casos++;
{
  const textoDeBonos = (piezas, agenda) =>
    C.bonos(piezas, agenda).map((b) => `${b.titulo}\n${b.desc}`).join("\n").toLowerCase();

  // 1. La ficha de Google solo con sitio: sin sitio no hay a dónde enlazar.
  for (const piezas of [["agente"], ["voz"], ["auto"], ["reactivacion"], ["panel"]]) {
    if (/ficha/i.test(textoDeBonos(piezas, "")))
      fallos.push(`[${piezas.join("+")}] se le ofrece la ficha de Google sin sitio que enlazar`);
  }
  if (!/ficha/i.test(textoDeBonos(["web"], "")))
    fallos.push("[web] perdió el bono de la ficha de Google");

  // 2. JAMÁS se promete una posición en Google: eso no lo controla nadie.
  for (const piezas of [["web"], ["web", "agente"]]) {
    const t = textoDeBonos(piezas, "");
    for (const p of ["primero", "primer lugar", "posicion", "posición", "ranking", "garantiz", "top de google"]) {
      if (t.includes(p)) fallos.push(`[${piezas.join("+")}] el bono promete una posición en Google: "${p}"`);
    }
  }

  // 3. El calendario: no se le ofrece a quien YA tiene uno digital (sería
  //    relleno), sí a quien lleva papel, y en condicional cuando no sabemos.
  const conSoftware = textoDeBonos(["web"], "Un software o sistema (HubSpot)");
  if (/agenda digital|calendario/i.test(conSoftware))
    fallos.push("[web·con software] se le regala un calendario que ya tiene");

  const conPapel = textoDeBonos(["web"], "papel y libreta");
  if (!/calendario/i.test(conPapel)) fallos.push("[web·papel] perdió el bono del calendario");
  if (/(?<![a-záéíóúüñ])si(?![a-záéíóúüñ])/i.test(conPapel))
    fallos.push("[web·papel] lo dice en condicional aunque YA sabemos que llevan libreta");

  const enFrio = textoDeBonos(["web"], "");
  if (!/calendario/i.test(enFrio)) fallos.push("[web·en frío] perdió el bono del calendario");
  if (!/(?<![a-záéíóúüñ])si(?![a-záéíóúüñ])/i.test(enFrio))
    fallos.push("[web·en frío] afirma cómo llevan la agenda sin habérselo preguntado");

  // 4. Y el bono que se descartó: el diseño ya se vende en "Nuestra parte", así
  //    que regalarlo sería cobrar y regalar lo mismo.
  // ⚠️ Palabras COMPLETAS, con la frontera a mano: buscar "ui" a pedazos marcaba
  // "qUIen" y tumbaba un bono correcto. En JavaScript \b no sirve aquí porque
  // falla junto a vocales acentuadas — regla de la casa.
  for (const piezas of [["web"], ["web", "agente"]]) {
    const t = textoDeBonos(piezas, "");
    for (const p of ["ux", "ui", "diseño", "diseno"]) {
      const re = new RegExp(`(?<![a-záéíóúüñ0-9])${p}(?![a-záéíóúüñ0-9])`, "i");
      if (re.test(t))
        fallos.push(`[${piezas.join("+")}] el bono regala el diseño, que ya está vendido: "${p}"`);
    }
  }

  // 5. A quien no toca la agenda no se le monta un calendario.
  if (/calendario/i.test(textoDeBonos(["reactivacion"], "")))
    fallos.push("[reactivacion] se le monta un calendario que su pieza no usa");
}

// ── 9 · El SEO va incluido, y se dice (2026-08-17) ──────────────────────────
// Se hacía y no se cobraba ni se nombraba. Ahora se nombra — con la misma
// disciplina que el bono: se promete lo que DEJAMOS HECHO, nunca una posición.
casos++;
{
  const seoWeb = C.lineaSeo(["web"]);
  if (!seoWeb) fallos.push("[web] no se le dice que el SEO va incluido");
  else {
    const t = seoWeb.toLowerCase();
    for (const p of ["primero", "primer lugar", "posicion", "posición", "ranking", "garantiz", "top de google"]) {
      if (t.includes(p)) fallos.push(`[web] la línea de SEO promete una posición: "${p}"`);
    }
    // Y que nombre lo que de verdad entrega el producto, no humo.
    for (const debe of ["google", "descripción", "ficha"]) {
      if (!t.includes(debe)) fallos.push(`[web] la línea de SEO no dice qué se hace: falta "${debe}"`);
    }
    // Tiene que salir dentro de "Nuestra parte", que es donde el cliente lo lee.
    const parte = C.nuestraParte(["web"], null).join("\n");
    if (!parte.includes(seoWeb)) fallos.push("[web] el SEO no aparece en Nuestra parte");
  }
  // A quien no compró sitio no se le promete SEO de un sitio que no existe.
  for (const piezas of [["agente"], ["voz"], ["auto"], ["reactivacion"], ["panel"]]) {
    if (C.lineaSeo(piezas)) fallos.push(`[${piezas.join("+")}] se le promete SEO sin sitio web`);
  }
}

// ── 10 · Quién contesta el "Me interesa" (2026-08-17) ───────────────────────
// El botón mandaba SIEMPRE al WhatsApp del asistente: un prospecto al que Yael
// acababa de llamar caía con un robot sin contexto de esa llamada.
const BOT = "14244472698";
const YAEL = "14244472941";
casos++;
{
  const num = (l) => (l.match(/wa\.me\/(\d+)/) || [])[1];

  if (num(C.linkWhatsApp("bot", "Inmobiliaria X")) !== BOT)
    fallos.push("las propuestas del asistente ya no llevan a su propio WhatsApp");
  if (num(C.linkWhatsApp("yael", "Inmobiliaria X")) !== YAEL)
    fallos.push("las propuestas de Yael no llevan a SU número");

  // El default es lo que de verdad protege: un snapshot viejo (sin el campo) o
  // un valor raro NUNCA pueden acabar mandando el lead al bot.
  for (const valor of [undefined, null, "", "   ", "Yael", "otra-cosa", 0, {}]) {
    if (num(C.linkWhatsApp(valor, "Inmobiliaria X")) !== YAEL)
      fallos.push(`con contacto=${JSON.stringify(valor)} el lead cae en el bot en vez de con una persona`);
  }
  // "bot" se reconoce aunque venga con mayúsculas o espacios (viene de un body).
  for (const valor of ["BOT", " bot ", "Bot"]) {
    if (num(C.linkWhatsApp(valor, "Inmobiliaria X")) !== BOT)
      fallos.push(`contacto=${JSON.stringify(valor)} no se reconoce como el bot`);
  }
  // Y el mensaje sigue llevando el nombre de la inmobiliaria en los dos casos.
  for (const quien of ["bot", "yael"]) {
    if (!decodeURIComponent(C.linkWhatsApp(quien, "Inmobiliaria X")).includes("Inmobiliaria X"))
      fallos.push(`[${quien}] el mensaje del WhatsApp perdió el nombre de la inmobiliaria`);
  }
}

// ── 11 · No se ofrece quitar una pieza cuando solo hay una ───────────────────
// Decía "si quitamos una pieza, el precio baja" en propuestas de UNA pieza,
// donde quitarla deja al cliente sin proyecto: un descuento imposible.
casos++;
{
  for (const piezas of [["web"], ["agente"], ["voz"], ["panel"]]) {
    const t = `${C.invitacionRecortar(piezas).titulo} ${C.invitacionRecortar(piezas).texto}`;
    if (/quitamos una pieza|si quitas una pieza/i.test(t))
      fallos.push(`[${piezas.join("+")}] ofrece quitar una pieza teniendo una sola`);
    if (!/whatsapp/i.test(t))
      fallos.push(`[${piezas.join("+")}] la invitación a ajustar perdió por dónde escribir`);
  }
  // Con dos o más piezas SÍ se dice, que es donde tiene sentido.
  const varias = C.invitacionRecortar(["web", "agente"]).texto;
  if (!/quitamos una pieza/i.test(varias))
    fallos.push("[web+agente] perdió la invitación a quitar piezas, que ahí sí aplica");
}

// ── Veredicto ─────────────────────────────────────────────────────────────────
console.log(`Casos probados: ${casos}`);
if (fallos.length) {
  console.log(`\n❌ ${fallos.length} fallo(s):\n`);
  for (const f of fallos.slice(0, 25)) console.log("  ·", f);
  if (fallos.length > 25) console.log(`  ... y ${fallos.length - 25} más`);
  process.exit(1);
}
console.log("✅ El copy de la propuesta respeta las piezas cotizadas en todas las combinaciones.");
