// ============================================================================
// CONTENIDO DEL SITIO — Upcore AI (clínicas)
// Todo el texto vive aquí para editarlo fácil. Cambia lo que quieras.
// ============================================================================

export const CONTACT = {
  // OJO: en México WhatsApp a veces necesita "521" en vez de "52". Probar el botón.
  whatsapp: "https://wa.me/523541172800?text=" +
    encodeURIComponent("Hola Upcore AI, quiero automatizar mi clínica. ¿Me ayudan?"),
  whatsappDisplay: "+52 354 117 2800",
  calendly: "https://calendly.com/upcoreai",
};

export const HERO = {
  eyebrow: "Automatización con IA para clínicas",
  title1: "Tu clínica llena.",
  title2: "Sin mover un dedo.",
  subtitle:
    "Automatización con IA que confirma tus citas, responde WhatsApp al instante y recupera a tus pacientes — 24/7, sin contratar a nadie.",
  ctaPrimary: "Agenda tu diagnóstico gratis",
  ctaSecondary: "Calcula cuánto puedes recuperar",
};

export const PROBLEMAS = {
  heading: "¿Te suena familiar?",
  sub: "Los huecos que le cuestan dinero a tu clínica cada semana.",
  items: [
    {
      icon: "IconCalendar",
      title: "Pacientes que no llegan",
      body: "Cada cita perdida es dinero que no entra y un hueco en tu agenda que ya no recuperas.",
    },
    {
      icon: "IconChat",
      title: "WhatsApp que no alcanzas a responder",
      body: "Mensajes a las 9 pm, domingos y festivos… y ahí se te va un paciente a otra clínica.",
    },
    {
      icon: "IconClock",
      title: "Recepción saturada",
      body: "Tu equipo pasa horas confirmando citas y respondiendo lo mismo una y otra vez.",
    },
    {
      icon: "IconRefresh",
      title: "Agenda con huecos",
      body: "Pacientes que no volvieron y espacios vacíos que podrías llenar sin gastar en publicidad.",
    },
  ],
};

export const PASOS = {
  heading: "Cómo funciona",
  sub: "En 3 pasos, sin que tú tengas que aprender nada técnico.",
  items: [
    {
      n: "01",
      title: "Diagnóstico gratis",
      body: "Analizamos tu clínica y te decimos exactamente qué automatizar y cuánto puedes recuperar.",
    },
    {
      n: "02",
      title: "Lo construimos por ti",
      body: "Montamos tu agente de IA en tu WhatsApp y tus sistemas. Tú no mueves un dedo.",
    },
    {
      n: "03",
      title: "Tu clínica funciona sola",
      body: "Confirma citas, responde 24/7 y llena tu agenda. Tú solo atiendes pacientes.",
    },
  ],
};

export const SISTEMA = {
  heading: "Construimos sistemas, no piezas sueltas",
  sub: "Más que automatizaciones sueltas: construimos la infraestructura completa —el sistema— que atiende, trabaja y te muestra todo en un solo lugar, hecha a la medida de tu clínica.",
  dashboard: {
    tag: "El centro de todo",
    title: "Dashboard inteligente",
    body: "Un panel simple donde ves todo en tiempo real y ajustas lo esencial tú mismo — sin depender de nadie y sin tocar nada que pueda romper el sistema.",
    views: [
      "Tus automatizaciones",
      "Pacientes",
      "Pendientes",
      "A quién llamar",
      "Gastos de tu agente",
      "Tu ROI",
    ],
    ajustesTitle: "Y ajustas lo esencial tú mismo:",
    ajustes: [
      "Cómo responde tu agente (su tono y qué dice)",
      "Tus mensajes y recordatorios",
      "Tus horarios de atención",
      "Los precios y servicios que menciona",
      "Activar o pausar cuando quieras",
    ],
  },
  items: [
    {
      icon: "IconChat",
      title: "Agentes de IA",
      body: "Atienden WhatsApp, agendan, confirman y califican pacientes las 24 horas.",
    },
    {
      icon: "IconRefresh",
      title: "Automatizaciones",
      body: "Recordatorios, seguimientos y flujos que trabajan solos y conectan tus herramientas.",
    },
    {
      icon: "IconData",
      title: "Base de conocimiento con IA",
      body: "Tu agente responde con la información real de tu clínica: precios, servicios e indicaciones.",
    },
    {
      icon: "IconSparkle",
      title: "Sitios web inteligentes",
      body: "Webs que agendan, responden y venden solas, con la automatización ya integrada.",
    },
    {
      icon: "IconChip",
      title: "Sistema a la medida",
      body: "Unimos todo en una sola infraestructura que opera tu clínica de punta a punta.",
    },
  ],
};

export const RESULTADOS = {
  heading: "Lo que puedes esperar",
  sub: "Estimaciones del sector para clínicas que automatizan. Varían según el producto que elijas (un agente, una automatización o un sitio web) y según tu clínica.",
  stats: [
    { value: "−80%", label: "en no-shows" },
    { value: "+30–40", label: "pacientes al mes" },
    { value: "15–20 h", label: "recuperadas por semana" },
    { value: "24/7", label: "atención sin descanso" },
  ],
  disclaimer:
    "* Cifras estimadas del sector, no una garantía de resultados individuales. Cambian según el producto (agente, automatización o sitio web) y tu clínica. Tu estimación personalizada sale de la calculadora de arriba y de tu diagnóstico gratis.",
};

export const GARANTIA = {
  heading: "Garantía de resultados",
  body: "En 30 días ves mejora en tus no-shows y tu agenda, o seguimos trabajando sin costo hasta lograrlo.",
  note: "Sin letra chica.",
};

export const PLANES = {
  heading: "Dos formas de trabajar juntos",
  sub: "La diferencia es una sola: ¿quieres operarlo tú, o que nosotros lo operemos y mantengamos por ti? Todo lo demás es igual, y todo queda a tu nombre.",
  items: [
    {
      name: "Llave en Mano",
      tagline: "Tú lo operas.",
      pago: "Pago único",
      desc: "Lo construimos y te lo entregamos con capacitación y video. De ahí en adelante lo manejas tú (o tu equipo).",
      incluye: ["Construcción completa", "Capacitación + guía", "Sin mensualidad"],
      destacado: false,
    },
    {
      name: "Gestionado",
      tagline: "Nosotros lo operamos.",
      pago: "Mensualidad (con o sin inversión inicial)",
      desc: "Lo construimos y nosotros lo operamos, mantenemos y mejoramos por ti — para siempre. Tú no te preocupas de nada.",
      incluye: [
        "Todo lo de Llave en Mano",
        "Operación y mantenimiento",
        "Mejoras y soporte prioritario",
      ],
      destacado: true,
    },
  ],
  nota: "En ambos planes, todo es tuyo: tus cuentas, tu servidor, tus APIs y tokens quedan a tu nombre. ¿Cuentas nuevas o las que ya tienes? ¿Las creas tú o las creamos nosotros? Como prefieras — siempre con tus datos seguros.",
  precioNota: "Precio personalizado según tu clínica",
  cta: "Agenda tu diagnóstico",
};

export const FAQ = {
  heading: "Preguntas frecuentes",
  items: [
    {
      q: "¿Es seguro con los datos de mis pacientes?",
      a: "Sí. Tus datos y los de tus pacientes viajan cifrados y viven aislados en tus propias cuentas. Nunca se comparten ni se mezclan con nadie.",
    },
    {
      q: "¿Necesito saber de tecnología?",
      a: "No. Nosotros lo montamos y, si eliges, lo operamos por ti. Tú solo atiendes tu clínica.",
    },
    {
      q: "¿Cuánto tarda en estar funcionando?",
      a: "La mayoría de las clínicas quedan operando en 1 a 2 semanas.",
    },
    {
      q: "¿Y si no funciona?",
      a: "Tienes garantía: en 30 días ves mejora o seguimos trabajando sin costo hasta lograrlo.",
    },
    {
      q: "¿Reemplaza a mi recepcionista?",
      a: "No. La libera de lo repetitivo para que dedique su tiempo a atender mejor a tus pacientes.",
    },
    {
      q: "¿Funciona con mi WhatsApp actual?",
      a: "Sí, usamos la API oficial de WhatsApp Business, así que todo queda bajo tu control.",
    },
    {
      q: "¿Cuánto cuesta?",
      a: "Depende de tu clínica y de lo que necesites. Lo calculamos en tu diagnóstico gratis, o usa la calculadora de arriba para un estimado al instante.",
    },
  ],
};

export const SOBRE = {
  heading: "Quién está detrás",
  body:
    "Upcore AI es un equipo completo y profesional de automatización con inteligencia artificial. Nos especializamos en clínicas privadas de salud y estética: conocemos tus retos y construimos soluciones hechas a tu medida.",
  badges: [
    { icon: "IconLock", label: "Datos cifrados" },
    { icon: "IconShield", label: "Aislados en tus cuentas" },
    { icon: "IconChat", label: "API oficial de WhatsApp" },
  ],
};

export const CTA_FINAL = {
  heading: "¿Listo para llenar tu agenda?",
  sub: "Agenda tu diagnóstico gratis. Te decimos exactamente qué automatizar y cuánto puedes recuperar — sin compromiso.",
  ctaCalendly: "Agendar por videollamada",
  ctaEmpezar: "Empezar sin llamada",
  ctaWhatsapp: "Escríbenos por WhatsApp",
};
