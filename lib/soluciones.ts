// ============================================================================
// PÁGINAS DE SOLUCIONES (SEO) — Upcore AI
// Cada objeto es una página en /soluciones/[slug]. Edita el texto aquí.
// Para agregar una página nueva: copia un bloque, cambia el slug y el texto.
// El sitemap y los enlaces del footer se actualizan solos desde esta lista.
// ============================================================================

import type { Giro } from "./demo-config";

export type Solucion = {
  slug: string;
  /** Título SEO (pestaña y Google) */
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
};

export const SOLUCIONES: Solucion[] = [
  {
    slug: "chatbot-whatsapp-para-clinicas",
    title: "Chatbot de WhatsApp para clínicas: responde y agenda 24/7 | Upcore AI",
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
  },
  {
    slug: "recepcionista-virtual-clinica",
    title: "Recepcionista virtual con IA para tu clínica | Upcore AI",
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
  },
  {
    slug: "automatizacion-clinicas-dentales",
    title: "Automatización con IA para clínicas dentales en México | Upcore AI",
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
  },
  {
    slug: "automatizacion-medicina-estetica",
    title: "IA para clínicas de medicina estética: agenda llena sin saturar recepción | Upcore AI",
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
  },
  {
    slug: "reducir-no-shows-clinica",
    title: "Cómo reducir no-shows en tu clínica: confirmación automática de citas | Upcore AI",
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
  },
];

export function getSolucion(slug: string): Solucion | undefined {
  return SOLUCIONES.find((s) => s.slug === slug);
}
