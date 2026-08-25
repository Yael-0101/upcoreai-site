// Los TEXTOS del Portal de Arranque, en español y en inglés. FUENTE ÚNICA.
//
// Mismo patrón que lib/acuerdo-textos.ts y lib/propuesta-textos.ts: una tabla
// `Record<Idioma, …>` que TypeScript obliga a completar, y una sola lógica que decide
// QUÉ texto sale según las piezas que compró el cliente. El idioma solo cambia las
// palabras, nunca la estructura ni los pasos.
//
// ⚠️ AQUÍ EL IDIOMA SE GUARDA, no viaja solo en la URL. El portal no se lee de una
// sentada: el cliente entra, deja a medias y vuelve al día siguiente con el mismo
// link. Si el idioma viviera únicamente en `?lang=en`, al volver lo encontraría en
// español — y pensaría que le cambiamos el portal. Se guarda dentro de `datos`, que
// es un JSON, así que no hace falta tocar el esquema de la tabla de n8n.
//
// 🔴 Y DE PASO SE ARREGLÓ UNA MENTIRA (2026-08-22). Los textos del paso de desarrollos
// decían "es lo que verán tus compradores en tu sitio", "tu asistente responde con TU
// información real… los precios pueden ser rangos" y "si prefieres no publicarlos,
// déjalos en blanco". Las tres prometen que el precio se va a usar de cara al
// comprador — y la línea roja nº1 de los cuatro productos es justo la contraria: ni el
// sitio ni el asistente dan precios, porque en preventa caducan solos. El 21 de agosto
// arreglé la ETIQUETA del campo y no las frases de al lado: el mismo error de mirar el
// campo y no la oración que lo acompaña.

import type { Idioma } from "./acuerdo-textos";

export type TextosArranque = {
  // ── Nombres de las piezas, para "lo suyo" ─────────────────────────────────
  suyo: {
    asistente: string;
    asistenteWa: string;
    asistenteTel: string;
    sitio: string;
    recordatorios: string;
    reactivacion: string;
    panel: string;
    sistema: string;
  };
  unir: (xs: string[]) => string;

  // ── 1 · Bienvenida ────────────────────────────────────────────────────────
  duraciones: { corta: string; media: string; larga: string };
  bienvenida: {
    etiqueta: (empresa: string) => string;
    paso: (n: number, de: number) => string;
    titulo: (nombre: string) => string;
    intro: (lo: string) => string;
    tuParteToma: (duracion: string) => string;
    guiando: string;
    seguridadFuerte: string;
    seguridadResto: string;
    empezar: string;
    seGuarda: string;
  };

  // ── 2 · Desarrollos ───────────────────────────────────────────────────────
  desarrollos: {
    q: string;
    hintAsistente: string;
    hintWeb: string;
    hintMensajes: string;
    hintPanel: string;
    labelNombre: string;
    ejNombre: string;
    labelPrecio: string;
    ejPrecio: string;
    labelTamano: string;
    ejTamano: string;
    quitar: string;
    agregar: string;
    faltan: string;
    /** Atajo para pegar la lista de golpe (2026-08-23). */
    pegarAbrir: string;
    pegarTitulo: string;
    pegarHint: string;
    pegarEjemplo: string;
    pegarUsar: string;
    pegarCancelar: string;
    pegarNada: string;
    pegarPisa: string;
    pegarRecortado: string;
    pegarEncabezado: string;
  };

  // ── 3 · Horarios y estilo ─────────────────────────────────────────────────
  horarios: {
    qAsistente: string;
    qEstilo: string;
    qSolo: string;
    hintChatYVoz: string;
    hintChat: string;
    hintVoz: string;
    hintWeb: string;
    hintMensajes: string;
    hintSolo: string;
    label: string;
    ejemplo: string;
    tonoAsistente: string;
    tonoSitio: string;
    tonoMensajes: string;
    faqsAsistente: string;
    faqsWeb: string;
    ejFaqs: string;
    indicaciones: string;
    ejIndicaciones: string;
    logo: string;
    ejLogo: string;
    // 🔴 A quién avisamos cuando un comprador pide una persona. Solo con asistente
    // (chat o voz) — ver `pideEscalacion` en arranque-copy.ts.
    escalacionTitulo: string;
    escalacionHint: string;
    escalacionNombre: string;
    ejEscalacionNombre: string;
    escalacionTel: string;
    ejEscalacionTel: string;
    // Dos versiones a propósito: el motivo REAL del número directo es el bucle del
    // desvío, y ese solo existe con agente de voz. A un cliente de solo chat el
    // guardián lo cazó leyendo "no alcanzó a tomar la llamada" — un teléfono que
    // nunca compró.
    escalacionAvisoVoz: string;
    escalacionAvisoChat: string;
    escalacionVia: string;
    // 🔄 Qué hace su asistente con precios, disponibilidad y fechas de entrega
    // (decisión de Yael, 2026-08-25: lo elige el cliente). Ver `pidePrecios`.
    preciosTitulo: string;
    preciosHint: string;
    preciosPublicadoLabel: string;
    ejPreciosPublicado: string;
    preciosFuenteLabel: string;
    ejPreciosFuente: string;
    // 🔒 Las reglas que NO puede quitar, y que VE. No es desconfianza: son las dos
    // únicas donde el daño no tiene marcha atrás, y las dos son de ley de EE.UU.
    sueloTitulo: string;
    sueloHint: string;
  };
  viasAviso: Array<{ val: string; label: string; desc: string }>;
  tonos: Array<{ val: string; label: string; desc: string }>;
  /** De dónde salen los precios que dice el asistente. Nunca "sí/no". */
  modosPrecio: Array<{ val: string; label: string; desc: string }>;
  /** Las reglas del suelo, tal como las lee el cliente. */
  suelo: Array<{ id: string; titulo: string; que: string; porque: string }>;

  // ── 4 · Número de WhatsApp ────────────────────────────────────────────────
  numero: {
    qChat: string;
    hintChat: string;
    actualChat: string;
    nuevoChat: string;
    qMensajes: string;
    hintMensajes: string;
    actualMensajes: string;
    nuevoMensajes: string;
    labelActual: string;
    labelNuevo: string;
    descActual: string;
    descNuevo: string;
    noSe: string;
    noSeDesc: string;
    prefijoActual: string;
    prefijoNuevo: string;
  };

  // ── 5 · Línea telefónica ──────────────────────────────────────────────────
  linea: {
    q: string;
    hint: string;
    desvio: string;
    nuevo: string;
    labelDesvio: string;
    labelNuevo: string;
    descDesvio: string;
    descNuevo: string;
    prefijoDesvio: string;
    prefijoNuevo: string;
  };

  // ── 7 · Calendario ────────────────────────────────────────────────────────
  calendario: {
    q: string;
    hintAmbos: string;
    hintAsistente: string;
    hintWeb: string;
    hintMensajes: string;
    google: string;
    software: string;
    ninguno: string;
    ningunoDesc: string;
  };

  // ── 8 · Demo ──────────────────────────────────────────────────────────────
  demo: { ideas: string[] };

  // ── 9 · Textos del sitio ──────────────────────────────────────────────────
  textos: {
    qAmbos: string;
    hintAmbos: string;
    qWeb: string;
    hintWeb: string;
    qMensajes: string;
    hintMensajes: string;
  };

  // ── 10 · Su equipo (solo con la pieza `panel`) ────────────────────────────
  equipo: {
    q: string;
    hint: string;
    labelNombre: string;
    ejNombre: string;
    labelRol: string;
    /** Las etiquetas de los roles, por su CLAVE guardada. La clave no se traduce. */
    roles: Record<string, string>;
    rolAyuda: string;
    agregar: string;
    quitar: string;
    labelComision: string;
    ejComision: string;
    comisionAyuda: string;
    nota: string;
  };

  // ── 11 · Resumen y cierre ─────────────────────────────────────────────────
  resumen: {
    etiquetaNumeroChat: string;
    etiquetaNumeroMensajes: string;
    etiquetaDemoChat: string;
    etiquetaDemoOtro: string;
    completo: string;
    listo: (nombre: string) => string;
    noTeFalta: string;
    seguimos: (lo: string) => string;
  };


  // ── 6 · Cuentas (concierge) ───────────────────────────────────────────────
  cuentas: {
    titulo: string;
    subtitulo: string;
    nuncaCompartas: string;
    porWhatsAppA: string;
    tuNoHaces: string;
    comoSeLlame: string;
    telefonoCodigos: string;
    hintTelefono: string;
    horarioEscribir: string;
    ejHorario: string;
  };
  // ── 7 · Calendario (detalle) ──────────────────────────────────────────────
  calendarioPasos: { ruta: string; listo: string; marcar: string; marcado: string };
  // ── 8 · Demo ──────────────────────────────────────────────────────────────
  demoUi: {
    titulo: string;
    subtitulo: string;
    ponloAPrueba: string;
    yaLoProbe: string;
    marcarProbado: string;
    queTeParecio: string;
    ejOpinion: string;
  };
  // ── 9 · Textos y estilo ───────────────────────────────────────────────────
  estilo: {
    paleta: string;
    paginaQueGusta: string;
    quitarReferencia: string;
    queTeGusta: string;
    ejQueGusta: string;
    enPreparacion: string;
    aprobado: string;
    conCambios: string;
    porRevisar: string;
    queCambiamos: string;
    ejCambio: string;
  };
  // ── 10 · Resumen ──────────────────────────────────────────────────────────
  resumenUi: {
    titulo: string;
    hint: string;
    desarrollos: string;
    horariosYTono: string;
    horarios: string;
    llamadas: string;
    cuentasListas: string;
    cuentasFaltan: string;
    calendario: string;
    estiloSitio: string;
    textosAprobados: string;
    enviar: string;
    /** 🔴 Estas dos estaban escritas a mano dentro del componente, en español, y
     *  salían tal cual en el portal en INGLÉS (2026-08-25). El guardián de
     *  vocabulario mira el copy, no el JSX. */
    faltaEsencial: string;
    completaEsenciales: string;
  };

  /** Frases largas que en el JSX van partidas por <strong>. Se guardan enteras y
   *  el componente marca en negrita la parte `fuerte`. */
  prosa: {
    tuParteToma1: string;
    tuParteToma2: string;
    seguridadTitulo: string;
    seguridadResto2: string;
    codigosAntes: string;
    codigosFuerte: string;
    codigosDespues: string;
    codigosFuerte2: string;
    codigosFinal: string;
    correoAntes: string;
    correoFuerte1: string;
    correoMedio: string;
    correoFuerte2: string;
    correoFinal: string;
    calAntes: string;
    calFuerte: string;
    calDespues: string;
    calNingunoAntes: string;
    calNingunoFuerte: string;
    calNingunoDespues: string;
    textosAntes: string;
    textosFuerte: string;
    textosDespues: string;
    ejPaleta: string;
    paginaQueGusta: (n: number) => string;
  };

  // ── Chrome del portal ─────────────────────────────────────────────────────
  ui: {
    guardando: string;
    guardado: string;
    errorGuardar: string;
    siguiente: string;
    atras: string;
    verEnOtroIdioma: string;
    avance: string;
    pie: (empresa: string) => string;
    dudas: string;
    escribenos: string;
    faltaPara: (que: string) => string;
    notaAvance: string;
    /** Las 5 fases del proyecto. La clave es el texto EN ESPAÑOL, que es lo que
     *  viaja guardado en `avances` — el idioma solo cambia cómo se lee. */
    fases: Record<string, string>;
    estados: Record<string, string>;
  };
};

const unirCon = (conj: string) => (xs: string[]) => {
  const l = xs.filter(Boolean);
  if (l.length === 0) return "";
  if (l.length === 1) return l[0];
  return `${l.slice(0, -1).join(", ")} ${conj} ${l[l.length - 1]}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// ESPAÑOL
// ─────────────────────────────────────────────────────────────────────────────

const ES: TextosArranque = {
  suyo: {
    asistente: "tu asistente",
    asistenteWa: "tu asistente de WhatsApp",
    asistenteTel: "tu asistente telefónico",
    sitio: "tu sitio",
    recordatorios: "tus recordatorios",
    reactivacion: "tus mensajes de reactivación",
    panel: "tu panel",
    sistema: "tu sistema",
  },
  unir: unirCon("y"),

  duraciones: { corta: "~15 minutos", media: "~30 minutos", larga: "~1 hora" },
  bienvenida: {
    etiqueta: (empresa) => `Portal de arranque · ${empresa}`,
    paso: (n, de) => `Paso ${n} de ${de}`,
    titulo: (nombre) => (nombre ? `${nombre}, bienvenido a tu arranque 🚀` : "Bienvenido a tu arranque 🚀"),
    intro: (lo) => `Aquí nos das lo que necesitamos para construir ${lo} — a tu ritmo, y todo se guarda solo.`,
    tuParteToma: (duracion) =>
      `Tu parte toma ${duracion} en total, y no tiene que ser de corrido: cierra y regresa con este mismo link cuando quieras.`,
    guiando: "Te vamos guiando paso por paso — no necesitas saber nada técnico.",
    seguridadFuerte: "Aquí jamás se piden contraseñas ni llaves.",
    seguridadResto:
      "Solo confirmaciones. Si alguien te pide una contraseña por chat, no somos nosotros.",
    empezar: "Empezar →",
    seGuarda: "Tu avance se guarda solo en cada paso.",
  },

  desarrollos: {
    q: "Tus desarrollos y precios",
    // 🔴 Los cuatro hint decían que el precio se iba a usar de cara al comprador
    // ("es lo que verán tus compradores en tu sitio", "tu asistente responde con
    // TU información real… los precios pueden ser rangos"). Ni el sitio ni el
    // asistente dan precios: en preventa caducan solos y por eso el producto ni
    // siquiera tiene el campo. Ahora se dice para qué SÍ sirve el dato.
    // ⚠️ La coletilla de "lo pausas tú" va SOLO en estos dos hint, no en los cuatro:
    // el interruptor de desarrollos es de las piezas que los ofrecen (agente, voz y
    // web). A un cliente de solo seguimiento o solo panel se le estaría prometiendo
    // un botón que su consola no le muestra.
    hintAsistente:
      "Con esto tu asistente habla de tus desarrollos reales. El rango de precios es para tu equipo: el asistente nunca lo dice — en preventa cambia por línea, piso y etapa, y pasa la consulta a tu asesor. Y no queda escrito en piedra: cuando uno se agote lo pausas tú desde tu celular, sin avisarnos.",
    hintWeb:
      "Es lo que verán tus compradores en tu sitio: el nombre de cada desarrollo, dónde está y qué tipo de unidades. El rango de precios NO se publica —caduca solo— pero nos sirve para escribir bien la página. Y no queda escrito en piedra: cuando uno se agote lo pausas tú desde tu celular y deja de aparecer.",
    hintMensajes:
      "Con esto tus mensajes hablan de tus proyectos reales. El rango de precios queda para tu equipo: los mensajes no lo dicen.",
    hintPanel:
      "Con esto tu panel muestra tus proyectos tal como los vendes. El rango de precios es de uso interno.",
    labelNombre: "Desarrollo o unidad",
    ejNombre: "Ej. Torre Brickell — 2 recámaras",
    labelPrecio: "Rango de precios — no se publica",
    ejPrecio: "Ej. desde 480,000 (solo para tu equipo)",
    labelTamano: "Recámaras o tamaño",
    ejTamano: "Ej. 2 rec · 1,100 ft²",
    quitar: "Quitar desarrollo",
    agregar: "+ Agregar otro desarrollo",
    faltan: "Escribe al menos un desarrollo para seguir.",
    // 🔴 2026-08-23: llenarlo de a uno son tres campos y un clic por desarrollo. Una firma
    // con quince torres YA tiene esa lista escrita en algún lado; pegarla es el camino corto.
    // El texto dice que se PUEDE revisar después, porque el atajo solo sirve si da confianza.
    pegarAbrir: "¿Tienes tu lista a la mano? Pégala de golpe",
    pegarTitulo: "Pega tu lista — un desarrollo por renglón",
    pegarHint:
      "Sirve tal cual desde una hoja de cálculo, un correo o tu página. Si además traes precio y tamaño, sepáralos con una raya | o con tabulador. Después puedes revisar y corregir cada uno.",
    pegarEjemplo:
      "Torre Brickell — 2 recámaras | desde 480,000 | 1,100 ft²\nAventura Park\nDoral Towers — penthouse",
    pegarUsar: "Usar esta lista",
    pegarCancelar: "Cancelar",
    pegarNada: "No encontré ningún desarrollo ahí. Escribe uno por renglón.",
    pegarPisa: "Esto reemplaza lo que ya tengas escrito arriba.",
    pegarRecortado: "Solo se tomaron los primeros 60. Agrega el resto a mano si hacen falta.",
    pegarEncabezado: "Se ignoró el encabezado de tu tabla.",
  },

  horarios: {
    qAsistente: "Horarios y personalidad",
    qEstilo: "Tus horarios y tu estilo",
    qSolo: "Tus horarios",
    hintChatYVoz: "Cuándo atiende tu equipo y cómo quieres que suene tu asistente, por WhatsApp y por teléfono.",
    hintChat: "Cuándo atiende tu equipo y cómo quieres que suene tu asistente cuando le escriban.",
    hintVoz: "Cuándo atiende tu equipo y cómo quieres que suene tu asistente cuando le llamen.",
    hintWeb: "Cuándo atiende tu equipo —es lo que verán tus compradores en tu sitio— y con qué estilo quieres que hable.",
    hintMensajes: "Cuándo atiende tu equipo y con qué tono quieres que salgan tus mensajes.",
    hintSolo: "Cuándo atiende tu equipo.",
    label: "Horarios de atención *",
    ejemplo: "Ej. Lunes a viernes 9:00–19:00\nSábado 9:00–14:00 · Domingo cerrado",
    tonoAsistente: "¿Cómo debe sonar tu asistente? *",
    tonoSitio: "¿Cómo quieres que hable tu sitio? *",
    tonoMensajes: "¿Cómo quieres que suenen tus mensajes? *",
    faqsAsistente: "Preguntas frecuentes de tus compradores (opcional)",
    faqsWeb: "Preguntas frecuentes de tus compradores (opcional) — irán en tu sitio",
    ejFaqs: "Ej. ¿Se puede comprar desde el extranjero? Sí. ¿Cuánto es el enganche? Normalmente 20%…",
    indicaciones: "Indicaciones o datos útiles (opcional)",
    ejIndicaciones: "Ej. El sales center está en el lobby de la torre. Valet gratis para visitas…",
    logo: "Logo y colores de tu marca (opcional)",
    ejLogo: "Ej. Logo me lo mandas por WhatsApp · azul marino y dorado",
    escalacionTitulo: "¿A quién le avisamos cuando alguien pide hablar con una persona?",
    escalacionHint:
      "Tu asistente nunca discute con quien pide un humano: toma sus datos y avisa al momento. Aquí decides a quién.",
    escalacionNombre: "Nombre de quien recibe el aviso *",
    ejEscalacionNombre: "Ej. Laura Medina, asesora de guardia",
    escalacionTel: "Su número directo *",
    ejEscalacionTel: "Ej. +1 305 555 0142",
    escalacionAvisoVoz:
      "⚠️ Que sea un número DIRECTO, no el teléfono general de la oficina. Tu agente de voz entra justo cuando el general no alcanzó a contestar: si el aviso cae ahí, se pierde igual.",
    escalacionAvisoChat:
      "⚠️ Que sea el número DIRECTO de esa persona, no un buzón que revisa todo el equipo. Un aviso que es de todos no es de nadie, y quien esperaba respuesta se enfría.",
    escalacionVia: "¿Por dónde le llega el aviso? *",
    preciosTitulo: "¿Qué hace con los precios? *",
    preciosHint:
      "Cuando un comprador pregunta cuánto cuesta una unidad, si queda disponibilidad o cuándo entregan. Tú decides — y lo que eliges es de dónde sale el dato, no si puede decirlo.",
    preciosPublicadoLabel: "¿Qué dice tu web hoy? Cópialo tal cual, con el link",
    ejPreciosPublicado: "Preventa desde $230,000 — tusitio.com/proyectos",
    preciosFuenteLabel: "¿Dónde tienes tu lista de precios al día?",
    ejPreciosFuente: "Follow Up Boss / una hoja de Google / nuestro sistema propio",
    sueloTitulo: "Tres cosas que tu asistente hace siempre",
    sueloHint:
      "Todo lo demás lo eliges tú. Estas tres no se pueden quitar, y te las decimos de frente porque son las que te protegen a ti.",
  },
  // ⚠️ Aquí NO va la opción "llamada", y no es un olvido: el guardián la cazó
  // colándose en el portal de un cliente que solo compró el asistente de chat, y
  // tenía razón — leer "te avisamos por llamada" ahí hace pensar que también le
  // pusimos un agente de voz. Se arregló el texto, no la medida.
  viasAviso: [
    { val: "whatsapp", label: "WhatsApp", desc: "Lo ve al momento" },
    { val: "correo", label: "Correo", desc: "Queda registro" },
    { val: "ambos", label: "Los dos", desc: "Aviso al momento y registro" },
  ],
  tonos: [
    { val: "calido", label: "Cálido y cercano", desc: "Como un asesor de confianza" },
    { val: "profesional", label: "Profesional y directo", desc: "Claro, sin rodeos" },
    { val: "elegante", label: "Elegante y discreto", desc: "Tono de firma premium" },
    { val: "fresco", label: "Fresco y relajado", desc: "Juvenil, sin perder respeto" },
  ],
  // ⚠️ El `val` NUNCA se traduce: es lo que se guarda y lo que lee el sistema. Si
  // cambiara con el idioma, el cliente elegiría una cosa y se guardaría otra.
  modosPrecio: [
    {
      val: "transfiere",
      label: "Que lo pase con un asesor",
      desc: "No dice precios ni disponibilidad: te pasa al comprador con lo que ya averiguó. En llamada te lo pasa en caliente, con el caso resumido.",
    },
    {
      val: "publicado",
      label: "Solo lo que ya publico",
      desc: "Puede repetir el rango que ya está en tu web (“desde $230,000”), nunca el precio de una unidad concreta. Nos das la frase y el link.",
    },
    {
      val: "en-vivo",
      label: "Que lo consulte en el momento",
      desc: "Lee tu lista de precios cada vez que alguien pregunta, igual que ya hace con tu calendario. El dato está tan al día como tu fuente. Necesita conectarse a donde la tengas.",
    },
  ],
  // ⚠️ El `id` NO se traduce, igual que los `val`: es lo que permite comprobar que una
  // regla sigue siendo la que dice ser. Sin él, el guardián solo podía buscar palabras
  // sueltas en el bloque — y al cambiar el título por lo contrario no se enteraba,
  // porque la palabra seguía apareciendo en el motivo.
  suelo: [
    {
      id: "vivienda-justa",
      titulo: "Nunca opina sobre un vecindario ni sobre quién vive ahí",
      que: "Da datos objetivos —dónde está, a cuánto del aeropuerto— y pasa al asesor cualquier pregunta sobre el perfil de la zona.",
      porque: "Lo prohíbe la ley federal de vivienda justa, y la responsabilidad cae en el bróker. Es la regla que más fácil se rompe sin querer, porque el comprador la pregunta con toda inocencia.",
    },
    {
      id: "se-identifica",
      titulo: "Siempre dice que es un asistente, y avisa si la llamada se graba",
      que: "Lo dice en la primera frase, antes de nada.",
      porque: "Florida exige el consentimiento de las dos partes: grabar sin avisar no es una falta de estilo, es un delito estatal.",
    },
    {
      id: "no-inventa",
      titulo: "Nunca inventa",
      que: "Si no tiene el dato, lo dice o te lo pasa. No se lo imagina.",
      porque: "Un dato equivocado dicho con seguridad es peor que no darlo, y te lo reclaman a ti.",
    },
  ],

  numero: {
    qChat: "¿Qué número atenderá tu asistente?",
    hintChat: "La decisión importante — léela con calma, no hay respuesta incorrecta.",
    actualChat:
      "tus compradores ya lo conocen — es la mejor opción para la mayoría. El detalle: al conectarlo al asistente sale de la app del teléfono y tu equipo pasa a responder desde una bandeja en la computadora.",
    nuevoChat:
      "tu número de siempre se queda como está en tu teléfono, y el asistente estrena línea propia. Cuesta poco y se anuncia donde ya publicas hoy.",
    qMensajes: "¿Desde qué número salen tus mensajes?",
    hintMensajes: "Los recordatorios tienen que salir de algún WhatsApp — tú decides de cuál.",
    actualMensajes:
      "tus compradores lo reconocen y no lo mandan a spam. El detalle: al conectarlo sale de la app del teléfono y tu equipo pasa a responder desde una bandeja en la computadora.",
    nuevoMensajes:
      "tu número de siempre se queda como está en tu teléfono, y los mensajes salen de una línea aparte. Cuesta poco.",
    labelActual: "Mi número actual",
    labelNuevo: "Un número nuevo",
    descActual: "El que ya conocen tus compradores",
    descNuevo: "Una línea aparte",
    noSe: "No sé — asesórenme",
    noSeDesc: "Lo vemos juntos",
    prefijoActual: "📱 Tu número actual:",
    prefijoNuevo: "🆕 Un número nuevo:",
  },

  linea: {
    q: "¿Cómo van a llegarle las llamadas?",
    hint: "Tu número de siempre no se toca. Aquí solo decides por dónde entra tu asistente.",
    desvio:
      "tus compradores siguen marcando el mismo número de siempre. Cuando nadie contesta —o ya cerraron— la llamada se desvía sola al asistente. Nadie se entera del cambio y tú no tocas nada de tu teléfono.",
    nuevo:
      "el asistente estrena línea propia y tú decides dónde anunciarla. Tu número actual se queda exactamente igual.",
    labelDesvio: "Desviar mi número",
    labelNuevo: "Una línea nueva",
    descDesvio: "Recomendado · nadie nota el cambio",
    descNuevo: "El asistente estrena número",
    prefijoDesvio: "📞 Desviar tu número:",
    prefijoNuevo: "🆕 Una línea nueva:",
  },

  calendario: {
    q: "Tu calendario o agenda",
    hintAmbos: "Para que las visitas que se agenden —por tu asistente o desde tu sitio— caigan donde tú ya trabajas.",
    hintAsistente: "Para que las visitas que agende tu asistente caigan donde tú ya trabajas.",
    hintWeb: "Para que las visitas que se agenden desde tu sitio caigan donde tú ya trabajas.",
    hintMensajes: "Para que tus recordatorios salgan solos de las visitas que ya tienes agendadas.",
    google: "Google Calendar",
    software: "Mi software de agenda",
    ninguno: "Aún no uso ninguno",
    ningunoDesc: "Te montamos uno",
  },

  demo: {
    ideas: [
      "Pide informes como comprador nuevo",
      "Pregunta el precio de una unidad",
      "Pide un horario y luego cámbialo",
      "Pregunta algo raro, a ver cómo sale",
      "Di “quiero hablar con una persona”",
    ],
  },

  textos: {
    qAmbos: "Los textos y el estilo de tu inmobiliaria",
    hintAmbos: "El estilo de tu sitio, y los textos que mandará tu sistema — tú les das el visto bueno.",
    qWeb: "El estilo de tu sitio",
    hintWeb: "Con esto el primer borrador ya se va a sentir tuyo. Todo es opcional, pero entre más nos des, mejor sale.",
    qMensajes: "Los textos de tu inmobiliaria",
    hintMensajes: "Recordatorios y confirmaciones que mandará tu sistema — tú les das el visto bueno.",
  },

  equipo: {
    q: "Tu equipo de ventas",
    hint:
      "Tu panel te enseña cómo va cada asesor, así que necesitamos saber quiénes son. " +
      "A cada uno le creamos su propio acceso: ve sus compradores y sus visitas, y nada más. " +
      "Quien dirige ve a todo el equipo.",
    labelNombre: "Nombre",
    ejNombre: "Ana Ruiz",
    labelRol: "Qué ve",
    // ⚠️ Las CLAVES no se traducen: son lo que se guarda y lo que acaba en su acceso.
    roles: { asesor: "Solo lo suyo", director: "Todo el equipo" },
    rolAyuda: "Puedes poner a más de una persona como dirección.",
    agregar: "Agregar a alguien",
    quitar: "Quitar",
    labelComision: "Lo que te deja una venta, en promedio",
    ejComision: "18,000",
    comisionAyuda:
      "Solo lo usamos cuando un asesor marca una venta sin escribir el importe. Es tuyo y no se publica en ningún lado.",
    nota:
      "Sus claves las creamos nosotros y te las pasamos por videollamada, una por persona. " +
      "Nunca van por chat ni por correo, y tampoco las guardamos escritas.",
  },

  resumen: {
    etiquetaNumeroChat: "Decisión del número de WhatsApp",
    etiquetaNumeroMensajes: "Número desde el que salen tus mensajes",
    etiquetaDemoChat: "Probaste el asistente",
    etiquetaDemoOtro: "Probaste tu sistema",
    completo: "¡Tu arranque está COMPLETO!",
    listo: (nombre) => (nombre ? `¡Listo, ${nombre}! Tu parte inicial está hecha` : "¡Listo! Tu parte inicial está hecha"),
    noTeFalta: "No te falta nada. Nosotros seguimos construyendo y aquí mismo verás el avance de tu proyecto.",
    seguimos: (lo) =>
      `Ya nos avisó el sistema y nos ponemos a construir ${lo}. Lo que quede pendiente lo puedes completar aquí mismo cuando quieras — este link es tuyo.`,
  },


  cuentas: {
    titulo: "Tus cuentas — tuyas desde el día uno",
    subtitulo: "Las abrimos nosotros, a tu nombre. Tú no tienes que crear ninguna.",
    nuncaCompartas: "Nunca compartas contraseñas ni llaves",
    porWhatsAppA: "por WhatsApp, y solo a este número:",
    tuNoHaces: "tú no haces nada",
    comoSeLlame: "¿Cómo te gustaría que se llame? (opcional)",
    telefonoCodigos: "Teléfono donde te llegan los códigos",
    hintTelefono: "10 dígitos — normalmente el mismo de tu WhatsApp",
    horarioEscribir: "¿Qué horario te queda mejor para que te escribamos? (opcional)",
    ejHorario: "ej. martes o jueves después de las 3, que es cuando puedo contestar rápido",
  },
  calendarioPasos: {
    ruta: "Configuración del calendario → Compartir con determinadas personas → Añadir",
    listo: "Google Calendar ordenado y listo",
    marcar: "Marcar cuando esté listo (puedes volver después)",
    marcado: "✓ Listo, ya quedó",
  },
  demoUi: {
    titulo: "Juega a ser tu comprador",
    subtitulo: "Prueba un asistente como el tuyo — así se sentirá escribirle a tu inmobiliaria.",
    ponloAPrueba: "Ponlo a prueba con esto:",
    yaLoProbe: "✓ Ya lo probé",
    marcarProbado: "Marcar cuando lo hayas probado",
    queTeParecio: "¿Qué te pareció? ¿Algo que quieras distinto en el tuyo? (opcional)",
    ejOpinion: "Ej. Me gustó, pero quiero que siempre pregunte desde qué país escriben…",
  },
  estilo: {
    paleta: "Tu paleta de colores (si tienes una)",
    paginaQueGusta: "Página que te gusta",
    quitarReferencia: "Quitar referencia",
    queTeGusta: "¿Qué te gusta de ella?",
    // 🔴 El ejemplo decía "cómo muestran los precios". Tu sitio no publica precios,
    // así que ese ejemplo le planta la idea de que el suyo sí los va a mostrar.
    ejQueGusta: "Ej. lo limpio del menú, las fotos grandes, cómo se ven los planos…",
    enPreparacion: "en preparación",
    aprobado: "Aprobado ✓",
    conCambios: "Con cambios",
    porRevisar: "Por revisar",
    queCambiamos: "¿Qué le cambiamos?",
    ejCambio: "Ej. Que no diga 'estimado cliente', mejor solo el nombre…",
  },
  resumenUi: {
    titulo: "Así va tu parte",
    hint: "Revisa el resumen — lo pendiente lo puedes completar después con este mismo link.",
    desarrollos: "Desarrollos y precios",
    horariosYTono: "Horarios y tono",
    horarios: "Horarios de atención",
    llamadas: "Cómo llegan tus llamadas",
    cuentasListas: "Cuentas: las creamos nosotros a tu nombre",
    cuentasFaltan: "Cuentas: falta decirnos tu correo y teléfono",
    calendario: "Calendario compartido",
    estiloSitio: "Estilo de tu sitio: paleta y referencias",
    textosAprobados: "Textos aprobados",
    enviar: "Mi parte está lista 🚀",
    faltaEsencial: "(falta — es esencial)",
    completaEsenciales: "Para avisarnos que arranquemos, completa lo marcado como esencial.",
  },

  prosa: {
    tuParteToma1: "Tu parte toma ",
    tuParteToma2: " en total, y no tiene que ser de corrido: cierra y regresa con este mismo link cuando quieras.",
    seguridadTitulo: "Nunca compartas contraseñas ni llaves",
    seguridadResto2: " — con nadie, ni con nosotros. Jamás te vamos a pedir una.",
    codigosAntes: "Los códigos de confirmación solo nos los dictas ",
    codigosFuerte: "por WhatsApp, y solo a este número:",
    codigosDespues: ". Si te escriben de otro número diciendo que son de Upcore, ",
    codigosFuerte2: "no somos nosotros",
    codigosFinal: " — verifícalo con nosotros antes de contestar nada.",
    correoAntes: "Los códigos de todas las cuentas llegan ahí y ",
    correoFuerte1: "tú no haces nada",
    correoMedio: ". Además deja ",
    correoFuerte2: "todas las cuentas de tu inmobiliaria en un solo lugar",
    // ⛔ NO se promete entrega EN PERSONA (2026-08-23, dicho por Yael): Upcore opera en
    // remoto y el cliente está en Florida, así que ir en persona no es algo que se pueda
    // cumplir. Prometerlo aquí es una promesa rota escrita por nosotros, en la pantalla
    // donde le estamos pidiendo confianza para manejar sus cuentas.
    // Lo vigila scripts/probar-arranque.mjs.
    correoFinal:
      ", sin revolverse con tu correo personal. Al entregarte el proyecto te pasamos su acceso por videollamada, y queda tuyo con todo adentro.",
    calAntes: "En tu Google Calendar: ",
    calFuerte: "Configuración del calendario → Compartir con determinadas personas → Añadir",
    calDespues: ", y agrega el correo que te mandaremos por WhatsApp, con permiso de “Realizar cambios en eventos”.",
    calNingunoAntes: "Sin problema: te dejamos un ",
    calNingunoFuerte: "Google Calendar ordenado y listo",
    calNingunoDespues: " (gratis) como parte del proyecto. Marca la casilla y sigue.",
    textosAntes: "✍️ Tus textos están ",
    textosFuerte: "en preparación",
    textosDespues:
      " (los redactamos con tu tono en cuanto tengamos tu checklist). Te avisaremos por WhatsApp cuando estén aquí para tu visto bueno.",
    ejPaleta: "Ej. azul marino y dorado · #1B2A4A y #C9A227 · o el link de una página cuyos colores te gusten",
    paginaQueGusta: (n) => `Página que te gusta ${n}`,
  },
  ui: {
    guardando: "Guardando…",
    guardado: "Guardado ✓",
    errorGuardar: "⚠️ No se pudo guardar — revisa tu internet",
    siguiente: "Siguiente →",
    atras: "← Atrás",
    verEnOtroIdioma: "View in English",
    avance: "Avance de tu proyecto",
    pie: (empresa) => `Upcore AI · Portal privado de ${empresa} — no compartas este link`,
    dudas: "¿Dudas?",
    escribenos: "Escríbenos por WhatsApp",
    faltaPara: (que) => `Para seguir, falta: ${que}`,
    notaAvance:
      "Esta sección la vamos actualizando nosotros conforme avanza tu proyecto — entra cuando quieras a ver cómo va.",
    fases: {
      "Preparación: checklist y cuentas": "Preparación: checklist y cuentas",
      "WhatsApp oficial con Meta": "WhatsApp oficial con Meta",
      "Construcción del sistema": "Construcción del sistema",
      "Pruebas contigo": "Pruebas contigo",
      "Entrega y capacitación": "Entrega y capacitación",
    },
    estados: { pendiente: "pendiente", "en-curso": "en curso", listo: "listo" },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// INGLÉS
// ─────────────────────────────────────────────────────────────────────────────

const EN: TextosArranque = {
  suyo: {
    asistente: "your assistant",
    asistenteWa: "your WhatsApp assistant",
    asistenteTel: "your phone assistant",
    sitio: "your site",
    recordatorios: "your reminders",
    reactivacion: "your re-engagement messages",
    panel: "your dashboard",
    sistema: "your system",
  },
  unir: unirCon("and"),

  duraciones: { corta: "~15 minutes", media: "~30 minutes", larga: "~1 hour" },
  bienvenida: {
    etiqueta: (empresa) => `Onboarding portal · ${empresa}`,
    paso: (n, de) => `Step ${n} of ${de}`,
    titulo: (nombre) => (nombre ? `${nombre}, welcome to your onboarding 🚀` : "Welcome to your onboarding 🚀"),
    intro: (lo) => `Here you give us what we need to build ${lo} — at your own pace, and everything saves itself.`,
    tuParteToma: (duracion) =>
      `Your part takes ${duracion} in total, and it does not have to be in one sitting: close it and come back with this same link whenever you want.`,
    guiando: "We walk you through it step by step — you do not need to know anything technical.",
    seguridadFuerte: "We never ask for passwords or keys here.",
    seguridadResto:
      "Only confirmations. If someone asks you for a password over chat, that is not us.",
    empezar: "Get started →",
    seGuarda: "Your progress saves itself at every step.",
  },

  desarrollos: {
    q: "Your developments and prices",
    hintAsistente:
      "This is how your assistant talks about your actual developments. The price range is for your team: the assistant never says it — in preconstruction it changes by line, floor and phase, so it hands the question to your agent. And it is not set in stone: when one sells out you pause it yourself from your phone, without telling us.",
    hintWeb:
      "This is what your buyers will see on your site: the name of each development, where it is and what kind of units. The price range is NOT published —it goes stale on its own— but it helps us write the page properly. And it is not set in stone: when one sells out you pause it yourself from your phone and it stops showing.",
    hintMensajes:
      "This is how your messages talk about your actual developments. The price range stays with your team: the messages do not say it.",
    hintPanel:
      "This is how your dashboard shows your developments the way you sell them. The price range is for internal use.",
    labelNombre: "Development or unit",
    ejNombre: "e.g. Brickell Tower — 2 bedrooms",
    labelPrecio: "Price range — not published",
    ejPrecio: "e.g. from 480,000 (for your team only)",
    labelTamano: "Bedrooms or size",
    ejTamano: "e.g. 2 bd · 1,100 sq ft",
    quitar: "Remove development",
    agregar: "+ Add another development",
    faltan: "Add at least one development to continue.",
    pegarAbrir: "Have your list handy? Paste it all at once",
    pegarTitulo: "Paste your list — one development per line",
    pegarHint:
      "Works straight from a spreadsheet, an email or your website. If you also have price and size, separate them with a | or a tab. You can review and fix each one afterwards.",
    pegarEjemplo:
      "Brickell Tower — 2 bedrooms | from 480,000 | 1,100 sq ft\nAventura Park\nDoral Towers — penthouse",
    pegarUsar: "Use this list",
    pegarCancelar: "Cancel",
    pegarNada: "I could not find any developments there. Write one per line.",
    pegarPisa: "This replaces whatever you already typed above.",
    pegarRecortado: "Only the first 60 were taken. Add the rest by hand if you need them.",
    pegarEncabezado: "Your table header was ignored.",
  },

  horarios: {
    qAsistente: "Hours and personality",
    qEstilo: "Your hours and your style",
    qSolo: "Your hours",
    hintChatYVoz: "When your team is available and how you want your assistant to sound, on WhatsApp and on the phone.",
    hintChat: "When your team is available and how you want your assistant to sound when someone messages.",
    hintVoz: "When your team is available and how you want your assistant to sound when someone calls.",
    hintWeb: "When your team is available —this is what your buyers will see on your site— and the style you want it to speak in.",
    hintMensajes: "When your team is available and the tone you want your messages to go out in.",
    hintSolo: "When your team is available.",
    label: "Business hours *",
    ejemplo: "e.g. Monday to Friday 9:00–19:00\nSaturday 9:00–14:00 · Sunday closed",
    tonoAsistente: "How should your assistant sound? *",
    tonoSitio: "How do you want your site to speak? *",
    tonoMensajes: "How do you want your messages to sound? *",
    faqsAsistente: "Frequently asked questions from your buyers (optional)",
    faqsWeb: "Frequently asked questions from your buyers (optional) — these will go on your site",
    ejFaqs: "e.g. Can I buy from abroad? Yes. How much is the down payment? Usually 20%…",
    indicaciones: "Directions or useful details (optional)",
    ejIndicaciones: "e.g. The sales center is in the tower lobby. Free valet for visits…",
    logo: "Your brand's logo and colors (optional)",
    ejLogo: "e.g. I'll send you the logo on WhatsApp · navy blue and gold",
    escalacionTitulo: "Who do we alert when someone asks to talk to a person?",
    escalacionHint:
      "Your assistant never argues with someone who asks for a human: it takes their details and alerts on the spot. Here you decide who gets it.",
    escalacionNombre: "Name of whoever gets the alert *",
    ejEscalacionNombre: "e.g. Laura Medina, agent on duty",
    escalacionTel: "Their direct number *",
    ejEscalacionTel: "e.g. +1 305 555 0142",
    escalacionAvisoVoz:
      "⚠️ Make it a DIRECT number, not the office main line. Your voice agent steps in precisely when the main line did not get picked up: if the alert lands there, it is lost all the same.",
    escalacionAvisoChat:
      "⚠️ Make it that person's DIRECT number, not an inbox the whole team checks. An alert that belongs to everyone belongs to no one, and whoever was waiting goes cold.",
    escalacionVia: "How should the alert reach them? *",
    preciosTitulo: "What does it do about pricing? *",
    preciosHint:
      "For when a buyer asks what a unit costs, whether anything is left, or when it delivers. You decide — and what you're choosing is where the number comes from, not whether it may say it.",
    preciosPublicadoLabel: "What does your site say today? Copy it exactly, with the link",
    ejPreciosPublicado: "Pre-construction from $230,000 — yoursite.com/projects",
    preciosFuenteLabel: "Where do you keep your up-to-date price list?",
    ejPreciosFuente: "Follow Up Boss / a Google Sheet / our own system",
    sueloTitulo: "Three things your assistant always does",
    sueloHint:
      "Everything else is your call. These three can't be removed, and we tell you upfront because they're the ones protecting you.",
  },
  viasAviso: [
    { val: "whatsapp", label: "WhatsApp", desc: "They see it right away" },
    { val: "correo", label: "Email", desc: "Leaves a record" },
    { val: "ambos", label: "Both", desc: "Instant alert and a record" },
  ],
  tonos: [
    { val: "calido", label: "Warm and personal", desc: "Like a trusted advisor" },
    { val: "profesional", label: "Professional and direct", desc: "Clear, no detours" },
    { val: "elegante", label: "Elegant and understated", desc: "A premium firm's tone" },
    { val: "fresco", label: "Fresh and relaxed", desc: "Youthful, still respectful" },
  ],
  // ⚠️ Los `val` son IDÉNTICOS a los del español: es lo que se guarda y lo que lee el
  // sistema. Solo cambian las etiquetas.
  modosPrecio: [
    {
      val: "transfiere",
      label: "Hand it to an advisor",
      desc: "It gives no pricing or availability: it hands you the buyer with what it already learned. On a call it transfers live, with the case summarized.",
    },
    {
      val: "publicado",
      label: "Only what I already publish",
      desc: "It can repeat the range already on your site (“from $230,000”), never the price of a specific unit. You give us the wording and the link.",
    },
    {
      val: "en-vivo",
      label: "Look it up in the moment",
      desc: "It reads your price list every time someone asks, the same way it already reads your calendar. The number is as current as your source. It needs to connect to wherever you keep it.",
    },
  ],
  suelo: [
    {
      id: "vivienda-justa",
      titulo: "It never comments on a neighborhood or on who lives there",
      que: "It gives objective facts — where it is, how far from the airport — and hands any question about the area's profile to your advisor.",
      porque: "Federal fair housing law prohibits it, and the liability falls on the broker. It's the rule that's easiest to break by accident, because buyers ask it in all innocence.",
    },
    {
      id: "se-identifica",
      titulo: "It always says it's an assistant, and warns if the call is recorded",
      que: "In the first sentence, before anything else.",
      porque: "Florida requires two-party consent: recording without warning isn't a matter of style, it's a state crime.",
    },
    {
      id: "no-inventa",
      titulo: "It never makes anything up",
      que: "If it doesn't have the answer, it says so or hands it to you. It doesn't guess.",
      porque: "A wrong answer delivered confidently is worse than no answer, and you're the one who gets the complaint.",
    },
  ],

  numero: {
    qChat: "Which number will your assistant answer?",
    hintChat: "The important decision — read it calmly, there is no wrong answer.",
    actualChat:
      "your buyers already know it — it is the best option for most firms. The detail: once it is connected to the assistant it leaves the phone app, and your team answers from an inbox on the computer.",
    nuevoChat:
      "your usual number stays exactly as it is on your phone, and the assistant gets its own line. It costs little and you advertise it wherever you already publish today.",
    qMensajes: "Which number do your messages go out from?",
    hintMensajes: "The reminders have to go out from some WhatsApp — you decide which one.",
    actualMensajes:
      "your buyers recognize it and do not send it to spam. The detail: once connected it leaves the phone app, and your team answers from an inbox on the computer.",
    nuevoMensajes:
      "your usual number stays exactly as it is on your phone, and the messages go out from a separate line. It costs little.",
    labelActual: "My current number",
    labelNuevo: "A new number",
    descActual: "The one your buyers already know",
    descNuevo: "A separate line",
    noSe: "Not sure — advise me",
    noSeDesc: "We look at it together",
    prefijoActual: "📱 Your current number:",
    prefijoNuevo: "🆕 A new number:",
  },

  linea: {
    q: "How will the calls reach it?",
    hint: "Your usual number is not touched. Here you only decide how your assistant comes in.",
    desvio:
      "your buyers keep dialing the same number as always. When nobody answers —or you have closed— the call forwards itself to the assistant. Nobody notices the change and you touch nothing on your phone.",
    nuevo:
      "the assistant gets its own line and you decide where to advertise it. Your current number stays exactly the same.",
    labelDesvio: "Forward my number",
    labelNuevo: "A new line",
    descDesvio: "Recommended · nobody notices the change",
    descNuevo: "The assistant gets its own number",
    prefijoDesvio: "📞 Forwarding your number:",
    prefijoNuevo: "🆕 A new line:",
  },

  calendario: {
    q: "Your calendar",
    hintAmbos: "So the visits that get booked —by your assistant or from your site— land where you already work.",
    hintAsistente: "So the visits your assistant books land where you already work.",
    hintWeb: "So the visits booked from your site land where you already work.",
    hintMensajes: "So your reminders go out on their own from the visits you already have booked.",
    google: "Google Calendar",
    software: "My scheduling software",
    ninguno: "I don't use one yet",
    ningunoDesc: "We set one up for you",
  },

  demo: {
    ideas: [
      "Ask for information like a brand-new buyer",
      "Ask the price of a unit",
      "Ask for a time slot and then change it",
      "Ask something odd, see how it handles it",
      "Say “I want to talk to a person”",
    ],
  },

  textos: {
    qAmbos: "Your firm's copy and style",
    hintAmbos: "The style of your site, and the messages your system will send — you sign off on them.",
    qWeb: "Your site's style",
    hintWeb: "With this the first draft will already feel like yours. All optional, but the more you give us, the better it comes out.",
    qMensajes: "Your firm's copy",
    hintMensajes: "Reminders and confirmations your system will send — you sign off on them.",
  },

  equipo: {
    q: "Your sales team",
    hint:
      "Your dashboard shows you how each agent is doing, so we need to know who they are. " +
      "We create a separate login for each one: they see their own buyers and visits, and nothing else. " +
      "Whoever runs the team sees everyone.",
    labelNombre: "Name",
    ejNombre: "Ana Ruiz",
    labelRol: "What they see",
    roles: { asesor: "Only their own", director: "The whole team" },
    rolAyuda: "You can set more than one person as management.",
    agregar: "Add someone",
    quitar: "Remove",
    labelComision: "What a sale leaves you, on average",
    ejComision: "18,000",
    comisionAyuda:
      "We only use it when an agent marks a sale without entering the amount. It is yours and it is never published anywhere.",
    nota:
      "We create their keys and hand them to you on a video call, one per person. " +
      "They never travel by chat or email, and we do not keep them written down either.",
  },

  resumen: {
    etiquetaNumeroChat: "WhatsApp number decision",
    etiquetaNumeroMensajes: "Number your messages go out from",
    etiquetaDemoChat: "You tested the assistant",
    etiquetaDemoOtro: "You tested your system",
    completo: "Your onboarding is COMPLETE!",
    listo: (nombre) => (nombre ? `All set, ${nombre}! Your initial part is done` : "All set! Your initial part is done"),
    noTeFalta: "Nothing is missing on your side. We keep building, and you will see your project's progress right here.",
    seguimos: (lo) =>
      `The system already notified us and we are getting to work on ${lo}. Anything still pending you can finish right here whenever you want — this link is yours.`,
  },


  cuentas: {
    titulo: "Your accounts — yours from day one",
    subtitulo: "We open them, in your name. You do not have to create a single one.",
    nuncaCompartas: "Never share passwords or keys",
    porWhatsAppA: "on WhatsApp, and only to this number:",
    tuNoHaces: "you do nothing",
    comoSeLlame: "What would you like it to be called? (optional)",
    telefonoCodigos: "Phone where the codes reach you",
    hintTelefono: "10 digits — usually the same as your WhatsApp",
    horarioEscribir: "What time works best for us to message you? (optional)",
    ejHorario: "e.g. Tuesday or Thursday after 3, that is when I can reply quickly",
  },
  calendarioPasos: {
    ruta: "Calendar settings → Share with specific people → Add",
    listo: "Google Calendar organized and ready",
    marcar: "Mark it when it is done (you can come back later)",
    marcado: "✓ Done, it is set",
  },
  demoUi: {
    titulo: "Play your own buyer",
    subtitulo: "Try an assistant like yours — this is what messaging your firm will feel like.",
    ponloAPrueba: "Put it to the test with this:",
    yaLoProbe: "✓ I already tried it",
    marcarProbado: "Mark it when you have tried it",
    queTeParecio: "What did you think? Anything you want different in yours? (optional)",
    ejOpinion: "e.g. I liked it, but I want it to always ask which country they are writing from…",
  },
  estilo: {
    paleta: "Your color palette (if you have one)",
    paginaQueGusta: "A site you like",
    quitarReferencia: "Remove reference",
    queTeGusta: "What do you like about it?",
    ejQueGusta: "e.g. how clean the menu is, the large photos, how the floor plans look…",
    enPreparacion: "being prepared",
    aprobado: "Approved ✓",
    conCambios: "With changes",
    porRevisar: "To review",
    queCambiamos: "What should we change?",
    ejCambio: "e.g. Don't say 'dear client', just the name…",
  },
  resumenUi: {
    titulo: "Here is how your part is going",
    hint: "Look over the summary — whatever is pending you can finish later with this same link.",
    desarrollos: "Developments and prices",
    horariosYTono: "Hours and tone",
    horarios: "Business hours",
    llamadas: "How your calls come in",
    cuentasListas: "Accounts: we create them in your name",
    cuentasFaltan: "Accounts: we still need your email and phone",
    calendario: "Calendar shared",
    estiloSitio: "Your site's style: palette and references",
    textosAprobados: "Copy approved",
    enviar: "My part is ready 🚀",
    faltaEsencial: "(missing — this one is essential)",
    completaEsenciales: "To tell us to get started, fill in everything marked as essential.",
  },

  prosa: {
    tuParteToma1: "Your part takes ",
    tuParteToma2: " in total, and it does not have to be in one sitting: close it and come back with this same link whenever you want.",
    seguridadTitulo: "Never share passwords or keys",
    seguridadResto2: " — with anyone, not even with us. We will never ask you for one.",
    codigosAntes: "You only read us the confirmation codes ",
    codigosFuerte: "on WhatsApp, and only to this number:",
    codigosDespues: ". If someone messages you from another number saying they are from Upcore, ",
    codigosFuerte2: "that is not us",
    codigosFinal: " — check with us before answering anything.",
    correoAntes: "The codes for every account arrive there and ",
    correoFuerte1: "you do nothing",
    correoMedio: ". It also keeps ",
    correoFuerte2: "all of your firm's accounts in one place",
    // ⛔ Igual que en español: nada de "in person". Ver el comentario de la versión en español.
    correoFinal:
      ", without getting mixed up with your personal email. When we hand the project over we give you its access on a video call, and it is yours with everything inside.",
    calAntes: "In your Google Calendar: ",
    calFuerte: "Calendar settings → Share with specific people → Add",
    calDespues: ", and add the email we will send you on WhatsApp, with “Make changes to events” permission.",
    calNingunoAntes: "No problem: we set up a ",
    calNingunoFuerte: "Google Calendar, organized and ready",
    calNingunoDespues: " (free) as part of the project. Tick the box and carry on.",
    textosAntes: "✍️ Your copy is ",
    textosFuerte: "being prepared",
    textosDespues:
      " (we write it in your tone as soon as we have your checklist). We will message you on WhatsApp when it is here for your sign-off.",
    ejPaleta: "e.g. navy blue and gold · #1B2A4A and #C9A227 · or a link to a site whose colors you like",
    paginaQueGusta: (n) => `A site you like ${n}`,
  },
  ui: {
    guardando: "Saving…",
    guardado: "Saved ✓",
    errorGuardar: "⚠️ Could not save — check your connection",
    siguiente: "Next →",
    atras: "← Back",
    verEnOtroIdioma: "Ver en español",
    avance: "Your project's progress",
    pie: (empresa) => `Upcore AI · Private portal for ${empresa} — please do not share this link`,
    dudas: "Questions?",
    escribenos: "Message us on WhatsApp",
    faltaPara: (que) => `To continue, still missing: ${que}`,
    notaAvance:
      "We keep this section updated as your project moves along — come in whenever you want to see how it is going.",
    fases: {
      "Preparación: checklist y cuentas": "Setup: checklist and accounts",
      "WhatsApp oficial con Meta": "Official WhatsApp with Meta",
      "Construcción del sistema": "Building the system",
      "Pruebas contigo": "Testing with you",
      "Entrega y capacitación": "Delivery and training",
    },
    estados: { pendiente: "pending", "en-curso": "in progress", listo: "done" },
  },
};

export const TA: Record<Idioma, TextosArranque> = { es: ES, en: EN };
