// ============================================================================
// TEXTOS DEL SITIO PÚBLICO — español e inglés, en una sola tabla.
//
// Misma disciplina que `acuerdo-textos.ts` y `arranque-textos.ts`: los dos
// idiomas viven en un `Record<Idioma, TextosSitio>`, así que TypeScript obliga a
// que tengan exactamente las mismas claves. Agregar una sección en español sin
// traducirla NO COMPILA. Dos textos escritos por separado se desfasan solos.
//
// ⚠️ Reglas de la casa que aplican a TODO este archivo, en los dos idiomas:
//   · Ninguna cifra sin fuente comprobada, y las que hay se marcan como
//     estimaciones del sector, nunca como promesa de resultado.
//   · Nunca se promete un número de ventas: no tenemos el CRM del cliente.
//   · 🔴 LÍNEA ROJA: el asistente NO da precios, NI disponibilidad, NI fechas de
//     entrega. En preventa esos tres cambian por línea, piso y etapa, así que
//     caducan solos. El sitio no puede prometer lo que el producto se niega a
//     hacer — está en el contrato y hay guardián (`scripts/probar-sitio.mjs`).
//   · Ley federal de vivienda justa de EE.UU.: nada que oriente por quién vive
//     en una zona. De una zona solo se dicen hechos.
//   · Al hablar de Upcore va el ABANICO completo (sitio, agenda, WhatsApp,
//     teléfono, panel) y luego la pieza concreta.
// ============================================================================

import type { Idioma } from "./idioma";

export type Punto = { ok: boolean; texto: string };

export type TextosSitio = {
  /**
   * Burbuja flotante de WhatsApp (decisión de Yael, 2026-09-04): la puerta al bot desde
   * cualquier página pública. `label` se ve en pantallas anchas junto al icono; `aria` es lo
   * que lee el lector de pantalla y el `title` del enlace.
   */
  burbujaWa: { label: string; aria: string };
  /**
   * Chat del sitio (2026-09-05): el MISMO agente de WhatsApp por otra puerta. Estos son solo
   * los textos del cascarón (botón, cabecera, caja de texto); lo que dice el asistente viene
   * del cerebro en n8n, nunca de aquí.
   */
  chatWeb: {
    abrir: string;
    cerrar: string;
    titulo: string;
    sub: string;
    bienvenida: string;
    placeholder: string;
    enviar: string;
    seguirWa: string;
    /** La versión corta que cabe en la cabecera del panel (380 px); `seguirWa` queda como nombre accesible. */
    seguirWaCorto: string;
    pensando: string;
    privacidad: string;
  };
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
  nav: {
    soluciones: string;
    precios: string;
    blog: string;
    nosotros: string;
    demoEnVivo: string;
    diagnosticoGratis: string;
    inicio: string;
    abrirMenu: string;
    cerrarMenu: string;
    cta: string;
    otroIdioma: string;
    otroIdiomaAria: string;
  };
  footer: {
    soluciones: string;
    privacidad: string;
    terminos: string;
    derechos: string;
  };
  cta: {
    cerrar: string;
    titulo: string;
    sub: string;
    opciones: { emoji: string; titulo: string; sub: string; href: string }[];
  };
  hero: {
    eyebrow: string;
    title1: string;
    title2: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  problemas: {
    heading: string;
    sub: string;
    items: { icon: string; title: string; body: string }[];
  };
  pasos: {
    heading: string;
    sub: string;
    items: { n: string; title: string; body: string }[];
  };
  sistema: {
    heading: string;
    sub: string;
    dashboard: {
      tag: string;
      title: string;
      body: string;
      views: string[];
      ajustesTitle: string;
      ajustes: string[];
    };
    items: { icon: string; title: string; body: string }[];
  };
  demoTeaser: {
    heading: string;
    sub: string;
    burbujas: { de: "comprador" | "bot"; texto: string }[];
    chatTitulo: string;
    chatEstado: string;
    copyTitulo: string;
    copyBody: string;
    ctaChat: string;
    ctaVoz: string;
    nota: string;
  };
  comparativa: {
    heading: string;
    sub: string;
    opciones: {
      title: string;
      sub: string;
      destacado: boolean;
      puntos: Punto[];
      costo: string;
    }[];
    cierre: string;
    cierreEnlace: string;
  };
  resultados: {
    heading: string;
    sub: string;
    stats: { value: string; label: string }[];
    disclaimer: string;
  };
  garantia: { heading: string; body: string; note: string };
  planes: {
    heading: string;
    sub: string;
    items: {
      name: string;
      tagline: string;
      pago: string;
      desc: string;
      incluye: string[];
      destacado: boolean;
    }[];
    recomendado: string;
    nota: string;
    precioNota: string;
    cta: string;
  };
  faq: { heading: string; items: { q: string; a: string }[] };
  sobre: { heading: string; body: string; badges: { icon: string; label: string }[] };
  ctaFinal: { heading: string; sub: string; ctaAgenda: string; ctaWhatsapp: string };
};

// ────────────────────────────────────────────────────────────────────────────
// ESPAÑOL — el original. El inglés se traduce de aquí, nunca al revés.
// ────────────────────────────────────────────────────────────────────────────
const ES: TextosSitio = {
  burbujaWa: {
    label: "Escríbenos por WhatsApp",
    aria: "Escríbenos por WhatsApp: te contesta nuestro asistente al momento",
  },
  chatWeb: {
    abrir: "Escríbenos",
    cerrar: "Cerrar el chat",
    titulo: "Asistente de Upcore AI",
    sub: "Contesta al momento, a cualquier hora",
    bienvenida: "Cuéntanos qué te trae por aquí. Te contesta el mismo asistente que atiende nuestro WhatsApp; es una IA, y lo dice si le preguntas.",
    placeholder: "Escribe tu mensaje…",
    enviar: "Enviar",
    seguirWa: "Seguir por WhatsApp",
    seguirWaCorto: "WhatsApp",
    pensando: "Escribiendo…",
    privacidad: "Lo que escribas aquí lo lee nuestro asistente y el equipo de Upcore, nadie más.",
  },
  meta: {
    title: "Upcore AI | Automatización con IA para inmobiliarias",
    description:
      "Automatización con IA para inmobiliarias de preventa en Miami: atiende tu WhatsApp y tu teléfono en español a cualquier hora, califica y agenda la visita.",
    keywords: [
      "automatización para inmobiliarias",
      "IA para inmobiliarias",
      "agente de WhatsApp para inmobiliarias",
      "seguimiento de leads inmobiliarios",
      "chatbot inmobiliario",
      "preventa Miami",
      "agente de voz inmobiliario",
      "panel para inmobiliarias",
    ],
  },

  nav: {
    soluciones: "Soluciones",
    precios: "Precios",
    blog: "Blog",
    nosotros: "Nosotros",
    demoEnVivo: "Demo en vivo",
    diagnosticoGratis: "Diagnóstico gratis",
    inicio: "Upcore AI — inicio",
    abrirMenu: "Abrir menú",
    cerrarMenu: "Cerrar menú",
    cta: "Haz tu diagnóstico",
    otroIdioma: "EN",
    otroIdiomaAria: "View this page in English",
  },

  footer: {
    soluciones: "Soluciones",
    privacidad: "Política de Privacidad",
    terminos: "Términos de Servicio",
    derechos: "© 2026 UPCORE AI. TODOS LOS DERECHOS RESERVADOS.",
  },

  cta: {
    cerrar: "Cerrar",
    titulo: "Tu diagnóstico gratis, sin llamadas",
    sub: "Contesta unas preguntas y el resultado aparece al instante, con los números de TU inmobiliaria.",
    opciones: [
      {
        emoji: "⚡",
        titulo: "Hacer mi diagnóstico",
        sub: "3 minutos de preguntas y tu diagnóstico al instante — sin agendar nada.",
        href: "/empezar",
      },
      {
        emoji: "🤖",
        titulo: "Prueba el agente de chat",
        sub: "Chatea con una demo del asistente, como si fueras tu comprador.",
        href: "/demo",
      },
      {
        emoji: "📞",
        titulo: "Prueba el agente de voz",
        sub: "Háblale por el micrófono y escucha cómo contestaría tu teléfono.",
        href: "/soluciones/agente-de-voz-para-inmobiliarias#demo-voz",
      },
    ],
  },

  hero: {
    eyebrow: "Automatización con IA para inmobiliarias de Miami",
    title1: "Ningún comprador",
    title2: "sin respuesta.",
    subtitle:
      "Tu comprador escribe en español, desde otro país y a cualquier hora. Montamos la parte digital que lo atiende al instante, lo califica y deja agendada la visita — aunque tu equipo esté dormido.",
    ctaPrimary: "Haz tu diagnóstico gratis",
    ctaSecondary: "Calcula cuánto puedes recuperar",
  },

  problemas: {
    heading: "¿Te suena familiar?",
    sub: "Por dónde se le va la gente a una inmobiliaria de preventa, cada semana.",
    items: [
      {
        icon: "IconClock",
        title: "Escribe a las 11 de la noche, desde Bogotá",
        body: "Tu comprador está en otro país y otro huso horario. Cuando tu equipo abre, él ya está hablando con otro proyecto.",
      },
      {
        icon: "IconRefresh",
        title: "El prospecto se enfría y nadie lo nota",
        body: "El primer contacto sí se atiende. El segundo, el de la semana siguiente y el del mes que viene, no. Y ahí es donde se cae la venta.",
      },
      {
        icon: "IconChat",
        title: "La conversación vive en el celular del asesor",
        body: "Si el asesor renuncia, se va con la lista. Y tú no tienes forma de saber qué se le dijo a quién.",
      },
      {
        icon: "IconCalendar",
        title: "La preventa dura meses",
        body: "Entre la reserva y la entrega pasan uno o dos años. Sostener esa conversación a mano, con cientos de prospectos, no lo aguanta ningún equipo.",
      },
    ],
  },

  pasos: {
    heading: "Cómo funciona",
    sub: "En 3 pasos, sin que tú tengas que aprender nada técnico.",
    items: [
      {
        n: "01",
        title: "Diagnóstico gratis al instante",
        body: "Contesta unas preguntas (aquí o por WhatsApp) y recibe tu diagnóstico en el momento: por dónde se te está yendo la gente, con tus números, y cómo lo arreglamos.",
      },
      {
        n: "02",
        title: "Lo construimos por ti",
        body: "Montamos el asistente en tu WhatsApp, tu teléfono y tu CRM actual. Tú no mueves un dedo.",
      },
      {
        n: "03",
        title: "Tu equipo recibe visitas, no mensajes",
        body: "Al asesor le llega el prospecto ya calificado y con la visita agendada. Su trabajo vuelve a ser vender.",
      },
    ],
  },

  sistema: {
    heading: "Construimos sistemas, no piezas sueltas",
    sub: "Armamos la parte digital de una inmobiliaria completa —sitio con la ficha de cada desarrollo, agenda en línea, WhatsApp, teléfono y panel— y la dejamos operando junta, hecha a la medida de tus proyectos.",
    dashboard: {
      tag: "El centro de todo",
      title: "Panel del director comercial",
      body: "Un panel simple donde ves qué pasó con cada prospecto, cómo va cada asesor y qué proyecto está jalando — sin depender de nadie y sin tocar nada que pueda romper el sistema.",
      // 🔴 2026-08-25. Esta lista decía "Prospectos, Pendientes de seguimiento, A
      // quién llamar hoy" — que son pantallas de la consola INCLUIDA, listada aquí
      // abajo mismo en `ajustes`. La misma página vendía como extra lo que regalaba
      // dos párrafos más abajo. Aquí solo va lo que el panel añade de verdad:
      // separar por asesor y seguir al comprador hasta el final.
      views: [
        "Cada asesor con su propio acceso",
        "Cómo va cada asesor",
        "El camino de cada comprador hasta la venta",
        "Qué desarrollo está jalando",
        "Tu retorno real, no el estimado",
      ],
      // 🔴 Esta lista es lo que el cliente puede tocar ÉL MISMO, así que cada
      // renglón tiene que existir de verdad en su panel (productos/panel-inmobiliaria).
      // Decía "Cómo responde tu asistente (su tono y qué dice)" y eso NO se puede
      // cambiar desde ahí — ni se va a poder: dejar que el cliente reescriba el guion
      // sería dejarle borrar el bloque de vivienda justa o la regla de no dar precios,
      // que son las que lo protegen a él. El tono se define una vez, en el arranque.
      ajustesTitle: "Y los controles vienen incluidos con cada pieza — desde tu celular:",
      ajustes: [
        // 🔴 Decía "Los proyectos, precios y planes de pago que menciona". El
        // asistente NO menciona precios: es la línea roja nº1 del producto.
        "Qué desarrollos ofrece y cuáles no",
        "Ver cada conversación y tomar el chat cuando quieras",
        "A qué asesor le llega el aviso cuando alguien pide una persona",
        "Tus horarios de atención",
        "Tus mensajes de seguimiento, antes de que salgan",
        "Apagarlo en un toque",
      ],
    },
    items: [
      {
        icon: "IconChat",
        title: "Agentes de IA",
        body: "Atienden WhatsApp y el teléfono a cualquier hora, en español o en inglés según en qué idioma les hablen, califican al comprador y agendan la visita.",
      },
      {
        icon: "IconRefresh",
        title: "Seguimiento automático",
        body: "Recordatorios de cada etapa de pago, avisos de avance de obra y reactivación del que dejó de contestar.",
      },
      {
        icon: "IconData",
        title: "Base de conocimiento con IA",
        // 🔴 Decía "…unidades, planes de pago y fechas de entrega": justo lo
        // que el asistente NO dice.
        body: "Tu asistente responde con la información real de tus proyectos: ubicación, amenidades y cómo es el proceso de compra. Lo que cambia solo —precios, disponibilidad y fechas— lo pasa a tu asesor.",
      },
      {
        icon: "IconSparkle",
        title: "Sitios web inteligentes",
        body: "Webs en español e inglés con la ficha de cada desarrollo, que califican y agendan solas.",
      },
      {
        icon: "IconChip",
        title: "Sistema a la medida",
        body: "Unimos todo en una sola infraestructura, conectada al CRM que ya usas.",
      },
    ],
  },

  demoTeaser: {
    heading: "No nos creas. Pruébalo.",
    sub: "Ponte en los zapatos de tu propio comprador: escríbele al asistente o háblale por teléfono, pídele informes y mira lo que sentirían los tuyos.",
    burbujas: [
      {
        de: "comprador",
        texto: "Hola, escribo desde Bogotá. ¿Todavía quedan unidades en el proyecto de Brickell?",
      },
      {
        de: "bot",
        // 🔴 Decía "Sí, quedan unidades. ¿Le muestro el inventario…". El
        // asistente NO confirma disponibilidad, y este diálogo le ENSEÑA al
        // prospecto qué esperar: ahora modela el comportamiento correcto.
        texto:
          "¡Hola! 😊 Con gusto. La disponibilidad cambia a diario, así que se la confirma su asesor al detalle en una videollamada. Tengo: 1) jueves 10:00 a. m. 2) jueves 1:00 p. m. 3) viernes 4:30 p. m. — hora de Miami.",
      },
      { de: "comprador", texto: "La del jueves a las 10" },
      {
        de: "bot",
        texto:
          "Listo, quedó su videollamada el jueves a las 10:00 a. m., hora de Miami. Le mando recordatorio un día antes por aquí 🏙️",
      },
    ],
    chatTitulo: "Asistente de tu inmobiliaria",
    chatEstado: "en línea · responde en segundos",
    copyTitulo: "Así se siente no perder un solo comprador",
    copyBody:
      "El asistente responde al momento, resuelve dudas y agenda la visita — a las 8 de la mañana o a las 11 de la noche. Y no solo por escrito: también contesta el teléfono. Las dos demos son interactivas.",
    ctaChat: "💬 Escríbele →",
    ctaVoz: "📞 Háblale →",
    nota: "Sin registro. Son demos con datos ficticios.",
  },

  comparativa: {
    heading: "Las 3 formas de resolver tu atención",
    sub: "Comparación honesta — porque contratar gente o usar un CRM con IA también son opciones reales.",
    // ⚠️ Los `costo` de las dos primeras opciones NO llevan cifra: no tenemos
    // rangos comprobados del mercado de Miami, y aquí no se escriben números
    // sin fuente. El nuestro sí va, porque es nuestro.
    opciones: [
      {
        title: "Contratar un asistente comercial",
        sub: "La solución tradicional",
        destacado: false,
        puntos: [
          { ok: true, texto: "Trato humano de principio a fin" },
          {
            ok: false,
            texto: "Cubre solo su turno — y tu comprador escribe desde otro huso horario",
          },
          { ok: false, texto: "En horas pico igual se satura" },
          { ok: false, texto: "Vacaciones, permisos y rotación" },
        ],
        costo: "Un sueldo más al mes, por turno",
      },
      {
        title: "CRM inmobiliario “con IA”",
        sub: "Las plataformas todo-en-uno",
        destacado: false,
        puntos: [
          { ok: true, texto: "Ordena tus prospectos, tu pipeline y tus reportes" },
          { ok: true, texto: "Recordatorios por plantilla" },
          { ok: false, texto: "Su IA puntúa y ordena leads — no conversa con ellos" },
          { ok: false, texto: "El chat lo contesta tu equipo, a mano" },
          { ok: false, texto: "Te mudas a SU plataforma, con módulos que se cobran aparte" },
        ],
        costo: "Mensualidad por usuario + módulos aparte",
      },
      {
        title: "Agente de IA de Upcore",
        sub: "La capa que contesta",
        destacado: true,
        puntos: [
          { ok: true, texto: "Contesta al instante, 24/7, también en domingo" },
          { ok: true, texto: "Conversa de verdad: entiende lenguaje natural" },
          { ok: true, texto: "Agenda solo, en TU calendario real" },
          { ok: true, texto: "Se integra a lo que ya usas — incluido tu CRM" },
          { ok: true, texto: "Todo queda a tu nombre, lo operes tú o nosotros" },
        ],
        costo: "Precio cerrado: diagnóstico gratis en 3 min",
      },
    ],
    cierre:
      "No es “uno u otro”: el agente se lleva bien con tu equipo y con tu software — es la capa que contesta cuando ellos no pueden.",
    cierreEnlace: "Pruébalo tú mismo en la demo →",
  },

  resultados: {
    heading: "Lo que puedes esperar",
    sub: "Estimaciones del sector inmobiliario, no de un caso aislado. Varían según el producto que elijas (un agente, un sitio web o el sistema completo) y según tu operación.",
    stats: [
      { value: "7×", label: "más probable calificar un lead si respondes en menos de 1 hora" },
      { value: "60–70%", label: "de los prospectos se pierden hoy por seguimiento tardío" },
      { value: "86%", label: "de los compradores extranjeros de Miami son latinoamericanos" },
      { value: "24/7", label: "atención en español, en su horario" },
    ],
    disclaimer:
      "* Cifras del sector inmobiliario, no una garantía de resultados individuales. Cambian según el producto (agente, sitio web o sistema completo) y según tu operación. Tu estimación personalizada sale de la calculadora de arriba y de tu diagnóstico gratis, hecho con TUS números.",
  },

  garantia: {
    heading: "Garantía de resultados",
    // ⚠️ Se promete lo que SÍ controlamos (que nadie se quede sin respuesta),
    // nunca ventas: no tenemos su CRM.
    body: "En 30 días ningún prospecto tuyo se queda sin respuesta, a la hora que escriba y en su idioma — o seguimos trabajando sin costo hasta lograrlo.",
    note: "Sin letra chica.",
  },

  planes: {
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
    recomendado: "Recomendado",
    // "¿Las creas tú o las creamos nosotros?" se quitó el 2026-08-16: las
    // creamos nosotros, siempre.
    nota: "En ambos planes, todo es tuyo: tus cuentas, tu hosting, tus APIs y tokens quedan a tu nombre. Y no tienes que abrir ninguna: las creamos nosotros con tus datos y te las entregamos al cerrar.",
    precioNota: "Precio cerrado según las piezas que elijas",
    cta: "Haz tu diagnóstico",
  },

  faq: {
    heading: "Preguntas frecuentes",
    items: [
      {
        q: "¿Reemplaza a mis asesores?",
        a: "No, al contrario: les llega el prospecto ya calificado y con la visita agendada, así que su tiempo se va en vender y no en contestar la misma pregunta cincuenta veces. Lo que el asistente cubre es lo que hoy nadie alcanza: la madrugada, el fin de semana y el seguimiento del mes cuatro.",
      },
      {
        q: "¿Funciona con el CRM que ya usamos?",
        a: "Sí, y esa es la idea. No te pedimos cambiarte de sistema: nos integramos al que ya tienes para que tus datos sigan viviendo donde viven hoy. Si no usas ninguno, te montamos el panel — pero se ofrece, no se impone.",
      },
      {
        q: "¿Y si un desarrollo ya se agotó? ¿lo va a seguir ofreciendo?",
        a: "No. Tú marcas ese desarrollo como pausado y desde ese momento el asistente deja de mencionarlo y de agendar visitas para él; a quien pregunte, lo pasa con tu asesor. Lo que no hace nunca —tampoco con los desarrollos activos— es decir cuántas unidades quedan ni en qué precio andan, porque eso cambia por línea, piso y etapa. Es a propósito: un dato así, por escrito, se convierte en un reclamo.",
      },
      {
        q: "¿Y si el comprador quiere hablar con una persona?",
        a: "Se lo pasa sin discutir. No insiste ni intenta convencerlo de seguir con el robot: toma su nombre y su teléfono, avisa a tu equipo en el momento, y le dice al comprador quién le va a marcar y cuándo. Tú decides a quién le llega ese aviso y por qué vía.",
      },
      {
        q: "¿Atiende en inglés también?",
        a: "Sí, y no solo el chat: todo lo que te entregamos va en los dos idiomas. El agente de WhatsApp detecta en qué idioma le escriben —español, inglés o portugués— y contesta igual. El agente de voz reconoce si le hablan en inglés y se cambia en la misma llamada. Y tu sitio y tu panel se entregan en español e inglés. En español está más afinado, porque de ahí viene la mayor parte de la demanda de preventa en Miami.",
      },
      {
        q: "¿Ustedes dónde están?",
        a: "Operamos desde México y trabajamos 100% en remoto, en la misma franja horaria que Florida. Lo decimos de frente porque es parte de por qué funcionamos: entendemos al comprador latinoamericano que te escribe, cómo pregunta y qué le preocupa, mejor que una agencia local que solo trabaja en inglés.",
      },
      {
        q: "¿Cuánto tarda en estar funcionando?",
        a: "La mayoría de las firmas quedan operando en 1 a 2 semanas.",
      },
      {
        q: "¿Y si no funciona?",
        a: "Tienes garantía: en 30 días ningún prospecto se queda sin respuesta, o seguimos trabajando sin costo hasta lograrlo.",
      },
      {
        q: "¿Es seguro con los datos de mis compradores?",
        a: "Sí. Tus datos y los de tus prospectos viajan cifrados y viven aislados en tus propias cuentas. Nunca se comparten ni se mezclan con nadie.",
      },
      {
        q: "¿Cuánto cuesta?",
        a: "Depende de qué piezas necesites, y el precio es cerrado: lo ves completo antes de decidir. Haz tu diagnóstico gratis (tarda 3 minutos y el resultado te llega al instante, con TUS números) o usa la calculadora de arriba para un estimado rápido.",
      },
    ],
  },

  sobre: {
    heading: "Quién está detrás",
    body: "Upcore AI arma la parte digital de las inmobiliarias: sitio, agenda en línea, WhatsApp, teléfono y panel. Nos especializamos en preventa del sur de Florida vendida a compradores latinoamericanos — conocemos cómo pregunta ese comprador y qué lo frena, y construimos a la medida de tus proyectos.",
    badges: [
      { icon: "IconLock", label: "Datos cifrados" },
      { icon: "IconShield", label: "Aislados en tus cuentas" },
      { icon: "IconChat", label: "WhatsApp en tu propio número" },
    ],
  },

  ctaFinal: {
    heading: "¿Listo para que ningún comprador se quede esperando?",
    sub: "Haz tu diagnóstico gratis: 3 minutos de preguntas y al instante ves por dónde se te está yendo la gente y cómo lo arreglamos — sin llamadas ni compromiso.",
    ctaAgenda: "Haz tu diagnóstico gratis",
    ctaWhatsapp: "Escríbenos por WhatsApp",
  },
};

// ────────────────────────────────────────────────────────────────────────────
// INGLÉS
//
// ⚠️ No es una traducción literal: es el mismo argumento contado como lo cuenta
// alguien que escribe marketing en inglés. Lo que NO cambia son los hechos, las
// cifras y las líneas rojas — un dato que solo aparece en un idioma es un dato
// que nadie revisó.
//
// ⚠️ El posicionamiento se conserva: seguimos siendo los que atienden al
// comprador latinoamericano EN ESPAÑOL. La versión en inglés existe porque el
// que firma es una empresa de EE.UU. y su equipo lee en inglés — no porque
// vendamos atención en inglés.
// ────────────────────────────────────────────────────────────────────────────
const EN: TextosSitio = {
  burbujaWa: {
    label: "Message us on WhatsApp",
    aria: "Message us on WhatsApp: our assistant replies right away",
  },
  chatWeb: {
    abrir: "Chat with us",
    cerrar: "Close the chat",
    titulo: "Upcore AI assistant",
    sub: "Replies right away, any time",
    bienvenida: "Tell us what brings you here. You'll get the same assistant that answers our WhatsApp; it's an AI, and it says so if you ask.",
    placeholder: "Type your message…",
    enviar: "Send",
    seguirWa: "Continue on WhatsApp",
    seguirWaCorto: "WhatsApp",
    pensando: "Typing…",
    privacidad: "What you write here is read by our assistant and the Upcore team, no one else.",
  },
  meta: {
    title: "Upcore AI | AI automation for real estate firms",
    description:
      "AI automation for South Florida preconstruction sales: it answers your WhatsApp and your phone around the clock, qualifies the buyer and books the visit.",
    keywords: [
      "real estate automation",
      "AI for real estate",
      "WhatsApp agent for real estate",
      "real estate lead follow-up",
      "real estate chatbot",
      "Miami preconstruction",
      "real estate voice agent",
      "real estate dashboard",
    ],
  },

  nav: {
    soluciones: "Solutions",
    precios: "Pricing",
    blog: "Blog",
    nosotros: "About",
    demoEnVivo: "Live demo",
    diagnosticoGratis: "Free assessment",
    inicio: "Upcore AI — home",
    abrirMenu: "Open menu",
    cerrarMenu: "Close menu",
    cta: "Get your assessment",
    otroIdioma: "ES",
    otroIdiomaAria: "Ver esta página en español",
  },

  footer: {
    soluciones: "Solutions",
    privacidad: "Privacy Policy",
    terminos: "Terms of Service",
    derechos: "© 2026 UPCORE AI. ALL RIGHTS RESERVED.",
  },

  cta: {
    cerrar: "Close",
    titulo: "Your free assessment — no calls",
    sub: "Answer a few questions and the result appears right away, using YOUR firm's numbers.",
    opciones: [
      {
        emoji: "⚡",
        titulo: "Run my assessment",
        sub: "Three minutes of questions and your assessment on the spot — nothing to schedule.",
        href: "/empezar",
      },
      {
        emoji: "🤖",
        titulo: "Try the chat agent",
        sub: "Chat with a demo of the assistant, as if you were your own buyer.",
        href: "/demo",
      },
      {
        emoji: "📞",
        titulo: "Try the voice agent",
        sub: "Talk to it through your microphone and hear how it would answer your phone.",
        href: "/soluciones/agente-de-voz-para-inmobiliarias#demo-voz",
      },
    ],
  },

  hero: {
    eyebrow: "AI automation for Miami real estate firms",
    title1: "No buyer left",
    title2: "unanswered.",
    subtitle:
      "Your buyer writes in Spanish, from another country, at any hour. We build the digital side that answers instantly, qualifies them and books the appointment — even while your team sleeps.",
    ctaPrimary: "Get your free assessment",
    ctaSecondary: "See what you can recover",
  },

  problemas: {
    heading: "Sound familiar?",
    sub: "Where a preconstruction sales operation loses people, week after week.",
    items: [
      {
        icon: "IconClock",
        title: "They write at 11 p.m., from Bogotá",
        body: "Your buyer is in another country and another time zone. By the time your team opens, they are already talking to a different project.",
      },
      {
        icon: "IconRefresh",
        title: "The lead goes cold and nobody notices",
        body: "The first contact does get handled. The second one, next week's and next month's do not. And that is exactly where the sale falls apart.",
      },
      {
        icon: "IconChat",
        title: "The conversation lives on the agent's phone",
        body: "If the agent leaves, the list leaves with them. And you have no way of knowing what was said to whom.",
      },
      {
        icon: "IconCalendar",
        title: "Preconstruction takes months",
        body: "One to two years pass between reservation and delivery. No team can hold that conversation by hand across hundreds of leads.",
      },
    ],
  },

  pasos: {
    heading: "How it works",
    sub: "Three steps, and you never have to learn anything technical.",
    items: [
      {
        n: "01",
        title: "Free assessment, right away",
        body: "Answer a few questions (here or on WhatsApp) and get your assessment on the spot: where you are losing people, using your numbers, and how we fix it.",
      },
      {
        n: "02",
        title: "We build it for you",
        body: "We set the assistant up on your WhatsApp, your phone line and the CRM you already use. You do not lift a finger.",
      },
      {
        n: "03",
        title: "Your team gets appointments, not messages",
        body: "The lead reaches your agent already qualified and with the appointment on the calendar. Their job goes back to selling.",
      },
    ],
  },

  sistema: {
    heading: "We build systems, not loose pieces",
    sub: "We put together the whole digital side of a real estate firm — a site with a page for every development, online booking, WhatsApp, phone and dashboard — and leave it running as one thing, built around your projects.",
    dashboard: {
      tag: "The center of it all",
      title: "Sales director's dashboard",
      body: "A simple dashboard where you see what happened with each lead, how each agent is doing and which project is pulling — without depending on anyone and without touching anything that could break the system.",
      // 🔴 Misma corrección que en español: lo que va incluido en la consola no se
      // puede listar aquí como si fuera parte de lo que se cobra.
      views: [
        "Every agent with their own login",
        "How each agent is doing",
        "Every buyer's path all the way to the sale",
        "Which development is pulling",
        "Your real return, not the estimate",
      ],
      ajustesTitle: "And the controls come included with every component — from your phone:",
      ajustes: [
        // 🔴 Misma línea roja que en español: nada de precios.
        "Which developments it offers and which it does not",
        "See every conversation and take over any chat",
        "Which agent gets the alert when someone asks for a person",
        "Your business hours",
        "Your follow-up messages, before they go out",
        "Switch it off with one tap",
      ],
    },
    items: [
      {
        icon: "IconChat",
        title: "AI agents",
        body: "They answer WhatsApp and the phone at any hour, in Spanish or English depending on the language they are addressed in, qualify the buyer and book the appointment.",
      },
      {
        icon: "IconRefresh",
        title: "Automatic follow-up",
        body: "Reminders for every payment milestone, construction progress updates, and re-engagement for whoever went quiet.",
      },
      {
        icon: "IconData",
        title: "AI knowledge base",
        // 🔴 Igual que en español: NO promete precios, disponibilidad ni fechas.
        body: "Your assistant answers with the real information about your projects: location, amenities and what the buying process looks like. Whatever moves on its own — pricing, availability and dates — it hands to your agent.",
      },
      {
        icon: "IconSparkle",
        title: "Smart websites",
        body: "Sites in Spanish and English with a page for each development, that qualify and book on their own.",
      },
      {
        icon: "IconChip",
        title: "A system built to fit",
        body: "We join everything into a single setup, wired into the CRM you already use.",
      },
    ],
  },

  demoTeaser: {
    heading: "Don't take our word for it. Try it.",
    sub: "Put yourself in your own buyer's shoes: write to the assistant or call it, ask for information, and see what your buyers would feel.",
    // ⚠️ Las burbujas se quedan en ESPAÑOL a propósito: la demo enseña cómo
    // atiende el asistente al comprador latinoamericano, que es el producto. Si
    // aquí saliera en inglés, el visitante entendería que vendemos atención en
    // inglés — justo lo contrario del posicionamiento.
    burbujas: [
      {
        de: "comprador",
        texto: "Hola, escribo desde Bogotá. ¿Todavía quedan unidades en el proyecto de Brickell?",
      },
      {
        de: "bot",
        texto:
          "¡Hola! 😊 Con gusto. La disponibilidad cambia a diario, así que se la confirma su asesor al detalle en una videollamada. Tengo: 1) jueves 10:00 a. m. 2) jueves 1:00 p. m. 3) viernes 4:30 p. m. — hora de Miami.",
      },
      { de: "comprador", texto: "La del jueves a las 10" },
      {
        de: "bot",
        texto:
          "Listo, quedó su videollamada el jueves a las 10:00 a. m., hora de Miami. Le mando recordatorio un día antes por aquí 🏙️",
      },
    ],
    chatTitulo: "Your firm's assistant",
    chatEstado: "online · replies in seconds",
    copyTitulo: "This is what not losing a single buyer feels like",
    // ⚠️ "both run in Spanish" era inexacto: el asistente contesta en el idioma
    // en que le escriban. Lo que se enseña arriba es la conversación en español
    // porque así escribe el comprador — pero el visitante puede probarlo en inglés.
    copyBody:
      "The assistant replies on the spot, answers questions and books the appointment — at 8 in the morning or 11 at night. And not only in writing: it answers the phone too. Both demos are interactive; the conversation above is in Spanish because that is how your buyers write, and it follows whatever language you use.",
    ctaChat: "💬 Write to it →",
    ctaVoz: "📞 Call it →",
    nota: "No sign-up. Both demos use made-up data.",
  },

  comparativa: {
    heading: "The 3 ways to cover your inbound",
    sub: "An honest comparison — because hiring someone or using a CRM with AI are real options too.",
    opciones: [
      {
        title: "Hire a sales assistant",
        sub: "The traditional answer",
        destacado: false,
        puntos: [
          { ok: true, texto: "A human touch from beginning to end" },
          {
            ok: false,
            texto: "Covers one shift only — and your buyer writes from another time zone",
          },
          { ok: false, texto: "Still gets swamped at peak hours" },
          { ok: false, texto: "Vacation, sick days and turnover" },
        ],
        costo: "One more salary a month, per shift",
      },
      {
        title: "A real estate CRM “with AI”",
        sub: "The all-in-one platforms",
        destacado: false,
        puntos: [
          { ok: true, texto: "Organizes your leads, your pipeline and your reporting" },
          { ok: true, texto: "Template-based reminders" },
          { ok: false, texto: "Its AI scores and sorts leads — it does not talk to them" },
          { ok: false, texto: "The chat is answered by your team, by hand" },
          { ok: false, texto: "You move onto THEIR platform, with modules billed separately" },
        ],
        costo: "Monthly fee per seat + modules on top",
      },
      {
        title: "Upcore's AI agent",
        sub: "The layer that answers",
        destacado: true,
        puntos: [
          { ok: true, texto: "Answers instantly, 24/7, Sundays included" },
          { ok: true, texto: "Actually converses: it understands natural language" },
          { ok: true, texto: "Books on its own, on YOUR real calendar" },
          { ok: true, texto: "Plugs into what you already use — your CRM included" },
          { ok: true, texto: "Everything stays in your name, whether you run it or we do" },
        ],
        costo: "Fixed price: free assessment in 3 min",
      },
    ],
    cierre:
      "It is not “one or the other”: the agent gets along with your team and with your software — it is the layer that answers when they cannot.",
    cierreEnlace: "Try it yourself in the demo →",
  },

  resultados: {
    heading: "What you can expect",
    sub: "Real estate industry estimates, not one isolated case. They vary with the product you choose (an agent, a website or the full system) and with how you operate.",
    stats: [
      { value: "7×", label: "more likely to qualify a lead if you reply within the hour" },
      { value: "60–70%", label: "of leads are lost today to late follow-up" },
      { value: "86%", label: "of Miami's foreign buyers are Latin American" },
      { value: "24/7", label: "coverage in Spanish, on their schedule" },
    ],
    disclaimer:
      "* Industry figures, not a guarantee of individual results. They change with the product (agent, website or full system) and with how you operate. Your own estimate comes from the calculator above and from your free assessment, run on YOUR numbers.",
  },

  garantia: {
    heading: "Results guarantee",
    body: "Within 30 days no lead of yours goes unanswered, whatever hour they write and in their own language — or we keep working at no cost until that is true.",
    note: "No fine print.",
  },

  planes: {
    heading: "Two ways to work together",
    sub: "There is exactly one difference: do you want to run it yourself, or would you rather we run and maintain it for you? Everything else is the same, and everything stays in your name.",
    items: [
      {
        name: "Turnkey",
        tagline: "You run it.",
        pago: "One-time payment",
        desc: "We build it and hand it over with training and a walkthrough video. From there you (or your team) run it.",
        incluye: ["Full build", "Training + guide", "No monthly fee"],
        destacado: false,
      },
      {
        name: "Managed",
        tagline: "We run it.",
        pago: "Monthly (with or without an upfront build)",
        desc: "We build it and we run, maintain and improve it for you — for as long as you want. You worry about nothing.",
        incluye: [
          "Everything in Turnkey",
          "Operation and maintenance",
          "Improvements and priority support",
        ],
        destacado: true,
      },
    ],
    recomendado: "Recommended",
    nota: "Under both plans everything is yours: your accounts, your hosting, your APIs and tokens are all in your name. And you do not have to open a single one — we create them with your details and hand them over at closing.",
    precioNota: "Fixed price based on the pieces you choose",
    cta: "Get your assessment",
  },

  faq: {
    heading: "Frequently asked questions",
    items: [
      {
        q: "Does it replace my agents?",
        a: "No — quite the opposite: the lead reaches them already qualified and with the appointment booked, so their time goes into selling instead of answering the same question fifty times. What the assistant covers is what nobody gets to today: the middle of the night, the weekend, and the follow-up in month four.",
      },
      {
        q: "Does it work with the CRM we already use?",
        a: "Yes, and that is the point. We do not ask you to switch systems: we integrate with the one you have so your data keeps living where it lives today. If you do not use one, we set up the dashboard — but it is offered, never imposed.",
      },
      {
        q: "What if a development is already sold out? Will it keep offering it?",
        a: "No. You mark that development as paused and from then on the assistant stops mentioning it and stops booking tours for it; anyone who asks gets handed to your agent. What it never does — not even for active developments — is state how many units are left or what they cost, because that changes by line, floor and phase. It is deliberate: a figure like that, in writing, turns into a complaint.",
      },
      {
        q: "What if the buyer wants to talk to a person?",
        a: "It hands them over, no argument. It does not push back or try to keep them with the bot: it takes their name and phone number, alerts your team on the spot, and tells the buyer who will call them and when. You decide who gets that alert and how.",
      },
      {
        q: "Does it handle English too?",
        a: "Yes, and not just the chat: everything we hand over comes in both languages. The WhatsApp agent detects the language it is written in — Spanish, English or Portuguese — and replies in kind. The voice agent picks up when it is spoken to in English and switches mid-call. And your site and your dashboard are delivered in Spanish and English. Spanish is where it is most finely tuned, because that is where most of Miami's preconstruction demand comes from.",
      },
      {
        q: "Where are you based?",
        a: "We operate out of Mexico and work fully remote, in the same time band as Florida. We say so up front because it is part of why this works: we understand the Latin American buyer writing to you — how they ask and what worries them — better than a local agency that only works in English.",
      },
      {
        q: "How long until it is running?",
        a: "Most firms are up and running in one to two weeks.",
      },
      {
        q: "And if it does not work?",
        a: "You have a guarantee: within 30 days no lead goes unanswered, or we keep working at no cost until that is true.",
      },
      {
        q: "Is it safe with my buyers' data?",
        a: "Yes. Your data and your leads' data travel encrypted and live isolated in your own accounts. It is never shared and never mixed with anyone else's.",
      },
      {
        q: "How much does it cost?",
        a: "It depends on which pieces you need, and the price is fixed: you see it in full before deciding. Run your free assessment (three minutes, and the result arrives on the spot with YOUR numbers) or use the calculator above for a quick estimate.",
      },
    ],
  },

  sobre: {
    heading: "Who is behind this",
    body: "Upcore AI builds the digital side of real estate firms: site, online booking, WhatsApp, phone and dashboard. We specialize in South Florida preconstruction sold to Latin American buyers — we know how that buyer asks and what holds them back, and we build around your projects.",
    badges: [
      { icon: "IconLock", label: "Encrypted data" },
      { icon: "IconShield", label: "Isolated in your accounts" },
      { icon: "IconChat", label: "WhatsApp on your own number" },
    ],
  },

  ctaFinal: {
    heading: "Ready to stop leaving buyers waiting?",
    sub: "Run your free assessment: three minutes of questions and you see right away where you are losing people and how we fix it — no calls, no commitment.",
    ctaAgenda: "Get your free assessment",
    ctaWhatsapp: "Message us on WhatsApp",
  },
};

export const TS: Record<Idioma, TextosSitio> = { es: ES, en: EN };

/** El texto del sitio en el idioma pedido. */
export const contenido = (idioma: Idioma): TextosSitio => TS[idioma];
