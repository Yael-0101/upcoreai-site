// ============================================================================
// FORMULARIO DE DIAGNÓSTICO (/empezar) — español e inglés.
//
// ⚠️ LO QUE SE GUARDA NO SE TRADUCE. Cada opción tiene un `val` (que viaja al
// webhook) y una etiqueta (que se ve). Los `val` son idénticos en los dos idiomas
// — si cambiaran, el cliente elegiría una cosa en inglés y se guardaría otra.
//
// ⚠️ Y LO QUE LE LLEGA A YAEL VA EN ESPAÑOL. El payload que se manda a n8n usa
// SIEMPRE las etiquetas españolas, aunque el prospecto haya llenado el formulario
// en inglés: el panel lo lee una persona que trabaja en español, y una ficha mitad
// en un idioma y mitad en otro es más difícil de leer que una traducida entera.
// Aquí se traduce la PANTALLA, no el dato.
// ============================================================================

import type { Idioma } from "./idioma";

/** Etiqueta por `val`. La lista de opciones y su orden viven en el componente. */
export type Etiquetas = Record<string, string>;

export type TextosEmpezar = {
  h1: string;
  subA: string;
  subFuerte: string;
  subB: string;
  paso: (n: number, total: number) => string;
  siguiente: string;
  atras: string;
  enviar: string;
  enviando: string;

  q1: string;
  hint1: string;
  campoNombreFirma: string;
  ejemploNombreFirma: string;
  bloqueTipo: string;
  bloqueTamano: string;

  q2: string;
  hint2: string;
  bloqueProspectos: string;
  bloquePerdidos: string;
  hintPerdidos: string;
  bloqueTicket: string;
  hintTicket: string;
  bloqueCanales: string;
  hintVarias: string;

  q3: string;
  hint3: string;
  sinPreferencia: string;
  sinPreferenciaTexto: string;

  q4: string;
  hint4: string;
  bloqueAgenda: string;
  hintAgenda: string;
  campoSoftware: string;
  ejemploSoftware: string;
  // 🔴 Dónde vive su lista de desarrollos. Sin este dato no se puede cotizar la
  // pieza que evita el peor escenario del producto: que el asistente siga ofreciendo
  // una torre agotada. Y hasta el 2026-08-24 el diagnóstico no lo preguntaba, aunque
  // /precios anuncia "Tus integraciones" como uno de los cuatro factores del precio.
  bloqueInventario: string;
  hintInventario: string;
  campoCrm: string;
  ejemploCrm: string;
  bloqueDolores: string;
  campoMensaje: string;
  ejemploMensaje: string;

  q5: string;
  hint5: string;
  bloqueObjetivo: string;
  hintObjetivo: string;
  bloqueUrgencia: string;
  bloquePapel: string;

  q6: string;
  hint6: string;
  campoNombre: string;
  ejemploNombre: string;
  campoContacto: string;
  ejemploContacto: string;
  campoCorreo: string;
  ejemploCorreo: string;
  bloqueHorario: string;
  hintHorario: string;
  aceptoA: string;
  aceptoEnlace: string;
  aceptoB: string;
  errorEnvio: string;

  listoTitulo: (nombre: string) => string;
  graciasTitulo: (nombre: string) => string;
  listoTexto: string;
  listoTextoCorreo: string;
  verDiagnostico: string;
  dudasA: string;
  dudasEnlace: string;
  dudasB: string;
  graciasTexto: string;
  graciasCta: string;

  /** Etiquetas de cada catálogo, por `val`. */
  tamano: Etiquetas;
  prospectos: Etiquetas;
  canales: Etiquetas;
  agenda: Etiquetas;
  inventario: Etiquetas;
  dolores: Etiquetas;
  urgencia: Etiquetas;
  papel: Etiquetas;
  horario: Etiquetas;
  citasPerdidas: Etiquetas;
  ticket: Etiquetas;
  objetivo: Etiquetas;
  /** Las preguntas por producto: el enunciado y las etiquetas de sus opciones. */
  porProducto: Record<string, { q: string; opciones: Etiquetas }>;
};

// ────────────────────────────────────────────────────────────────────────────
const ES: TextosEmpezar = {
  h1: "Empieza sin llamada",
  subA: "Cuéntanos de tu inmobiliaria en 3 minutos — puro toque de botón. Al terminar, tu diagnóstico aparece ",
  subFuerte: "al instante",
  subB: ", con los números de tu firma.",
  paso: (n, total) => `Paso ${n} de ${total}`,
  siguiente: "Siguiente →",
  atras: "← Atrás",
  enviar: "Enviar →",
  enviando: "Enviando…",

  q1: "Cuéntanos de tu inmobiliaria",
  hint1: "Así sabemos con quién estamos hablando",
  campoNombreFirma: "Nombre de tu inmobiliaria",
  ejemploNombreFirma: "Ej: Brickell Preventa Realty",
  bloqueTipo: "¿Qué tipo de firma es?",
  bloqueTamano: "¿Qué tan grande es el equipo?",

  q2: "El movimiento de tu operación",
  hint2: "Cifras aproximadas — con eso calculamos tu potencial",
  bloqueProspectos: "¿Cuántos prospectos nuevos les llegan por semana, más o menos?",
  bloquePerdidos: "¿Cuántos prospectos se enfrían o no vuelven, por semana?",
  hintPerdidos: "Con esto calculamos cuánto se está yendo — es la pregunta que más vale",
  bloqueTicket: "¿Cuánto te deja una venta promedio?",
  hintTicket: "Aproximado en dólares — la comisión que te deja una venta típica",
  bloqueCanales: "¿De dónde llegan tus prospectos hoy?",
  hintVarias: "Puedes elegir varias",

  q3: "¿Qué necesitas?",
  hint3: "Elige una o varias — o pídenos que te recomendemos",
  sinPreferencia: "🤔 No estoy seguro — recomiéndenme lo mejor",
  sinPreferenciaTexto: "Sin preferencia — que le recomienden",

  q4: "Cuéntanos tu situación",
  hint4: "Toca al menos una opción en cada pregunta — de aquí sale tu diagnóstico",
  bloqueAgenda: "¿Cómo manejan hoy las visitas y el seguimiento?",
  hintAgenda: "Elige todas las que usen — casi nadie usa una sola",
  campoSoftware: "¿Cuál software o sistema? (opcional)",
  ejemploSoftware: "Ej: Follow Up Boss, kvCORE, una hoja de cálculo…",
  bloqueInventario: "¿Dónde vive hoy tu lista de desarrollos y su estado?",
  hintInventario: "Nos dice a qué conectarnos para que el asistente no ofrezca lo que ya se agotó",
  campoCrm: "¿Cuál CRM? (opcional)",
  ejemploCrm: "Ej: Follow Up Boss, kvCORE, HubSpot…",
  bloqueDolores: "¿Qué es lo que más te duele hoy?",
  campoMensaje: "¿Algo más que quieras contarnos? (opcional)",
  ejemploMensaje: "Ej: Somos 3 asesores, vendemos preventa en Brickell y Edgewater…",

  q5: "Para cerrar",
  hint5: "Tres toques y pasamos a tus datos",
  bloqueObjetivo: "Si esto funciona, ¿qué es lo que más quieres lograr?",
  hintObjetivo: "Define hacia dónde apuntamos tu diagnóstico",
  bloqueUrgencia: "¿Qué tan pronto te gustaría empezar?",
  bloquePapel: "¿Cuál es tu papel en la firma?",

  q6: "Tus datos de contacto",
  hint6: "Te escribimos por WhatsApp — sin llamadas",
  campoNombre: "Tu nombre",
  ejemploNombre: "Ej: Ana Martínez",
  campoContacto: "WhatsApp o teléfono",
  ejemploContacto: "Ej: +1 305 123 4567",
  campoCorreo: "Correo (opcional)",
  ejemploCorreo: "tu@inmobiliaria.com",
  bloqueHorario: "¿Cuándo prefieres que te escribamos?",
  hintHorario: "Opcional — para no escribirte a deshoras",
  aceptoA: "Acepto que Upcore AI me contacte por WhatsApp y trate mis datos según su ",
  aceptoEnlace: "Política de Privacidad",
  aceptoB: ".",
  errorEnvio: "No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.",

  listoTitulo: (n) => `¡Listo, ${n}! Tu diagnóstico ya existe`,
  graciasTitulo: (n) => `¡Gracias, ${n}!`,
  listoTexto:
    "Lo calculamos con tus números en este momento: qué se te está escapando, cuánto vale y cómo lo arreglamos.",
  listoTextoCorreo: "También te lo mandamos por correo.",
  verDiagnostico: "Ver mi diagnóstico ahora →",
  dudasA: "¿Dudas? Escríbenos por ",
  dudasEnlace: "WhatsApp",
  dudasB: " — te contesta nuestro asistente al momento, a cualquier hora.",
  graciasTexto:
    "Ya tenemos tu información. Te contactamos pronto por WhatsApp con tu diagnóstico — sin compromiso.",
  graciasCta: "Escríbenos ahora por WhatsApp",

  tamano: {
    solo: "Solo yo",
    "2-5": "2 a 5 personas",
    "6-15": "6 a 15 personas",
    "15+": "Más de 15 o varias oficinas",
  },
  prospectos: {
    "<20": "Menos de 20",
    "20-50": "20 a 50",
    "50-150": "50 a 150",
    "150+": "Más de 150",
    nose: "No lo sé",
  },
  canales: {
    recomendacion: "Recomendación",
    redes: "Redes sociales",
    google: "Google",
    anuncios: "Anuncios pagados",
    nose: "No lo sé",
  },
  agenda: {
    whatsapp: "WhatsApp a mano",
    telefono: "Teléfono",
    software: "Un software o sistema",
    papel: "Papel o Excel",
  },
  inventario: {
    crm: "En un CRM",
    hoja: "En un Excel o Google Sheets",
    desarrollador: "Nos la manda el desarrollador",
    cabeza: "No hay lista fija — la trae el equipo en la cabeza",
  },
  dolores: {
    noshows: "Prospectos que se enfrían sin seguimiento",
    whatsapp: "WhatsApp sin responder",
    llamadas: "Llamadas que nadie alcanza a contestar",
    equipo: "El equipo comercial saturado",
    huecos: "Prospectos viejos que nunca se volvieron a tocar",
    nuevos: "Atraer más compradores nuevos",
  },
  urgencia: {
    ya: "Lo antes posible",
    mes: "Este mes",
    "1-3m": "En 1 a 3 meses",
    explorando: "Solo estoy explorando",
  },
  papel: {
    dueno: "Soy el dueño/a",
    asesor: "Soy asesor(a) de ventas",
    admin: "Administración / operaciones",
    otro: "Otro",
  },
  horario: {
    manana: "Por la mañana",
    tarde: "Por la tarde",
    noche: "Por la noche",
    cualquiera: "Cualquier hora",
  },
  citasPerdidas: {
    "0": "Casi ninguna",
    "1-2": "1 – 2 por semana",
    "3-5": "3 – 5 por semana",
    "6-10": "6 – 10 o más",
    nose: "No lo medimos",
  },
  ticket: {
    "5000-10000": "$5,000 – $10,000",
    "10000-20000": "$10,000 – $20,000",
    "20000-40000": "$20,000 – $40,000",
    "40000-80000": "Más de $40,000",
    nose: "Varía mucho / no sé",
  },
  objetivo: {
    "llenar-agenda": "Llenar mi agenda",
    "no-perder-citas": "Dejar de perder prospectos",
    "recuperar-pacientes": "Reactivar prospectos viejos",
    imagen: "Verse más profesional",
  },
  porProducto: {
    agente: {
      q: "¿Cuándo se les quedan más mensajes sin contestar?",
      opciones: {
        fuera: "Fuera de horario",
        findes: "Fines de semana",
        siempre: "A toda hora, no damos abasto",
        nose: "No sé, solo sé que se pierden",
      },
    },
    voz: {
      q: "¿Cuántas llamadas dirías que se quedan sin contestar al día?",
      opciones: {
        "1-3": "1 – 3",
        "4-10": "4 – 10",
        "10+": "Más de 10",
        nose: "No lo medimos (no queda registro)",
      },
    },
    web: {
      q: "¿Tienes sitio web hoy?",
      opciones: {
        no: "No tengo",
        viejo: "Tengo, pero viejo o sin agenda",
        si: "Tengo y funciona, quiero algo mejor",
      },
    },
    auto: {
      q: "¿Cuántos prospectos a la semana se enfrían por falta de seguimiento?",
      opciones: {
        "1-2": "1 – 2",
        "3-5": "3 – 5",
        "5+": "Más de 5",
        nose: "No lo medimos",
      },
    },
    reactivacion: {
      q: "¿Dónde guardan los prospectos que nunca cerraron?",
      opciones: {
        software: "En un software",
        excel: "Excel o papel",
        no: "No tenemos registro ordenado",
      },
    },
  },
};

// ────────────────────────────────────────────────────────────────────────────
const EN: TextosEmpezar = {
  h1: "Start without a call",
  subA: "Tell us about your firm in 3 minutes — just tapping buttons. When you finish, your assessment appears ",
  subFuerte: "right away",
  subB: ", using your firm's numbers.",
  paso: (n, total) => `Step ${n} of ${total}`,
  siguiente: "Next →",
  atras: "← Back",
  enviar: "Send →",
  enviando: "Sending…",

  q1: "Tell us about your firm",
  hint1: "So we know who we are talking to",
  campoNombreFirma: "Your firm's name",
  ejemploNombreFirma: "e.g. Brickell Preventa Realty",
  bloqueTipo: "What kind of firm is it?",
  bloqueTamano: "How big is the team?",

  q2: "How your operation moves",
  hint2: "Rough figures — that is enough for us to work out your potential",
  bloqueProspectos: "Roughly how many new leads come in per week?",
  bloquePerdidos: "How many leads go cold or never come back, per week?",
  hintPerdidos: "This is how we work out what is slipping away — the most valuable question here",
  bloqueTicket: "What does an average sale leave you?",
  hintTicket: "Approximate, in dollars — the commission a typical sale leaves you",
  bloqueCanales: "Where do your leads come from today?",
  hintVarias: "You can pick several",

  q3: "What do you need?",
  hint3: "Choose one or several — or ask us to recommend",
  sinPreferencia: "🤔 I am not sure — recommend what is best",
  sinPreferenciaTexto: "Sin preferencia — que le recomienden",

  q4: "Tell us about your situation",
  hint4: "Tap at least one option in each question — this is what your assessment comes from",
  bloqueAgenda: "How do you handle appointments and follow-up today?",
  hintAgenda: "Pick all the ones you use — almost nobody uses just one",
  campoSoftware: "Which software or system? (optional)",
  ejemploSoftware: "e.g. Follow Up Boss, kvCORE, a spreadsheet…",
  bloqueInventario: "Where does your list of developments and their status live today?",
  hintInventario: "It tells us what to connect to, so the assistant never offers what is already sold out",
  campoCrm: "Which CRM? (optional)",
  ejemploCrm: "e.g. Follow Up Boss, kvCORE, HubSpot…",
  bloqueDolores: "What hurts most right now?",
  campoMensaje: "Anything else you want to tell us? (optional)",
  ejemploMensaje: "e.g. We are 3 agents, we sell preconstruction in Brickell and Edgewater…",

  q5: "To wrap up",
  hint5: "Three taps and we move on to your details",
  bloqueObjetivo: "If this works, what do you most want to achieve?",
  hintObjetivo: "It sets what your assessment aims at",
  bloqueUrgencia: "How soon would you like to start?",
  bloquePapel: "What is your role at the firm?",

  q6: "Your contact details",
  hint6: "We write to you on WhatsApp — no calls",
  campoNombre: "Your name",
  ejemploNombre: "e.g. Ana Martínez",
  campoContacto: "WhatsApp or phone",
  ejemploContacto: "e.g. +1 305 123 4567",
  campoCorreo: "Email (optional)",
  ejemploCorreo: "you@yourfirm.com",
  bloqueHorario: "When would you rather we write to you?",
  hintHorario: "Optional — so we do not write at an awkward hour",
  aceptoA: "I agree that Upcore AI may contact me on WhatsApp and handle my data under its ",
  aceptoEnlace: "Privacy Policy",
  aceptoB: ".",
  errorEnvio: "We could not send your request. Try again or write to us on WhatsApp.",

  listoTitulo: (n) => `Done, ${n}! Your assessment already exists`,
  graciasTitulo: (n) => `Thank you, ${n}!`,
  listoTexto:
    "We worked it out with your numbers just now: what is slipping away, what it is worth and how we fix it.",
  listoTextoCorreo: "We also sent it to you by email.",
  verDiagnostico: "See my assessment now →",
  dudasA: "Questions? Write to us on ",
  dudasEnlace: "WhatsApp",
  dudasB: " — our assistant replies right away, at any hour.",
  graciasTexto:
    "We have your information. We will contact you soon on WhatsApp with your assessment — no commitment.",
  graciasCta: "Write to us on WhatsApp now",

  tamano: {
    solo: "Just me",
    "2-5": "2 to 5 people",
    "6-15": "6 to 15 people",
    "15+": "More than 15, or several offices",
  },
  prospectos: {
    "<20": "Fewer than 20",
    "20-50": "20 to 50",
    "50-150": "50 to 150",
    "150+": "More than 150",
    nose: "I do not know",
  },
  canales: {
    recomendacion: "Referral",
    redes: "Social media",
    google: "Google",
    anuncios: "Paid ads",
    nose: "I do not know",
  },
  agenda: {
    whatsapp: "WhatsApp, by hand",
    telefono: "Phone",
    software: "Some software or system",
    papel: "Paper or Excel",
  },
  inventario: {
    crm: "In a CRM",
    hoja: "In Excel or Google Sheets",
    desarrollador: "The developer sends it to us",
    cabeza: "No fixed list — the team keeps it in their heads",
  },
  dolores: {
    noshows: "Leads that go cold without follow-up",
    whatsapp: "WhatsApp left unanswered",
    llamadas: "Calls nobody gets to answer",
    equipo: "The sales team is swamped",
    huecos: "Old leads nobody ever went back to",
    nuevos: "Attracting more new buyers",
  },
  urgencia: {
    ya: "As soon as possible",
    mes: "This month",
    "1-3m": "In 1 to 3 months",
    explorando: "Just exploring",
  },
  papel: {
    dueno: "I am the owner",
    asesor: "I am a sales agent",
    admin: "Administration / operations",
    otro: "Other",
  },
  horario: {
    manana: "In the morning",
    tarde: "In the afternoon",
    noche: "In the evening",
    cualquiera: "Any time",
  },
  citasPerdidas: {
    "0": "Almost none",
    "1-2": "1 – 2 per week",
    "3-5": "3 – 5 per week",
    "6-10": "6 – 10 or more",
    nose: "We do not measure it",
  },
  ticket: {
    "5000-10000": "$5,000 – $10,000",
    "10000-20000": "$10,000 – $20,000",
    "20000-40000": "$20,000 – $40,000",
    "40000-80000": "More than $40,000",
    nose: "It varies a lot / I do not know",
  },
  objetivo: {
    "llenar-agenda": "Fill my calendar",
    "no-perder-citas": "Stop losing leads",
    "recuperar-pacientes": "Re-engage old leads",
    imagen: "Look more professional",
  },
  porProducto: {
    agente: {
      q: "When do most messages go unanswered?",
      opciones: {
        fuera: "Outside business hours",
        findes: "Weekends",
        siempre: "All the time, we cannot keep up",
        nose: "I do not know, I just know we lose them",
      },
    },
    voz: {
      q: "How many calls would you say go unanswered per day?",
      opciones: {
        "1-3": "1 – 3",
        "4-10": "4 – 10",
        "10+": "More than 10",
        nose: "We do not measure it (nothing gets logged)",
      },
    },
    web: {
      q: "Do you have a website today?",
      opciones: {
        no: "I do not have one",
        viejo: "I have one, but it is old or has no booking",
        si: "I have one and it works, I want something better",
      },
    },
    auto: {
      q: "How many leads a week go cold for lack of follow-up?",
      opciones: {
        "1-2": "1 – 2",
        "3-5": "3 – 5",
        "5+": "More than 5",
        nose: "We do not measure it",
      },
    },
    reactivacion: {
      q: "Where do you keep the leads that never closed?",
      opciones: {
        software: "In a software tool",
        excel: "Excel or paper",
        no: "We have no organized record",
      },
    },
  },
};

export const TE: Record<Idioma, TextosEmpezar> = { es: ES, en: EN };

export const empezar = (idioma: Idioma): TextosEmpezar => TE[idioma];

/** La etiqueta de una opción en el idioma de la pantalla, con el español como
 *  respaldo si a alguien se le olvidó traducir una clave nueva. */
export const etiqueta = (mapa: Etiquetas, respaldo: Etiquetas, val: string) =>
  mapa[val] ?? respaldo[val] ?? val;
