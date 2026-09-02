// Los TEXTOS de la propuesta, en español y en inglés. FUENTE ÚNICA de los dos idiomas.
//
// Mismo patrón que lib/acuerdo-textos.ts, y por el mismo motivo: el cliente habla los
// dos idiomas pero su empresa es de Estados Unidos. La diferencia es que aquí no hay
// nada que "gobierne" — una propuesta no obliga a nadie —, así que el inglés no lleva
// cláusula de idioma; lo que sí lleva es el mismo candado contra el desfase:
//
//   1. `Record<Idioma, TextosProp>` obliga a que los dos idiomas tengan las MISMAS
//      claves: si alguien agrega una frase en español y no la traduce, no compila.
//   2. Las funciones de lib/propuesta-copy.ts siguen decidiendo QUÉ texto sale según
//      las piezas cotizadas. El idioma solo cambia las palabras, nunca la estructura.
//
// ⚠️ Los nombres de las PIEZAS (catálogo de lib/calc.ts) no se traducen aquí: ya lo
// hace `traducirRenglon` en lib/acuerdo-textos.ts, y usar dos diccionarios para lo
// mismo es exactamente cómo empiezan los desfases.

import type { Idioma } from "./acuerdo-textos";
import { CALC_TEXTOS, type TextosCalc } from "./calc-textos";

export type ItemParte = { t: string; min: string };

export type TextosProp = {
  // ── Chrome de la página ───────────────────────────────────────────────────
  etiquetaVigencia: (hasta: string) => string;
  titular: (nombre: string, empresa: string, objetivo: string) => string;
  preparado: (fecha: string) => string;
  conSusNumeros: string;
  conInfoPublica: string;
  verEnOtroIdioma: string;
  avisoTraduccion: string;

  secciones: {
    contaste: string;
    costando: string;
    construiriamos: (complejidad: string) => string;
    inversion: string;
    garantia: string;
    proceso: string;
    dudas: string;
  };

  // ── Sección 1: lo que nos contaste ────────────────────────────────────────
  diag: {
    volumen: (v: string) => string;
    agenda: (v: string) => string;
    prospectosPor: (v: string) => string;
    presencia: Record<string, string>;
  };
  objetivos: Record<string, string>;

  // ── Sección 2: el dolor ───────────────────────────────────────────────────
  cadaMes: string;
  enUnAno: string;
  calculo: (a: {
    porSemana: number;
    estimado: boolean;
    unoDeCada: number;
    comision: string;
    comisionEstimada: boolean;
    valor: string;
  }) => string;
  calculoSimple: (a: {
    porSemana: number;
    estimado: boolean;
    comision: string;
    comisionEstimada: boolean;
  }) => string;

  // ── Sección 3: lo que construiríamos ──────────────────────────────────────
  incluidoSinCosto: (que: string) => string;
  ademasSinCosto: string;
  fueraAProposito: { titulo: string; texto: string };
  puedeEsperar: string;

  // ── Sección 4: inversión ──────────────────────────────────────────────────
  contexto: (perdida: string) => string;
  planes: {
    llaveTitulo: string;
    llaveDesc: string;
    gestionadoTitulo: string;
    gestionadoDesc: string;
    favorito: string;
  };
  filas: {
    inversion: string;
    mensualidad: string;
    retorno: string;
    ahorro: string;
  };

  // ── Sección 5: garantía ───────────────────────────────────────────────────
  garantia: { titulo: string; texto: string; nota: string };

  // ── Sección 6: proceso ────────────────────────────────────────────────────
  pasos: {
    dia0: string;
    dia0Titulo: string;
    dia0Desc: string;
    dia1Titulo: string;
    construccionTitulo: string;
    construccionDesc: string;
    pruebasTitulo: string;
    entregaTitulo: string;
    entregaTituloCapacitacion: string;
    entregaWeb: string;
    entregaOtro: string;
    dia1: string;
    mas30: string;
    acompanamientoTitulo: string;
    acompanamientoDesc: string;
    nota: (total: string) => string;
  };
  tuParteTitulo: string;
  tuParteNota: string;
  horasUna: string;
  horasDos: string;
  nuestraParteTitulo: string;
  nuestraParteNota: string;
  noNecesitasTitulo: string;
  consejoHonesto: string;

  // ── Cierre ────────────────────────────────────────────────────────────────
  probarDemo: string;
  meInteresa: string;
  sinCompromiso: (hasta: string) => string;
  descargarPdf: string;
  pie: (empresa: string) => string;
  vencida: { titulo: string; texto: string; cta: string };

  // ── Copy por pieza (lo que consume lib/propuesta-copy.ts) ─────────────────
  boceto: {
    etiqueta: string;
    titulo: string;
    intro: (empresa: string) => string;
    queLlevaWeb: string[];
    queLlevaOtro: (empresa: string) => string[];
    esBocetoTitulo: string;
    esBocetoWeb: string;
    esBocetoOtro: string;
    cta: string;
  };
  waMensaje: (empresa: string) => string;
  recortarVarias: { titulo: string; texto: string };
  recortarUna: { titulo: string; texto: string };
  costos: { dominioK: string; dominioN: string; apisK: string; apisN: string };
  faqBase: Array<{ q: string; a: string }>;
  faqNumeros: { q: string; a: string };
  faqDeDonde: { q: string; a: string };
  faqApis: { q: string; a: string };
  faqDominio: { q: string; a: string };
  // 🔴 Las dos preguntas que TODO prospecto hace y que la propuesta no contestaba.
  // El sitio y el acuerdo sí las responden; el documento de en medio —el que se lee
  // justo antes de decidir— no decía ni una palabra. `faqHumano` solo se muestra con
  // una pieza que hable con compradores; `faqOffmarket` tiene versión de asistente y
  // versión de sitio, porque una web sola no conversa ni escala a nadie.
  faqHumano: { q: string; a: string };
  faqOffmarket: { q: string; a: string };
  faqOffmarketWeb: { q: string; a: string };
  dia1: {
    checklist: string;
    numeroWa: string;
    desvio: string;
    materialWeb: string;
    cuentas: string;
    agendaWeb: string;
    envoltura: (partes: string) => string;
  };
  pruebas: {
    agenteYVoz: string;
    agente: string;
    voz: string;
    web: string;
    auto: string;
    reactivacion: string;
    generico: string;
  };
  seo: string;
  entrega: { web: string; otro: string };
  nuestra: {
    primeraWeb: string;
    primeraReactivacion: string;
    primeraSistema: string;
    probarlo: string;
    garantia: string;
    ajustes: string;
  };
  agenda: {
    integrarSoftware: (nombre: string) => string;
    integrarSistema: string;
    montarDigital: string;
    conectar: string;
    conectarWeb: string;
  };
  bonoGoogle: { titulo: string; desc: string };
  bonoAgenda: { titulo: string; descPapel: string; descCondicional: string };
  noNecesitasBase: string[];
  noNecesitasWeb: string;
  tuParte: Record<string, ItemParte[]>;
  tuParteGenerica: ItemParte[];

  // ── Notas que produce lib/calc.ts (van congeladas en el snapshot) ─────────
  // Viven en lib/calc-textos.ts porque calc.ts se espeja al panel y no puede
  // arrastrar dependencias. Aquí solo se reexponen para que la página las use.
  calc: TextosCalc;
};

// ─────────────────────────────────────────────────────────────────────────────
// ESPAÑOL
// ─────────────────────────────────────────────────────────────────────────────

const ES: TextosProp = {
  etiquetaVigencia: (hasta) => `Diagnóstico personalizado · válido hasta el ${hasta}`,
  titular: (nombre, empresa, objetivo) =>
    `${nombre}, esto es lo que necesita ${empresa} para ${objetivo}`,
  preparado: (fecha) => `Preparado el ${fecha}`,
  // 🔴 "sin compromiso" ES PARTE DEL PRODUCTO (pedido de Yael, 2026-09-01): quien lee
  // una propuesta de un proveedor nuevo necesita saber que leerla no lo amarra a nada.
  // Va aquí, en la línea que enmarca todo el documento, y en las dos variantes.
  conSusNumeros:
    "calculado con los números que tú nos diste, sin promesas infladas. Es gratis y sin compromiso: leerlo no te obliga a nada",
  conInfoPublica:
    "armado con la información pública de tu inmobiliaria, sin promesas infladas. Es gratis y sin compromiso: leerlo no te obliga a nada",
  verEnOtroIdioma: "View in English",
  avisoTraduccion: "",

  secciones: {
    contaste: "Lo que nos contaste",
    costando: "Lo que te está costando seguir igual",
    construiriamos: (c) => `Lo que construiríamos para ti (${c})`,
    inversion: "Tu inversión, con números honestos",
    garantia: "Nuestra garantía (el riesgo lo tomamos nosotros)",
    proceso: "Si dices que sí, así trabajaríamos juntos",
    dudas: "Las dudas que seguro tienes",
  },

  diag: {
    // ⚠️ Antes decía "Volumen: 40-60" a secas: un dato sin unidad ni frase, en el
    // primer bloque que lee el prospecto. Un dato metido en una plantilla tiene
    // que caber en la frase que lo recibe.
    volumen: (v) => `Prospectos nuevos que nos dijiste: ${v}`,
    agenda: (v) => `Hoy la agenda la llevan en: ${v}`,
    prospectosPor: (v) => `Tus prospectos llegan por: ${v}`,
    presencia: {
      "web-y-redes": "Hoy te encuentran por tu sitio web y tus redes",
      "solo-web": "Hoy te encuentran por tu sitio web",
      "solo-redes": "Hoy te encuentran solo por redes — no tienes sitio web",
      nada: "Hoy no tienes sitio web ni redes activas",
    },
  },
  objetivos: {
    "llenar-agenda": "llenar tu agenda de visitas",
    "no-perder-citas": "dejar de perder prospectos por no contestar a tiempo",
    "recuperar-pacientes": "volver a tocar a los prospectos que nunca cerraron",
    imagen: "que tu firma se vea tan profesional como es",
    _default: "dejar de perder prospectos",
  },

  cadaMes: "Cada mes que pasa",
  enUnAno: "En un año",
  calculo: (a) =>
    `El cálculo, a la vista: se te enfrían ~${a.porSemana} prospectos por semana` +
    `${a.estimado ? " (estimado conservador)" : " (tu dato)"}. No todos habrían comprado, ` +
    `así que contamos que cerrarías 1 de cada ${a.unoDeCada}: a ${a.comision} de comisión por venta` +
    `${a.comisionEstimada ? " (promedio del giro)" : " (tu dato)"}, cada prospecto que se ` +
    `enfría vale ~${a.valor}. Cuánto de eso se puede rescatar de verdad va abajo, en el punto ` +
    `de la inversión — y va calculado a la baja.`,
  calculoSimple: (a) =>
    `El cálculo, a la vista: ~${a.porSemana} oportunidades perdidas por semana` +
    `${a.estimado ? " (estimado conservador)" : " (tu dato)"} × ${a.comision}` +
    `${a.comisionEstimada ? " (promedio del giro)" : " (tu dato)"}. Cuánto de eso se puede ` +
    `recuperar de verdad va abajo, en el punto de la inversión — y va calculado a la baja.`,

  incluidoSinCosto: (que) => `Incluido sin costo extra: ${que}, y 30 días de ajustes por nuestra cuenta.`,
  ademasSinCosto: "Además, sin costo",
  fueraAProposito: {
    titulo: "Esto lo dejamos fuera a propósito",
    // 🔴 LA PROMESA DEL PRECIO (decisión de Yael, 2026-08-25). El precio de abajo ya
    // lleva el descuento de paquete —`conDescuento()` en el motor—, así que la pieza
    // aplazada NUNCA se cotiza como si fuera su primera compra. Faltaba DECIRLO: sin
    // esta frase, "está caro" se convierte en un no, y con ella en una venta
    // aplazada. Hay guardián que exige que la promesa esté y que el precio que se
    // enseña sea de verdad el de paquete (`probar-panel-vs-consola.mjs`).
    // La primera frase es el pedido de Yael (2026-09-01) dicho de frente: cotizamos solo
    // lo que aporta valor HOY, y lo demás se enseña aparte — eso es no vender de más.
    texto:
      "Te cotizamos únicamente lo que sí le aporta valor a tu negocio hoy — no te vendemos de más. " +
      "Esto no está incluido en el precio de abajo: sirve, y en algún momento te va a convenir, pero " +
      "primero se resuelve lo que hoy te está costando ventas. Si lo quieres desde el arranque, " +
      "esto es lo que sumaría — y si prefieres agregarlo más adelante, te respeto este mismo " +
      "precio de paquete durante el primer año:",
  },
  puedeEsperar: "puede esperar",

  contexto: (perdida) => `Para ponerla en contexto: compárala contra los ~${perdida} que hoy se van cada mes.`,
  planes: {
    llaveTitulo: "Llave en Mano",
    llaveDesc: "Lo construimos y es 100% tuyo — tú lo operas, sin mensualidad",
    gestionadoTitulo: "Gestionado",
    gestionadoDesc: "Lo construimos Y lo operamos por ti: monitoreo, cambios y soporte",
    favorito: "El favorito de las firmas",
  },
  filas: {
    inversion: "Inversión (una vez)",
    mensualidad: "Mensualidad Upcore",
    retorno: "Retorno sobre lo que cuesta operarlo",
    ahorro: "Ahorro estimado para tu firma",
  },

  garantia: {
    titulo: "Si no te entrego lo acordado funcionando, te devuelvo tu anticipo.",
    // 🔴 EL PILOTO DE 14 DÍAS (decisión de Yael, 2026-09-02): el riesgo del cliente baja a
    // cero SIN regalar el trabajo ni romper el ancla del precio — paga normal, y si en dos
    // semanas funcionando decide que no es para él, se apaga y se le devuelve. Solo el
    // consumo de APIs (contratadas a su nombre) no se devuelve: es de terceros.
    texto:
      "Y va más allá: tienes un piloto de 14 días. Desde que el sistema queda funcionando, si en " +
      "las dos primeras semanas decides que no es para ti, lo apagamos y te devuelvo lo pagado del " +
      "proyecto — solo el consumo de APIs, que va a tu nombre con los proveedores, no es " +
      "reembolsable. Además, los primeros 30 días después de la entrega todos los ajustes van por " +
      "mi cuenta. Tú solo arriesgas seguir como estás.",
    nota: "",
  },

  pasos: {
    dia0: "Día 0",
    dia0Titulo: "Aceptas y das el anticipo",
    dia0Desc:
      "Me confirmas por WhatsApp con un “va”, te mando el acuerdo simple de 1 página (sin letras " +
      "chiquitas) y, en cuanto llega tu anticipo por transferencia, arranco ese mismo día.",
    dia1Titulo: "Recibes tu Portal de Arranque",
    construccionTitulo: "Construcción con avances",
    construccionDesc:
      "Construyo todo y lo conecto con tus herramientas. Te comparto avances por WhatsApp o video " +
      "corto — tú solo opinas si quieres.",
    pruebasTitulo: "TÚ lo pruebas",
    entregaTitulo: "Entrega",
    entregaTituloCapacitacion: "Entrega y capacitación",
    entregaWeb:
      "Tu sitio en vivo, en tu dominio y a tu nombre. Te dejo tu pantalla privada para bloquear con " +
      "un toque los días que no atiendes, y un video corto de tres minutos. Aquí se liquida el resto.",
    entregaOtro:
      "Todo funcionando y a tu nombre, con video de cómo usarlo + guía de 1 página. Aquí se liquida el resto.",
    dia1: "Día 1",
    mas30: "+30 días",
    acompanamientoTitulo: "Acompañamiento",
    acompanamientoDesc:
      "Ajustes incluidos por mi cuenta. Y si elegiste Gestionado, lo operamos, vigilamos y " +
      "mejoramos por ti cada mes.",
    nota: (total) =>
      `* Días hábiles aproximados desde tu anticipo — entrega total ${total}. También dependen de ` +
      `tus tiempos de respuesta: si tú vas rápido, esto vuela.`,
  },
  tuParteTitulo: "Tu parte",
  tuParteNota: "en total, repartida en los primeros días:",
  horasUna: "~1 hora",
  horasDos: "~1 a 2 horas",
  nuestraParteTitulo: "Nuestra parte",
  nuestraParteNota: "Todo lo demás:",
  noNecesitasTitulo: "Y lo que NO vas a necesitar:",
  consejoHonesto: "Nuestro consejo honesto:",

  probarDemo: "¿Quieres ver el agente en acción antes de decidir? Pruébalo tú mismo aquí — juega a ser tu propio comprador.",
  meInteresa: "Me interesa — hablemos por WhatsApp",
  sinCompromiso: (hasta) => `Este diagnóstico no te compromete a nada · Válido hasta el ${hasta}`,
  descargarPdf: "Descargar en PDF",
  pie: (empresa) => `Upcore AI · upcoreai.com · Diagnóstico privado para ${empresa} — no compartas este link`,
  vencida: {
    titulo: "Este diagnóstico ya no está disponible",
    texto: "Puede que haya vencido o que el link esté incompleto. Escríbenos y te mandamos uno nuevo.",
    cta: "Hablar con Upcore",
  },

  boceto: {
    etiqueta: "Ya está hecho · véalo ahora",
    titulo: "No se lo vamos a describir: se lo enseñamos funcionando.",
    intro: (empresa) =>
      `Lo construimos con la información que ya es pública de ${empresa}, antes de pedirle nada. ` +
      `Ábralo desde su celular y pruébelo como lo haría un comprador.`,
    queLlevaWeb: [
      "Su página completa: la ficha de cada desarrollo, ubicación con mapa, preguntas frecuentes y las opiniones de sus clientes.",
      "Agenda en línea: el comprador elige proyecto, día y hora en menos de un minuto, desde su país y sin llamar.",
      "Una pantalla privada para usted y su equipo, donde apaga los días, las tardes o las horas sueltas que no atienden.",
    ],
    queLlevaOtro: (empresa) => [
      `Armado con lo que ya es público de ${empresa}, para que lo pruebe con sus propios datos.`,
      "Funciona de verdad: no es un video ni una presentación.",
    ],
    esBocetoTitulo: "Es un boceto: todo se puede cambiar",
    esBocetoWeb:
      "Nada de lo que ve está cerrado. Los colores, la tipografía, las animaciones, el orden de las " +
      "secciones, los textos y las fotos se cambian por los suyos — usted nos manda su logo y su " +
      "paleta, o nos dice qué le gustaría distinto, y se lo rehacemos. Los horarios y las fotos que " +
      "aparecen son de ejemplo hasta que nos pase los suyos.",
    esBocetoOtro:
      "Nada de lo que ve está cerrado. El tono, las respuestas y la forma de trabajar se ajustan a " +
      "como atiende usted — dígame qué le cambiaría y se lo rehacemos.",
    cta: "Ver el adelanto →",
  },
  waMensaje: (empresa) => `Hola, vi el diagnóstico de ${empresa} y me interesa.`,
  recortarVarias: {
    titulo: "¿Algo de aquí no lo necesitas?",
    texto:
      "Dímelo por WhatsApp y te mando tu propuesta ajustada en el momento — si quitamos una pieza, " +
      "el precio baja. No vendemos paquetes cerrados: pagas por lo que de verdad vas a usar.",
  },
  recortarUna: {
    titulo: "¿Quieres algo distinto?",
    texto:
      "Dímelo por WhatsApp y te lo ajusto en el momento. El alcance lo defines tú: si sobra algo de " +
      "lo que incluye, se quita y el precio se recalcula.",
  },
  costos: {
    dominioK: "Dominio y hosting",
    dominioN:
      "El primer año va incluido en el precio, a nombre de tu inmobiliaria. Después son unos $15–25 " +
      "USD al año, o van incluidos si te quedas con el mantenimiento. El hosting de una página así no cuesta.",
    apisK: "Costos de APIs (tuyos)",
    apisN: "Directo a los proveedores, a tu nombre — sin margen de Upcore",
  },
  faqBase: [
    {
      q: "¿Es difícil de usar? No soy de tecnología.",
      a: "Está pensado justo para eso: tú sigues trabajando como siempre y el sistema hace la parte pesada. Te enseño lo poco que hay que saber en un video corto; si algo no queda claro, me escribes y lo vemos.",
    },
    {
      q: "Ya tengo mi sistema / mi forma de trabajar.",
      a: "No se toca. Nos integramos a lo que ya usas (agenda, WhatsApp, Excel, software) — tus datos se quedan donde están y esto se encarga de lo que hoy nadie alcanza a hacer.",
    },
    {
      q: "¿De quién queda todo esto?",
      a: "Tuyo, al 100%. Las cuentas, el número, la página y el sistema quedan a tu nombre. Si un día no quieres seguir con Upcore, todo sigue siendo tuyo — nunca quedas amarrado.",
    },
    {
      q: "¿Y si no funciona como esperaba?",
      a: "Los primeros 30 días los ajustes van por mi cuenta hasta que quede como acordamos. Y si no te entrego lo acordado funcionando, te devuelvo tu anticipo.",
    },
  ],
  faqNumeros: {
    q: "¿Los números de esta propuesta son reales?",
    a: "Son estimaciones conservadoras calculadas con los datos que TÚ nos diste (los supuestos están a la vista). Preferimos quedarnos cortos a prometerte de más.",
  },
  faqDeDonde: {
    q: "¿De dónde sacaron la información de mi inmobiliaria?",
    a: "De lo que ya es público: su propio sitio, su ficha de Google y sus reseñas. Nada de eso nos lo dio usted, y por eso lo que ve puede tener detalles por ajustar — los horarios, por ejemplo, están de ejemplo hasta que nos diga los suyos. El precio de aquí abajo no depende de eso: es cerrado.",
  },
  faqApis: {
    q: "¿Por qué los costos de APIs van aparte?",
    a: "Porque son tuyos y así lo ves todo transparente: pagas el consumo real directo al proveedor, sin margen escondido de Upcore. Suelen ser unos cuantos dólares al mes, con tope de gasto activado.",
  },
  faqDominio: {
    q: "¿Y el dominio de mi página?",
    a: "Lo compramos nosotros y va incluido en el precio, a nombre de la inmobiliaria desde el primer día. A partir del segundo año se renueva por unos $15 a $25 dólares al año, que pasan a su tarjeta — o corren por nuestra cuenta si se queda con el mantenimiento. La dirección es suya siempre: nadie se la puede quitar.",
  },
  faqHumano: {
    q: "¿Y si el comprador quiere hablar con una persona?",
    a: "Se lo pasa sin discutir. No insiste ni intenta convencerlo de seguir con el asistente: toma su nombre y su teléfono, avisa a tu equipo en el momento, y le dice quién le va a contactar y cuándo — nadie se queda esperando sin saber qué sigue. Tú eliges a qué asesor le llega ese aviso y por qué vía.",
  },
  faqOffmarket: {
    q: "¿Y si un desarrollo ya se agotó? ¿lo va a seguir ofreciendo?",
    a: "No. Lo pausas tú desde tu celular y desde ese momento el asistente deja de mencionarlo y de agendar visitas para él; a quien pregunte, lo pasa con tu asesor. Lo que no hace nunca —tampoco con los activos— es decir cuántas unidades quedan ni en qué precio andan, porque eso cambia por línea, piso y etapa. Es a propósito: un dato así, por escrito, se convierte en un reclamo.",
  },
  faqOffmarketWeb: {
    q: "¿Y si un desarrollo ya se agotó?",
    a: "Lo pausas tú desde tu celular y deja de aparecer en tu sitio en unos minutos — no tienes que avisarnos ni esperar a nadie. Por eso tu página tampoco publica cuántas unidades quedan ni en qué precio andan: eso cambia por línea, piso y etapa, y una página con datos vencidos hace más daño que una sin ellos. Quien se interesa deja sus datos y tu equipo le da los números al día.",
  },
  dia1: {
    checklist: "el checklist de tu inmobiliaria (15 min)",
    numeroWa: "la decisión de tu número de WhatsApp",
    desvio: "cómo quedará el desvío de tu teléfono (tu número no cambia)",
    materialWeb: "tus textos, renders, colores y páginas de referencia para tu sitio",
    cuentas: "a qué correo y teléfono quedan tus cuentas, que abrimos nosotros a tu nombre",
    agendaWeb: "y cómo llevas hoy tu agenda, para conectarla a la del sitio",
    envoltura: (partes) => `Un link privado donde haces tu parte a tu ritmo: ${partes}. Todo se guarda solo.`,
  },
  pruebas: {
    agenteYVoz: "Le escribes y le marcas como si fueras tu propio comprador, y ajustamos lo que pidas antes de salir en vivo.",
    agente: "Lo usas como si fueras tu propio comprador y ajustamos lo que pidas antes de salir en vivo.",
    voz: "Le marcas como si fueras tu propio comprador: haces la llamada, pides informes de un proyecto y ajustamos lo que pidas antes de salir en vivo.",
    web: "Recorres tu sitio completo en tu celular y en tu computadora, como un comprador que te encuentra por primera vez, y pides los cambios que quieras antes de publicarlo.",
    auto: "Corremos el flujo completo con un prospecto de mentira: ves llegar los recordatorios y avisos tal como los verán tus compradores, y ajustamos lo que pidas.",
    reactivacion: "Revisas y apruebas los mensajes con tu propia lista antes de que salga el primero — nada se manda sin tu visto bueno.",
    generico: "Lo pruebas con calma y ajustamos lo que pidas antes de darlo por entregado.",
  },
  seo: "Dejarlo listo para Google: su título y su descripción en los dos idiomas —cada uno con su propia dirección, para que el buscador indexe las dos versiones y no las tome por repetidas—, tu ficha de negocio declarada (nombre, dirección, teléfono y a qué te dedicas) y la página cargando rápido en el celular",
  entrega: {
    web: "Un video corto de dónde te caen las visitas y cómo bloquear desde tu celular los días que no atiendes",
    otro: "Capacitarte con un video corto + guía de 1 página",
  },
  nuestra: {
    primeraWeb: "Diseñar y construir tu sitio completo, de punta a punta — estructura, textos en español e inglés y agenda de visitas incluidos",
    primeraReactivacion: "Armar la campaña completa, de punta a punta — lista, mensajes y seguimiento",
    primeraSistema: "Construir el sistema completo, de punta a punta",
    probarlo: "Probarlo contigo hasta que quede como acordamos",
    garantia: "La garantía: si no entrego lo acordado funcionando, te devuelvo tu anticipo",
    ajustes: "30 días de ajustes después de la entrega, por mi cuenta",
  },
  agenda: {
    integrarSoftware: (nombre) => `Integrarnos a tu ${nombre} — tus datos y tu expediente se quedan donde están`,
    integrarSistema: "Integrarnos al sistema que ya usas — tus datos se quedan donde están",
    montarDigital: "Dejarte la agenda ordenada en un calendario digital (hoy la llevas en papel o Excel) — sin costo extra",
    conectar: "Conectarnos a tu forma actual de agendar — sin obligarte a cambiar nada",
    conectarWeb: "Conectar el botón de visitas de tu sitio con tu forma actual de agendar — sin obligarte a cambiar nada",
  },
  bonoGoogle: {
    titulo: "Tu ficha de Google, al día y conectada",
    desc: "Dejamos tu ficha con tus horarios, tus proyectos, tus fotos y el enlace a tu sitio nuevo. Es donde ya te están buscando — y hoy, quien te encuentra ahí no tiene a dónde ir.",
  },
  bonoAgenda: {
    titulo: "Tu agenda digital, montada",
    descPapel: "Te dejamos tu calendario creado y ordenado, listo para recibir las visitas del sitio, y le enseñamos a tu equipo a usarlo.",
    descCondicional: "Si hoy llevan la agenda de visitas a mano, te montamos tu calendario digital sin costo — es lo que hace que las visitas del sitio lleguen a algún lado. Si ya usan uno, nos conectamos al suyo.",
  },
  noNecesitasBase: [
    "Saber de tecnología",
    "Cambiar tu software o tu forma de trabajar",
    "Contratar a alguien más",
    "Pagar todo por adelantado",
    "Compartir contraseñas por chat (eso jamás)",
  ],
  noNecesitasWeb: "Saber de diseño ni redactar textos — eso lo armamos nosotros con lo que ya tienes",
  tuParte: {
    agente: [
      { t: "Contestar el checklist de tu inmobiliaria: proyectos, planes de pago, horarios y tu tono", min: "15 min" },
      { t: "Decidir qué número de WhatsApp usará el asistente — te explico la diferencia antes", min: "5 min" },
      { t: "Tus cuentas: las creamos NOSOTROS a tu nombre — tú solo nos dices a qué correo quedan; contraseñas por chat, jamás", min: "5 min" },
      { t: "Darme acceso a tu calendario o agenda", min: "5 min" },
      { t: "Probarlo como si fueras tu comprador antes de salir en vivo", min: "15 min" },
    ],
    voz: [
      { t: "Contestar el checklist de tu inmobiliaria: proyectos, planes de pago, horarios y tu tono", min: "15 min" },
      { t: "Decidir cómo quedará el desvío de llamadas — tu número no cambia, te explico antes", min: "5 min" },
      { t: "Tus cuentas: las creamos NOSOTROS a tu nombre — tú solo nos dices a qué correo quedan; contraseñas por chat, jamás", min: "5 min" },
      { t: "Darme acceso a tu calendario o agenda", min: "5 min" },
      { t: "Hacerle una llamada de prueba como si fueras tu comprador", min: "10 min" },
    ],
    web: [
      { t: "Pasarme los textos, renders y logo que ya tengas de tus proyectos", min: "20 min" },
      { t: "Tus desarrollos: nombre, ubicación y qué tipo de unidades. Su rango de precios también, para que tu equipo lo tenga a la mano — en el sitio no se publica", min: "15 min" },
      { t: "Tu paleta de colores, si tienes una — o el link de una página cuyos colores te gusten", min: "5 min" },
      { t: "1 a 3 páginas web que te gusten como referencia, y qué te gusta de cada una", min: "10 min" },
      { t: "Reseñas o testimonios de clientes que quieras presumir (con su permiso)", min: "10 min" },
      { t: "Fotos de tu equipo y del sales center — con las del celular basta, nosotros las acomodamos", min: "15 min" },
      { t: "Horarios, dirección, teléfono y redes, tal cual quieres que aparezcan", min: "5 min" },
      { t: "Cómo llevas hoy la agenda — libreta, calendario en el celular, algún programa", min: "5 min" },
      { t: "Revisar el borrador y pedirme cambios", min: "15 min" },
    ],
    auto: [
      { t: "Darme acceso a tu calendario o agenda", min: "5 min" },
      { t: "Aprobar los textos de recordatorios y avisos de seguimiento (van con tu tono)", min: "10 min" },
      { t: "Probar el flujo completo con un prospecto de mentira", min: "10 min" },
    ],
    reactivacion: [
      { t: "Sacar tu lista de prospectos que nunca cerraron — te digo exactamente cómo exportarla", min: "15 min" },
      { t: "Aprobar los mensajes de reactivación", min: "10 min" },
    ],
    panel: [{ t: "Una revisión corta de avances para dejar tu panel a tu gusto", min: "15 min" }],
  },
  tuParteGenerica: [
    { t: "Contestar el checklist de tu inmobiliaria", min: "15 min" },
    { t: "Tus cuentas: las creamos NOSOTROS a tu nombre — tú solo nos dices a qué correo quedan", min: "5 min" },
    { t: "Probar el sistema antes de la entrega", min: "15 min" },
  ],

  calc: CALC_TEXTOS.es,
};

// ─────────────────────────────────────────────────────────────────────────────
// INGLÉS — la propuesta no obliga a nadie, así que aquí no hay versión que
// "gobierne": es el mismo diagnóstico, dicho en el idioma en que lo quiera leer.
// ─────────────────────────────────────────────────────────────────────────────

const EN: TextosProp = {
  etiquetaVigencia: (hasta) => `Personalized assessment · valid through ${hasta}`,
  titular: (nombre, empresa, objetivo) =>
    `${nombre}, this is what ${empresa} needs in order to ${objetivo}`,
  preparado: (fecha) => `Prepared on ${fecha}`,
  conSusNumeros:
    "calculated with the numbers you gave us, with no inflated promises. It is free and carries no commitment: reading it does not oblige you to anything",
  conInfoPublica:
    "put together from your firm's public information, with no inflated promises. It is free and carries no commitment: reading it does not oblige you to anything",
  verEnOtroIdioma: "Ver en español",
  avisoTraduccion: "",

  secciones: {
    contaste: "What you told us",
    costando: "What staying as you are is costing you",
    construiriamos: (c) => `What we would build for you (${c})`,
    inversion: "Your investment, with honest numbers",
    garantia: "Our guarantee (we take the risk)",
    proceso: "If you say yes, this is how we would work together",
    dudas: "The questions you are probably asking",
  },

  diag: {
    volumen: (v) => `New prospects, as you told us: ${v}`,
    agenda: (v) => `Today you keep the calendar in: ${v}`,
    prospectosPor: (v) => `Your prospects come in through: ${v}`,
    presencia: {
      "web-y-redes": "Today people find you through your website and your social media",
      "solo-web": "Today people find you through your website",
      "solo-redes": "Today people only find you on social media — you have no website",
      nada: "Today you have neither a website nor active social media",
    },
  },
  objetivos: {
    "llenar-agenda": "fill your calendar with visits",
    "no-perder-citas": "stop losing prospects because nobody answers in time",
    "recuperar-pacientes": "reach back out to the prospects who never closed",
    imagen: "make your firm look as professional as it is",
    _default: "stop losing prospects",
  },

  cadaMes: "Every month that passes",
  enUnAno: "In a year",
  calculo: (a) =>
    `The math, in plain sight: about ${a.porSemana} prospects a week go cold` +
    `${a.estimado ? " (conservative estimate)" : " (your figure)"}. Not all of them would have ` +
    `bought, so we assume you would close 1 in ${a.unoDeCada}: at ${a.comision} of commission per sale` +
    `${a.comisionEstimada ? " (industry average)" : " (your figure)"}, every prospect that goes ` +
    `cold is worth about ${a.valor}. How much of that can actually be recovered is below, in the ` +
    `investment section — and it is calculated on the low side.`,
  calculoSimple: (a) =>
    `The math, in plain sight: about ${a.porSemana} lost opportunities a week` +
    `${a.estimado ? " (conservative estimate)" : " (your figure)"} × ${a.comision}` +
    `${a.comisionEstimada ? " (industry average)" : " (your figure)"}. How much of that can ` +
    `actually be recovered is below, in the investment section — and it is calculated on the low side.`,

  incluidoSinCosto: (que) => `Included at no extra cost: ${que}, plus 30 days of adjustments on us.`,
  ademasSinCosto: "Also included, at no cost",
  fueraAProposito: {
    titulo: "We left this out on purpose",
    texto:
      "We only quote what genuinely adds value to your business today — we do not oversell. " +
      "This is not included in the price below: it is useful, and at some point it will be worth it, " +
      "but first we fix what is costing you sales today. If you want it from the start, this is what " +
      "it would add — and if you would rather add it later, I will honor this same package price " +
      "for the first year:",
  },
  puedeEsperar: "can wait",

  contexto: (perdida) => `To put it in context: compare it against the ~${perdida} that walk out the door every month.`,
  planes: {
    llaveTitulo: "Turnkey",
    llaveDesc: "We build it and it is 100% yours — you run it, no monthly fee",
    gestionadoTitulo: "Managed",
    gestionadoDesc: "We build it AND we run it for you: monitoring, changes and support",
    favorito: "The firms' favorite",
  },
  filas: {
    inversion: "Investment (one time)",
    mensualidad: "Upcore monthly fee",
    retorno: "Return on what it costs to run",
    ahorro: "Estimated gain for your firm",
  },

  garantia: {
    titulo: "If I do not deliver what we agreed, working, I return your deposit.",
    texto:
      "And it goes further: you get a 14-day pilot. From the moment the system is live, if within " +
      "the first two weeks you decide it is not for you, we switch it off and I refund what you " +
      "paid for the project — only the API usage, billed to your name by the providers, is " +
      "non-refundable. On top of that, for the first 30 days after delivery every adjustment is on " +
      "me. The only thing you risk is staying exactly as you are.",
    nota: "",
  },

  pasos: {
    dia0: "Day 0",
    dia0Titulo: "You accept and send the deposit",
    dia0Desc:
      "You confirm on WhatsApp with a “yes”, I send you the simple 1-page agreement (no fine print) " +
      "and, as soon as your deposit arrives by wire, I start that same day.",
    dia1Titulo: "You get your Onboarding Portal",
    construccionTitulo: "Build, with progress updates",
    construccionDesc:
      "I build everything and connect it to your tools. I share progress on WhatsApp or a short " +
      "video — you only weigh in if you want to.",
    pruebasTitulo: "YOU test it",
    entregaTitulo: "Delivery",
    entregaTituloCapacitacion: "Delivery and training",
    entregaWeb:
      "Your site live, on your domain and in your name. I leave you your private screen to block off " +
      "the days you are not available with one tap, and a short three-minute video. The balance is " +
      "settled here.",
    entregaOtro:
      "Everything working and in your name, with a video on how to use it + a 1-page guide. The " +
      "balance is settled here.",
    dia1: "Day 1",
    mas30: "+30 days",
    acompanamientoTitulo: "Follow-up",
    acompanamientoDesc:
      "Adjustments included, on me. And if you chose Managed, we run it, watch it and improve it " +
      "for you every month.",
    nota: (total) =>
      `* Approximate business days from your deposit — total delivery ${total}. It also depends on ` +
      `how fast you reply: if you move quickly, this flies.`,
  },
  tuParteTitulo: "Your part",
  tuParteNota: "in total, spread over the first few days:",
  horasUna: "~1 hour",
  horasDos: "~1 to 2 hours",
  nuestraParteTitulo: "Our part",
  nuestraParteNota: "Everything else:",
  noNecesitasTitulo: "And what you will NOT need:",
  consejoHonesto: "Our honest advice:",

  probarDemo: "Want to see the agent in action before deciding? Try it yourself here — play your own buyer.",
  meInteresa: "I'm interested — let's talk on WhatsApp",
  sinCompromiso: (hasta) => `This assessment commits you to nothing · Valid through ${hasta}`,
  descargarPdf: "Download as PDF",
  pie: (empresa) => `Upcore AI · upcoreai.com · Private assessment for ${empresa} — please do not share this link`,
  vencida: {
    titulo: "This assessment is no longer available",
    texto: "It may have expired, or the link may be incomplete. Message us and we will send a new one.",
    cta: "Talk to Upcore",
  },

  boceto: {
    etiqueta: "Already built · see it now",
    titulo: "We are not going to describe it: we are showing it to you, working.",
    intro: (empresa) =>
      `We built it from what is already public about ${empresa}, before asking you for anything. ` +
      `Open it on your phone and try it the way a buyer would.`,
    queLlevaWeb: [
      "Your full site: a page for each development, location with a map, frequently asked questions and your clients' reviews.",
      "Online booking: the buyer picks a project, a day and a time in under a minute, from their own country and without calling.",
      "A private screen for you and your team, where you switch off the days, afternoons or single hours nobody is available.",
    ],
    queLlevaOtro: (empresa) => [
      `Built from what is already public about ${empresa}, so you can try it with your own information.`,
      "It actually works: this is not a video or a slide deck.",
    ],
    esBocetoTitulo: "It is a draft: everything can change",
    esBocetoWeb:
      "Nothing you see is locked in. The colors, the typography, the animations, the order of the " +
      "sections, the copy and the photos all get swapped for yours — you send us your logo and your " +
      "palette, or tell us what you would like different, and we redo it. The hours and photos you " +
      "see are placeholders until you send us yours.",
    esBocetoOtro:
      "Nothing you see is locked in. The tone, the answers and the way it works all adjust to how " +
      "you do business — tell me what you would change and we redo it.",
    cta: "See the preview →",
  },
  waMensaje: (empresa) => `Hi, I saw the assessment for ${empresa} and I'm interested.`,
  recortarVarias: {
    titulo: "Is there anything here you do not need?",
    texto:
      "Tell me on WhatsApp and I will send you an adjusted proposal on the spot — if we take a " +
      "component out, the price goes down. We do not sell closed packages: you pay for what you are " +
      "actually going to use.",
  },
  recortarUna: {
    titulo: "Want something different?",
    texto:
      "Tell me on WhatsApp and I will adjust it on the spot. You define the scope: if something in " +
      "it is unnecessary, we take it out and the price is recalculated.",
  },
  costos: {
    dominioK: "Domain and hosting",
    dominioN:
      "The first year is included in the price, in your firm's name. After that it is about $15–25 " +
      "USD a year, or it stays included if you keep the maintenance plan. Hosting for a site like " +
      "this has no cost.",
    apisK: "API costs (yours)",
    apisN: "Straight to the providers, in your name — no Upcore margin",
  },
  faqBase: [
    {
      q: "Is it hard to use? I'm not a tech person.",
      a: "That is exactly what it is designed for: you keep working the way you always have and the system does the heavy part. I show you the little there is to know in a short video; if something is unclear, you message me and we go through it.",
    },
    {
      q: "I already have my system / my way of working.",
      a: "We do not touch it. We integrate with what you already use (calendar, WhatsApp, Excel, software) — your data stays where it is and this handles what nobody has time for today.",
    },
    {
      q: "Who owns all of this?",
      a: "You do, 100%. The accounts, the number, the site and the system are all in your name. If one day you do not want to continue with Upcore, everything is still yours — you are never locked in.",
    },
    {
      q: "And if it does not work the way I expected?",
      a: "For the first 30 days the adjustments are on me, until it is the way we agreed. And if I do not deliver what we agreed, working, I return your deposit.",
    },
  ],
  faqNumeros: {
    q: "Are the numbers in this proposal real?",
    a: "They are conservative estimates calculated with the data YOU gave us (the assumptions are in plain sight). We would rather fall short than promise you too much.",
  },
  faqDeDonde: {
    q: "Where did you get my firm's information?",
    a: "From what is already public: your own site, your Google listing and your reviews. None of it came from you, which is why what you see may have details to adjust — the hours, for example, are placeholders until you tell us yours. The price below does not depend on any of that: it is fixed.",
  },
  faqApis: {
    q: "Why are the API costs separate?",
    a: "Because they are yours and this way you see everything transparently: you pay the real usage straight to the provider, with no hidden Upcore margin. It is usually a few dollars a month, with a spending cap turned on.",
  },
  faqDominio: {
    q: "What about my site's domain?",
    a: "We buy it and it is included in the price, in your firm's name from day one. From the second year it renews for about $15 to $25 a year, which moves to your card — or stays on us if you keep the maintenance plan. The address is always yours: nobody can take it from you.",
  },
  faqHumano: {
    q: "What if the buyer wants to talk to a person?",
    a: "It hands them over, no argument. It does not push back or try to keep them with the assistant: it takes their name and phone number, alerts your team on the spot, and tells them who will reach out and when — nobody is left waiting without knowing what comes next. You choose which agent gets that alert and how.",
  },
  faqOffmarket: {
    q: "What if a development is already sold out? Will it keep offering it?",
    a: "No. You pause it yourself from your phone and from then on the assistant stops mentioning it and stops booking tours for it; anyone who asks gets handed to your agent. What it never does — not even for active ones — is say how many units are left or what they cost, because that changes by line, floor and phase. It is deliberate: a figure like that, in writing, turns into a complaint.",
  },
  faqOffmarketWeb: {
    q: "What if a development is already sold out?",
    a: "You pause it yourself from your phone and it stops showing on your site within minutes — no need to tell us or wait on anyone. That is also why your site does not publish how many units are left or what they cost: that changes by line, floor and phase, and a page with expired figures does more damage than a page without them. Anyone interested leaves their details and your team gives them the current numbers.",
  },
  dia1: {
    checklist: "your firm's checklist (15 min)",
    numeroWa: "the decision about your WhatsApp number",
    desvio: "how your phone forwarding will work (your number does not change)",
    materialWeb: "your copy, renders, colors and reference sites for your website",
    cuentas: "which email and phone your accounts go under, which we open in your name",
    agendaWeb: "and how you keep your calendar today, so we can connect it to the site's",
    envoltura: (partes) => `A private link where you do your part at your own pace: ${partes}. Everything saves itself.`,
  },
  pruebas: {
    agenteYVoz: "You message it and call it as if you were your own buyer, and we adjust whatever you ask before it goes live.",
    agente: "You use it as if you were your own buyer and we adjust whatever you ask before it goes live.",
    voz: "You call it as if you were your own buyer: you make the call, ask about a project, and we adjust whatever you ask before it goes live.",
    web: "You go through your whole site on your phone and on your computer, like a buyer finding you for the first time, and you ask for any changes before we publish it.",
    auto: "We run the whole flow with a made-up prospect: you watch the reminders and notices arrive exactly as your buyers will see them, and we adjust whatever you ask.",
    reactivacion: "You review and approve the messages against your own list before the first one goes out — nothing is sent without your sign-off.",
    generico: "You test it at your own pace and we adjust whatever you ask before calling it delivered.",
  },
  seo: "Set up for Google: its title and description in both languages —each with its own address, so the search engine indexes both versions instead of treating them as duplicates—, your business listing declared (name, address, phone and what you do) and the page loading fast on a phone",
  entrega: {
    web: "A short video showing where your visits land and how to block off, from your phone, the days you are not available",
    otro: "Training you with a short video + a 1-page guide",
  },
  nuestra: {
    primeraWeb: "Designing and building your entire site, end to end — structure, copy in Spanish and English and visit booking included",
    primeraReactivacion: "Putting the whole campaign together, end to end — list, messages and follow-up",
    primeraSistema: "Building the complete system, end to end",
    probarlo: "Testing it with you until it is the way we agreed",
    garantia: "The guarantee: if I do not deliver what we agreed, working, I return your deposit",
    ajustes: "30 days of adjustments after delivery, on me",
  },
  agenda: {
    integrarSoftware: (nombre) => `Integrating with your ${nombre} — your data and your records stay where they are`,
    integrarSistema: "Integrating with the system you already use — your data stays where it is",
    montarDigital: "Setting up your calendar properly in a digital one (today you keep it on paper or Excel) — at no extra cost",
    conectar: "Connecting to the way you book today — without forcing you to change anything",
    conectarWeb: "Connecting your site's visit button to the way you book today — without forcing you to change anything",
  },
  bonoGoogle: {
    titulo: "Your Google Business listing, updated and linked",
    desc: "We leave your listing with your hours, your developments, your photos and the link to your new site. It is where people are already looking for you — and today, whoever finds you there has nowhere to go.",
  },
  bonoAgenda: {
    titulo: "Your digital calendar, set up",
    descPapel: "We leave your calendar created and organized, ready to receive the visits from the site, and we teach your team to use it.",
    descCondicional: "If you keep the visit calendar by hand today, we set up your digital calendar at no cost — it is what makes the visits from the site land somewhere. If you already use one, we connect to yours.",
  },
  noNecesitasBase: [
    "Knowing anything about technology",
    "Changing your software or the way you work",
    "Hiring anyone else",
    "Paying everything up front",
    "Sharing passwords over chat (never)",
  ],
  noNecesitasWeb: "Knowing design or writing copy — we put that together with what you already have",
  tuParte: {
    agente: [
      { t: "Answering your firm's checklist: developments, payment plans, hours and your tone", min: "15 min" },
      { t: "Deciding which WhatsApp number the assistant will use — I explain the difference first", min: "5 min" },
      { t: "Your accounts: WE create them in your name — you just tell us which email they go under; passwords over chat, never", min: "5 min" },
      { t: "Giving me access to your calendar", min: "5 min" },
      { t: "Testing it as if you were your own buyer before it goes live", min: "15 min" },
    ],
    voz: [
      { t: "Answering your firm's checklist: developments, payment plans, hours and your tone", min: "15 min" },
      { t: "Deciding how call forwarding will work — your number does not change, I explain first", min: "5 min" },
      { t: "Your accounts: WE create them in your name — you just tell us which email they go under; passwords over chat, never", min: "5 min" },
      { t: "Giving me access to your calendar", min: "5 min" },
      { t: "Making a test call as if you were your own buyer", min: "10 min" },
    ],
    web: [
      { t: "Sending me the copy, renders and logo you already have for your developments", min: "20 min" },
      { t: "Your developments: name, location and what kind of units. Their price range too, so your team has it on hand — it is not published on the site", min: "15 min" },
      { t: "Your color palette, if you have one — or a link to a site whose colors you like", min: "5 min" },
      { t: "1 to 3 websites you like as a reference, and what you like about each", min: "10 min" },
      { t: "Reviews or testimonials from clients you want to show off (with their permission)", min: "10 min" },
      { t: "Photos of your team and the sales center — phone photos are fine, we arrange them", min: "15 min" },
      { t: "Hours, address, phone and social media, exactly as you want them to appear", min: "5 min" },
      { t: "How you keep the calendar today — a notebook, a phone calendar, some software", min: "5 min" },
      { t: "Reviewing the draft and asking me for changes", min: "15 min" },
    ],
    auto: [
      { t: "Giving me access to your calendar", min: "5 min" },
      { t: "Approving the copy for reminders and follow-up notices (they go in your tone)", min: "10 min" },
      { t: "Testing the whole flow with a made-up prospect", min: "10 min" },
    ],
    reactivacion: [
      { t: "Pulling your list of prospects who never closed — I tell you exactly how to export it", min: "15 min" },
      { t: "Approving the re-engagement messages", min: "10 min" },
    ],
    panel: [{ t: "A short progress review to leave your dashboard the way you like it", min: "15 min" }],
  },
  tuParteGenerica: [
    { t: "Answering your firm's checklist", min: "15 min" },
    { t: "Your accounts: WE create them in your name — you just tell us which email they go under", min: "5 min" },
    { t: "Testing the system before delivery", min: "15 min" },
  ],

  calc: CALC_TEXTOS.en,
};

export const TP: Record<Idioma, TextosProp> = { es: ES, en: EN };
