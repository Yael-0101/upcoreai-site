// ============================================================================
// MAPA DE KEYWORDS — la fuente de verdad de qué búsqueda ataca cada página.
//
// Es el plan editorial del blog y las soluciones, como dato y con guardián
// (scripts/probar-mapa-keywords.mjs, en el prebuild):
//   · toda keyword "publicado" apunta a una página que EXISTE;
//   · ninguna keyword se repite entre dos páginas vivas (anti-canibalización:
//     dos páginas atacando la misma búsqueda compiten entre sí y pierden las dos);
//   · todo artículo y toda solución tienen su keyword asignada — una página
//     sin búsqueda objetivo es una página que nadie va a encontrar.
//
// Cómo se usa: al escribir un artículo nuevo, primero se elige aquí una
// keyword "planeado" (o se agrega una que sugieran los datos de Search
// Console), se escribe el artículo atacándola, y se cambia a "publicado" con
// su path. El guardián exige que las dos cosas pasen juntas.
//
// "descartado" se conserva con su motivo: es la memoria de por qué NO vamos
// por esa búsqueda, para que nadie la vuelva a proponer desde cero.
// ============================================================================

export type IntencionKeyword = "informacional" | "comercial";

export type Keyword = {
  /** La búsqueda en español, tal como la teclearía el prospecto. */
  keywordEs: string;
  /** Su equivalente en inglés (la página inglesa ataca esta). */
  keywordEn: string;
  intencion: IntencionKeyword;
  /** 1 = corazón del nicho · 2 = importante · 3 = algún día */
  prioridad: 1 | 2 | 3;
  estado: "publicado" | "planeado" | "descartado";
  /** Ruta canónica española de la página que la ataca (obligatoria si publicado). */
  path?: string;
  /** Solo para descartadas: por qué no vamos por ella. */
  motivo?: string;
};

export const MAPA_KEYWORDS: Keyword[] = [
  // ── Publicadas: cada página viva con su búsqueda objetivo ────────────────
  {
    keywordEs: "automatización para inmobiliarias",
    keywordEn: "real estate automation",
    intencion: "comercial",
    prioridad: 1,
    estado: "publicado",
    path: "/soluciones/automatizacion-para-inmobiliarias",
  },
  {
    keywordEs: "chatbot de WhatsApp para inmobiliarias",
    keywordEn: "WhatsApp chatbot for real estate",
    intencion: "comercial",
    prioridad: 1,
    estado: "publicado",
    path: "/soluciones/chatbot-whatsapp-para-inmobiliarias",
  },
  {
    keywordEs: "asistente virtual para inmobiliarias",
    keywordEn: "virtual assistant for real estate",
    intencion: "comercial",
    prioridad: 1,
    estado: "publicado",
    path: "/soluciones/asistente-virtual-para-inmobiliarias",
  },
  {
    keywordEs: "agente de voz para inmobiliarias",
    keywordEn: "voice agent for real estate",
    intencion: "comercial",
    prioridad: 1,
    estado: "publicado",
    path: "/soluciones/agente-de-voz-para-inmobiliarias",
  },
  {
    keywordEs: "seguimiento de leads inmobiliarios",
    keywordEn: "real estate lead follow-up",
    intencion: "comercial",
    prioridad: 1,
    estado: "publicado",
    path: "/soluciones/seguimiento-de-leads-inmobiliarios",
  },
  {
    keywordEs: "vender preventa en Miami a compradores latinoamericanos",
    keywordEn: "selling Miami preconstruction to Latin American buyers",
    intencion: "comercial",
    prioridad: 1,
    estado: "publicado",
    path: "/soluciones/vender-preventa-en-miami-a-compradores-latinos",
  },
  {
    keywordEs: "por qué se pierden los prospectos inmobiliarios",
    keywordEn: "why real estate leads go cold",
    intencion: "informacional",
    prioridad: 2,
    estado: "publicado",
    path: "/blog/prospectos-que-se-enfrian-seguimiento-inmobiliario",
  },
  {
    keywordEs: "comprador latinoamericano de preventa en Miami",
    keywordEn: "Latin American buyer Miami preconstruction",
    intencion: "informacional",
    prioridad: 2,
    estado: "publicado",
    path: "/blog/comprador-latinoamericano-preventa-miami",
  },
  {
    keywordEs: "cuánto cuesta automatizar una inmobiliaria",
    keywordEn: "cost to automate a real estate firm",
    intencion: "informacional",
    prioridad: 1,
    estado: "publicado",
    path: "/blog/cuanto-cuesta-automatizar-atencion-inmobiliaria",
  },
  {
    keywordEs: "WhatsApp Business API para inmobiliarias",
    keywordEn: "WhatsApp Business API for real estate",
    intencion: "informacional",
    prioridad: 1,
    estado: "publicado",
    path: "/blog/whatsapp-business-api-inmobiliarias-guia",
  },
  {
    keywordEs: "llamadas perdidas en una inmobiliaria",
    keywordEn: "missed calls at a real estate firm",
    intencion: "informacional",
    prioridad: 2,
    estado: "publicado",
    path: "/blog/llamadas-perdidas-inmobiliaria-quien-contesta",
  },
  {
    keywordEs: "precios de automatización para inmobiliarias",
    keywordEn: "real estate automation pricing",
    intencion: "comercial",
    prioridad: 2,
    estado: "publicado",
    path: "/precios",
  },

  // ── Planeadas: el calendario editorial (2 artículos al mes) ──────────────
  {
    keywordEs: "responder leads inmobiliarios en menos de una hora",
    keywordEn: "speed to lead real estate",
    intencion: "informacional",
    prioridad: 1,
    estado: "planeado",
  },
  {
    keywordEs: "IA para desarrolladoras de condominios",
    keywordEn: "AI for condo developers",
    intencion: "comercial",
    prioridad: 1,
    estado: "planeado",
  },
  {
    keywordEs: "chatbot para ventas de preconstrucción",
    keywordEn: "chatbot for preconstruction sales",
    intencion: "comercial",
    prioridad: 1,
    estado: "planeado",
  },
  {
    keywordEs: "agente de IA que atiende en español",
    keywordEn: "Spanish-speaking AI agent for real estate",
    intencion: "comercial",
    prioridad: 1,
    estado: "planeado",
  },
  {
    keywordEs: "cómo vender preconstrucción a distancia",
    keywordEn: "selling preconstruction remotely",
    intencion: "informacional",
    prioridad: 2,
    estado: "planeado",
  },
  {
    keywordEs: "recuperar leads fríos de una inmobiliaria",
    keywordEn: "re-engage cold real estate leads",
    intencion: "informacional",
    prioridad: 2,
    estado: "planeado",
  },
  {
    keywordEs: "calificar leads inmobiliarios automáticamente",
    keywordEn: "automatically qualify real estate leads",
    intencion: "informacional",
    prioridad: 2,
    estado: "planeado",
  },
  {
    keywordEs: "atención 24/7 para una inmobiliaria",
    keywordEn: "24/7 lead response for real estate",
    intencion: "informacional",
    prioridad: 2,
    estado: "planeado",
  },
  {
    keywordEs: "cuánto cuesta un asistente virtual inmobiliario",
    keywordEn: "real estate virtual assistant cost",
    intencion: "informacional",
    prioridad: 2,
    estado: "planeado",
  },
  {
    keywordEs: "automatizar el seguimiento de compradores extranjeros",
    keywordEn: "following up with foreign buyers",
    intencion: "informacional",
    prioridad: 2,
    estado: "planeado",
  },
  {
    keywordEs: "CRM para preventa inmobiliaria",
    keywordEn: "preconstruction CRM",
    intencion: "informacional",
    prioridad: 3,
    estado: "planeado",
  },
  {
    keywordEs: "embudo de ventas de una preventa",
    keywordEn: "preconstruction sales funnel",
    intencion: "informacional",
    prioridad: 3,
    estado: "planeado",
  },

  // ── Descartadas: la memoria de por qué NO ────────────────────────────────
  {
    keywordEs: "marketing para preventa en Miami",
    keywordEn: "Miami preconstruction marketing",
    intencion: "comercial",
    prioridad: 3,
    estado: "descartado",
    motivo:
      "Upcore no vende marketing ni anuncios: atraer tráfico de esa búsqueda traería prospectos que piden lo que no hacemos.",
  },
  {
    keywordEs: "precios de condominios en preventa en Miami",
    keywordEn: "Miami preconstruction condo prices",
    intencion: "informacional",
    prioridad: 3,
    estado: "descartado",
    motivo:
      "Línea roja del nicho: precios y disponibilidad de inmuebles caducan solos y no los afirmamos en ningún texto.",
  },
];
