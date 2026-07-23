// ============================================================================
// PÁGINAS DE SOLUCIONES (SEO) — Upcore AI
// Cada objeto es una página en /soluciones/[slug]. Edita el texto aquí.
// Para agregar una página nueva: copia un bloque, cambia el slug y el texto.
// El sitemap y los enlaces del footer se actualizan solos desde esta lista.
// ============================================================================

import type { Giro } from "./demo-config";

export type Solucion = {
  slug: string;
  /** Título SEO SIN "| Upcore AI" — el layout agrega la marca */
  title: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string;
  /** Nombre corto para el enlace del footer */
  nombreCorto: string;
  dolores: { title: string; body: string }[];
  comoAyuda: { title: string; body: string }[];
  stats: { value: string; label: string }[];
  faqs: { q: string; a: string }[];
  giroDemo: Giro;
  /** "Cómo funciona, paso a paso" (opcional) */
  pasos?: { title: string; body: string }[];
  /** "Nos integramos a lo que ya usas" (opcional) */
  integraciones?: { nombre: string; detalle: string }[];
  /** "Tus datos y tus cuentas son tuyos" (opcional) */
  seguridad?: { title: string; body: string }[];
  /** Slugs de otras soluciones → enlaces internos (opcional) */
  relacionadas?: string[];
  /** ISO "2026-07-22" → lastModified del sitemap (solo fechas reales) */
  actualizado?: string;
};

export const SOLUCIONES: Solucion[] = [
  {
    slug: "chatbot-whatsapp-para-clinicas",
    title: "Chatbot de WhatsApp para clínicas: responde y agenda 24/7",
    metaDescription:
      "Un chatbot de WhatsApp con IA para tu clínica: responde a tus pacientes al instante, agenda citas y confirma asistencia 24/7. Hecho para clínicas en México.",
    eyebrow: "Chatbot de WhatsApp para clínicas",
    h1: "Tu WhatsApp responde solo. Tus citas se agendan solas.",
    intro:
      "Un chatbot de WhatsApp con inteligencia artificial que atiende a tus pacientes al instante — a las 7 de la mañana o a las 11 de la noche. Responde dudas, agenda citas en tu calendario y confirma asistencia, con el tono de tu clínica.",
    nombreCorto: "Chatbot de WhatsApp",
    dolores: [
      {
        title: "Mensajes que llegan fuera de horario",
        body: "El 40% de los mensajes a una clínica llegan cuando nadie puede contestar. Cada uno es un paciente que puede irse con otra clínica que sí respondió.",
      },
      {
        title: "Respuestas lentas = pacientes perdidos",
        body: "Un paciente que pregunta precio y espera horas por la respuesta, casi nunca vuelve a escribir. La velocidad de respuesta decide la cita.",
      },
      {
        title: "Tu recepción repite lo mismo todo el día",
        body: "Precios, horarios, ubicación, '¿tienen cita mañana?' — horas de trabajo en preguntas que un asistente bien configurado responde igual o mejor.",
      },
    ],
    comoAyuda: [
      {
        title: "Responde al instante, 24/7",
        body: "Precios, servicios, horarios y dudas frecuentes, con la información real de tu clínica. Nunca deja un mensaje en visto.",
      },
      {
        title: "Agenda, reagenda y confirma citas",
        body: "Ve tu agenda real, ofrece horarios disponibles y aparta la cita ahí mismo. También manda el recordatorio para que el paciente sí llegue.",
      },
      {
        title: "Sabe cuándo llamar a un humano",
        body: "Si el paciente pide hablar con una persona o la duda es delicada, avisa a tu recepción. Tu equipo solo atiende lo que de verdad lo necesita.",
      },
    ],
    stats: [
      { value: "24/7", label: "atención sin descanso" },
      { value: "< 1 min", label: "tiempo de respuesta" },
      { value: "−80%", label: "en no-shows" },
      { value: "0", label: "mensajes en visto" },
    ],
    faqs: [
      {
        q: "¿Funciona con mi número de WhatsApp actual?",
        a: "Sí. Conectamos el asistente a tu número con la API oficial de WhatsApp, y todo queda en tus propias cuentas, bajo tu control.",
      },
      {
        q: "¿Suena robótico?",
        a: "No. Usa inteligencia artificial de última generación con la información y el tono de tu clínica. Pruébalo tú mismo en nuestra demo antes de decidir.",
      },
      {
        q: "¿Y si el paciente quiere hablar con una persona?",
        a: "El asistente lo detecta y avisa a tu recepción al momento. Nunca deja a un paciente atrapado con un robot.",
      },
      {
        q: "¿Cuánto tarda en estar funcionando?",
        a: "La mayoría de las clínicas quedan operando en 1 a 2 semanas.",
      },
    ],
    giroDemo: "dental",
    pasos: [
      {
        title: "Diagnóstico gratis (3 minutos)",
        body: "Nos cuentas cómo maneja hoy tu clínica el WhatsApp y las citas — por chat o en nuestra web. Al instante recibes tu diagnóstico con números: cuánto se te está yendo y qué conviene automatizar primero.",
      },
      {
        title: "Lo construimos por ti",
        body: "Cargamos tu información real — servicios, precios, horarios, tono — y conectamos tu número con la API oficial de WhatsApp. Tú no configuras nada ni aprendes ninguna herramienta.",
      },
      {
        title: "Lo pruebas antes de salir en vivo",
        body: "Chateas con tu asistente como si fueras tu propio paciente y ajustamos lo que pidas: frases, límites, y en qué momentos debe pasar la conversación a una persona.",
      },
      {
        title: "Sale a producción en 1–2 semanas",
        body: "Empieza a contestar de verdad. Tu equipo ve cada conversación y puede tomar el control de cualquier chat en el momento que quiera.",
      },
      {
        title: "Mejora con tu operación",
        body: "Lo afinamos con las preguntas reales de tus pacientes. Y si eliges el plan Gestionado, nosotros lo vigilamos y lo mejoramos por ti todos los meses.",
      },
    ],
    integraciones: [
      {
        nombre: "Google Calendar",
        detalle: "El asistente agenda directo en tu calendario y lee los horarios que de verdad tienes libres.",
      },
      {
        nombre: "Tu agenda o software actual",
        detalle: "¿Ya usas un sistema para tus citas? Nos integramos encima — no te hacemos migrar ni cambiar tu forma de trabajar.",
      },
      {
        nombre: "WhatsApp Business API oficial",
        detalle: "Tu número conectado por la vía autorizada de Meta. Nada de apps piratas que ponen en riesgo tu línea.",
      },
      {
        nombre: "Tu hoja de cálculo o CRM",
        detalle: "Cada paciente y cada cita quedan registrados donde tú ya llevas tu información.",
      },
    ],
    seguridad: [
      {
        title: "Tus cuentas, tus llaves",
        body: "El número, las APIs y los datos viven en cuentas a TU nombre. Si un día dejamos de trabajar juntos, todo sigue funcionando y sigue siendo tuyo.",
      },
      {
        title: "Conversaciones protegidas",
        body: "WhatsApp cifra los mensajes y usamos exclusivamente la API oficial de Meta — la vía autorizada, no atajos que arriesgan tu número.",
      },
      {
        title: "Sin sorpresas de consumo",
        body: "Las APIs se contratan a tu nombre y con tope de gasto activado. Ves tu consumo real, sin intermediarios que revendan de más.",
      },
    ],
    relacionadas: ["recepcionista-virtual-clinica", "reducir-no-shows-clinica"],
    actualizado: "2026-07-22",
  },
  {
    slug: "recepcionista-virtual-clinica",
    title: "Recepcionista virtual con IA para tu clínica",
    metaDescription:
      "Una recepcionista virtual con inteligencia artificial que atiende WhatsApp, agenda citas y da seguimiento a tus pacientes — sin contratar a nadie más.",
    eyebrow: "Recepcionista virtual con IA",
    h1: "Como contratar otra recepcionista, sin contratar a nadie.",
    intro:
      "Una recepcionista virtual con inteligencia artificial que atiende los mensajes de tu clínica, agenda citas, confirma asistencia y da seguimiento — mientras tu equipo se dedica a atender bien a quien ya está en el consultorio.",
    nombreCorto: "Recepcionista virtual",
    dolores: [
      {
        title: "Una sola persona no puede con todo",
        body: "Contestar el teléfono, recibir pacientes, cobrar y además responder WhatsApp. Algo se cae — y casi siempre son los mensajes.",
      },
      {
        title: "Contratar a alguien más es caro",
        body: "Un puesto de recepción adicional cuesta sueldo, prestaciones y capacitación. Y aun así no cubre noches, fines de semana ni festivos.",
      },
      {
        title: "Los seguimientos no se hacen",
        body: "Confirmar las citas de mañana, recordar al que no ha vuelto, avisar al que dejó su tratamiento a medias — nadie tiene tiempo, y son citas que se pierden.",
      },
    ],
    comoAyuda: [
      {
        title: "Atiende como tu mejor recepcionista",
        body: "Responde con amabilidad y con la información real de tu clínica: servicios, precios, horarios, indicaciones. Sin días malos y sin filas de mensajes.",
      },
      {
        title: "Trabaja las horas que nadie cubre",
        body: "Noches, fines de semana y festivos. Justo cuando tus pacientes tienen tiempo de escribir es cuando tu recepcionista virtual está despierta.",
      },
      {
        title: "Hace los seguimientos solos",
        body: "Confirmaciones de cita, recordatorios y seguimiento a pacientes que no han vuelto — de forma automática y constante.",
      },
    ],
    stats: [
      { value: "24/7", label: "siempre disponible" },
      { value: "15–20 h", label: "recuperadas por semana" },
      { value: "1–2 sem", label: "para estar operando" },
      { value: "$0", label: "en sueldos extra" },
    ],
    faqs: [
      {
        q: "¿Reemplaza a mi recepcionista?",
        a: "No. La libera de lo repetitivo (mensajes, confirmaciones, recordatorios) para que dedique su tiempo a atender mejor a los pacientes presentes.",
      },
      {
        q: "¿Qué pasa con las preguntas que no sabe responder?",
        a: "Escala con tu equipo al momento. El asistente sabe lo que sabe, y lo que no, lo pasa a una persona real.",
      },
      {
        q: "¿Necesito saber de tecnología?",
        a: "No. Nosotros lo montamos y, si eliges, lo operamos por ti. Tú solo atiendes tu clínica.",
      },
      {
        q: "¿Los datos de mis pacientes están seguros?",
        a: "Sí. Viajan cifrados y viven aislados en tus propias cuentas. Nunca se comparten ni se mezclan con nadie.",
      },
    ],
    giroDemo: "medica",
    pasos: [
      {
        title: "Diagnóstico gratis con tus números",
        body: "Vemos cuántos mensajes recibe tu clínica, en qué horarios llegan y qué se está quedando sin respuesta. Con tus datos reales, no con promedios de folleto.",
      },
      {
        title: "Entrenamos a tu recepcionista virtual",
        body: "Le cargamos tu catálogo de servicios, precios, indicaciones y tu forma de hablar. Queda lista para responder como alguien de tu propio equipo.",
      },
      {
        title: "Definimos juntos sus límites",
        body: "Qué responde sola, qué pasa a tu equipo y cómo les avisa. Tú pones las reglas; ella las sigue al pie de la letra, a cualquier hora.",
      },
      {
        title: "En vivo en 1–2 semanas",
        body: "Empieza a atender 24/7. Tu equipo conserva el control total: puede pausarla y tomar cualquier conversación desde su bandeja.",
      },
      {
        title: "Se afina con el uso",
        body: "La pulimos con las preguntas reales de tus pacientes para que cada semana atienda mejor. En el plan Gestionado, eso corre por nuestra cuenta.",
      },
    ],
    integraciones: [
      {
        nombre: "Google Calendar",
        detalle: "Agenda y confirma citas directamente en el calendario que ya usa tu clínica.",
      },
      {
        nombre: "Tu sistema de agenda actual",
        detalle: "Si ya tienes un software de citas o expediente, trabajamos encima de él — tus datos no se mueven de ahí.",
      },
      {
        nombre: "WhatsApp Business API oficial",
        detalle: "Atiende desde tu número, por la vía autorizada de Meta, con tu nombre y tu marca.",
      },
      {
        nombre: "Tu CRM o expediente",
        detalle: "No lo reemplazamos: tu recepcionista virtual registra y consulta donde tú ya trabajas.",
      },
    ],
    seguridad: [
      {
        title: "Todo queda a tu nombre",
        body: "Cuentas, número y datos son tuyos desde el día uno. Nunca quedas amarrado a nosotros para que tu clínica siga funcionando.",
      },
      {
        title: "Tu equipo siempre al mando",
        body: "Desde su bandeja pueden pausar al asistente, responder en persona o retomarlo cuando quieran. La última palabra siempre es humana.",
      },
      {
        title: "Datos aislados y protegidos",
        body: "La información de tus pacientes viaja cifrada y vive aislada en tus propias cuentas. No se comparte ni se mezcla con nadie.",
      },
    ],
    relacionadas: ["chatbot-whatsapp-para-clinicas", "reducir-no-shows-clinica"],
    actualizado: "2026-07-22",
  },
  {
    slug: "automatizacion-clinicas-dentales",
    title: "Automatización con IA para clínicas dentales en México",
    metaDescription:
      "Automatiza tu clínica dental: citas por WhatsApp, confirmaciones automáticas y menos no-shows. Agentes de IA hechos para dentistas en México.",
    eyebrow: "Automatización para clínicas dentales",
    h1: "Tu clínica dental, llena y sin huecos en la agenda.",
    intro:
      "Automatización con inteligencia artificial diseñada para clínicas dentales: un agente que responde WhatsApp, agenda limpiezas y valoraciones, confirma citas y recupera a los pacientes que dejaron su tratamiento a medias.",
    nombreCorto: "Clínicas dentales",
    dolores: [
      {
        title: "El no-show dental duele doble",
        body: "Un sillón vacío no solo es la consulta perdida: es el tiempo del doctor, el de la asistente y un espacio que otro paciente sí quería.",
      },
      {
        title: "Tratamientos que se quedan a medias",
        body: "Pacientes que empezaron ortodoncia o una rehabilitación y dejaron de venir. Sin seguimiento constante, esa producción se pierde.",
      },
      {
        title: "El teléfono suena mientras atiendes",
        body: "Tu asistente está apoyándote en el sillón y el WhatsApp acumula mensajes. El paciente que no recibió respuesta agenda con el consultorio de enfrente.",
      },
    ],
    comoAyuda: [
      {
        title: "Agenda y confirma cada cita",
        body: "El agente ofrece horarios reales, aparta la cita y manda recordatorio un día antes. Los huecos de última hora se reducen drásticamente.",
      },
      {
        title: "Recupera pacientes inactivos",
        body: "Detecta quién no ha vuelto (limpieza semestral, tratamiento pausado) y les escribe con un mensaje amable para reactivarlos.",
      },
      {
        title: "Responde lo que todos preguntan",
        body: "¿Cuánto cuesta una limpieza? ¿Atienden niños? ¿Aceptan mi aseguranza? Respuestas al instante, con los datos reales de tu clínica.",
      },
    ],
    stats: [
      { value: "−80%", label: "en no-shows" },
      { value: "+30–40", label: "pacientes al mes" },
      { value: "24/7", label: "atención sin descanso" },
      { value: "1–2 sem", label: "para estar operando" },
    ],
    faqs: [
      {
        q: "¿Sirve para consultorios chicos o solo para clínicas grandes?",
        a: "Está pensado justo para consultorios y clínicas chicas y medianas: donde cada cita cuenta y no hay equipo de sobra para contestar mensajes.",
      },
      {
        q: "¿Se integra con mi agenda actual?",
        a: "Sí. Si ya usas Google Calendar, una agenda dental u otro sistema, nos integramos a lo tuyo — no te obligamos a cambiar de herramientas.",
      },
      {
        q: "¿Cuánto cuesta?",
        a: "Depende de tu clínica y de lo que necesites. Usa la calculadora de nuestra página principal para un estimado al instante, o agenda un diagnóstico gratis.",
      },
      {
        q: "¿Qué pasa con los datos de mis pacientes?",
        a: "Viven en tus propias cuentas, cifrados y aislados. Son tuyos y solo tuyos.",
      },
    ],
    giroDemo: "dental",
    pasos: [
      {
        title: "Diagnóstico con los números de tu consultorio",
        body: "Citas al mes, no-shows, ticket promedio y tratamientos pausados. En 3 minutos sabes cuánto dinero se está quedando en la agenda y qué recuperarías.",
      },
      {
        title: "Armamos tu sistema dental",
        body: "Agente que responde y agenda + confirmaciones automáticas + reactivación de pacientes: limpiezas que ya tocan y tratamientos que quedaron a medias.",
      },
      {
        title: "Conectamos tu agenda, no la cambiamos",
        body: "Google Calendar o el software dental que ya uses. Tus expedientes se quedan donde están — nosotros trabajamos encima.",
      },
      {
        title: "Pruebas y salida en vivo en 1–2 semanas",
        body: "Lo pruebas como si fueras paciente, ajustamos los detalles y sale a contestar de verdad, con tu equipo siempre en control.",
      },
      {
        title: "Resultados a la vista",
        body: "Citas confirmadas, huecos rellenados y pacientes reactivados, medidos mes a mes. En el sistema completo lo ves en tu propio panel.",
      },
    ],
    integraciones: [
      {
        nombre: "Google Calendar",
        detalle: "El agente ve tus espacios reales y aparta las citas directo en tu calendario.",
      },
      {
        nombre: "Tu software dental actual",
        detalle: "Tus expedientes y odontogramas se quedan en tu sistema de siempre; el agente agenda y da seguimiento encima.",
      },
      {
        nombre: "WhatsApp Business API oficial",
        detalle: "Tu número de la clínica, conectado por la vía autorizada de Meta.",
      },
      {
        nombre: "Tu hoja de cálculo",
        detalle: "Si tu control es una hoja de cálculo, perfecto: ahí mismo registramos citas y seguimientos.",
      },
    ],
    seguridad: [
      {
        title: "Los expedientes no se tocan",
        body: "El agente agenda, confirma y da seguimiento. Tu expediente clínico se queda en tu sistema, bajo tus reglas y tu acceso.",
      },
      {
        title: "Cuentas a tu nombre",
        body: "Número, APIs y datos viven en tus propias cuentas, con tope de gasto. Todo es tuyo, trabajemos juntos o no.",
      },
      {
        title: "Protegido de extremo a extremo",
        body: "Mensajes cifrados por WhatsApp y acceso mínimo indispensable: el sistema solo ve lo que necesita para agendar.",
      },
    ],
    relacionadas: ["reducir-no-shows-clinica", "chatbot-whatsapp-para-clinicas"],
    actualizado: "2026-07-22",
  },
  {
    slug: "automatizacion-medicina-estetica",
    title: "IA para clínicas de medicina estética: agenda llena sin saturar recepción",
    metaDescription:
      "Automatización con IA para clínicas de medicina estética: responde WhatsApp al instante, agenda valoraciones y da seguimiento a tus pacientes.",
    eyebrow: "IA para medicina estética",
    h1: "Cada mensaje respondido al instante. Cada valoración agendada.",
    intro:
      "En estética, el paciente que pregunta hoy se decide hoy. Un agente de IA que responde tu WhatsApp al momento, agenda valoraciones, resuelve dudas de tratamientos y da seguimiento — con la discreción y el tono que tu clínica exige.",
    nombreCorto: "Medicina estética",
    dolores: [
      {
        title: "El interés se enfría en horas",
        body: "Quien pregunta por botox o un tratamiento facial está comparando 3 o 4 clínicas al mismo tiempo. La primera que responde bien suele ganarse la valoración.",
      },
      {
        title: "Preguntas infinitas antes de decidir",
        body: "Precios, sesiones, cuidados, resultados… cada paciente estético pregunta mucho antes de agendar. Atender eso a mano consume a tu equipo.",
      },
      {
        title: "Pacientes de una sola vez",
        body: "Tratamientos que necesitan mantenimiento (toxina, faciales, láser) y pacientes que no regresan porque nadie les recordó que ya toca.",
      },
    ],
    comoAyuda: [
      {
        title: "Responde al momento, con buen gusto",
        body: "Información clara de tratamientos, precios y cuidados, con el tono de tu marca. El paciente siente atención premium desde el primer mensaje.",
      },
      {
        title: "Convierte preguntas en valoraciones",
        body: "Después de resolver la duda, el agente ofrece agendar la valoración ahí mismo, con tus horarios reales.",
      },
      {
        title: "Trae de vuelta a tus pacientes",
        body: "Recordatorios de mantenimiento (“ya tocan tus 4 meses”) y seguimiento post-tratamiento, automáticos y con tu tono.",
      },
    ],
    stats: [
      { value: "< 1 min", label: "tiempo de respuesta" },
      { value: "24/7", label: "también fines de semana" },
      { value: "+30–40", label: "pacientes al mes" },
      { value: "−80%", label: "en no-shows" },
    ],
    faqs: [
      {
        q: "¿Puede hablar de mis tratamientos específicos?",
        a: "Sí. Lo cargamos con tu menú real de tratamientos, precios, duraciones y cuidados. Responde con TU información, no con datos genéricos.",
      },
      {
        q: "¿Qué tan discreto es con los pacientes?",
        a: "El tono lo defines tú. Y los datos de tus pacientes viven cifrados en tus propias cuentas — la discreción también es técnica.",
      },
      {
        q: "¿Funciona con Instagram además de WhatsApp?",
        a: "El corazón es WhatsApp (donde se cierran las citas). En el diagnóstico vemos tu caso y qué canales conviene conectar.",
      },
      {
        q: "¿Cómo empiezo?",
        a: "Con un diagnóstico gratis: analizamos tu clínica y te decimos exactamente qué automatizar y cuánto puedes recuperar.",
      },
    ],
    giroDemo: "estetica",
    pasos: [
      {
        title: "Diagnóstico gratis de tu clínica",
        body: "Cuántas consultas de valoración pierdes por responder tarde, cuántos pacientes no regresan a mantenimiento y cuánto vale eso al mes. Números tuyos, al instante.",
      },
      {
        title: "Cargamos tu menú de tratamientos",
        body: "Precios, duraciones, cuidados previos y posteriores, promociones vigentes. El asistente responde con TU información, con el tono premium de tu marca.",
      },
      {
        title: "Definimos tono y límites clínicos",
        body: "Cómo habla, qué informa y qué NO responde: las valoraciones médicas siempre las da tu especialista. El asistente informa, agenda y acompaña.",
      },
      {
        title: "En vivo en 1–2 semanas",
        body: "Empieza a convertir preguntas en valoraciones agendadas, también de noche y en fin de semana — cuando tus pacientes sí tienen tiempo de escribir.",
      },
      {
        title: "Mantenimiento en automático",
        body: "Recordatorios de retoque (“ya tocan tus 4 meses”) y seguimiento post-tratamiento con tu tono. Tus pacientes regresan sin que nadie los persiga.",
      },
    ],
    integraciones: [
      {
        nombre: "Google Calendar",
        detalle: "Valoraciones y citas apartadas directo en la agenda de tus cabinas o consultorios.",
      },
      {
        nombre: "Tu agenda actual",
        detalle: "Si ya usas un sistema de citas para estética, nos conectamos a él — sin migrar nada.",
      },
      {
        nombre: "WhatsApp Business API oficial",
        detalle: "La conversación vive en el canal donde tus pacientes deciden, desde tu número verificado.",
      },
      {
        nombre: "Instagram → WhatsApp",
        detalle: "El link de tu bio y tus anuncios llevan la conversación a WhatsApp, donde el asistente la convierte en cita.",
      },
    ],
    seguridad: [
      {
        title: "Discreción, también técnica",
        body: "Los datos de tus pacientes viajan cifrados y viven en tus cuentas. La privacidad que la estética exige, cuidada de verdad.",
      },
      {
        title: "El especialista decide",
        body: "El asistente informa precios, cuidados y disponibilidad; los diagnósticos y valoraciones clínicas siempre quedan en manos de tu médico.",
      },
      {
        title: "Todo a tu nombre",
        body: "Cuentas, número y datos son de tu clínica. Si mañana cambias de proveedor, el sistema y la información siguen contigo.",
      },
    ],
    relacionadas: ["recepcionista-virtual-clinica", "reducir-no-shows-clinica"],
    actualizado: "2026-07-22",
  },
  {
    slug: "reducir-no-shows-clinica",
    title: "Cómo reducir no-shows en tu clínica: confirmación automática de citas",
    metaDescription:
      "Reduce las inasistencias de tu clínica con confirmación y recordatorios automáticos por WhatsApp. Cada cita confirmada es dinero que no se pierde.",
    eyebrow: "Reducir no-shows",
    h1: "Los no-shows no se eliminan con regaños. Se eliminan con sistema.",
    intro:
      "La mayoría de los pacientes no falta por mala fe: se les olvida, les dio pena cancelar o no encontraron cómo reagendar. Un sistema de confirmación y recordatorios automáticos por WhatsApp ataca esas tres causas — sin que tu equipo pierda horas llamando.",
    nombreCorto: "Reducir no-shows",
    dolores: [
      {
        title: "El olvido es la causa #1",
        body: "Entre el trabajo y la familia, la cita que se agendó hace 2 semanas simplemente se borra de la mente. Sin recordatorio, la silla queda vacía.",
      },
      {
        title: "Cancelar da pena",
        body: "Muchos pacientes prefieren no llegar antes que llamar a cancelar. Si reagendar fuera tan fácil como responder un mensaje, avisarían.",
      },
      {
        title: "Confirmar a mano no escala",
        body: "Llamar uno por uno a los pacientes de mañana consume horas de recepción — y muchas llamadas ni se contestan. Los mensajes sí se leen.",
      },
    ],
    comoAyuda: [
      {
        title: "Recordatorio que sí se lee",
        body: "Mensaje por WhatsApp un día antes (y el día de la cita si quieres), con hora, dirección y lo que debe traer. WhatsApp se abre; las llamadas no siempre.",
      },
      {
        title: "Confirmar o reagendar en un toque",
        body: "El paciente responde 'confirmo' o pide cambio ahí mismo, y el sistema reagenda solo. Un hueco avisado a tiempo se puede volver a llenar.",
      },
      {
        title: "Lista de 'a quién llamar' cada mañana",
        body: "Los que no confirmaron aparecen en una lista clara para tu recepción. El esfuerzo humano se concentra solo donde hace falta.",
      },
    ],
    stats: [
      { value: "−80%", label: "en no-shows" },
      { value: "100%", label: "de citas con recordatorio" },
      { value: "0 h", label: "de llamadas manuales" },
      { value: "24/7", label: "reagendado disponible" },
    ],
    faqs: [
      {
        q: "¿De verdad funciona un simple recordatorio?",
        a: "El recordatorio es la base, pero lo que más recupera citas es poder confirmar o reagendar respondiendo el mensaje. Le quitas toda la fricción al paciente.",
      },
      {
        q: "¿Los mensajes salen de mi número?",
        a: "Sí, de tu WhatsApp, con tu nombre y tu tono. El paciente siente que le escribe tu clínica, porque es tu clínica.",
      },
      {
        q: "¿Qué pasa si el paciente responde con una duda?",
        a: "Si tienes el agente de IA, la responde al instante. Si no, la duda llega a tu recepción de forma ordenada.",
      },
      {
        q: "¿Cuánto me cuesta un no-show hoy?",
        a: "Multiplica tu ticket promedio por las citas que se pierden al mes — ese es el dinero que un sistema así defiende. En el diagnóstico gratis lo calculamos con tus números.",
      },
    ],
    giroDemo: "dental",
    pasos: [
      {
        title: "Medimos tu fuga real",
        body: "¿Cuántas citas se te caen al mes y cuánto cuestan? El diagnóstico gratis lo calcula con tu volumen y tu ticket promedio — sin adornos.",
      },
      {
        title: "Conectamos tu agenda",
        body: "El sistema lee tus citas de Google Calendar o del software que ya uses. Nadie captura nada a mano ni cambia su forma de trabajar.",
      },
      {
        title: "Diseñamos la secuencia de recordatorios",
        body: "Cuándo se manda cada mensaje y qué dice, con tu tono: un día antes, el día de la cita, y el toque para reagendar si avisan que no llegan.",
      },
      {
        title: "Confirmar o reagendar en un toque",
        body: "El paciente responde el mensaje y listo. Un hueco avisado a tiempo es un espacio que tu recepción todavía puede volver a llenar.",
      },
      {
        title: "Lista diaria para tu recepción",
        body: "Cada mañana: quién confirmó, quién no, y a quién vale la pena llamar. El esfuerzo humano va solo donde de verdad hace falta.",
      },
    ],
    integraciones: [
      {
        nombre: "Google Calendar",
        detalle: "Lee tus citas reales y actualiza confirmaciones y cambios en tu propio calendario.",
      },
      {
        nombre: "Tu software de agenda",
        detalle: "¿Llevas las citas en otro sistema? Nos integramos a lo que uses — el registro sigue siendo el tuyo.",
      },
      {
        nombre: "WhatsApp Business API oficial",
        detalle: "Recordatorios que sí se leen, enviados desde tu número por la vía autorizada de Meta.",
      },
      {
        nombre: "Tu hoja de control",
        detalle: "Las confirmaciones y los pendientes se registran donde tu equipo ya trabaja.",
      },
    ],
    seguridad: [
      {
        title: "Solo los datos mínimos",
        body: "Nombre, teléfono y cita. Nada clínico viaja en los recordatorios — la información médica se queda en tu sistema.",
      },
      {
        title: "Mensajes desde TU número",
        body: "El paciente ve el WhatsApp de tu clínica, con tu nombre. La confianza que ya construiste no se presta a terceros.",
      },
      {
        title: "Cuentas y topes a tu nombre",
        body: "El envío de mensajes se contrata en tu cuenta, con tope de gasto activado. Pagas lo que se usa, y lo ves tú mismo.",
      },
    ],
    relacionadas: ["chatbot-whatsapp-para-clinicas", "automatizacion-clinicas-dentales"],
    actualizado: "2026-07-22",
  },
];

export function getSolucion(slug: string): Solucion | undefined {
  return SOLUCIONES.find((s) => s.slug === slug);
}
