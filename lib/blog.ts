// ============================================================================
// BLOG (SEO) — Upcore AI
// Cada objeto es un artículo en /blog/[slug]. Edita el texto aquí.
// Para agregar un artículo: copia un bloque, cambia slug/fechas/texto.
// El sitemap, el índice /blog y el enlace del menú se actualizan solos.
// ============================================================================

export type SeccionArticulo = {
  h2: string;
  parrafos: string[];
  /** Bullets opcionales que van después de los párrafos */
  lista?: string[];
};

export type Articulo = {
  slug: string;
  /** Título SEO SIN "| Upcore AI" — el layout agrega la marca */
  title: string;
  metaDescription: string;
  h1: string;
  /** Entradilla: se muestra en el índice y bajo el h1 */
  resumen: string;
  /** ISO "2026-07-22" — alimenta JSON-LD y sitemap (solo fechas reales) */
  fechaPublicado: string;
  fechaActualizado?: string;
  secciones: SeccionArticulo[];
  faqs?: { q: string; a: string }[];
  /** Slugs de lib/soluciones.ts → enlaces internos al final del artículo */
  solucionesRelacionadas?: string[];
};

export const ARTICULOS: Articulo[] = [
  {
    slug: "cuanto-cuesta-chatbot-whatsapp-clinica-mexico",
    title: "¿Cuánto cuesta un chatbot de WhatsApp para una clínica en México? (guía 2026)",
    metaDescription:
      "Precios reales 2026: lo que cobran agencias y software en México por un chatbot de WhatsApp para clínicas, los costos ocultos de las APIs y las preguntas para detectar letra chica.",
    h1: "¿Cuánto cuesta un chatbot de WhatsApp para una clínica en México?",
    resumen:
      "La mayoría de los proveedores te hace 'solicitar cotización' para averiguarlo. Aquí va la respuesta con números reales del mercado 2026: cuánto se cobra, qué modelos de pago existen, cuánto cuestan las APIs que casi nadie menciona — y las preguntas para que no te agarren con letra chica.",
    fechaPublicado: "2026-07-22",
    secciones: [
      {
        h2: "La respuesta corta: de $12,000 MXN a mucho más — y por qué",
        parrafos: [
          "En México, en 2026, un chatbot de WhatsApp para una clínica se mueve en estos rangos reales de mercado:",
        ],
        lista: [
          "Bot básico de agencia (responde preguntas frecuentes): desde $12,000–15,000 MXN, pago único.",
          "Bot con agenda (además agenda citas y califica pacientes): $20,000–36,000 MXN, pago único.",
          "Modelo de renta mensual: $1,600 a $4,500 MXN al mes, normalmente con el costo de construcción 'escondido' dentro de la mensualidad — si dejas de pagar, te quedas sin nada.",
          "Software de gestión con WhatsApp incluido: $1,400–5,500 MXN al mes… pero su WhatsApp suele ser de plantillas (recordatorios), no un bot que conversa, y varios cobran el módulo aparte.",
          "Sistema completo a la medida (agente + automatizaciones + panel): $90,000–180,000 MXN. Una pieza suelta cuesta 3 a 6 veces menos que el sistema completo.",
        ],
      },
      {
        h2: "Los 3 modelos de cobro que te vas a topar",
        parrafos: [
          "Detrás de cualquier cotización hay uno de estos tres modelos, y conviene reconocerlos porque cambian totalmente lo que acabas pagando a 2 años:",
          "1) Renta mensual (SaaS). Pagas poco para entrar y para siempre. A $3,000 MXN al mes, en 2 años llevas $72,000 — y el bot nunca es tuyo: si te vas, se apaga. Es el modelo favorito del mercado porque asegura ingreso recurrente al proveedor.",
          "2) Proyecto de pago único. Pagas la construcción una vez y el sistema queda a tu nombre. Cuesta más al inicio, pero a mediano plazo suele ser lo más barato, y no quedas amarrado a nadie. Casi nadie lo ofrece en México — pregunta por él.",
          "3) Híbrido: construcción + mensualidad de operación. Pagas el proyecto y, si quieres, una mensualidad para que el proveedor lo opere, mantenga y mejore por ti. La clave honesta aquí: la mensualidad debe pagar el SERVICIO de operación, no 'la renta del bot'.",
        ],
      },
      {
        h2: "Los costos que casi nadie te dice: las APIs",
        parrafos: [
          "Todo chatbot serio corre sobre dos servicios que cobran por consumo, y es dinero aparte del proyecto. Un proveedor honesto te los pone sobre la mesa desde el día uno:",
        ],
        lista: [
          "WhatsApp (Meta): responder a un paciente que te escribió es gratis dentro de una ventana de 24 horas. Solo cuestan los mensajes que TÚ inicias con plantillas (recordatorios, campañas): del orden de centavos — unos $0.10 a $0.55 MXN por mensaje según el tipo. Para una clínica chica, esto suele ser de $0 a unos cientos de pesos al mes.",
          "Inteligencia artificial (el 'cerebro'): se paga por uso al proveedor del modelo. En una clínica típica: entre $40 y $800 MXN al mes según el volumen de conversaciones.",
          "Hosting (donde vive la automatización): de $0 (planes gratuitos serios) a unos $110–220 MXN al mes si el proyecto necesita servidor propio.",
          "La práctica sana: que esas cuentas estén A TU NOMBRE, con tope de gasto activado, y que tú veas el consumo real. Si el proveedor 'te lo incluye', pregunta cuánto le está ganando a tu consumo.",
        ],
      },
      {
        h2: "El otro precio: lo que cuesta NO tener quien conteste",
        parrafos: [
          "El precio del chatbot solo tiene sentido comparado contra lo que hoy se te va. Haz esta cuenta rápida: si tu ticket promedio es de $1,000 MXN y a la semana se te escapan aunque sea 2 pacientes que preguntaron y nadie les contestó a tiempo, son unos $8,000 MXN al mes — casi $100,000 al año — yéndose con la clínica de enfrente.",
          "Con esa referencia, un bot de $20,000–30,000 pago único se paga solo en 3 o 4 meses. Y uno rentado 'barato' a $3,000/mes también se justifica… mientras recuerdes que a los 2 años pagaste más del doble y no es tuyo.",
        ],
      },
      {
        h2: "5 preguntas para detectar la letra chica",
        parrafos: [
          "Antes de firmar con cualquier proveedor (incluidos nosotros), haz estas preguntas. Las respuestas te dicen todo:",
        ],
        lista: [
          "¿La implementación y la capacitación van incluidas, o son un cargo aparte? (Hay quien cobra $3,900–8,500 MXN extra de 'puesta en marcha'.)",
          "¿Cobran por usuario o por sucursal? (Los 'por usuario' se inflan callados conforme creces.)",
          "¿El WhatsApp conversa de verdad o solo manda plantillas? Pide chatear TÚ con un demo antes de decidir.",
          "¿De quién son las cuentas — el número, las APIs, los datos? Si la respuesta es 'del proveedor', el día que te vayas pierdes todo.",
          "¿Qué pasa exactamente si me quiero ir en 12 meses? La respuesta honesta debería ser: 'te quedas con todo funcionando'.",
        ],
      },
      {
        h2: "Cómo lo hacemos en Upcore (para que compares)",
        parrafos: [
          "En Upcore AI no publicamos una tabla de precios porque sería mentirte: no cuesta lo mismo un consultorio de un doctor que una clínica de cinco sillones. Lo que sí hacemos es darte tu precio exacto GRATIS y al instante: contestas unas preguntas (3 minutos, por la web o por WhatsApp) y tu diagnóstico llega con los números de TU clínica — cuánto pierdes hoy, qué te conviene construir y cuánto cuesta, en pago único o con nosotros operándolo.",
          "Las APIs siempre quedan a tu nombre con tope de gasto, la implementación va incluida, no cobramos por usuario, y todo lo construido es tuyo — te quedes con nosotros o no.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿No hay chatbots gratis?",
        a: "Los hay genéricos y 'hazlo tú mismo'. El costo real es tu tiempo y el riesgo: un bot mal configurado contestando mal a pacientes reales sale más caro que cualquier proveedor. Para uso médico/estético, la calidad de las respuestas no es negociable.",
      },
      {
        q: "¿Necesito la API oficial de WhatsApp o sirve una app 'pirata'?",
        a: "API oficial, siempre. Las conexiones no oficiales ponen tu número en riesgo de bloqueo — y el número de tu clínica, con años de pacientes, no es algo que quieras apostar.",
      },
      {
        q: "¿Cuánto cuesta el chatbot de Upcore AI?",
        a: "Depende de tu clínica — por eso el diagnóstico gratis te da tu número exacto en 3 minutos, sin llamada y sin compromiso. Como referencia honesta: nos movemos dentro de los rangos de mercado de esta guía.",
      },
      {
        q: "¿La renta mensual es siempre mala idea?",
        a: "No. Si prefieres no desembolsar de golpe y quieres que alguien lo opere por ti, una mensualidad honesta (que pague servicio de operación, no 'renta del bot') es una gran opción. Lo importante es que la propiedad sea tuya en cualquier caso.",
      },
    ],
    solucionesRelacionadas: [
      "chatbot-whatsapp-para-clinicas",
      "reducir-no-shows-clinica",
    ],
  },
  {
    slug: "software-clinica-ia-notas-vs-atencion",
    title: "¿Tu software de clínica ya 'tiene IA'? Notas médicas no es lo mismo que atención al paciente",
    metaDescription:
      "Los software de gestión presumen IA, pero casi siempre es dictado y resumen de notas para el médico. Aprende a distinguir la IA que documenta de la IA que atiende, con un test de 5 preguntas.",
    h1: "¿Tu software de clínica ya “tiene IA”? Hay dos IA distintas — y te falta una",
    resumen:
      "Casi todos los software de gestión de clínicas anuncian inteligencia artificial. Es cierto… a medias: su IA le escribe las notas al médico. La que contesta el WhatsApp, califica al paciente y agenda a las 11 de la noche es OTRA tecnología — y es la que llena agendas. Aquí aprendes a distinguirlas en 5 preguntas.",
    fechaPublicado: "2026-07-22",
    secciones: [
      {
        h2: "Las dos IA que puede tener una clínica",
        parrafos: [
          "Cuando un software dice 'ahora con IA', hay que preguntar: ¿IA hacia adentro o hacia afuera?",
          "IA hacia adentro (documentación): trabaja PARA el médico. Transcribe la consulta por voz, da formato a la nota clínica, resume el expediente. Ahorra tiempo de tecleo — muy útil, cero discusión.",
          "IA hacia afuera (atención): trabaja PARA el paciente. Contesta el WhatsApp al instante, resuelve dudas de precios y servicios, agenda en el calendario real, confirma citas y sabe cuándo pasar la conversación a una persona. Esta es la que convierte mensajes en citas.",
          "El problema: el mercado vende la primera con el lenguaje de la segunda. Y una clínica que compra 'software con IA' esperando que le llenen la agenda, descubre meses después que su IA solo escribe notas.",
        ],
      },
      {
        h2: "Qué hace (de verdad) la IA de los software de gestión",
        parrafos: [
          "Revisamos a fondo qué ofrecen las plataformas de gestión más conocidas que se venden en México y España. El patrón se repite:",
        ],
        lista: [
          "Dictado por voz a texto de la consulta y formato automático de notas clínicas.",
          "Resúmenes automáticos del historial del paciente.",
          "Formularios médicos que se llenan solos.",
          "Recordatorios de cita por WhatsApp de plantilla: mensajes salientes de una vía, con botones de confirmar/cancelar en el mejor de los casos.",
          "Chat de WhatsApp 'integrado'… que contesta UNA PERSONA de tu equipo, manualmente.",
        ],
      },
      {
        h2: "Por qué los recordatorios de plantilla no son conversación",
        parrafos: [
          "Un recordatorio de plantilla avisa: 'Su cita es mañana a las 10:00. Responda 1 para confirmar'. Eso reduce olvidos y está muy bien — pero mira lo que pasa cuando el paciente responde cualquier cosa fuera del guion: '¿puedo mejor el jueves?', '¿cuánto cuesta agregar una limpieza?', '¿atienden a mi hijo de 8 años?'.",
          "Silencio. O un '1' que no aplica. La plantilla no entiende lenguaje natural; solo dispara mensajes predefinidos. Cada una de esas respuestas sin atender es una cita que se enfría.",
          "Un agente conversacional de verdad entiende la pregunta, la responde con la información real de tu clínica, reagenda ahí mismo si el paciente lo pide, y escala con tu equipo cuando el tema lo amerita.",
        ],
      },
      {
        h2: "El test de las 5 preguntas",
        parrafos: [
          "¿Quieres saber en 2 minutos si algo 'con IA' de verdad atiende pacientes? Hazle estas 5 preguntas al proveedor (o mejor: pide un demo y pruébalas tú):",
        ],
        lista: [
          "Si un paciente NUEVO escribe a las 11 de la noche '¿cuánto cuesta una valoración y cuándo tienen lugar?', ¿recibe respuesta útil al instante?",
          "¿Entiende mensajes con lenguaje natural ('me duele una muela desde ayer, ¿me pueden ver hoy?') o solo botones y números?",
          "¿Puede agendar SOLO, viendo los horarios reales del calendario, sin que intervenga tu recepción?",
          "¿Sabe cuándo NO contestar y pasar la conversación a un humano (casos delicados, quejas, temas médicos)?",
          "¿Responde con TU información — precios, servicios, indicaciones — o con respuestas genéricas?",
        ],
      },
      {
        h2: "No es 'una u otra': son complementarias",
        parrafos: [
          "Aquí viene lo importante: no tienes que tirar tu software de gestión. Si ya usas uno para expediente, agenda y facturación, está haciendo su trabajo — y su IA de notas le ahorra tiempo real a tus médicos.",
          "Lo que te falta es la capa de ATENCIÓN: el agente que está despierto cuando tu recepción no, y que convierte los mensajes en citas dentro de tu misma agenda. La arquitectura sana es: tu software sigue siendo el registro (ahí viven expedientes y citas), y el agente conversacional se conecta ENCIMA — lee tu calendario, agenda, confirma y da seguimiento.",
          "Por eso en Upcore AI el principio es 'integrar, no migrar': construimos el agente sobre lo que tu clínica ya usa. Tus datos no se mueven; tu forma de trabajar no cambia; tu WhatsApp empieza a contestar solo.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Entonces la IA de mi software de gestión no sirve?",
        a: "Sí sirve — para lo que fue hecha: ahorrarle tecleo al médico (notas, resúmenes, formularios). Lo que no hace es atender pacientes. Son dos tecnologías distintas con el mismo apellido.",
      },
      {
        q: "¿Tengo que cambiar de software para tener un agente de IA?",
        a: "No. Un agente bien construido se integra a lo que ya usas: tu calendario, tu software de agenda, tu hoja de cálculo. Si un proveedor te obliga a migrar todo a su plataforma para 'darte IA', esa es una bandera roja.",
      },
      {
        q: "¿El agente puede dar consejo médico?",
        a: "No debe. Un agente serio informa (precios, horarios, indicaciones generales, preparación para una cita) y agenda; los diagnósticos y valoraciones clínicas se quedan siempre en manos del médico. Esos límites se configuran desde el día uno.",
      },
      {
        q: "¿Cómo pruebo la diferencia sin comprar nada?",
        a: "Chatea con un agente real. Nuestra demo es pública: entra a upcoreai.com/demo, juega a ser tu paciente y hazle las 5 preguntas del test. Así se siente la IA 'hacia afuera'.",
      },
    ],
    solucionesRelacionadas: [
      "chatbot-whatsapp-para-clinicas",
      "recepcionista-virtual-clinica",
    ],
  },
  {
    slug: "whatsapp-business-api-clinicas-guia",
    title: "WhatsApp Business API para clínicas: la guía simple (número, costos de Meta y ventana de 24 horas)",
    metaDescription:
      "Qué es la API oficial de WhatsApp y cómo la usa una clínica: diferencias con la app, la ventana de 24 horas, cuánto cobra Meta por mensaje y los errores que ponen tu número en riesgo.",
    h1: "WhatsApp Business API para clínicas: la guía simple, sin tecnicismos",
    resumen:
      "Si tu clínica quiere un asistente que conteste solo, tarde o temprano aparecen las palabras 'API oficial de WhatsApp'. Esta guía te explica en cristiano qué es, en qué se diferencia del WhatsApp normal, cuánto cobra Meta de verdad, qué es la famosa ventana de 24 horas — y qué errores pueden costarte el número de tu clínica.",
    fechaPublicado: "2026-07-22",
    secciones: [
      {
        h2: "Los 3 WhatsApp que existen (y cuál es para qué)",
        parrafos: [
          "Aunque para el paciente todo 'es WhatsApp', del lado del negocio hay tres productos distintos:",
        ],
        lista: [
          "WhatsApp normal (el de tu teléfono personal): para tu vida. Usarlo como canal oficial de la clínica mezcla lo personal con el negocio y no permite automatizar nada.",
          "WhatsApp Business app (la app gratuita de negocio): agrega catálogo, respuestas rápidas y etiquetas. Sigue siendo 100% manual — una persona contesta desde un teléfono. Perfecto para empezar; insuficiente cuando el volumen crece.",
          "WhatsApp Business API (también llamada 'Platform'): el número vive en la nube, conectado a sistemas. Aquí es donde un agente de IA puede contestar 24/7, varias personas pueden atender a la vez, y todo se integra con tu agenda. No tiene app: se maneja desde paneles y sistemas.",
        ],
      },
      {
        h2: "Qué gana tu clínica al pasar a la API",
        parrafos: [
          "La API no es 'un WhatsApp más caro'; es otra categoría de herramienta:",
        ],
        lista: [
          "Un asistente con IA puede responder al instante, a cualquier hora — la app normal no permite conectar nada así de forma segura.",
          "El número se verifica ante Meta a nombre de tu negocio (aparece el nombre de tu clínica, no solo un teléfono).",
          "Tu equipo completo puede atender desde una bandeja compartida, con historial ordenado.",
          "Se conecta con tu calendario y tus sistemas: las citas que el asistente agenda caen en TU agenda real.",
          "Los recordatorios y confirmaciones salen solos, desde tu número, con reglas claras de Meta.",
        ],
      },
      {
        h2: "La ventana de 24 horas y las plantillas, en cristiano",
        parrafos: [
          "Es la regla de oro de los costos en la API, y entendida bien te ahorra dinero:",
          "Cuando un PACIENTE te escribe, se abre una 'ventana' de 24 horas. Dentro de esa ventana, tu clínica (o tu asistente de IA) puede responderle lo que sea, gratis — texto libre, sin plantillas. Cada nuevo mensaje del paciente reinicia el reloj.",
          "Cuando TÚ quieres iniciar la conversación (un recordatorio de cita, un aviso), fuera de esa ventana, necesitas una 'plantilla': un mensaje pre-aprobado por Meta, con costo por envío. Los de servicio/utilidad (recordatorios, confirmaciones) cuestan del orden de centavos por mensaje; los de marketing cuestan más y se usan con cuidado.",
          "Traducción práctica para una clínica: atender pacientes que te escriben es gratis. Lo que cuesta (poco) es el flujo proactivo — recordatorios y avisos — que es justo el que te reduce los no-shows. El balance sale absurdamente a favor.",
        ],
      },
      {
        h2: "Los errores que ponen tu número en riesgo",
        parrafos: [
          "El número de WhatsApp de una clínica — con años de pacientes que lo conocen — es un activo. Estos errores lo ponen en riesgo:",
        ],
        lista: [
          "Conectarlo a apps o APIs 'no oficiales' (las que piden escanear un QR desde un servidor pirata). Meta las detecta y puede restringir o bloquear el número. Si un proveedor te propone esa vía 'porque es más barata', corre.",
          "Mandar mensajes en frío a números comprados o listas masivas. Además de las quejas, dispara los filtros de spam de WhatsApp.",
          "Vincular y desvincular el número repetidamente entre dispositivos y servicios en poco tiempo.",
          "No decidir con calma QUÉ número conectar: al pasar un número a la API, sale de la app del teléfono (deja de usarse ahí). Es lo correcto para el canal oficial de la clínica — pero hay que decidirlo sabiendo, no descubrirlo después.",
        ],
      },
      {
        h2: "Qué necesitas para arrancar (checklist)",
        parrafos: [
          "Para conectar una clínica a la API oficial hacen falta cuatro cosas:",
        ],
        lista: [
          "Un número para el canal oficial: idealmente el que tus pacientes ya conocen (sabiendo que sale de la app), o uno nuevo dedicado si prefieres conservar el actual en el teléfono.",
          "Una cuenta de Meta Business del DUEÑO real del negocio — con su cuenta personal de Facebook con historia. Las cuentas recién creadas despiertan revisiones de Meta.",
          "El sistema que va a contestar: el agente de IA, la bandeja del equipo, la conexión con tu agenda. Aquí entra tu proveedor.",
          "Una regla de propiedad: los activos (el portafolio de Meta, el número, las APIs) se crean A NOMBRE DE LA CLÍNICA, con el proveedor como colaborador con acceso acotado. Si alguien quiere crearlos a su nombre 'para hacértelo fácil', ese proveedor te está amarrando.",
        ],
      },
      {
        h2: "Cómo lo hacemos en Upcore",
        parrafos: [
          "En Upcore AI conectamos clínicas a la API oficial con la regla de propiedad completa: el portafolio de Meta se crea con la cuenta del dueño (nosotros te dictamos cada clic, tú los das), el número y las APIs quedan a tu nombre con topes de gasto, y el agente que contesta se construye con la información y el tono de tu clínica. Puedes probar cómo se siente en la demo pública, y tu diagnóstico gratis te dice exactamente qué necesita tu caso — incluyendo la decisión del número.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Puedo usar el número actual de mi clínica?",
        a: "Sí, y suele ser lo mejor (tus pacientes ya lo conocen). El detalle importante: al conectarlo a la API sale de la app del teléfono, y tu equipo pasa a responder desde una bandeja/panel. Si no quieren soltar la app, se usa un número nuevo dedicado para el canal oficial.",
      },
      {
        q: "¿Cuánto cobra Meta por usar la API?",
        a: "Responder a pacientes que te escriben es gratis (ventana de 24 horas). Los mensajes que tú inicias con plantilla cuestan del orden de centavos (los de servicio) — en una clínica chica el gasto mensual con Meta suele ir de $0 a unos cientos de pesos. Las tarifas cambian por trimestre; un buen proveedor te muestra el rate card vigente.",
      },
      {
        q: "¿Me pueden bloquear el número?",
        a: "Con la API oficial, buenas prácticas y mensajes a pacientes reales, el riesgo es mínimo — es la vía que Meta diseñó para negocios. Lo peligroso es lo contrario: las conexiones piratas y el spam en frío.",
      },
      {
        q: "¿La API tiene app para mi teléfono?",
        a: "No. El número vive en la nube y se atiende desde paneles (la bandeja de tu equipo). Esa es justo la gracia: deja de depender de UN teléfono y una persona.",
      },
    ],
    solucionesRelacionadas: [
      "chatbot-whatsapp-para-clinicas",
      "automatizacion-clinicas-dentales",
    ],
  },
  {
    slug: "pacientes-perdidos-whatsapp-clinica-calculo",
    title: "¿Cuántos pacientes pierde tu clínica por no contestar WhatsApp? Cálculo paso a paso",
    metaDescription:
      "Un método de 4 pasos para calcular cuántas citas y cuánto dinero pierde tu clínica por mensajes de WhatsApp sin responder — con un ejemplo trabajado y las 3 formas de tapar la fuga.",
    h1: "¿Cuántos pacientes pierde tu clínica por no contestar WhatsApp? Hagamos la cuenta",
    resumen:
      "No es una pregunta retórica: se puede calcular. Aquí va el método de 4 pasos con un ejemplo trabajado, los números típicos del sector para que compares, y las tres formas (de gratis a automática) de tapar la fuga.",
    fechaPublicado: "2026-07-22",
    secciones: [
      {
        h2: "Por qué un mensaje sin contestar es una cita perdida",
        parrafos: [
          "El paciente que escribe a una clínica casi nunca escribe solo a una: está comparando 3 o 4 al mismo tiempo, con el teléfono en la mano y la decisión fresca. La primera que le contesta bien suele quedarse con la cita — no necesariamente la mejor clínica, ni la más barata: la que contestó.",
          "Y los mensajes no llegan en horario de oficina: una parte enorme cae en la noche, en fin de semana, o justo cuando tu recepción está con un paciente enfrente. Alrededor del 40% de los mensajes a una clínica llegan cuando nadie puede contestar. Ahí está la fuga.",
        ],
      },
      {
        h2: "El cálculo en 4 pasos",
        parrafos: [
          "Toma papel (o abre tu WhatsApp Business y revisa una semana real) y sigue estos pasos:",
        ],
        lista: [
          "Paso 1 — Cuenta tus conversaciones NUEVAS por semana: personas distintas que escribieron preguntando algo (no tus pacientes de siempre confirmando). Ejemplo: 30.",
          "Paso 2 — ¿Cuántas recibieron respuesta tarde (más de 1 hora) o nunca? Cuenta las de fuera de horario y las de horas pico. Ejemplo honesto: 12 de las 30 (40%).",
          "Paso 3 — ¿Cuántas de esas venían a agendar? En clínicas, entre el 30% y el 50% de los mensajes nuevos preguntan por cita, precio o disponibilidad — es intención real. Ejemplo conservador: 40% de 12 ≈ 5 por semana.",
          "Paso 4 — ¿Cuántas se pierden y cuánto valen? No todas se van con otro; asume que pierdes la mitad: 2–3 citas por semana. Con un ticket promedio de $1,000 MXN son $8,000–12,000 MXN al mes. Al año: más de $100,000.",
        ],
      },
      {
        h2: "Ajusta el número a TU clínica",
        parrafos: [
          "El ejemplo usa números conservadores de un consultorio chico. Mueve las palancas según tu caso:",
        ],
        lista: [
          "Ticket promedio: en dental y estética el rango típico en México va de $800 a $3,000 MXN por cita — y en tratamientos completos, mucho más. Con ticket de $2,000, la misma fuga vale el doble.",
          "Volumen: si recibes 60 conversaciones nuevas por semana, duplica todo.",
          "Velocidad actual: si hoy contestas en minutos dentro de horario, tu fuga está casi toda en noches y fines de semana — cuenta solo esas.",
          "Ojo: esta cuenta NO incluye los no-shows (pacientes que agendaron y no llegaron). Esa es otra fuga, con su propio arreglo — la tratamos en nuestro caso de ejemplo con ROI.",
        ],
      },
      {
        h2: "Las 3 formas de tapar la fuga (de gratis a automática)",
        parrafos: [
          "No todas las clínicas necesitan lo mismo. Estas son las tres soluciones reales, en orden de inversión:",
          "Nivel 1 — Protocolo humano (gratis): define que TODO mensaje se contesta en menos de 15 minutos en horario de clínica, con turnos claros de quién atiende el WhatsApp. Tapa la fuga de horas pico; no puede tapar la de noches y domingos, y depende de la disciplina del equipo.",
          "Nivel 2 — WhatsApp Business app bien usada (gratis): respuestas rápidas para las 10 preguntas de siempre, mensaje de ausencia con expectativa clara ('te contestamos mañana a las 9') y etiquetas para no perder pendientes. Mejora la experiencia; sigue siendo manual y el mensaje de ausencia no agenda a nadie.",
          "Nivel 3 — Agente de IA 24/7: un asistente que contesta al instante a cualquier hora, con la información real de tu clínica, agenda en tu calendario y pasa a tu equipo lo delicado. Es el único nivel que tapa la fuga completa — incluida la mitad de los mensajes que llegan cuando tu clínica duerme.",
        ],
      },
      {
        h2: "Hazlo con tus números reales (gratis)",
        parrafos: [
          "Si quieres la versión sin papel: nuestro diagnóstico gratis hace exactamente esta cuenta con los números de TU clínica — volumen, ticket, citas que se caen — y te la entrega al instante, con la recomendación honesta de qué nivel te conviene (aunque la respuesta sea 'por ahora, con el protocolo humano te alcanza').",
          "Son 3 minutos de preguntas, por la web o directo por WhatsApp, sin llamadas y sin compromiso. Y si quieres sentir cómo contesta un agente de verdad, la demo es pública: juega a ser tu propio paciente.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿De dónde sale el dato del 40% fuera de horario?",
        a: "Es el patrón típico del sector servicios en WhatsApp: los mensajes se concentran en la noche (cuando la gente por fin tiene tiempo) y los fines de semana. Tu número real puede variar — por eso el método te pide medir UNA semana de tu propio WhatsApp antes que creer promedios ajenos.",
      },
      {
        q: "¿Y si yo mismo contesto rápido a todas horas?",
        a: "Mientras puedas sostenerlo, funciona — muchos dueños lo hacen años. El costo es invisible: tus noches, tus domingos, y que el día que no puedas (vacaciones, consulta llena), la fuga regresa. La automatización no te reemplaza; te devuelve esas horas.",
      },
      {
        q: "¿Esto aplica para una clínica chica con pocos mensajes?",
        a: "Aplica más: con 10 conversaciones nuevas por semana, cada una vale proporcionalmente más. Perder 1 cita semanal de $1,500 son $6,000 al mes — para un consultorio chico, eso es la renta.",
      },
      {
        q: "¿El agente de IA no espanta a los pacientes?",
        a: "Uno malo, sí. Uno bien hecho responde natural, con la información y el tono de tu clínica, y pasa a tu equipo en cuanto hace falta — la mayoría de los pacientes solo nota que POR FIN le contestaron al momento. Pruébalo tú mismo en la demo y saca tu conclusión.",
      },
    ],
    solucionesRelacionadas: [
      "reducir-no-shows-clinica",
      "recepcionista-virtual-clinica",
    ],
  },
];

export const HAY_BLOG = ARTICULOS.length > 0;

export function getArticulo(slug: string): Articulo | undefined {
  return ARTICULOS.find((a) => a.slug === slug);
}

/** "2026-07-22" → "22 de julio de 2026" */
export function fechaBonita(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}
