// ============================================================================
// TEXTOS PROPIOS DE CADA PÁGINA — español e inglés.
//
// `site-textos.ts` tiene lo del home y lo compartido (menú, pie, modal). Aquí va lo
// que solo existe en una página: /precios, /nosotros, /blog, /demo y los armazones
// de las páginas de solución y de artículo.
//
// ⚠️ ESTA ES LA CAPA QUE SIEMPRE SE OLVIDA. Al traducir la propuesta y el Portal de
// Arranque se tradujo el copy y el componente, y quedó en español lo que vivía en la
// PÁGINA que los envuelve (encabezados de sección, pies, medias frases partidas por
// un <strong>). Por eso aquí no queda ni un texto suelto dentro de un .tsx.
// ============================================================================

import type { Idioma } from "./idioma";

export type TextosPaginas = {
  precios: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    h1: string;
    /** La entradilla va partida porque lleva una negrita en medio. */
    introA: string;
    introFuerte: string;
    introB: string;
    ctaPrimario: string;
    ctaSecundario: string;
    factoresTitulo: string;
    factoresSub: string;
    factores: { n: string; title: string; body: string }[];
    claridadesTitulo: string;
    claridadesSub: string;
    claridades: { title: string; body: string }[];
    faqTitulo: string;
    faqs: { q: string; a: string }[];
    migaInicio: string;
    migaAqui: string;
  };
  nosotros: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    h1: string;
    intro: string;
    principiosTitulo: string;
    principiosSub: string;
    principios: { title: string; body: string }[];
    queTitulo: string;
    queSub: string;
    contactoTitulo: string;
    contactoSub: string;
    whatsapp: string;
    correo: string;
    correoPie: string;
    correoAsunto: string;
    jsonLdNombre: string;
    migaInicio: string;
    migaAqui: string;
  };
  blog: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    h1: string;
    intro: string;
    leer: string;
    migaInicio: string;
    migaAqui: string;
    volver: string;
    publicado: string;
    actualizado: string;
    tambien: string;
    sigueLeyendo: string;
  };
  solucion: {
    ctaVoz: string;
    ctaDemo: string;
    ctaDiagnostico: string;
    doloresTitulo: string;
    comoTitulo: string;
    comoSub: string;
    pasosTitulo: string;
    pasosSub: string;
    integracionesTitulo: string;
    integracionesSub: string;
    seguridadTitulo: string;
    faqTitulo: string;
    tambien: string;
    guias: string;
    migaInicio: string;
  };
  demo: {
    metaTitle: string;
    metaDescription: string;
    etiqueta: string;
    h1: string;
    intro: string;
    bullets: { titulo: string; texto: string }[];
    cierre: string;
    cta: string;
  };
  calculadora: {
    h2: string;
    sub: string;
    ultimoPaso: string;
    paso: (n: number, total: number) => string;
    siguiente: string;
    atras: string;
    verEstimado: string;
    q1: string;
    hint1: string;
    q2: string;
    hint2: string;
    q3: string;
    hint3: string;
    q4: string;
    hint4: string;
    q5: string;
    hint5: string;
    campoMensajes: string;
    ejemploMensajes: string;
    campoLeads: string;
    ejemploLeads: string;
    qEmail: string;
    hintEmail: string;
    placeholderEmail: string;
    omitir: string;
    tuEstimacion: string;
    basadoEn: string;
    inversion: string;
    costosTuyos: string;
    mensualidadUpcore: string;
    ahorro: string;
    retorno: string;
    consejo: string;
    construiriamos: string;
    notaFinal: string;
    cta: string;
    calcularOtra: string;
  };
  demoVoz: {
    titulo: string;
    intro: string;
    enLlamada: string;
    hablaNormal: string;
    terminada: string;
    colgar: string;
    conectando: string;
    otraVez: string;
    llamar: string;
    limite: string;
    errorInicio: string;
    errorCorte: string;
    errorMicro: string;
  };
  demoChat: {
    descanso: string;
    agendada: string;
    placeholder: string;
    placeholderFin: string;
    aria: string;
    quieroEsto: string;
    enLinea: string;
    demoFicticia: string;
    asistenteDe: (n: string) => string;
    enviar: string;
  };
};

// ────────────────────────────────────────────────────────────────────────────
const ES: TextosPaginas = {
  precios: {
    metaTitle: "Precios: así se calcula tu inversión, sin letra chica",
    metaDescription:
      "Sin precios escondidos ni módulos sorpresa: qué define tu inversión, qué incluye cada pieza, y tu precio exacto sale gratis en 3 minutos con el diagnóstico.",
    eyebrow: "Precios claros",
    h1: "Sin precios escondidos. Sin letra chica.",
    introA:
      "Otros te piden “solicitar cotización” y te contestan cuando pueden, o publican un precio que luego se infla módulo por módulo. Aquí es al revés: cada pieza tiene un ",
    introFuerte: "precio cerrado",
    introB:
      ", lo ves abajo, y tu total exacto sale gratis y al instante con tu diagnóstico de 3 minutos.",
    ctaPrimario: "Mi precio exacto en 3 minutos →",
    ctaSecundario: "Primero quiero probar la demo",
    factoresTitulo: "Qué define tu inversión",
    factoresSub: "Cuatro factores — los mismos que revisamos contigo en el diagnóstico.",
    factores: [
      {
        n: "01",
        title: "El alcance",
        body: "No es lo mismo un agente de WhatsApp que un sistema completo con panel, automatizaciones y web. Puedes empezar con una pieza y crecer después.",
      },
      {
        n: "02",
        title: "Quién lo opera",
        body: "Llave en Mano (pago único, tú lo operas) o Gestionado (mensualidad, nosotros lo operamos, mantenemos y mejoramos por ti).",
      },
      {
        n: "03",
        title: "No cobramos por tamaño",
        body: "El precio lo deciden las piezas que montas, no cuántos asesores tienes ni cuántos proyectos vendes. Y de la segunda pieza en adelante, 15% menos.",
      },
      {
        n: "04",
        title: "Tus integraciones",
        body: "A qué nos conectamos: tu calendario, tu CRM, tu hoja de cálculo. Integrar lo que ya usas es parte del proyecto, no un extra.",
      },
    ],
    claridadesTitulo: "Lo que en otros lados es letra chica",
    claridadesSub: "Políticas fijas de Upcore, en cualquier plan.",
    claridades: [
      {
        title: "La implementación va incluida",
        body: "La puesta en marcha, las pruebas y la capacitación son parte del proyecto — no un cargo sorpresa aparte.",
      },
      {
        title: "Sin módulos sorpresa",
        body: "Lo acordado incluye lo acordado. No te cobramos aparte “el módulo de WhatsApp”, “la app” o “el CRM” a medio camino.",
      },
      {
        title: "Sin cobros por usuario",
        body: "Tu equipo completo puede usar el sistema. No pagas más por cada persona que se conecta.",
      },
      {
        title: "Las APIs, a TU nombre y con tope",
        body: "El consumo de WhatsApp e inteligencia artificial se paga directo al proveedor, en tus cuentas, con tope de gasto activado. No lo intermediamos ni le ganamos de más.",
      },
    ],
    faqTitulo: "Preguntas sobre precios",
    faqs: [
      {
        q: "¿Cuánto cuesta cada pieza?",
        a: "El precio es cerrado, no un rango: el asistente de WhatsApp son $6,000 USD —y hay una versión esencial de $3,000, que atiende solo en español—, el agente de voz $6,500, el sitio con agenda $4,500, el seguimiento automático $3,500 y la reactivación $3,000. El panel, si lo quieres, $3,000. De la segunda pieza en adelante, 15% menos. Tu diagnóstico gratis te dice en 3 minutos cuáles necesitas y cuánto suma.",
      },
      {
        q: "¿Hay mensualidad obligatoria?",
        a: "No. En Llave en Mano pagas una sola vez y el sistema es tuyo. La mensualidad solo existe si eliges el plan Gestionado, donde nosotros lo operamos, mantenemos y mejoramos por ti.",
      },
      {
        q: "¿Cuánto cuestan las APIs (WhatsApp, IA)?",
        a: "Depende de tu volumen, y se paga directo al proveedor en TUS cuentas — típicamente unas decenas de dólares al mes. La excepción es el agente de voz, que se cobra por minuto hablado y sube con tus llamadas. Siempre con tope de gasto activado y visible para ti. En tu diagnóstico te damos el estimado con tus números.",
      },
      {
        q: "¿Piden todo el pago por adelantado?",
        a: "No. Se arranca con un anticipo del 50% y el resto se paga contra entrega, con todo funcionando y probado.",
      },
      {
        q: "¿Qué incluye el precio del proyecto?",
        a: "Construcción completa, integración con tus herramientas, pruebas contigo, capacitación con video y guía de 1 página, y la garantía de entrega con 30 días de ajustes.",
      },
      {
        q: "¿Y si mi presupuesto es limitado?",
        a: "Para eso existe el agente de WhatsApp esencial: $3,000, atiende en español a cualquier hora y deja la visita agendada. Es la pieza que más dinero recupera, en su versión más ligera, y el sistema crece después cuando ya se está pagando solo. También existe el plan Gestionado sin inversión inicial fuerte.",
      },
    ],
    migaInicio: "Inicio",
    migaAqui: "Precios",
  },

  nosotros: {
    metaTitle: "Quiénes somos",
    metaDescription:
      "Agencia de automatización con IA para inmobiliarias de preventa del sur de Florida: agentes de WhatsApp y voz, seguimiento y sistemas que quedan a tu nombre.",
    eyebrow: "Nosotros",
    h1: "Automatización con IA, hecha para inmobiliarias.",
    intro:
      "Upcore AI es una agencia mexicana que construye agentes de inteligencia artificial, automatizaciones y sistemas completos para inmobiliarias que venden preventa en el sur de Florida. No vendemos software genérico: construimos el sistema de TU firma, y todo queda a tu nombre.",
    principiosTitulo: "Cómo trabajamos",
    principiosSub: "Cuatro principios fijos — aplican en cualquier plan y en cualquier proyecto.",
    principios: [
      {
        title: "Nos integramos, no te migramos",
        body: "Tu CRM, tu calendario, tu hoja de cálculo se quedan. Construimos encima de lo que ya usas — no te obligamos a mudar tu operación a nuestra plataforma.",
      },
      {
        title: "Todo queda a tu nombre",
        body: "Cuentas, número de WhatsApp, APIs y datos son tuyos desde el día uno. Si mañana no seguimos juntos, tu sistema sigue funcionando y sigue siendo tuyo.",
      },
      {
        title: "Hecho por ti, no hazlo-tú-mismo",
        body: "Nada de trials para que lo configures solo: lo construimos, lo probamos contigo y te lo entregamos funcionando, con video y guía. Y si quieres, lo operamos por ti.",
      },
      {
        title: "Honestidad en los números",
        body: "Estimaciones conservadoras, supuestos a la vista y cero cifras infladas. Si a tu volumen algo no te conviene, te lo decimos — aunque vendamos menos.",
      },
    ],
    queTitulo: "Qué construimos",
    queSub: "Cada solución tiene su propia página, con el paso a paso y sus preguntas frecuentes.",
    contactoTitulo: "Habla directo con nosotros",
    contactoSub: "Sin menús telefónicos ni tickets de soporte.",
    whatsapp: "WhatsApp",
    correo: "Correo",
    correoPie: "Clic para escribirnos →",
    correoAsunto: "Consulta para Upcore AI",
    jsonLdNombre: "Quiénes somos — Upcore AI",
    migaInicio: "Inicio",
    migaAqui: "Nosotros",
  },

  blog: {
    metaTitle: "Blog: IA y automatización para inmobiliarias",
    metaDescription:
      "Guías sin tecnicismos para preventa: cuánto cuesta automatizar la atención, cómo funciona la API de WhatsApp y por qué se enfrían tus prospectos.",
    eyebrow: "Blog",
    h1: "Guías claras, sin tecnicismos.",
    intro:
      "Lo que un director comercial necesita saber sobre IA, WhatsApp y automatización — con números reales y cero humo.",
    leer: "Leer la guía →",
    migaInicio: "Inicio",
    migaAqui: "Blog",
    volver: "← Todas las guías",
    publicado: "Publicado el",
    actualizado: "Actualizado el",
    tambien: "Te puede servir:",
    sigueLeyendo: "Sigue leyendo:",
  },

  solucion: {
    ctaVoz: "Háblale ahora →",
    ctaDemo: "Pruébalo en la demo",
    ctaDiagnostico: "Empieza tu diagnóstico gratis",
    doloresTitulo: "¿Te está pasando esto?",
    comoTitulo: "Así lo resolvemos",
    comoSub:
      "Lo construimos por ti, lo conectamos a tus herramientas y tú no tienes que aprender nada técnico.",
    pasosTitulo: "Cómo funciona, paso a paso",
    pasosSub:
      "Del diagnóstico a tenerlo funcionando — sin que tengas que aprender nada técnico.",
    integracionesTitulo: "Nos integramos a lo que ya usas",
    integracionesSub:
      "Tu forma de trabajar no cambia: el sistema se conecta encima de tus herramientas. No te obligamos a migrar a ninguna plataforma.",
    seguridadTitulo: "Tus datos y tus cuentas, siempre tuyos",
    faqTitulo: "Preguntas frecuentes",
    tambien: "También te puede servir:",
    guias: "Guías del blog sobre esto:",
    migaInicio: "Inicio",
  },

  demo: {
    metaTitle: "Prueba el asistente",
    metaDescription:
      "Chatea con una demo del asistente de IA que responde, califica y agenda visitas por WhatsApp para inmobiliarias. Juega a ser tu comprador.",
    etiqueta: "Demo en vivo",
    h1: "Juega a ser tu comprador",
    intro:
      "Este es el asistente que Upcore construye para firmas como la tuya. Escríbele como si buscaras un departamento — pide horarios, pregunta por los proyectos, ponlo a prueba.",
    bullets: [
      {
        titulo: "Responde al instante, 24/7",
        texto: "Lo que acabas de vivir: cero esperas, aunque sean las 11 de la noche.",
      },
      {
        titulo: "Agenda solo",
        texto:
          "Ofrece horarios reales de tu calendario y deja la visita agendada sin que nadie de tu equipo toque el teléfono.",
      },
      {
        titulo: "Con tu información",
        texto: "En tu firma respondería con TUS proyectos, TUS horarios y TU forma de hablar.",
      },
    ],
    cierre: "¿Te imaginas esto contestando el WhatsApp de tu firma?",
    cta: "Haz tu diagnóstico gratis",
  },

  calculadora: {
    h2: "¿Cuánto puedes ahorrar?",
    sub: "Configura tu solución y te damos un estimado honesto en 2 minutos.",
    ultimoPaso: "Último paso",
    paso: (n, total) => `Paso ${n} de ${total}`,
    siguiente: "Siguiente →",
    atras: "← Atrás",
    verEstimado: "Ver mi estimado →",
    q1: "¿Qué tipo de firma tienes?",
    hint1: "Selecciona la opción que mejor describe tu operación",
    q2: "¿Qué quieres para tu firma?",
    hint2: "Elige una o varias — armamos lo que necesites",
    q3: "¿Cómo lo quieres?",
    hint3: "Con todo el sistema, o solo la pieza esencial",
    q4: "¿Quién lo opera?",
    hint4: "Tú mismo, o nosotros nos encargamos de todo",
    q5: "Cuéntanos tu volumen",
    hint5: "Cifras aproximadas son más que suficientes",
    campoMensajes: "Mensajes o consultas por día",
    ejemploMensajes: "Ej: 25",
    campoLeads: "Prospectos nuevos por mes",
    ejemploLeads: "Ej: 40",
    qEmail: "Un último paso",
    hintEmail: "Recibe el estimado completo en tu correo — es opcional",
    placeholderEmail: "tu@inmobiliaria.com",
    omitir: "Omitir y ver mi estimado →",
    tuEstimacion: "Tu estimación",
    basadoEn: "basado en firmas similares",
    inversion: "Inversión (construcción)",
    costosTuyos: "Costos que pagas tú",
    mensualidadUpcore: "Mensualidad de Upcore",
    ahorro: "Ahorro estimado",
    retorno: "Retorno estimado",
    consejo: "Nuestro consejo honesto:",
    construiriamos: "Esto construiríamos para ti:",
    notaFinal:
      "* Estimaciones para orientarte. Todo (cuentas, APIs, tokens, hosting) queda a tu nombre. Los precios de construcción son cerrados; lo que varía es el consumo de APIs, según tu volumen.",
    cta: "Haz tu diagnóstico gratis",
    calcularOtra: "Calcular de nuevo",
  },

  demoVoz: {
    titulo: "Háblale como si fueras tu comprador",
    intro:
      "Marca, pregunta por una visita y escucha lo que oiría quien llama a tu firma. Contesta en español, como te llaman tus compradores — háblale en inglés y se cambia. Usa el micrófono de tu compu; no hace falta ningún número.",
    enLlamada: "En llamada ·",
    hablaNormal: "Habla normal, te está escuchando",
    terminada:
      "Llamada terminada. Así de simple sería para tus compradores — a cualquier hora, sin que nadie de tu equipo tenga que contestar.",
    colgar: "Colgar",
    conectando: "Conectando…",
    otraVez: "Llamar otra vez",
    llamar: "Llamar a la demo →",
    limite: "Máximo 3 minutos · datos ficticios · te pedirá permiso del micrófono",
    errorInicio: "No se pudo iniciar la llamada. Inténtalo de nuevo en un momento.",
    errorCorte: "Se cortó la llamada. Puedes intentarlo otra vez.",
    errorMicro:
      "Tu navegador bloqueó el micrófono o no está disponible. Revisa los permisos e inténtalo de nuevo.",
  },

  demoChat: {
    descanso:
      "El asistente de demostración está tomando un descanso 😅 Haz tu diagnóstico gratis y te lo enseñamos en vivo.",
    agendada:
      "✨ Visita agendada en menos de un minuto, sin que nadie de tu equipo tocara el teléfono. Esto mismo, en TU WhatsApp.",
    placeholder: "Escribe como comprador…",
    placeholderFin: "La demo terminó — agenda tu diagnóstico 👆",
    aria: "Mensaje para el asistente de demostración",
    quieroEsto: "Quiero esto en mi inmobiliaria →",
    enLinea: "en línea",
    demoFicticia: "Demo · datos ficticios",
    asistenteDe: (n) => `Asistente de ${n}`,
    enviar: "Enviar",
  },
};

// ────────────────────────────────────────────────────────────────────────────
const EN: TextosPaginas = {
  precios: {
    metaTitle: "Pricing: fixed prices, no fine print",
    metaDescription:
      "No hidden prices and no surprise modules: what determines your investment, what is included, and your exact price free in 3 minutes with the assessment.",
    eyebrow: "Clear pricing",
    h1: "No hidden prices. No fine print.",
    introA:
      "Others make you “request a quote” and get back to you whenever they can, or publish a price that then inflates module by module. Here it is the other way around: every piece has a ",
    introFuerte: "fixed price",
    introB:
      ", you see it below, and your exact total comes free and instantly with your 3-minute assessment.",
    ctaPrimario: "My exact price in 3 minutes →",
    ctaSecundario: "I want to try the demo first",
    factoresTitulo: "What determines your investment",
    factoresSub: "Four factors — the same ones we go through with you in the assessment.",
    factores: [
      {
        n: "01",
        title: "The scope",
        body: "A WhatsApp agent is not the same as a full system with a dashboard, automations and a website. You can start with one piece and grow later.",
      },
      {
        n: "02",
        title: "Who runs it",
        body: "Turnkey (one-time payment, you run it) or Managed (monthly fee, we run, maintain and improve it for you).",
      },
      {
        n: "03",
        title: "We do not charge by size",
        body: "The price is decided by the pieces you build, not by how many agents you have or how many projects you sell. And from the second piece onward, 15% off.",
      },
      {
        n: "04",
        title: "Your integrations",
        body: "What we connect to: your calendar, your CRM, your spreadsheet. Integrating what you already use is part of the project, not an extra.",
      },
    ],
    claridadesTitulo: "What elsewhere is fine print",
    claridadesSub: "Fixed Upcore policies, under any plan.",
    claridades: [
      {
        title: "Implementation is included",
        body: "Setup, testing and training are part of the project — not a surprise charge on the side.",
      },
      {
        title: "No surprise modules",
        body: "What was agreed includes what was agreed. We do not bill you separately for “the WhatsApp module”, “the app” or “the CRM” halfway through.",
      },
      {
        title: "No per-seat charges",
        body: "Your whole team can use the system. You do not pay more for each person who logs in.",
      },
      {
        title: "The APIs, in YOUR name and capped",
        body: "WhatsApp and AI usage is paid directly to the provider, in your accounts, with a spending cap turned on. We do not sit in the middle and we do not mark it up.",
      },
    ],
    faqTitulo: "Questions about pricing",
    faqs: [
      {
        q: "What does each piece cost?",
        a: "The price is fixed, not a range: the WhatsApp assistant is $6,000 USD —and there is an essential version at $3,000 that answers in Spanish only—, the voice agent $6,500, the site with booking $4,500, automated follow-up $3,500 and re-engagement $3,000. The dashboard, if you want it, $3,000. From the second piece onward, 15% off. Your free assessment tells you in 3 minutes which ones you need and what they add up to.",
      },
      {
        q: "Is there a mandatory monthly fee?",
        a: "No. Under Turnkey you pay once and the system is yours. The monthly fee only exists if you choose the Managed plan, where we run, maintain and improve it for you.",
      },
      {
        q: "What do the APIs (WhatsApp, AI) cost?",
        a: "It depends on your volume, and it is paid directly to the provider in YOUR accounts — typically a few tens of dollars a month. The exception is the voice agent, billed per minute spoken, which rises with your call volume. Always with a spending cap turned on and visible to you. Your assessment gives you the estimate using your numbers.",
      },
      {
        q: "Do you ask for the full payment up front?",
        a: "No. We start with a 50% deposit and the balance is paid on delivery, with everything running and tested.",
      },
      {
        q: "What does the project price include?",
        a: "The full build, integration with your tools, testing with you, training with a video and a one-page guide, and the delivery guarantee with 30 days of adjustments.",
      },
      {
        q: "What if my budget is limited?",
        a: "That is what the essential WhatsApp agent is for: $3,000, it answers in Spanish at any hour and leaves the visit booked. It is the piece that recovers the most money, in its lightest version, and the system grows later once it is already paying for itself. There is also the Managed plan without a heavy upfront investment.",
      },
    ],
    migaInicio: "Home",
    migaAqui: "Pricing",
  },

  nosotros: {
    metaTitle: "About us",
    metaDescription:
      "An AI automation agency for South Florida preconstruction sales: WhatsApp and voice agents, lead follow-up, and systems that stay in your name.",
    eyebrow: "About",
    h1: "AI automation, built for real estate.",
    intro:
      "Upcore AI is a Mexican agency that builds artificial intelligence agents, automations and complete systems for firms selling preconstruction in South Florida. We do not sell generic software: we build YOUR firm's system, and it all stays in your name.",
    principiosTitulo: "How we work",
    principiosSub: "Four fixed principles — they apply under any plan and on any project.",
    principios: [
      {
        title: "We integrate, we do not migrate you",
        body: "Your CRM, your calendar, your spreadsheet all stay. We build on top of what you already use — we do not force you to move your operation onto our platform.",
      },
      {
        title: "Everything stays in your name",
        body: "Accounts, WhatsApp number, APIs and data are yours from day one. If tomorrow we no longer work together, your system keeps running and keeps being yours.",
      },
      {
        title: "Done for you, not do-it-yourself",
        body: "No trials for you to configure alone: we build it, we test it with you and we hand it over running, with a video and a guide. And if you want, we run it for you.",
      },
      {
        title: "Honesty in the numbers",
        body: "Conservative estimates, assumptions in plain view and zero inflated figures. If something is not worth it at your volume, we say so — even if it means selling less.",
      },
    ],
    queTitulo: "What we build",
    queSub: "Each solution has its own page, with the step-by-step and its frequently asked questions.",
    contactoTitulo: "Talk to us directly",
    contactoSub: "No phone menus and no support tickets.",
    whatsapp: "WhatsApp",
    correo: "Email",
    correoPie: "Click to write to us →",
    correoAsunto: "Enquiry for Upcore AI",
    jsonLdNombre: "About us — Upcore AI",
    migaInicio: "Home",
    migaAqui: "About",
  },

  blog: {
    metaTitle: "Blog: AI and automation for real estate",
    metaDescription:
      "Jargon-free guides for preconstruction teams: what it costs to automate your inbound, how the WhatsApp API works, and why your leads go cold.",
    eyebrow: "Blog",
    h1: "Clear guides, no jargon.",
    intro:
      "What a sales director needs to know about AI, WhatsApp and automation — with real numbers and zero hype.",
    leer: "Read the guide →",
    migaInicio: "Home",
    migaAqui: "Blog",
    volver: "← All guides",
    publicado: "Published",
    actualizado: "Updated",
    tambien: "You may also want:",
    sigueLeyendo: "Keep reading:",
  },

  solucion: {
    ctaVoz: "Call it now →",
    ctaDemo: "Try it in the demo",
    ctaDiagnostico: "Start your free assessment",
    doloresTitulo: "Is this happening to you?",
    comoTitulo: "This is how we solve it",
    comoSub:
      "We build it for you, we connect it to your tools, and you do not have to learn anything technical.",
    pasosTitulo: "How it works, step by step",
    pasosSub: "From the assessment to having it running — without learning anything technical.",
    integracionesTitulo: "We plug into what you already use",
    integracionesSub:
      "The way you work does not change: the system connects on top of your tools. We do not force you to migrate to any platform.",
    seguridadTitulo: "Your data and your accounts, always yours",
    faqTitulo: "Frequently asked questions",
    tambien: "You may also want:",
    guias: "Blog guides on this:",
    migaInicio: "Home",
  },

  demo: {
    metaTitle: "Try the assistant",
    metaDescription:
      "Chat with a demo of the AI assistant that answers, qualifies and books appointments over WhatsApp for real estate firms. Play the part of your own buyer.",
    etiqueta: "Live demo",
    h1: "Play the part of your buyer",
    // ⚠️ Esta frase existe porque al LEER la página inglesa el chat aparecía
    // entero en español sin explicación, y eso se ve como algo roto, no como una
    // decisión. Y ojo: la primera versión decía "It answers in Spanish", que es
    // FALSO — el asistente contesta en el idioma en que le escriban. Prometer de
    // menos también es prometer mal.
    intro:
      "This is the assistant Upcore builds for firms like yours. It greets you in Spanish, the way your buyers write — switch to English and it follows you. Write to it as if you were looking for a condo: ask for times, ask about the projects, put it through its paces.",
    bullets: [
      {
        titulo: "Replies instantly, 24/7",
        texto: "What you just experienced: zero waiting, even at 11 at night.",
      },
      {
        titulo: "Books on its own",
        texto:
          "It offers real slots from your calendar and leaves the appointment booked without anyone on your team touching the phone.",
      },
      {
        titulo: "With your information",
        texto: "At your firm it would answer with YOUR projects, YOUR hours and YOUR way of speaking.",
      },
    ],
    cierre: "Can you picture this answering your firm's WhatsApp?",
    cta: "Get your free assessment",
  },

  calculadora: {
    h2: "How much can you save?",
    sub: "Set up your solution and we give you an honest estimate in 2 minutes.",
    ultimoPaso: "Last step",
    paso: (n, total) => `Step ${n} of ${total}`,
    siguiente: "Next →",
    atras: "← Back",
    verEstimado: "See my estimate →",
    q1: "What kind of firm do you have?",
    hint1: "Pick the option that best describes your operation",
    q2: "What do you want for your firm?",
    hint2: "Choose one or several — we build what you need",
    q3: "How do you want it?",
    hint3: "With the whole system, or just the essential component",
    q4: "Who runs it?",
    hint4: "You, or we take care of everything",
    q5: "Tell us about your volume",
    hint5: "Rough figures are more than enough",
    campoMensajes: "Messages or enquiries per day",
    ejemploMensajes: "e.g. 25",
    campoLeads: "New leads per month",
    ejemploLeads: "e.g. 40",
    qEmail: "One last step",
    hintEmail: "Get the full estimate by email — this is optional",
    placeholderEmail: "you@yourfirm.com",
    omitir: "Skip and see my estimate →",
    tuEstimacion: "Your estimate",
    basadoEn: "based on similar firms",
    inversion: "Investment (build)",
    costosTuyos: "Costs you pay",
    mensualidadUpcore: "Upcore monthly fee",
    ahorro: "Estimated saving",
    retorno: "Estimated return",
    consejo: "Our honest advice:",
    construiriamos: "This is what we would build for you:",
    notaFinal:
      "* Estimates to orient you. Everything (accounts, APIs, tokens, hosting) stays in your name. Build prices are fixed; what varies is API usage, depending on your volume.",
    cta: "Get your free assessment",
    calcularOtra: "Calculate again",
  },

  demoVoz: {
    titulo: "Talk to it as if you were your buyer",
    // ⚠️ NO se promete aquí que la voz cambie de idioma. El chat sí lo hace y está
    // comprobado en su prompt (lib/demo.ts), pero el agente de voz vive en Retell,
    // fuera de este repo: no se puede comprobar leyendo el código y por lo tanto no
    // se afirma. La página del agente de voz sí lo dice, porque ahí es una
    // capacidad del producto que se configura al desplegarlo.
    intro:
      "Call, ask about a visit and hear what someone phoning your firm would hear. It picks up in Spanish, the way your buyers call — speak to it in English and it switches. Use your computer's microphone; no phone number needed.",
    enLlamada: "On the call ·",
    hablaNormal: "Speak normally, it is listening",
    terminada:
      "Call ended. That is how simple it would be for your buyers — at any hour, without anyone on your team having to pick up.",
    colgar: "Hang up",
    conectando: "Connecting…",
    otraVez: "Call again",
    llamar: "Call the demo →",
    limite: "3 minutes maximum · made-up data · it will ask for microphone permission",
    errorInicio: "The call could not be started. Try again in a moment.",
    errorCorte: "The call dropped. You can try again.",
    errorMicro:
      "Your browser blocked the microphone or it is unavailable. Check the permissions and try again.",
  },

  demoChat: {
    descanso:
      "The demo assistant is taking a break 😅 Get your free assessment and we will show it to you live.",
    agendada:
      "✨ Appointment booked in under a minute, without anyone on your team touching the phone. This exact thing, on YOUR WhatsApp.",
    placeholder: "Write as a buyer…",
    placeholderFin: "The demo has ended — get your assessment 👆",
    aria: "Message for the demo assistant",
    quieroEsto: "I want this at my firm →",
    enLinea: "online",
    demoFicticia: "Demo · made-up data",
    asistenteDe: (n) => `${n} assistant`,
    enviar: "Send",
  },
};

export const TP_PAG: Record<Idioma, TextosPaginas> = { es: ES, en: EN };

export const paginas = (idioma: Idioma): TextosPaginas => TP_PAG[idioma];
