// Copy POR PIEZA de la propuesta pública (/p/[token]) — FUENTE ÚNICA.
// Vivía dentro de app/p/[token]/page.tsx (mismo movimiento que lib/acuerdo.ts).
// Se mueve aquí para que el guardián scripts/probar-propuesta.mjs pruebe EXACTAMENTE
// los textos que verá el cliente, pieza por pieza, sin montar React.
//
// LECCIÓN 2026-08-10: una propuesta de "solo sitio web" salió con la fila de
// "Costos de APIs", el paso de "la decisión de tu número" y el bloque de la demo
// del agente — el 90% de la plantilla era texto fijo que salía SIEMPRE. Cada bloque
// de aquí decide su texto según las piezas COTIZADAS del snapshot (v4: `piezas`;
// v3 y anteriores: se infieren de los labels de `incluye`).

import { TP } from "./propuesta-textos";
import { CONTACT } from "./content";
import type { Idioma } from "./acuerdo-textos";

export type PiezaClave = "web" | "agente" | "agente-basico" | "voz" | "auto" | "reactivacion" | "panel";

const CLAVES: PiezaClave[] = ["web", "agente", "voz", "auto", "reactivacion", "panel"];

// v3 no trae claves crudas: se infieren del label. "Agente de voz" se prueba ANTES
// que "Agente" — el startsWith ciego era el bug que le daba a la voz el checklist
// del número de WhatsApp.
export function inferPiezas(incluye: string[]): PiezaClave[] {
  const out: PiezaClave[] = [];
  for (const x of incluye ?? []) {
    if (x.startsWith("Agente de voz")) out.push("voz");
    else if (x.startsWith("Agente")) out.push("agente");
    else if (x.startsWith("Sitio")) out.push("web");
    else if (x.startsWith("Automatizaciones")) out.push("auto");
    else if (x.startsWith("Reactivación")) out.push("reactivacion");
    else if (x.startsWith("Dashboard") || x.startsWith("Panel")) out.push("panel");
  }
  return [...new Set(out)];
}

export function piezasDeSnapshot(snap: { piezas?: string[]; incluye: string[] }): PiezaClave[] {
  const v4 = (snap.piezas ?? []).filter((p): p is PiezaClave => (CLAVES as string[]).includes(p));
  return v4.length ? v4 : inferPiezas(snap.incluye ?? []);
}

const tiene = (p: PiezaClave[], ...claves: PiezaClave[]) => claves.some((c) => p.includes(c));

/** ¿Alguna pieza consume APIs/IA? Todo menos la web sola. */
export const usaApis = (p: PiezaClave[]) =>
  tiene(p, "agente", "voz", "auto", "reactivacion", "panel");

export const esWebSola = (p: PiezaClave[]) => p.length > 0 && p.every((x) => x === "web");

// ── El adelanto ya construido (el "boceto") ─────────────────────────────────
// Es el bloque más fuerte de la propuesta: cualquiera promete un producto, pero
// enseñarlo hecho, con su nombre y sus datos, antes de cobrar un peso, no lo
// hace nadie.
//
// LECCIÓN 2026-08-16: decía solo "lo construimos con su información pública,
// ábralo desde su celular". Dos huecos que se ven en cuanto lo lees con ojos de
// doctor: (1) no dice QUÉ le construimos, así que abre el link sin saber qué
// está mirando; y (2) no dice que es un BOCETO. Si el doctor cree que eso es el
// producto final y algo no le gusta —el color, la letra, el orden— se cae la
// venta por algo que en realidad se cambia en un rato. Decir "todo se cambia"
// convierte cada pero en una conversación, y es además la verdad: los horarios
// y las fotos son de ejemplo hasta que él mande los suyos.
export function copyBoceto(p: PiezaClave[], clinica: string, idioma: Idioma = "es") {
  const t = TP[idioma].boceto;
  const suClinica = clinica || (idioma === "en" ? "your firm" : "su inmobiliaria");
  const web = tiene(p, "web");
  return {
    etiqueta: t.etiqueta,
    titulo: t.titulo,
    intro: t.intro(suClinica),
    queLleva: web ? t.queLlevaWeb : t.queLlevaOtro(suClinica),
    esBocetoTitulo: t.esBocetoTitulo,
    // La segunda frase lista TODO lo que en el boceto es de ejemplo: si el cliente
    // lee "las fotos son de ejemplo" y ve otra cosa inventada, va a suponer que esa
    // si salio de algun dato suyo. Los PRECIOS ya no estan en la lista porque el
    // boceto no ensena ninguno (linea roja del producto) y hay guardian que lo exige.
    esBoceto: web ? t.esBocetoWeb : t.esBocetoOtro,
    cta: t.cta,
  };
}

// ── ¿A quién le escribe el cliente cuando dice "me interesa"? ────────────────
// LECCIÓN 2026-08-17: el botón mandaba SIEMPRE al WhatsApp del asistente. En una
// propuesta que Yael acaba de trabajar por teléfono, eso deja al prospecto más
// caliente del embudo hablando con un robot — y el bot ni siquiera tiene el
// contexto de esa llamada.
//
// La regla: contesta quien VENÍA en la conversación.
//   · "bot"  → propuestas que generó el asistente tras su propio diagnóstico.
//   · "yael" → todo lo demás. Y es el DEFAULT a propósito: si algún día alguien
//     olvida marcarlo, el prospecto cae con una persona. El error barato es que
//     Yael conteste algo que podía contestar el bot; el caro es el contrario.
export type Contacto = "yael" | "bot";

export function esContactoBot(v: unknown): boolean {
  return String(v ?? "").trim().toLowerCase() === "bot";
}

/** El wa.me al que lleva "Me interesa", ya con su mensaje. */
export function linkWhatsApp(contacto: unknown, clinica: string, idioma: Idioma = "es"): string {
  const texto = encodeURIComponent(
    TP[idioma].waMensaje(clinica || (idioma === "en" ? "my firm" : "mi inmobiliaria"))
  );
  // 🔴 Este comentario decía "los números viven en content.ts; aquí solo se decide cuál" — y
  // era MENTIRA: estaban escritos a mano justo debajo. Se descubrió al mudar la línea humana
  // al +1 786 (2026-08-28): el sitio ya decía el número nuevo y la propuesta seguía mandando
  // al viejo, sin dar un solo error. Ahora sí sale de CONTACT, que es la fuente.
  return esContactoBot(contacto)
    ? `${CONTACT.whatsappBot}?text=${texto}`
    : `${CONTACT.whatsappYael}?text=${texto}`;
}

// ── La invitación a recortar el alcance ──────────────────────────────────────
// LECCIÓN 2026-08-17: decía "si quitamos una pieza, el precio baja" incluso en
// una propuesta de UNA sola pieza — donde quitarla deja al cliente sin proyecto.
// Le ofrecía un descuento imposible, que es peor que no ofrecer nada.
export function invitacionRecortar(
  p: PiezaClave[],
  idioma: Idioma = "es"
): { titulo: string; texto: string } {
  return p.length > 1 ? TP[idioma].recortarVarias : TP[idioma].recortarUna;
}

// ── Fila de costos variables del PlanCard ────────────────────────────────────
// El VALOR (rango en pesos) siempre sale de la calculadora congelada; aquí solo
// cambia el NOMBRE y la nota según qué lo genera de verdad.
export function filaCostos(
  p: PiezaClave[],
  idioma: Idioma = "es"
): { k: string; n: string } {
  const c = TP[idioma].costos;
  return esWebSola(p) ? { k: c.dominioK, n: c.dominioN } : { k: c.apisK, n: c.apisN };
}

// ── FAQ: la última entrada cambia por pieza ──────────────────────────────────
const FAQ_BASE = [
  {
    q: "¿Es difícil de usar? No soy de tecnología.",
    a: "Está pensado justo para eso: tú sigues trabajando como siempre y el sistema hace la parte pesada. Te enseño lo poco que hay que saber en un video corto; si algo no queda claro, me escribes y lo vemos.",
  },
  {
    q: "Ya tengo mi sistema / mi forma de trabajar.",
    a: "No se toca. Nos integramos a lo que ya usas (agenda, WhatsApp, Excel, software) — tus datos se quedan donde están y esto se encarga de lo que hoy nadie alcanza a hacer.",
  },
  {
    q: "¿De quién queda todo esto?",
    a: "Tuyo, al 100%. Las cuentas, el número, la página y el sistema quedan a tu nombre. Si un día no quieres seguir con Upcore, todo sigue siendo tuyo — nunca quedas amarrado.",
  },
  {
    q: "¿Y si no funciona como esperaba?",
    a: "Los primeros 30 días los ajustes van por mi cuenta hasta que quede como acordamos. Y si no te entrego lo acordado funcionando, te devuelvo tu anticipo.",
  },
];

// Esta solo aparece cuando la propuesta SÍ trae estimaciones hechas con sus
// cifras. En una propuesta en frío no hay ningún número suyo, así que preguntar
// "¿son reales?" y responder "los calculamos con los datos que TÚ nos diste"
// deja al cliente buscando unos datos que nunca dio. Lo cazó Yael leyendo.
const FAQ_NUMEROS = {
  q: "¿Los números de esta propuesta son reales?",
  a: "Son estimaciones conservadoras calculadas con los datos que TÚ nos diste (los supuestos están a la vista). Preferimos quedarnos cortos a prometerte de más.",
};

// Y esta la sustituye cuando la propuesta va en frío: la duda que de verdad
// tiene alguien que acaba de recibir un adelanto de su sitio sin haber hablado
// con nadie es otra — de dónde salió su información.
const FAQ_DE_DONDE = {
  q: "¿De dónde sacaron la información de mi inmobiliaria?",
  a: "De lo que ya es público: su propio sitio, su ficha de Google y sus reseñas. Nada de eso nos lo dio usted, y por eso lo que ve puede tener detalles por ajustar — los horarios, por ejemplo, están de ejemplo hasta que nos diga los suyos. El precio de aquí abajo no depende de eso: es cerrado.",
};
const FAQ_APIS = {
  q: "¿Por qué los costos de APIs van aparte?",
  a: "Porque son tuyos y así lo ves todo transparente: pagas el consumo real directo al proveedor, sin margen escondido de Upcore. Suelen ser unos cuantos dólares al mes, con tope de gasto activado.",
};
const FAQ_DOMINIO = {
  q: "¿Y el dominio de mi página?",
  a: "Lo compramos nosotros y va incluido en el precio, a nombre de la inmobiliaria desde el primer día. A partir del segundo año se renueva por unos $15 a $25 dólares al año, que pasan a su tarjeta — o corren por nuestra cuenta si se queda con el mantenimiento. La dirección es suya siempre: nadie se la puede quitar.",
};

/**
 * Las preguntas que se muestran.
 *
 * `conNumeros` = la propuesta trae estimaciones hechas con SUS cifras. Cuando va
 * en frío (solo con el boceto), esa pregunta se cambia por la de dónde salió su
 * información, que es la que de verdad se hace quien recibe esto sin haber
 * hablado con nadie.
 */
export const faq = (p: PiezaClave[], conNumeros = true, idioma: Idioma = "es") => {
  const t = TP[idioma];
  // 🔴 Las dos preguntas que todo prospecto hace —"¿y si un desarrollo ya se agotó?"
  // y "¿y si quiere hablar con una persona?"— no estaban en la propuesta. El sitio y
  // el acuerdo las contestan; el documento que se lee JUSTO ANTES DE DECIDIR, no.
  //
  // Se filtran por pieza, como todo lo demás del documento: una web sola no conversa
  // ni escala a nadie, así que le tocaría una FAQ sobre un asistente que no compró
  // (es el fallo del Portal de Arranque del 2026-08-16).
  const hablaConCompradores = tiene(p, "agente", "voz");
  return [
    ...t.faqBase,
    ...(hablaConCompradores ? [t.faqHumano, t.faqOffmarket] : []),
    ...(!hablaConCompradores && tiene(p, "web") ? [t.faqOffmarketWeb] : []),
    conNumeros ? t.faqNumeros : t.faqDeDonde,
    esWebSola(p) ? t.faqDominio : t.faqApis,
  ];
};

// ── Línea de tiempo: el Día 1 y el paso de pruebas cambian por pieza ─────────
export function dia1Desc(p: PiezaClave[], idioma: Idioma = "es"): string {
  const t = TP[idioma].dia1;
  const partes = [t.checklist];
  if (tiene(p, "agente", "auto", "reactivacion")) partes.push(t.numeroWa);
  if (tiene(p, "voz")) partes.push(t.desvio);
  if (tiene(p, "web")) partes.push(t.materialWeb);
  // Las cuentas las abrimos NOSOTROS (arranque concierge): lo unico que se le
  // pide aqui es a nombre de quien quedan.
  if (usaApis(p)) partes.push(t.cuentas);
  // Con una web sola tampoco se le pide el dominio: lo compramos nosotros y va
  // dentro del precio. Lo que si hace falta saber es a que agenda conectarnos.
  else if (tiene(p, "web")) partes.push(t.agendaWeb);
  return t.envoltura(partes.join(", "));
}

export function pruebasDesc(p: PiezaClave[], idioma: Idioma = "es"): string {
  const t = TP[idioma].pruebas;
  if (tiene(p, "agente") && tiene(p, "voz")) return t.agenteYVoz;
  if (tiene(p, "agente")) return t.agente;
  if (tiene(p, "voz")) return t.voz;
  if (tiene(p, "web")) return t.web;
  if (tiene(p, "auto")) return t.auto;
  if (tiene(p, "reactivacion")) return t.reactivacion;
  return t.generico;
}

/**
 * El SEO va INCLUIDO en el sitio y hasta hoy no se decía en ninguna pantalla
 * (Yael, 2026-08-17). Es trabajo que ya se hace y que el cliente estaba pagando
 * sin enterarse.
 *
 * ⚠️ Se nombra SOLO lo que el producto entrega de verdad, comprobado en el
 * código de `productos/sitio-inmobiliaria`: título y descripción por firma,
 * canonical, OpenGraph en es-US y la ficha estructurada de negocio (JSON-LD con
 * nombre, dirección, teléfono y giro, en `Landing.tsx`), sobre un sitio
 * estático que carga rápido.
 *
 * ⛔ Lo que NO es: un servicio mensual de SEO, ni contenidos, ni enlaces, ni una
 * posición en Google. Prometer eso sería vender algo que no hacemos — y el
 * doctor lo descubre al mes. Hay guardián que lo comprueba.
 */
export function lineaSeo(p: PiezaClave[], idioma: Idioma = "es"): string | null {
  if (!tiene(p, "web")) return null;
  return TP[idioma].seo;
}

// ── Nuestra parte ────────────────────────────────────────────────────────────
export function nuestraParte(
  p: PiezaClave[],
  lineaAgenda: string | null,
  idioma: Idioma = "es"
): string[] {
  const t = TP[idioma].nuestra;
  const primera = esWebSola(p)
    ? t.primeraWeb
    : p.length === 1 && p[0] === "reactivacion"
      ? t.primeraReactivacion
      : t.primeraSistema;
  const resto = [t.probarlo, entregaDesc(p, idioma), t.garantia, t.ajustes];
  // El SEO va incluido y va JUNTO a la construccion, no al final: es parte de
  // dejar el sitio hecho, no un extra que se agrega despues.
  const seo = lineaSeo(p, idioma);
  const cabeza = seo ? [primera, seo] : [primera];
  return lineaAgenda ? [...cabeza, lineaAgenda, ...resto] : [...cabeza, ...resto];
}

/**
 * Qué se entrega el último día, dicho con lo que de verdad se entrega.
 *
 * Un sitio web no se "capacita": no hay nada que operar. Prometer "capacitación
 * + guía de 1 página" para una web es relleno, y el cliente lo nota (lo cazó
 * Yael el 2026-08-16). Lo que sí necesita saber son dos cosas nada obvias:
 * dónde le caen las citas y cómo bloquear los días que no atiende — si se va de
 * vacaciones sin saberlo, el sitio le sigue agendando pacientes.
 *
 * Un agente o un sistema completo SÍ tienen manejo, y ahí la capacitación y la
 * guía se quedan como estaban.
 */
// ⚠️ Sin dos puntos dentro: esta frase se incrusta después de "Incluido sin
// costo extra:" y quedaba "extra: un video corto: dónde te caen…". Un texto de
// plantilla tiene que caber en la frase que lo recibe.
export function entregaDesc(p: PiezaClave[], idioma: Idioma = "es"): string {
  const t = TP[idioma].entrega;
  return esWebSola(p) ? t.web : t.otro;
}

// La línea de agenda solo aplica a piezas que TOCAN la agenda. Para web-sola se
// dice en clave de sitio; para reactivación-sola no se dice nada.
export function lineaAgendaPorPieza(
  agendaHoy: string,
  p: PiezaClave[],
  idioma: Idioma = "es"
): string | null {
  const t = TP[idioma].agenda;
  const a = (agendaHoy || "").trim();
  if (!a) return null;
  if (tiene(p, "agente", "voz", "auto", "panel")) {
    const software = a.match(/\(([^)]+)\)/)?.[1]?.trim();
    if (software) return t.integrarSoftware(software);
    if (/software|sistema/i.test(a)) return t.integrarSistema;
    if (/papel|excel/i.test(a)) return t.montarDigital;
    return t.conectar;
  }
  if (tiene(p, "web")) return t.conectarWeb;
  return null;
}

// ── Los bonos ────────────────────────────────────────────────────────────────
// Decisión de Yael (2026-08-17): sumar un bono a la propuesta del sitio.
//
// ⛔ El bono que NO se pone es "diseño UX/UI", que fue la primera idea. Tres
// razones: (1) ya se le está vendiendo —"Diseñar y construir tu sitio completo"
// está en nuestraParte()—; (2) devalúa el boceto, que es la PRUEBA del diseño y
// el argumento más fuerte de la venta: si el diseño es un regalo, el doctor se
// pregunta qué sería el sitio sin él; (3) "UX/UI" no significa nada para un
// dentista, y un bono solo vale si el que lo recibe entiende qué gana.
//
// La vara de un bono: que NO lo estemos vendiendo ya, que nos cueste poco, y que
// se entienda sin explicarlo. Estos dos la pasan.

/** ¿Consta que ya llevan la agenda en digital? Se lee del mismo campo que
 *  `lineaAgendaPorPieza`, para que las dos frases no puedan contradecirse. */
function agendaYaEsDigital(agendaHoy: string): boolean {
  const a = (agendaHoy || "").trim();
  if (!a) return false;
  if (/papel|libreta|cuaderno|excel/i.test(a)) return false;
  return /calendar|software|sistema|agenda digital|\(/i.test(a);
}

export function bonos(
  p: PiezaClave[],
  agendaHoy: string,
  idioma: Idioma = "es"
): { titulo: string; desc: string }[] {
  const t = TP[idioma];
  const salida: { titulo: string; desc: string }[] = [];

  // 1. Su ficha de Google. Solo con sitio: el bono es dejarla ENLAZADA al sitio
  //    nuevo, y sin sitio no hay a donde enlazar. Se promete lo que dejamos HECHO,
  //    nunca una posicion en Google: eso no lo controla nadie.
  if (tiene(p, "web")) salida.push(t.bonoGoogle);

  // 2. Su calendario montado. Solo en piezas que TOCAN la agenda, y solo si no
  //    consta que ya usen uno digital: ofrecerle a alguien algo que ya tiene es
  //    relleno, y el relleno se nota.
  if (tiene(p, "web", "agente", "voz", "auto") && !agendaYaEsDigital(agendaHoy)) {
    const enPapel = /papel|libreta|cuaderno|excel/i.test((agendaHoy || "").trim());
    // En frio (propuesta con boceto, sin diagnostico) no sabemos como agendan: se
    // dice en condicional. Afirmar que llevan libreta seria inventarle un dato de
    // su propio negocio, que es lo unico que mata una venta de golpe.
    salida.push({
      titulo: t.bonoAgenda.titulo,
      desc: enPapel ? t.bonoAgenda.descPapel : t.bonoAgenda.descCondicional,
    });
  }

  return salida;
}

// ── Lo que NO necesitas ──────────────────────────────────────────────────────
const NO_NECESITAS_BASE = [
  "Saber de tecnología",
  "Cambiar tu software o tu forma de trabajar",
  "Contratar a alguien más",
  "Pagar todo por adelantado",
  "Compartir contraseñas por chat (eso jamás)",
];
export const noNecesitas = (p: PiezaClave[], idioma: Idioma = "es") =>
  tiene(p, "web")
    ? [...TP[idioma].noNecesitasBase, TP[idioma].noNecesitasWeb]
    : TP[idioma].noNecesitasBase;

// ── Tu parte, por CLAVE de pieza ─────────────────────────────────────────────
// Antes se matcheaba por label.startsWith y "Agente de voz" caía en "Agente":
// a un proyecto de voz se le pedía decidir su número de WhatsApp.
export const TU_PARTE: Record<PiezaClave, { t: string; min: string }[]> = {
  agente: [
    { t: "Contestar el checklist de tu inmobiliaria: proyectos, planes de pago, horarios y tu tono", min: "15 min" },
    { t: "Decidir qué número de WhatsApp usará el asistente — te explico la diferencia antes", min: "5 min" },
    { t: "Tus cuentas: las creamos NOSOTROS a tu nombre — tú solo nos dices a qué correo quedan; contraseñas por chat, jamás", min: "5 min" },
    { t: "Darme acceso a tu calendario o agenda", min: "5 min" },
    { t: "Probarlo como si fueras tu comprador antes de salir en vivo", min: "15 min" },
  ],
  // Menos alcance = menos trabajo para él, y se nota en la lista: un solo idioma que
  // revisar y sin calificación que afinar. Si esta lista fuera igual que la del agente
  // completo, el cliente se preguntaría por qué paga la mitad y pone lo mismo.
  "agente-basico": [
    { t: "Contestar el checklist de tu inmobiliaria: proyectos, planes de pago, horarios y tu tono", min: "15 min" },
    { t: "Decidir qué número de WhatsApp usará el asistente — te explico la diferencia antes", min: "5 min" },
    { t: "Tus cuentas: las creamos NOSOTROS a tu nombre — tú solo nos dices a qué correo quedan; contraseñas por chat, jamás", min: "5 min" },
    { t: "Darme acceso a tu calendario o agenda", min: "5 min" },
    { t: "Probarlo como si fueras tu comprador antes de salir en vivo", min: "10 min" },
  ],
  voz: [
    { t: "Contestar el checklist de tu inmobiliaria: proyectos, planes de pago, horarios y tu tono", min: "15 min" },
    { t: "Decidir cómo quedará el desvío de llamadas — tu número no cambia, te explico antes", min: "5 min" },
    { t: "Tus cuentas: las creamos NOSOTROS a tu nombre — tú solo nos dices a qué correo quedan; contraseñas por chat, jamás", min: "5 min" },
    { t: "Darme acceso a tu calendario o agenda", min: "5 min" },
    { t: "Hacerle una llamada de prueba como si fueras tu comprador", min: "10 min" },
  ],
  web: [
    { t: "Pasarme los textos, renders y logo que ya tengas de tus proyectos", min: "20 min" },
    // 🔴 Decía "Tus proyectos con precios — los que quieras mostrar". El sitio NO
    // publica precios: es la línea roja nº1 del producto —en preventa cambian por
    // línea, piso y etapa— y el config ni siquiera tiene dónde escribirlos. O sea que
    // le pedíamos precios "para mostrar" que nunca iba a ver en su página, y lo
    // descubriría el día de la entrega. El rango sí se pide, pero se dice para qué es.
    {
      t: "Tus desarrollos: nombre, ubicación y qué tipo de unidades. Su rango de precios también, para que tu equipo lo tenga a la mano — en el sitio no se publica",
      min: "15 min",
    },
    { t: "Tu paleta de colores, si tienes una — o el link de una página cuyos colores te gusten", min: "5 min" },
    { t: "1 a 3 páginas web que te gusten como referencia, y qué te gusta de cada una", min: "10 min" },
    { t: "Reseñas o testimonios de clientes que quieras presumir (con su permiso)", min: "10 min" },
    { t: "Fotos de tu equipo y del sales center — con las del celular basta, nosotros las acomodamos", min: "15 min" },
    { t: "Horarios, dirección, teléfono y redes, tal cual quieres que aparezcan", min: "5 min" },
    // Cómo agendan hoy manda sobre TODO lo demás del sitio: define a qué se
    // conecta la agenda. Si ya usan un calendario, las citas caen ahí y no en
    // uno nuevo que nadie mira.
    { t: "Cómo llevas hoy la agenda — libreta, calendario en el celular, algún programa", min: "5 min" },
    // ⛔ Aquí decía "Tu dominio (o lo compramos juntos, a tu nombre)". Ya no es
    // parte suya: el dominio del primer año lo compra Upcore y va dentro del
    // precio (decisión 2026-08-16). El cliente no abre ninguna cuenta.
    { t: "Revisar el borrador y pedirme cambios", min: "15 min" },
  ],
  auto: [
    { t: "Darme acceso a tu calendario o agenda", min: "5 min" },
    { t: "Aprobar los textos de recordatorios y avisos de seguimiento (van con tu tono)", min: "10 min" },
    { t: "Probar el flujo completo con un prospecto de mentira", min: "10 min" },
  ],
  reactivacion: [
    { t: "Sacar tu lista de prospectos que nunca cerraron — te digo exactamente cómo exportarla", min: "15 min" },
    { t: "Aprobar los mensajes de reactivación", min: "10 min" },
  ],
  panel: [
    { t: "Una revisión corta de avances para dejar tu panel a tu gusto", min: "15 min" },
  ],
};
export const TU_PARTE_GENERICA = [
  { t: "Contestar el checklist de tu inmobiliaria", min: "15 min" },
  { t: "Tus cuentas: las creamos NOSOTROS a tu nombre — tú solo nos dices a qué correo quedan", min: "5 min" },
  { t: "Probar el sistema antes de la entrega", min: "15 min" },
];

export function tuParte(p: PiezaClave[], idioma: Idioma = "es"): { t: string; min: string }[] {
  const tabla = TP[idioma].tuParte;
  const items: { t: string; min: string }[] = [];
  const vistos = new Set<string>();
  for (const clave of ["voz", "agente", "web", "auto", "reactivacion", "panel"] as PiezaClave[]) {
    if (!p.includes(clave)) continue;
    for (const item of tabla[clave] ?? []) {
      if (vistos.has(item.t)) continue; // dedup entre piezas (ej. acceso al calendario)
      vistos.add(item.t);
      items.push(item);
    }
  }
  return items.length > 0 ? items : TP[idioma].tuParteGenerica;
}

// ── Demo y sección de pérdida ────────────────────────────────────────────────
/** La demo pública ES el agente de WhatsApp (chat): solo se invita si se cotizó.
 *  A un proyecto de voz-sola no se le manda a ESCRIBIRLE a algo que contesta llamadas. */
export const mostrarDemo = (p: PiezaClave[]) => p.includes("agente");

/** Números honestos: a una web-sola no se le restriega una "pérdida mensual" armada
 *  con puros estimados de fallback. Si el cliente SÍ declaró sus citas perdidas y su
 *  ticket, el número es suyo y se muestra. Para las demás piezas, igual que siempre. */
export function mostrarPerdida(
  p: PiezaClave[],
  n?: { perdidaMensual: number; citasEstimado: boolean; ticketEstimado: boolean } | null
): boolean {
  if (!n || !(n.perdidaMensual > 0)) return false;
  if (esWebSola(p) && (n.citasEstimado || n.ticketEstimado)) return false;
  return true;
}
