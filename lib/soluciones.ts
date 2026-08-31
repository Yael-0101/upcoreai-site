// ============================================================================
// PÁGINAS DE SOLUCIONES (SEO) — Upcore AI · español e inglés
//
// Cada objeto es una página en /soluciones/[slug] (español) y /en/soluciones/[slug]
// (inglés). El sitemap, el `hreflang` y los enlaces del footer salen de esta lista.
//
// El texto vive en `t: Record<Idioma, TextoSolucion>`: TypeScript obliga a que los
// dos idiomas tengan las mismas claves, así que agregar una sección en español sin
// traducirla NO COMPILA.
//
// ⚠️ El SLUG es el mismo en los dos idiomas, a propósito: así cada página sabe cuál
// es su pareja sin ningún diccionario y el `hreflang` sale solo. Ver `lib/idioma.ts`.
//
// ⚠️ REGLAS DE CIFRAS (las de la casa, y aquí pegan fuerte porque esto es público):
//   · Solo van números con fuente comprobada. Los del sector inmobiliario que se usan
//     abajo son: se pierde el 60–70% de los prospectos por seguimiento tardío; responder
//     en menos de 1 hora hace 7× más probable calificar al lead; el sector convierte
//     entre 0.4% y 2.4%; el 52% de las compras de preventa en el sur de Florida son de
//     extranjeros y ~86% de esos son latinoamericanos.
//   · Lo demás que aparece en `stats` es lo que HACE el producto (responde en menos de un
//     minuto, atiende 24/7), no una promesa de resultado.
//   · NUNCA se promete un número de ventas: no tenemos el CRM del cliente.
//
// 🔴 LÍNEA ROJA (2026-08-22). Este archivo tenía DOS fugas que ningún guardián vio:
//   · Una FAQ preguntaba "¿Da precios o fechas de entrega?" y contestaba "Solo los que
//     tú apruebes" — o sea, la página de producto prometía por escrito justo lo que el
//     contrato dice que el sistema NO hace.
//   · Un párrafo listaba "Precios, planes de pago, fechas de entrega" entre las
//     preguntas que el asistente responde.
//   Se colaron porque el guardián revisaba oración por oración y esas frases nombran el
//   dato en una oración y al sistema en la SIGUIENTE. Arreglado el texto y arreglado el
//   guardián (ahora mira la oración y su vecina).
// ============================================================================

import type { Giro } from "./demo-config";
import type { Idioma } from "./idioma";

export type TextoSolucion = {
  /** Título SEO SIN "| Upcore AI" — el layout agrega la marca */
  title: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string;
  /** Nombre corto para el menú y el footer */
  nombreCorto: string;
  dolores: { title: string; body: string }[];
  comoAyuda: { title: string; body: string }[];
  stats: { value: string; label: string }[];
  faqs: { q: string; a: string }[];
  /** "Cómo funciona, paso a paso" (opcional) */
  pasos?: { title: string; body: string }[];
  /** "Nos integramos a lo que ya usas" (opcional) */
  integraciones?: { nombre: string; detalle: string }[];
  /** "Tus datos y tus cuentas son tuyos" (opcional) */
  seguridad?: { title: string; body: string }[];
};

export type Solucion = {
  /** El slug ESPAÑOL. Es además el identificador interno de la solución: es el
   *  que se escribe en `relacionadas` y el que reciben `getSolucion()` y
   *  `ruta()`, en los dos idiomas. */
  slug: string;
  /**
   * El slug INGLÉS, que es el que se publica bajo `/en/solutions/…`.
   *
   * ⚠️ Es obligatorio a propósito: agregar una solución sin traducir su slug NO
   * COMPILA. Hasta el 2026-08-22 la versión inglesa vivía en la dirección
   * española (`/en/soluciones/agente-de-voz-para-inmobiliarias`), que es medio
   * trabajo: la página estaba traducida y su dirección no, justo donde el
   * buscador lee de qué trata. La traducción de las dos direcciones la hace
   * `lib/rutas.ts`, y hay guardián que comprueba que no se repitan ni queden
   * escritos como el español.
   */
  slugEn: string;
  giroDemo: Giro;
  /** Slugs ESPAÑOLES de otras soluciones → enlaces internos (opcional) */
  relacionadas?: string[];
  /** ISO "2026-07-22" → lastModified del sitemap (solo fechas reales) */
  actualizado?: string;
  t: Record<Idioma, TextoSolucion>;
};

const SEGURIDAD_ES = [
  {
    title: "Todo vive en tus cuentas",
    body: "Las cuentas de IA, WhatsApp y hosting se abren a tu nombre, con tope de gasto activado. Nosotros las montamos por ti, pero desde el primer día son tuyas.",
  },
  {
    title: "Tus prospectos no se copian ni se comparten",
    body: "No exportamos tu base ni la mezclamos con la de nadie. Cualquier acceso que necesitemos para construir es acotado, documentado y lo revocas cuando quieras.",
  },
  {
    title: "Si un día no sigues con nosotros, todo sigue siendo tuyo",
    body: "El número, el sitio, las cuentas y el sistema quedan a tu nombre. No hay licencia que se apague ni datos que se queden con el proveedor.",
  },
];

const SEGURIDAD_EN = [
  {
    title: "Everything lives in your accounts",
    body: "The AI, WhatsApp and hosting accounts are opened in your name, with spending caps turned on. We set them up for you, but they are yours from day one.",
  },
  {
    title: "Your leads are never copied or shared",
    body: "We do not export your database and we do not mix it with anyone else's. Any access we need in order to build is narrow, documented, and you can revoke it whenever you want.",
  },
  {
    title: "If one day you stop working with us, it all stays yours",
    body: "The number, the site, the accounts and the system are in your name. There is no license to switch off and no data that stays behind with the vendor.",
  },
];

export const SOLUCIONES: Solucion[] = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "chatbot-whatsapp-para-inmobiliarias",
    slugEn: "whatsapp-chatbot-for-real-estate",
    giroDemo: "comercializadora",
    relacionadas: [
      "agente-de-voz-para-inmobiliarias",
      "seguimiento-de-leads-inmobiliarios",
      "vender-preventa-en-miami-a-compradores-latinos",
    ],
    actualizado: "2026-08-22",
    t: {
      es: {
        title: "Chatbot de WhatsApp para inmobiliarias 24/7",
        metaDescription:
          "Un chatbot de WhatsApp con IA para tu inmobiliaria: atiende en español a cualquier hora, califica al comprador y agenda la visita. Hecho para preventa en Miami.",
        eyebrow: "Chatbot de WhatsApp para inmobiliarias",
        h1: "Tu comprador escribe a las 11 de la noche. Alguien le contesta.",
        intro:
          "Un asistente de WhatsApp con inteligencia artificial que atiende a tus prospectos al instante — a las 7 de la mañana en Bogotá o a la medianoche en Buenos Aires. Resuelve dudas de tus proyectos, califica al comprador y deja agendada la visita, con el tono de tu firma.",
        nombreCorto: "Chatbot de WhatsApp",
        dolores: [
          {
            title: "Escriben cuando tu equipo ya cerró",
            body: "Tu comprador está en otro país y otro huso horario. El mensaje entra de noche o en domingo, y cuando alguien lo ve, ya está hablando con otro proyecto.",
          },
          {
            title: "Responder tarde cuesta el lead",
            body: "Quien contesta en menos de una hora tiene 7 veces más probabilidad de calificar a ese prospecto. La mayoría de los equipos tarda 24 horas o más.",
          },
          {
            title: "Tu asesor repite lo mismo todo el día",
            // 🔴 Decía "Precios, planes de pago, fechas de entrega…". Esos tres son
            // justo lo que el asistente NO contesta: aquí solo van las preguntas que
            // sí puede resolver sin que el dato caduque.
            body: "Dónde está el proyecto, qué amenidades tiene, cómo es el proceso de compra, si se puede comprar desde el extranjero. Horas de trabajo en preguntas que un asistente bien configurado responde igual y sin cansarse.",
          },
        ],
        comoAyuda: [
          {
            title: "Contesta en segundos, en su idioma",
            body: "Detecta si te escriben en español, inglés o portugués y responde igual. En español está afinado para el comprador latinoamericano, que es de donde viene la mayor parte de la demanda de preventa en Miami.",
          },
          {
            title: "Califica antes de pasarlo",
            body: "Pregunta lo que tu asesor preguntaría: qué busca, en qué zona, con qué presupuesto, en qué plazo y si necesita financiamiento. Al asesor le llega el prospecto con la tarea hecha.",
          },
          {
            title: "Agenda la visita o la videollamada",
            body: "Ofrece los horarios que de verdad tienes libres, confirma en tu calendario y avisa al asesor. Y le recuerda al comprador que los horarios son de Miami, porque puede estar en otro huso.",
          },
        ],
        stats: [
          { value: "24/7", label: "atención sin descanso" },
          { value: "< 1 min", label: "tiempo de respuesta" },
          { value: "7×", label: "más probable calificar si respondes en menos de 1 hora" },
          { value: "0", label: "mensajes en visto" },
        ],
        faqs: [
          {
            q: "¿Funciona con mi número de WhatsApp actual?",
            a: "Sí. Conectamos el asistente a tu número con la API oficial de WhatsApp, y todo queda en tus propias cuentas, bajo tu control.",
          },
          {
            q: "¿Suena robótico?",
            a: "No. Usa inteligencia artificial de última generación con la información y el tono de tu firma. Pruébalo tú mismo en nuestra demo antes de decidir.",
          },
          {
            q: "¿Y si el comprador quiere hablar con una persona?",
            a: "El asistente lo detecta y avisa a tu equipo al momento, sin insistir ni intentar convencerlo de seguir con el robot. Le dice quién le va a escribir y cuándo, para que no se quede esperando. Nunca deja a un comprador atrapado con un robot.",
          },
          {
            q: "¿Y si un desarrollo ya se agotó? ¿lo va a seguir ofreciendo?",
            a: "No. Tú marcas ese desarrollo como pausado y desde ese momento el asistente deja de mencionarlo y de agendar visitas para él; a quien pregunte, lo pasa con tu asesor. Y se marca una sola vez: se calla en tu WhatsApp, en tu sitio y en tu teléfono el mismo día.",
          },
          {
            q: "¿Da precios o fechas de entrega?",
            // 🔴 Decía "Solo los que tú apruebes, y nunca inventa" — o sea, sí los
            // daba. Es la línea roja nº1 del producto y estaba prometida al revés
            // en la página que vende esa pieza.
            // 🔄 Reescrita el 2026-08-25: ahora lo elige el cliente. Lo que se dice es de
            // DÓNDE sale el dato, nunca un "sí" a secas — un asistente inventándose un
            // precio de preventa es el reclamo que esta respuesta existe para evitar.
            a: "Tú decides, y lo que eliges es de dónde sale el dato. Por defecto no los da: pasa la conversación a tu asesor con lo que ya averiguó. Si prefieres que sí, puede repetir el rango que ya publicas en tu web, o consultar tu lista de precios en el momento —igual que ya consulta tu calendario—, así que el número está tan al día como tu fuente. Lo que nunca hace es inventárselo: en preventa el precio, la disponibilidad y la fecha cambian por línea, piso y etapa, y por escrito se convierten en un reclamo. Impuestos, FIRPTA, escrituración o crédito los deriva siempre a tu asesor o a tu abogado.",
          },
        ],
        pasos: [
          {
            title: "Diagnóstico gratis (3 minutos)",
            body: "Nos cuentas cómo manejan hoy el WhatsApp y las visitas — por chat o aquí en la web. Al instante recibes tu diagnóstico con números: por dónde se te está yendo la gente y qué conviene resolver primero.",
          },
          {
            title: "Lo construimos por ti",
            // 🔴 Decía "proyectos, planes de pago, fechas, tono".
            body: "Cargamos tu información real — proyectos, ubicaciones, amenidades, cómo es tu proceso de compra y el tono de tu firma — y conectamos tu número con la API oficial de WhatsApp. Tú no configuras nada ni aprendes ninguna herramienta.",
          },
          {
            title: "Lo pruebas antes de salir en vivo",
            body: "Le escribes como si fueras tu propio comprador y ajustamos lo que pidas: frases, límites, y en qué momentos debe pasar la conversación a una persona.",
          },
          {
            title: "Sale a producción en 1–2 semanas",
            body: "Empieza a contestar de verdad. Tu equipo ve cada conversación y puede tomar el control de cualquier chat en el momento que quiera.",
          },
          {
            title: "Mejora con tu operación",
            body: "Lo afinamos con las preguntas reales de tus compradores. Y si eliges el plan Gestionado, nosotros lo vigilamos y lo mejoramos por ti todos los meses.",
          },
        ],
        integraciones: [
          {
            nombre: "Google Calendar",
            detalle:
              "El asistente agenda directo en tu calendario y lee los horarios que de verdad tienes libres.",
          },
          {
            nombre: "El CRM que ya usas",
            detalle:
              "Nos integramos encima del sistema donde hoy viven tus prospectos — no te hacemos migrar ni cambiar tu forma de trabajar.",
          },
          {
            nombre: "WhatsApp Business API oficial",
            detalle:
              "Tu número conectado por la vía autorizada de Meta. Nada de apps piratas que ponen en riesgo tu línea.",
          },
        ],
        seguridad: SEGURIDAD_ES,
      },
      en: {
        title: "WhatsApp chatbot for real estate: books 24/7",
        metaDescription:
          "An AI WhatsApp chatbot for your firm: answers in Spanish at any hour, qualifies the buyer and books the appointment. Built for Miami preconstruction sales.",
        eyebrow: "WhatsApp chatbot for real estate firms",
        h1: "Your buyer writes at 11 p.m. Someone answers.",
        intro:
          "A WhatsApp assistant powered by artificial intelligence that answers your leads instantly — 7 in the morning in Bogotá or midnight in Buenos Aires. It answers questions about your projects, qualifies the buyer and leaves the appointment booked, in your firm's voice.",
        nombreCorto: "WhatsApp chatbot",
        dolores: [
          {
            title: "They write after your team has closed",
            body: "Your buyer is in another country and another time zone. The message lands at night or on a Sunday, and by the time somebody sees it they are already talking to a different project.",
          },
          {
            title: "Answering late costs you the lead",
            body: "Reply within the hour and you are 7 times more likely to qualify that lead. Most teams take 24 hours or more.",
          },
          {
            title: "Your agent repeats the same things all day",
            body: "Where the project is, what amenities it has, what the buying process looks like, whether you can buy from abroad. Hours of work on questions a well-configured assistant answers just as well and never tires of.",
          },
        ],
        comoAyuda: [
          {
            title: "Answers in seconds, in their language",
            body: "It detects whether you are written to in Spanish, English or Portuguese and replies in kind. In Spanish it is tuned for the Latin American buyer, which is where most of Miami's preconstruction demand comes from.",
          },
          {
            title: "Qualifies before handing over",
            body: "It asks what your agent would ask: what they are looking for, which area, what budget, what timeline, and whether they need financing. The lead reaches your agent with the homework already done.",
          },
          {
            title: "Books the visit or the video call",
            body: "It offers the slots you actually have free, confirms on your calendar and notifies the agent. And it reminds the buyer that the times are Miami time, since they may be in another zone.",
          },
        ],
        stats: [
          { value: "24/7", label: "coverage that never rests" },
          { value: "< 1 min", label: "response time" },
          { value: "7×", label: "more likely to qualify if you reply within the hour" },
          { value: "0", label: "messages left on read" },
        ],
        faqs: [
          {
            q: "Does it work with my current WhatsApp number?",
            a: "Yes. We connect the assistant to your number through the official WhatsApp API, and everything stays in your own accounts, under your control.",
          },
          {
            q: "Does it sound robotic?",
            a: "No. It runs on state-of-the-art AI loaded with your firm's information and tone. Try it yourself in our demo before you decide.",
          },
          {
            q: "What if the buyer wants to talk to a person?",
            a: "The assistant picks that up and alerts your team right away, without pushing back or trying to keep them with the bot. It tells them who will reach out and when, so they are not left waiting. It never leaves a buyer trapped with a robot.",
          },
          {
            q: "What if a development is already sold out? Will it keep offering it?",
            a: "No. You mark that development as paused and from then on the assistant stops mentioning it and stops booking tours for it; anyone who asks gets handed to your agent. And you mark it once: it goes quiet on your WhatsApp, your site and your phone the same day.",
          },
          {
            q: "Does it give prices or delivery dates?",
            a: "You decide, and what you choose is where the figure comes from. By default it doesn't give them: it hands the conversation to your agent with what it already learned. If you'd rather it did, it can repeat the range you already publish on your site, or look your price list up in the moment —the same way it already reads your calendar— so the number is as current as your source. What it never does is make one up: in preconstruction the price, the availability and the date change by line, floor and phase, and in writing they turn into a complaint. Taxes, FIRPTA, closing or financing are always handed to your agent or your attorney.",
          },
        ],
        pasos: [
          {
            title: "Free assessment (3 minutes)",
            body: "You tell us how you handle WhatsApp and appointments today — by chat or right here on the site. You get your assessment on the spot, with numbers: where you are losing people and what is worth fixing first.",
          },
          {
            title: "We build it for you",
            body: "We load your real information — projects, locations, amenities, what your buying process looks like and your firm's tone — and connect your number through the official WhatsApp API. You configure nothing and learn no new tool.",
          },
          {
            title: "You test it before it goes live",
            body: "You write to it as if you were your own buyer and we adjust whatever you ask: phrasing, limits, and the moments when it should hand the conversation to a person.",
          },
          {
            title: "It goes live in 1–2 weeks",
            body: "It starts answering for real. Your team sees every conversation and can take over any chat at any moment.",
          },
          {
            title: "It gets better as you operate",
            body: "We tune it with your buyers' real questions. And if you choose the Managed plan, we watch it and improve it for you every month.",
          },
        ],
        integraciones: [
          {
            nombre: "Google Calendar",
            detalle:
              "The assistant books straight into your calendar and reads the slots you actually have free.",
          },
          {
            nombre: "The CRM you already use",
            detalle:
              "We integrate on top of the system where your leads live today — no migration, no change to how you work.",
          },
          {
            nombre: "Official WhatsApp Business API",
            detalle:
              "Your number connected through Meta's authorized route. No unofficial apps that put your line at risk.",
          },
        ],
        seguridad: SEGURIDAD_EN,
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "asistente-virtual-para-inmobiliarias",
    slugEn: "virtual-assistant-for-real-estate",
    giroDemo: "equipo",
    relacionadas: [
      "chatbot-whatsapp-para-inmobiliarias",
      "agente-de-voz-para-inmobiliarias",
      "automatizacion-para-inmobiliarias",
    ],
    actualizado: "2026-08-22",
    t: {
      es: {
        title: "Asistente virtual para inmobiliarias con IA",
        metaDescription:
          "Un asistente virtual con IA que atiende el WhatsApp y el teléfono de tu inmobiliaria, califica al comprador y agenda la visita. Sin contratar a nadie más.",
        eyebrow: "Asistente virtual para inmobiliarias",
        h1: "Un asistente que no duerme, no se va de vacaciones y no renuncia.",
        intro:
          "No es un contestador ni un menú de opciones. Es un asistente con inteligencia artificial que atiende tu WhatsApp y tu teléfono, entiende lo que le preguntan de tus proyectos, califica al comprador y deja la visita agendada — a la hora que sea y en el idioma que sea.",
        nombreCorto: "Asistente virtual",
        dolores: [
          {
            title: "Contratar a alguien más es caro y tarda",
            body: "Un asistente comercial en Florida cuesta miles de dólares al mes, hay que buscarlo, entrenarlo y aun así solo cubre un turno.",
          },
          {
            title: "La conversación vive en el celular del asesor",
            body: "Si el asesor renuncia, se va con la lista. Y nadie arriba puede saber qué se le dijo a quién ni por qué ese prospecto se enfrió.",
          },
          {
            title: "El volumen sube y la atención baja",
            body: "Cuando entra una campaña buena, el equipo se satura justo cuando más importa contestar rápido. Los prospectos se enfrían en la bandeja.",
          },
        ],
        comoAyuda: [
          {
            title: "Cubre las horas que hoy nadie cubre",
            body: "Noches, fines de semana y festivos — que es cuando escribe quien está en otro huso horario y con tiempo para pensar en comprar.",
          },
          {
            title: "Todo queda registrado en un solo lugar",
            body: "Cada conversación, cada dato y cada compromiso quedan en tu sistema, no en un teléfono personal. Si alguien se va, la información se queda.",
          },
          {
            title: "Aguanta el volumen que llegue",
            body: "Atiende diez conversaciones o quinientas con la misma velocidad. No se satura, no se le pasa ninguna y no pide aumento.",
          },
        ],
        stats: [
          { value: "24/7", label: "atención sin descanso" },
          { value: "60–70%", label: "de los prospectos se pierden hoy por seguimiento tardío" },
          { value: "< 1 min", label: "tiempo de respuesta" },
          { value: "1–2 sem", label: "para estar operando" },
        ],
        faqs: [
          {
            q: "¿Reemplaza a mis asesores?",
            a: "No. Les llega el prospecto ya calificado y con la visita agendada, así que su tiempo se va en vender. Lo que el asistente cubre es lo que hoy nadie alcanza: la madrugada, el domingo y el seguimiento del mes cuatro.",
          },
          {
            q: "¿Atiende en inglés?",
            a: "Sí. Detecta el idioma y contesta igual — español, inglés o portugués.",
          },
          {
            q: "¿Puedo ver lo que responde?",
            a: "Sí. Cada conversación queda a la vista y tu equipo puede tomar el control de cualquier chat en el momento que quiera.",
          },
          {
            q: "¿Qué pasa si no sabe algo?",
            a: "Lo dice y avisa a tu equipo. Está construido para admitir lo que no sabe en vez de inventarlo: una respuesta a la ligera sobre un plan de pago o un impuesto le cuesta dinero de verdad a tu comprador.",
          },
        ],
        integraciones: [
          {
            nombre: "El CRM que ya usas",
            detalle: "Tus prospectos siguen viviendo donde viven hoy. Nosotros orquestamos encima.",
          },
          {
            nombre: "Google Calendar",
            detalle: "Las visitas caen en el calendario que tu equipo ya mira todos los días.",
          },
          {
            nombre: "WhatsApp y teléfono",
            detalle:
              "Los dos canales por donde de verdad te buscan, atendidos por el mismo cerebro y con la misma información.",
          },
        ],
        seguridad: SEGURIDAD_ES,
      },
      en: {
        title: "AI virtual assistant for real estate firms",
        metaDescription:
          "An AI virtual assistant that answers your firm's WhatsApp and phone, qualifies the buyer and books the appointment. Without hiring anyone else.",
        eyebrow: "Virtual assistant for real estate firms",
        h1: "An assistant that does not sleep, does not take vacation and does not quit.",
        intro:
          "It is not an answering machine and not a phone menu. It is an assistant powered by artificial intelligence that handles your WhatsApp and your phone, understands what it is asked about your projects, qualifies the buyer and leaves the appointment booked — at any hour and in any language.",
        nombreCorto: "Virtual assistant",
        dolores: [
          {
            title: "Hiring someone else is expensive and slow",
            body: "A sales assistant in Florida costs thousands of dollars a month, you have to find them, train them, and even then they only cover one shift.",
          },
          {
            title: "The conversation lives on the agent's phone",
            body: "If the agent quits, the list leaves with them. And nobody above can know what was said to whom, or why that lead went cold.",
          },
          {
            title: "Volume goes up and service goes down",
            body: "When a good campaign lands, the team gets swamped exactly when answering fast matters most. Leads go cold in the inbox.",
          },
        ],
        comoAyuda: [
          {
            title: "Covers the hours nobody covers today",
            body: "Nights, weekends and holidays — which is when the person in another time zone, with time to think about buying, writes to you.",
          },
          {
            title: "Everything is recorded in one place",
            body: "Every conversation, every detail and every commitment lands in your system, not on a personal phone. If someone leaves, the information stays.",
          },
          {
            title: "Handles whatever volume arrives",
            body: "It handles ten conversations or five hundred at the same speed. It does not get swamped, it does not miss any, and it does not ask for a raise.",
          },
        ],
        stats: [
          { value: "24/7", label: "coverage that never rests" },
          { value: "60–70%", label: "of leads are lost today to late follow-up" },
          { value: "< 1 min", label: "response time" },
          { value: "1–2 wks", label: "to be up and running" },
        ],
        faqs: [
          {
            q: "Does it replace my agents?",
            a: "No. The lead reaches them already qualified and with the appointment booked, so their time goes into selling. What the assistant covers is what nobody gets to today: the small hours, Sunday, and the follow-up in month four.",
          },
          {
            q: "Does it handle English?",
            a: "Yes. It detects the language and replies in kind — Spanish, English or Portuguese.",
          },
          {
            q: "Can I see what it replies?",
            a: "Yes. Every conversation is visible and your team can take over any chat at any moment.",
          },
          {
            q: "What happens if it does not know something?",
            a: "It says so and alerts your team. It is built to admit what it does not know instead of making it up: a careless answer about a payment plan or a tax costs your buyer real money.",
          },
        ],
        integraciones: [
          {
            nombre: "The CRM you already use",
            detalle: "Your leads keep living where they live today. We orchestrate on top.",
          },
          {
            nombre: "Google Calendar",
            detalle: "Appointments land in the calendar your team already checks every day.",
          },
          {
            nombre: "WhatsApp and phone",
            detalle:
              "The two channels people actually reach you on, handled by the same brain with the same information.",
          },
        ],
        seguridad: SEGURIDAD_EN,
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "agente-de-voz-para-inmobiliarias",
    slugEn: "ai-voice-agent-for-real-estate",
    giroDemo: "comercializadora",
    relacionadas: [
      "chatbot-whatsapp-para-inmobiliarias",
      "asistente-virtual-para-inmobiliarias",
      "vender-preventa-en-miami-a-compradores-latinos",
    ],
    actualizado: "2026-08-22",
    t: {
      es: {
        title: "Agente de voz para inmobiliarias: contesta y agenda",
        metaDescription:
          "Un agente de voz con IA que contesta las llamadas de tu inmobiliaria a cualquier hora, resuelve dudas hablando y agenda la visita. Conservas tu número actual.",
        eyebrow: "Agente de voz para inmobiliarias",
        h1: "Las llamadas que hoy se van al buzón, contestadas.",
        intro:
          "Un agente que contesta el teléfono hablando, no con un menú de opciones. Resuelve las dudas de siempre sobre tus proyectos, agenda la visita en tu calendario y avisa a tu asesor — atendiendo en español o en inglés según quien llame. Tu número de siempre no cambia.",
        nombreCorto: "Agente de voz",
        dolores: [
          {
            title: "El que llama y no encuentra a nadie, no vuelve a llamar",
            body: "Una llamada al buzón es un prospecto que sigue de largo. Y en preventa, quien llama suele ser el que ya está decidido a comprar.",
          },
          {
            title: "Fuera de horario nadie contesta",
            body: "El comprador que está en otro país llama a su hora, no a la tuya. Ese es justo el momento en que tu oficina está cerrada.",
          },
          {
            title: "Los menús de opciones espantan",
            body: "\"Marque 1 para ventas\" es lo contrario de la atención que espera alguien que va a poner cientos de miles de dólares.",
          },
        ],
        comoAyuda: [
          {
            title: "Contesta hablando, como una persona",
            body: "Entiende lo que le preguntan y responde con la información real de tus proyectos. Sin menús, sin esperas y sin repetir el motivo de la llamada tres veces.",
          },
          {
            title: "Conservas tu número",
            body: "Se configura un desvío: quien te llama marca el mismo número de siempre y, cuando nadie contesta o ya cerraron, la llamada entra al asistente. Nadie se entera del cambio.",
          },
          {
            title: "Deja la visita agendada",
            body: "Consulta tus horarios reales, agenda en tu calendario y le avisa al asesor con el resumen de lo que se habló.",
          },
        ],
        stats: [
          { value: "24/7", label: "el teléfono siempre contestado" },
          { value: "0", label: "llamadas al buzón" },
          { value: "es/en", label: "atiende en el idioma de quien llama" },
          { value: "Tu número", label: "no cambia" },
        ],
        faqs: [
          {
            q: "¿Tengo que cambiar mi número?",
            a: "No. Tu número de siempre se queda igual y solo se configura un desvío. También puedes darle una línea propia al asistente si lo prefieres — tú decides.",
          },
          {
            q: "¿Cuánto cuesta operarlo?",
            a: "La voz se cobra por minuto hablado, así que sube con tus llamadas. Es la pieza con el costo por uso más alto de todas y te lo decimos de frente antes de que decidas. Se contrata con tope de gasto y ves tu consumo tú mismo.",
          },
          {
            q: "¿De verdad funciona o suena a robot?",
            a: "Está probado en llamadas reales: consulta agenda, agenda de verdad y escala a una persona cuando hace falta. Puedes marcarle tú mismo antes de salir en vivo.",
          },
          {
            q: "¿Y si el que llama pide hablar con alguien?",
            // 🔴 Decía "Pasa la llamada o avisa a tu equipo, según cómo lo
            // configures". La transferencia de llamada NO está construida (Retell la
            // trae de fábrica y nunca se ha configurado): lo único que hace hoy
            // `escalar_a_asesor` es avisar. Prometer una transferencia a quien acaba
            // de pedir una persona, y colgarle, es la peor forma de perderlo.
            // Vuelve tal cual cuando exista — ver productos/panel-inmobiliaria/LEEME.md.
            a: "Toma sus datos y avisa a tu equipo en el momento, sin discutir ni intentar convencerlo de seguir con el asistente. Antes de colgar le dice quién le va a marcar y cuándo, para que nadie se quede esperando. Tú eliges a qué asesor le llega ese aviso y por qué vía.",
          },
          {
            q: "¿Y si un desarrollo ya se agotó? ¿lo va a seguir ofreciendo?",
            a: "No. Tú marcas ese desarrollo como pausado y el agente deja de mencionarlo y de agendar visitas para él; a quien pregunte por él, lo pasa con tu asesor. Y nunca dice \"se agotó\" ni \"ya se vendió\": eso también es hablar de inventario, y en preventa cambia por línea, piso y etapa. Si quieres que sí dé precios o disponibilidad, se configura aparte y sale de la fuente que tú mantengas — lo que no hace en ningún caso es inventarse el dato, porque por teléfono se dice con toda seguridad y luego alguien lo reclama.",
          },
        ],
        seguridad: SEGURIDAD_ES,
      },
      en: {
        title: "Voice agent for real estate: answers and books",
        metaDescription:
          "An AI voice agent that answers your firm's calls at any hour, handles questions out loud and books the appointment. You keep your current number.",
        eyebrow: "Voice agent for real estate firms",
        h1: "The calls that go to voicemail today, answered.",
        intro:
          "An agent that answers the phone by talking, not with a menu of options. It handles the usual questions about your projects, books the appointment on your calendar and notifies your agent — in Spanish or English depending on who calls. Your usual number does not change.",
        nombreCorto: "Voice agent",
        dolores: [
          {
            title: "Whoever calls and reaches nobody does not call back",
            body: "A call that hits voicemail is a lead moving on. And in preconstruction, the person who calls is usually the one already set on buying.",
          },
          {
            title: "After hours, nobody answers",
            body: "The buyer in another country calls on their clock, not yours. That is exactly when your office is closed.",
          },
          {
            title: "Phone menus scare people off",
            body: "\"Press 1 for sales\" is the opposite of the treatment someone about to put down hundreds of thousands of dollars expects.",
          },
        ],
        comoAyuda: [
          {
            title: "Answers out loud, like a person",
            body: "It understands what it is asked and replies with the real information about your projects. No menus, no hold music, and no repeating why you called three times.",
          },
          {
            title: "You keep your number",
            body: "We set up call forwarding: people dial the same number as always and, when nobody picks up or you have closed, the call reaches the assistant. Nobody notices the change.",
          },
          {
            title: "Leaves the appointment booked",
            body: "It checks your real availability, books on your calendar and notifies the agent with a summary of what was discussed.",
          },
        ],
        stats: [
          { value: "24/7", label: "the phone always answered" },
          { value: "0", label: "calls to voicemail" },
          { value: "es/en", label: "answers in the caller's language" },
          { value: "Your number", label: "does not change" },
        ],
        faqs: [
          {
            q: "Do I have to change my number?",
            a: "No. Your usual number stays exactly as it is and we only set up forwarding. You can also give the assistant a line of its own if you prefer — your call.",
          },
          {
            q: "What does it cost to run?",
            a: "Voice is billed per minute spoken, so it rises with your call volume. It is the piece with the highest usage cost of them all and we tell you that up front, before you decide. It is set up with a spending cap and you watch your own usage.",
          },
          {
            q: "Does it really work, or does it sound like a robot?",
            a: "It has been tested on real calls: it checks the calendar, books for real, and escalates to a person when needed. You can dial it yourself before it goes live.",
          },
          {
            q: "What if the caller asks for a person?",
            a: "It takes their details and alerts your team on the spot, without arguing or trying to keep them with the assistant. Before hanging up it tells them who will call and when, so nobody is left waiting. You choose which agent gets that alert and how.",
          },
          {
            q: "What if a development is already sold out? Will it keep offering it?",
            a: "No. You mark that development as paused and the agent stops mentioning it and stops booking tours for it; anyone who asks about it gets handed to your agent. And it never says \"sold out\" either: that is talking inventory too, and in preconstruction it changes by line, floor and phase. If you do want it to give prices or availability, that is configured separately and comes from the source you keep current — what it never does, either way, is make the figure up, because on a call it is said with total confidence and later someone holds you to it.",
          },
        ],
        seguridad: SEGURIDAD_EN,
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "seguimiento-de-leads-inmobiliarios",
    slugEn: "real-estate-lead-follow-up",
    giroDemo: "equipo",
    relacionadas: [
      "automatizacion-para-inmobiliarias",
      "chatbot-whatsapp-para-inmobiliarias",
      "asistente-virtual-para-inmobiliarias",
    ],
    actualizado: "2026-08-22",
    t: {
      es: {
        title: "Seguimiento automático de leads inmobiliarios",
        metaDescription:
          "El 60–70% de los prospectos se pierde por seguimiento tardío. Automatiza el seguimiento de una preventa: recordatorios, avances de obra y reactivación.",
        eyebrow: "Seguimiento de leads inmobiliarios",
        h1: "El primer contacto sí se atiende. El del mes cuatro es el que se cae.",
        intro:
          "En preventa pasan meses —a veces años— entre la primera pregunta y la firma. Sostener esa conversación a mano, con cientos de prospectos a la vez, no lo aguanta ningún equipo. Esto lo sostiene solo: recuerda cada etapa de pago, avisa del avance de obra y vuelve a tocar al que dejó de contestar.",
        nombreCorto: "Seguimiento de leads",
        dolores: [
          {
            title: "Casi la mitad de los asesores no da un segundo toque",
            body: "El 48% no vuelve a contactar después de la primera llamada. No es falta de ganas: es que el volumen gana cuando no hay un sistema detrás.",
          },
          {
            title: "El prospecto se enfría y nadie lo nota",
            body: "Entre el 60% y el 70% de los prospectos se pierden por seguimiento tardío. No dejan rastro: simplemente dejan de contestar y nadie se entera de que existían.",
          },
          {
            title: "La preventa dura demasiado para la memoria de nadie",
            body: "Reserva, contrato, cada etapa de pago, avances de obra, entrega. Son meses de recordatorios que alguien tiene que estar dando.",
          },
        ],
        comoAyuda: [
          {
            title: "Cada prospecto tiene su siguiente toque programado",
            body: "Nadie se queda sin un próximo paso. El sistema sabe a quién le toca hoy y por qué, y te lo pone enfrente.",
          },
          {
            title: "Los recordatorios de pago salen solos",
            body: "Cada etapa del plan de pagos avisa con tiempo, con tu tono y por el canal donde de verdad te leen. Menos llamadas incómodas para tu equipo.",
          },
          {
            title: "El que se enfrió vuelve a la conversación",
            body: "Una campaña de reactivación toca a los prospectos viejos que quedaron en la lista y nunca compraron. Es la lista más barata que tienes, y casi nadie la usa.",
          },
        ],
        stats: [
          { value: "60–70%", label: "de los prospectos se pierden por seguimiento tardío" },
          { value: "48%", label: "de los asesores no da un segundo contacto" },
          { value: "0.4–2.4%", label: "es lo que convierte hoy el sector" },
          { value: "24/7", label: "el seguimiento no descansa" },
        ],
        faqs: [
          {
            q: "¿Se siente automático para el comprador?",
            a: "No, si está bien hecho. Los mensajes van con tu tono, con su nombre y con el dato que le corresponde a él — no una plantilla igual para todos. Tú apruebas los textos antes de que salga el primero.",
          },
          {
            q: "¿Funciona con mi CRM?",
            a: "Sí. Nos conectamos al sistema donde hoy viven tus prospectos. Si no usas ninguno, te montamos el panel — pero se ofrece, no se impone.",
          },
          {
            q: "¿Cuántas ventas más voy a cerrar?",
            a: "No te lo podemos decir, y desconfía de quien te dé un número: no tenemos tu CRM ni tu tasa de cierre. Lo que sí controlamos es que ningún prospecto se quede sin su siguiente toque, y eso lo garantizamos.",
          },
          {
            q: "¿Puedo aprobar los mensajes antes de que salgan?",
            a: "Sí, y es obligatorio en la campaña de reactivación: nada se manda a tu lista sin tu visto bueno.",
          },
        ],
        seguridad: SEGURIDAD_ES,
      },
      en: {
        title: "Real estate lead follow-up: so no lead goes cold",
        metaDescription:
          "60–70% of real estate leads are lost to late follow-up. Automate preconstruction follow-up: reminders, construction updates and re-engagement.",
        eyebrow: "Real estate lead follow-up",
        h1: "The first contact does get handled. It is month four that falls apart.",
        intro:
          "In preconstruction, months — sometimes years — pass between the first question and the signature. No team can hold that conversation by hand across hundreds of leads at once. This holds it on its own: it remembers every payment milestone, reports construction progress, and goes back to whoever stopped replying.",
        nombreCorto: "Lead follow-up",
        dolores: [
          {
            title: "Almost half of agents never make a second touch",
            body: "48% do not follow up after the first call. It is not for lack of will: volume wins when there is no system behind it.",
          },
          {
            title: "The lead goes cold and nobody notices",
            body: "Between 60% and 70% of leads are lost to late follow-up. They leave no trace: they simply stop replying and nobody finds out they existed.",
          },
          {
            title: "Preconstruction lasts longer than anyone's memory",
            body: "Reservation, contract, every payment milestone, construction updates, handover. Months of reminders somebody has to be giving.",
          },
        ],
        comoAyuda: [
          {
            title: "Every lead has its next touch scheduled",
            body: "Nobody is left without a next step. The system knows who is due today and why, and puts it in front of you.",
          },
          {
            title: "Payment reminders go out on their own",
            body: "Every stage of the payment plan gets flagged in advance, in your tone and on the channel where people actually read you. Fewer awkward calls for your team.",
          },
          {
            title: "Whoever went cold comes back into the conversation",
            body: "A re-engagement campaign reaches the old leads sitting on your list who never bought. It is the cheapest list you own, and almost nobody uses it.",
          },
        ],
        stats: [
          { value: "60–70%", label: "of leads are lost to late follow-up" },
          { value: "48%", label: "of agents never make a second contact" },
          { value: "0.4–2.4%", label: "is what the industry converts today" },
          { value: "24/7", label: "follow-up that never rests" },
        ],
        faqs: [
          {
            q: "Does it feel automated to the buyer?",
            a: "Not if it is done right. The messages carry your tone, their name and the detail that belongs to them — not one template for everybody. You approve the copy before the first one goes out.",
          },
          {
            q: "Does it work with my CRM?",
            a: "Yes. We connect to the system where your leads live today. If you do not use one, we set up the dashboard — but it is offered, never imposed.",
          },
          {
            q: "How many more sales will I close?",
            a: "We cannot tell you, and be suspicious of anyone who gives you a number: we do not have your CRM or your close rate. What we do control is that no lead is left without its next touch, and that we guarantee.",
          },
          {
            q: "Can I approve the messages before they go out?",
            a: "Yes, and it is mandatory for the re-engagement campaign: nothing goes to your list without your sign-off.",
          },
        ],
        seguridad: SEGURIDAD_EN,
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "automatizacion-para-inmobiliarias",
    slugEn: "real-estate-automation",
    giroDemo: "desarrolladora",
    relacionadas: [
      "seguimiento-de-leads-inmobiliarios",
      "asistente-virtual-para-inmobiliarias",
      "chatbot-whatsapp-para-inmobiliarias",
    ],
    actualizado: "2026-08-22",
    t: {
      es: {
        title: "Automatización para inmobiliarias: todo conectado",
        metaDescription:
          "Sitio con la ficha de cada desarrollo, agenda en línea, WhatsApp, teléfono y panel — montado, conectado a tu CRM y operando junto.",
        eyebrow: "Automatización para inmobiliarias",
        h1: "No piezas sueltas: la parte digital de tu inmobiliaria, completa.",
        intro:
          "Sitio con la ficha de cada desarrollo, agenda en línea, WhatsApp, teléfono y un panel para el director comercial. Todo en español e inglés, montado por nosotros, conectado al CRM que ya usas y operando junto — para que no acabes con cinco herramientas que no se hablan entre ellas.",
        nombreCorto: "Automatización",
        dolores: [
          {
            title: "Cinco herramientas que no se hablan",
            body: "El sitio por un lado, el WhatsApp por otro, la agenda en un tercero y el CRM sin la mitad de los datos. Cada salto es un lugar donde se pierde un prospecto.",
          },
          {
            title: "Trabajo repetitivo que come el día",
            body: "Copiar un lead del formulario al CRM, mandar el mismo mensaje de bienvenida, recordar la visita, avisar del avance de obra. Horas que nadie debería estar dando.",
          },
          {
            title: "Nadie ve el cuadro completo",
            body: "Sin un lugar donde mirar, el director comercial se entera de que un proyecto no jala cuando ya pasó el mes.",
          },
        ],
        comoAyuda: [
          {
            title: "Lo montamos todo, tú no configuras nada",
            body: "Abrimos las cuentas a tu nombre, conectamos las piezas y lo dejamos funcionando. Tu parte es alrededor de una hora en total.",
          },
          {
            title: "Se integra a lo que ya usas",
            body: "No te pedimos cambiarte de CRM ni de calendario. Tus datos siguen viviendo donde viven hoy y nosotros orquestamos encima.",
          },
          {
            title: "Un panel donde se ve todo",
            body: "Qué pasó con cada prospecto, cómo va cada asesor, qué proyecto está jalando y cuánto te está regresando la inversión.",
          },
        ],
        stats: [
          { value: "1–2 sem", label: "para estar operando" },
          { value: "~1 h", label: "es todo lo que te toca hacer a ti" },
          { value: "24/7", label: "trabajando sin descanso" },
          { value: "100%", label: "queda a tu nombre" },
        ],
        faqs: [
          {
            q: "¿Tengo que comprarlo todo junto?",
            a: "No. Cada pieza se vende por separado y el precio es cerrado. Se recomienda el sistema completo porque las piezas rinden más juntas, pero puedes empezar por una sola.",
          },
          {
            q: "¿El panel es obligatorio?",
            a: "No. Se ofrece, no se impone. Si ya tienes un sistema donde miras todo, nos integramos al tuyo.",
          },
          {
            q: "¿Quién paga las APIs?",
            a: "Tú, directo a los proveedores y a tu nombre, con tope de gasto activado. Upcore no les agrega ni un dólar de margen. Suelen ser unas decenas de dólares al mes según tu volumen.",
          },
          {
            q: "¿Y si quiero que ustedes lo operen?",
            a: "Es el plan Gestionado: lo construimos y lo operamos, mantenemos y mejoramos por ti, con una mensualidad. La propiedad sigue siendo tuya en los dos planes.",
          },
        ],
        integraciones: [
          {
            nombre: "El CRM que ya usas",
            detalle:
              "Nos conectamos encima. Cero migraciones, cero \"ahora todos aprendan este sistema nuevo\".",
          },
          {
            nombre: "Google Calendar",
            detalle:
              "Las visitas caen en el calendario que tu equipo ya mira, no en uno nuevo que nadie abre.",
          },
          {
            nombre: "WhatsApp Business API oficial",
            detalle: "Por la vía autorizada de Meta, con tu número y en tus cuentas.",
          },
        ],
        seguridad: SEGURIDAD_ES,
      },
      en: {
        title: "Real estate automation: the digital side, complete",
        metaDescription:
          "A site with a page for every development, online booking, WhatsApp, phone and a dashboard — set up, wired into your CRM and running as one.",
        eyebrow: "Real estate automation",
        h1: "Not loose pieces: the digital side of your firm, complete.",
        intro:
          "A site with a page for every development, online booking, WhatsApp, phone and a dashboard for the sales director. All of it in Spanish and English, set up by us, wired into the CRM you already use and running as one thing — so you do not end up with five tools that never talk to each other.",
        nombreCorto: "Automation",
        dolores: [
          {
            title: "Five tools that never talk to each other",
            body: "The site over here, WhatsApp over there, the calendar somewhere else and the CRM missing half the data. Every hop is a place where a lead gets lost.",
          },
          {
            title: "Repetitive work that eats the day",
            body: "Copying a lead from the form into the CRM, sending the same welcome message, reminding about the appointment, reporting construction progress. Hours nobody should be spending.",
          },
          {
            title: "Nobody sees the whole picture",
            body: "With no single place to look, the sales director finds out a project is not pulling once the month is already gone.",
          },
        ],
        comoAyuda: [
          {
            title: "We set it all up, you configure nothing",
            body: "We open the accounts in your name, connect the pieces and leave it running. Your share is about an hour in total.",
          },
          {
            title: "It plugs into what you already use",
            body: "We do not ask you to change CRM or calendar. Your data keeps living where it lives today and we orchestrate on top.",
          },
          {
            title: "One dashboard where it all shows",
            body: "What happened with each lead, how each agent is doing, which project is pulling, and what the investment is giving back.",
          },
        ],
        stats: [
          { value: "1–2 wks", label: "to be up and running" },
          { value: "~1 h", label: "is all that is on you" },
          { value: "24/7", label: "working without a break" },
          { value: "100%", label: "stays in your name" },
        ],
        faqs: [
          {
            q: "Do I have to buy it all at once?",
            a: "No. Each piece is sold separately and the price is fixed. We recommend the full system because the pieces are worth more together, but you can start with just one.",
          },
          {
            q: "Is the dashboard mandatory?",
            a: "No. It is offered, never imposed. If you already have a system where you watch everything, we integrate with yours.",
          },
          {
            q: "Who pays for the APIs?",
            a: "You do, straight to the providers and in your name, with a spending cap turned on. Upcore does not add a single dollar of margin. It usually runs to a few tens of dollars a month depending on your volume.",
          },
          {
            q: "And if I want you to run it?",
            a: "That is the Managed plan: we build it and we run, maintain and improve it for you, for a monthly fee. Ownership stays yours under both plans.",
          },
        ],
        integraciones: [
          {
            nombre: "The CRM you already use",
            detalle:
              "We connect on top. Zero migrations, zero \"now everybody learn this new system\".",
          },
          {
            nombre: "Google Calendar",
            detalle:
              "Appointments land in the calendar your team already checks, not in a new one nobody opens.",
          },
          {
            nombre: "Official WhatsApp Business API",
            detalle: "Through Meta's authorized route, with your number and in your accounts.",
          },
        ],
        seguridad: SEGURIDAD_EN,
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "vender-preventa-en-miami-a-compradores-latinos",
    slugEn: "selling-miami-preconstruction-to-latin-buyers",
    giroDemo: "comercializadora",
    relacionadas: [
      "chatbot-whatsapp-para-inmobiliarias",
      "agente-de-voz-para-inmobiliarias",
      "seguimiento-de-leads-inmobiliarios",
    ],
    actualizado: "2026-08-22",
    t: {
      es: {
        title: "Vender preventa en Miami a compradores latinos",
        metaDescription:
          "El 52% de las compras de preventa en el sur de Florida son de extranjeros y ~86% de ellos, latinoamericanos. Cómo atenderlos en su idioma y su horario.",
        eyebrow: "Preventa en Miami · comprador latinoamericano",
        h1: "Tu comprador decide en español. ¿Tu operación está lista para eso?",
        intro:
          "En preconstrucción del sur de Florida, más de la mitad de las compras son de extranjeros, y la gran mayoría de ellos son latinoamericanos. Escriben en español, desde otro país y a su propia hora. Esta página es sobre qué cambia en tu operación cuando ese es tu comprador — y qué se puede automatizar sin perder el trato.",
        nombreCorto: "Preventa para compradores latinos",
        dolores: [
          {
            title: "El idioma decide la confianza",
            body: "El español suele ser el idioma del primer contacto y el de la decisión familiar. Un equipo que atiende bien en inglés y regular en español pierde justo en el momento que más pesa.",
          },
          {
            title: "El huso horario juega en contra",
            body: "Bogotá, Buenos Aires, Ciudad de México y São Paulo no comparten tu horario de oficina. La pregunta entra cuando tú ya cerraste.",
          },
          {
            title: "Compra a distancia, y eso da miedo",
            body: "Muchos compran sin haber visitado. Las dudas no son solo del proyecto: son cómo se paga desde fuera, a nombre de quién se escritura y qué pasa con los impuestos.",
          },
        ],
        comoAyuda: [
          {
            title: "Atención en español, a cualquier hora",
            body: "El asistente contesta en el idioma en que le escriban y a la hora que sea, con la información real de tus proyectos. Y sabe recordar que tus horarios son de Miami.",
          },
          {
            title: "Las dudas serias se derivan, no se improvisan",
            body: "Impuestos, FIRPTA, comprar a nombre de una LLC, condiciones de crédito o temas de visa se derivan a tu equipo, a tu abogado o a tu contador. El asistente lo dice así de claro: una respuesta a la ligera ahí le cuesta dinero de verdad a tu comprador.",
          },
          {
            title: "El seguimiento aguanta los meses que dura",
            body: "Entre la reserva y la entrega pasan meses o años. El sistema sostiene esa conversación: cada etapa de pago, cada avance de obra, cada prospecto que se enfrió.",
          },
        ],
        stats: [
          {
            value: "52%",
            label: "de las compras de preventa en el sur de Florida son de extranjeros",
          },
          { value: "86%", label: "de esos compradores internacionales son latinoamericanos" },
          { value: "7×", label: "más probable calificar si respondes en menos de 1 hora" },
          { value: "24/7", label: "atención en su idioma y en su horario" },
        ],
        faqs: [
          {
            q: "¿Ustedes dónde están?",
            a: "Operamos desde México y trabajamos 100% en remoto, en la misma franja horaria que Florida. Lo decimos de frente porque es parte de por qué funcionamos: entendemos al comprador latinoamericano que te escribe, cómo pregunta y qué le preocupa, mejor que una agencia local que solo trabaja en inglés.",
          },
          {
            q: "¿El asistente también atiende en inglés?",
            a: "Sí, y en portugués. Detecta el idioma y contesta igual. El español es donde está más afinado, porque es de donde viene la mayor parte de la demanda.",
          },
          {
            q: "¿Sirve si vendo unidades listas, no preventa?",
            a: "Sí. El seguimiento largo pesa menos, pero la atención inmediata y la calificación del comprador sirven igual. En el diagnóstico se ajusta a lo que tú vendes.",
          },
          {
            q: "¿Cómo se paga estando ustedes fuera de Estados Unidos?",
            a: "Por transferencia internacional, contra un invoice comercial con el detalle del servicio. Si tu contador necesita el formulario de proveedor extranjero, se lo firmamos antes de la primera transferencia.",
          },
        ],
        seguridad: SEGURIDAD_ES,
      },
      en: {
        title: "Selling Miami preconstruction to Latin America",
        metaDescription:
          "52% of South Florida preconstruction buyers are foreign, and ~86% of those are Latin American. How to serve them in their language, on their clock.",
        eyebrow: "Miami preconstruction · the Latin American buyer",
        h1: "Your buyer decides in Spanish. Is your operation ready for that?",
        intro:
          "In South Florida preconstruction, more than half of purchases are made by foreign buyers, and the great majority of them are Latin American. They write in Spanish, from another country, on their own clock. This page is about what changes in your operation when that is your buyer — and what can be automated without losing the personal touch.",
        nombreCorto: "Preconstruction for Latin buyers",
        dolores: [
          {
            title: "Language is where trust is decided",
            body: "Spanish tends to be the language of the first contact and of the family decision. A team that is good in English and merely passable in Spanish loses at exactly the moment that weighs most.",
          },
          {
            title: "The time zone works against you",
            body: "Bogotá, Buenos Aires, Mexico City and São Paulo do not share your office hours. The question lands after you have closed.",
          },
          {
            title: "Buying from a distance is frightening",
            body: "Many buy without ever having visited. The doubts are not only about the project: they are about how to pay from abroad, whose name goes on the deed and what happens with taxes.",
          },
        ],
        comoAyuda: [
          {
            title: "Coverage in Spanish, at any hour",
            body: "The assistant replies in whatever language it is written in and at whatever hour, with the real information about your projects. And it remembers to say that your times are Miami time.",
          },
          {
            title: "The serious questions get handed over, not improvised",
            body: "Taxes, FIRPTA, buying through an LLC, financing terms or visa matters go to your team, your attorney or your accountant. The assistant says so plainly: a careless answer there costs your buyer real money.",
          },
          {
            title: "The follow-up lasts as long as the sale does",
            body: "Months or years pass between reservation and handover. The system holds that conversation: every payment milestone, every construction update, every lead that went quiet.",
          },
        ],
        stats: [
          { value: "52%", label: "of South Florida preconstruction purchases are by foreign buyers" },
          { value: "86%", label: "of those international buyers are Latin American" },
          { value: "7×", label: "more likely to qualify if you reply within the hour" },
          { value: "24/7", label: "coverage in their language and on their clock" },
        ],
        faqs: [
          {
            q: "Where are you based?",
            a: "We operate out of Mexico and work fully remote, in the same time band as Florida. We say so up front because it is part of why this works: we understand the Latin American buyer writing to you — how they ask and what worries them — better than a local agency that only works in English.",
          },
          {
            q: "Does the assistant handle English too?",
            a: "Yes, and Portuguese. It detects the language and replies in kind. Spanish is where it is most finely tuned, because that is where most of the demand comes from.",
          },
          {
            q: "Does it help if I sell finished units rather than preconstruction?",
            a: "Yes. The long follow-up matters less, but instant response and buyer qualification are just as useful. The assessment adjusts it to what you actually sell.",
          },
          {
            q: "How do we pay you if you are outside the United States?",
            a: "By international wire, against a commercial invoice itemizing the service. If your accountant needs the foreign-vendor form, we sign it before the first transfer.",
          },
        ],
        seguridad: SEGURIDAD_EN,
      },
    },
  },
];

/** Busca una solución por slug. Devuelve undefined si no existe (la página hace notFound). */
/**
 * Busca una solución por el slug del idioma pedido: en español por `slug`, en
 * inglés por `slugEn`.
 *
 * ⚠️ Es ESTRICTO a propósito. La tentación es aceptar cualquiera de los dos
 * slugs "por si acaso", y eso publicaría la misma página inglesa en dos
 * direcciones — que es exactamente el contenido duplicado que traducir las
 * direcciones venía a evitar. Las direcciones viejas se resuelven con una
 * redirección permanente (ver `redireccionesViejas()` en lib/rutas.ts), no
 * sirviendo la página dos veces.
 */
export function getSolucion(slug: string, idioma: Idioma = "es"): Solucion | undefined {
  return SOLUCIONES.find((s) => (idioma === "en" ? s.slugEn : s.slug) === slug);
}
