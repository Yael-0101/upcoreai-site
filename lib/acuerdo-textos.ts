// Los TEXTOS del acuerdo, en español y en inglés. FUENTE ÚNICA de los dos idiomas.
//
// POR QUÉ ASÍ (decisión de Yael, 2026-08-22). El cliente habla español e inglés, pero su
// empresa es de Estados Unidos: su contador o su abogado van a querer leerlo en inglés.
// La tentación es escribir dos contratos; es justo la trampa que más veces ha mordido
// aquí (la propuesta contra el portal, el generador contra n8n). Dos documentos escritos
// por separado se desfasan solos, y en un contrato eso no es cosmético.
//
// La defensa es de dos capas:
//   1. **TypeScript.** `Record<Idioma, Textos>` obliga a que los dos idiomas tengan
//      EXACTAMENTE las mismas claves: si mañana alguien agrega una cláusula en español
//      y no la traduce, el proyecto no compila. No es un recordatorio, es un candado.
//   2. **El armador es UNO SOLO** (lib/acuerdo.ts): mismas secciones, mismos números,
//      mismas reglas por pieza. El idioma solo cambia las palabras, nunca la estructura.
//
// ⚠️ EL ESPAÑOL ES EL QUE MANDA. La versión en inglés es una traducción de cortesía y el
// propio contrato lo dice (`clausulaIdioma`). No es un tecnicismo: Yael no puede
// verificar un texto legal en inglés, así que la versión que lo obliga tiene que ser la
// que sí puede leer. Con esa cláusula, un error de traducción es una molestia; sin ella,
// es un problema.

import type { TipoPlan } from "./acuerdo";

// ⚠️ `Idioma` NACIÓ aquí, cuando el acuerdo fue lo primero que se hizo bilingüe.
// Al hacer bilingüe el sitio se mudó a `lib/idioma.ts`, que es su única dueña: dos
// definiciones del mismo tipo se desfasan en silencio (en TypeScript dos uniones de
// texto idénticas son compatibles, así que el compilador NO avisaría). Se sigue
// re-exportando desde aquí para no romper a quien ya lo importaba.
export type { Idioma } from "./idioma";
export { IDIOMAS, idiomaDe } from "./idioma";

import type { Idioma } from "./idioma";
// El renglón de la consola se traduce recomponiéndolo, no por diccionario: ver
// `traducirConsola()` abajo. calc-textos no importa nada, así que no hay ciclo.
import { CALC_TEXTOS, MANDOS } from "./calc-textos";

export type Textos = {
  /** Cómo se llama el documento y su encabezado. */
  documento: string;
  acuerdoEntre: (empresa: string) => string;
  aDistancia: string;
  intro: string;
  /** La cláusula que dice qué versión gobierna. Va en LOS DOS idiomas. */
  clausulaIdioma: string;

  /** Bloque de firmas. */
  firmas: string;
  pendiente: string;
  pendienteNota: string;
  aceptadoLinea: (partes: { fecha: string; correo: string; ip: string }) => string;
  notaLegalFirma: string;
  pie: (empresa: string) => string;
  pagina: (n: number, de: number) => string;

  /** Lo que nunca entra, sin importar las piezas contratadas. */
  noIncluyeFijo: string[];
  planes: Record<
    TipoPlan,
    { label: string; descripcion: string; filaMensualidad: string; operacion: string }
  >;
  sinMensualidad: string;
  bono: (titulo: string) => string;

  /** Nombres de los terceros y de las cuentas, para armar las listas por pieza. */
  terceros: {
    whatsapp: string;
    meta: string;
    linea: string;
    ia: string;
    hosting: string;
    dominio: string;
    internet: string;
  };
  cuentas: { ia: string; whatsapp: string; linea: string };
  /** Une una lista con comas y la conjunción del idioma ("a, b y c" / "a, b and c"). */
  unir: (xs: string[]) => string;

  /** Lo que rodea al contrato en la PANTALLA: botones, avisos, el formulario de
   *  aceptación. No es parte del documento, pero lo lee la misma persona — si sale
   *  en español dentro de una página en inglés, el documento se ve a medio traducir. */
  ui: {
    etiquetaAceptado: string;
    etiquetaActivo: string;
    verEnOtroIdioma: string;
    avisoTraduccion: string;
    aceptadoEl: (fechaHora: string) => string;
    avisoCopia: string;
    descargarPdf: string;
    guardalo: string;
    dudas: string;
    escribenos: string;
    noDisponible: string;
    noDisponibleNota: string;
    hablarConUpcore: string;
    /** El formulario de aceptación. */
    paraAceptar: string;
    tuNombre: string;
    tuCorreo: string;
    correoNota: string;
    leiTodo: string;
    aceptar: string;
    registrando: string;
    errorAceptar: string;
    notaFinal: string;
  };

  sec: {
    entregar: {
      titulo: string;
      noIncluye: (lista: string) => string;
      recortar: string;
    };
    plan: { titulo: (label: string) => string };
    inversion: {
      titulo: string;
      construccion: string;
      anticipo: string;
      resto: string;
      dominioWebSola: string;
      costosVariables: (cuentas: string) => string;
      facturacion: string;
    };
    tiempos: {
      titulo: string;
      arranca: string;
      entrega: (plazo: string) => string;
      tuParte: string;
      meta: string;
      incluye: string;
    };
    cambios: { titulo: string; items: string[] };
    garantia: { titulo: string; items: string[] };
    atrasos: { titulo: string; items: string[]; fuerzaMayor: (terceros: string) => string };
    cancelar: { titulo: string; items: string[]; gestionado: string };
    propiedad: { titulo: string; todoTuyo: (empresa: string) => string; portable: string };
    datos: { titulo: string; items: string[] };
    responsabilidad: {
      titulo: string;
      intro: string;
      tope: string;
      terceros: (lista: string) => string;
      asistente: string;
      noDice: (conAsistente: boolean) => string;
      siResponde: string;
    };
    vigencia: {
      titulo: string;
      validez: string;
      vigente: (gestionado: boolean) => string;
      ley: (ley: string, foro: string) => string;
    };
  };
};

/** Une con comas y la conjunción que toque. Igual en los dos, solo cambia la palabra. */
const unirCon = (conj: string) => (xs: string[]) =>
  xs.filter(Boolean).join(", ").replace(/, ([^,]*)$/, ` ${conj} $1`);

// ─────────────────────────────────────────────────────────────────────────────
// ESPAÑOL — la versión que gobierna
// ─────────────────────────────────────────────────────────────────────────────

const ES: Textos = {
  documento: "Acuerdo de servicio",
  acuerdoEntre: (empresa) => `Acuerdo entre Upcore AI y ${empresa}`,
  aDistancia: "Acordado a distancia",
  intro:
    "Esto no es un contrato de permanencia ni tiene letras chiquitas. Es el resumen por escrito " +
    "de lo que ya platicamos, para que los dos tengamos claro qué entra, cuánto cuesta, para " +
    "cuándo, y qué pasa si algo se sale del plan.",
  clausulaIdioma:
    "**Este acuerdo está escrito en español**, que es el idioma en que lo platicamos. Si " +
    "necesitas la versión en inglés para tu contador o tu abogado, está en el mismo enlace — " +
    "pero es una traducción de cortesía: **si las dos versiones llegaran a decir cosas " +
    "distintas, manda la versión en español**. " +
    "(English: this agreement is written in Spanish. An English translation is provided for " +
    "convenience; if the two versions differ, the Spanish version governs.)",

  firmas: "Firmas",
  pendiente: "Pendiente de aceptación",
  pendienteNota:
    "Este documento todavía no ha sido aceptado. Se acepta en línea, en el enlace que " +
    "recibiste, escribiendo tu nombre completo.",
  aceptadoLinea: ({ fecha, correo, ip }) =>
    `Aceptado electrónicamente el ${fecha} (hora de Miami)` +
    (correo ? ` desde ${correo}` : "") +
    (ip ? ` · IP ${ip}` : ""),
  notaLegalFirma:
    "Esta aceptación electrónica tiene la misma validez que una firma de puño y letra " +
    "conforme a la ley E-SIGN de Estados Unidos y a la UETA del Estado de Florida " +
    "(Fla. Stat. §668.50). La fecha y la hora las registró el servidor de Upcore AI.",
  pie: (empresa) => `Upcore AI · Acuerdo de servicio · ${empresa}`,
  pagina: (n, de) => `Página ${n} de ${de}`,

  noIncluyeFijo: [
    "campañas de publicidad o pauta",
    "creación de contenido para redes sociales",
    "migración de tu base de datos desde otro CRM",
    "cualquier pieza que no esté en la lista de arriba",
  ],
  planes: {
    llave: {
      label: "Llave en Mano",
      descripcion:
        "Lo construyo, te lo entrego funcionando y te capacito. De ahí en adelante lo operas tú " +
        "(o quien tú decidas). Pago único, sin mensualidad y sin permanencia. Si más adelante " +
        "necesitas soporte puntual, se cobra por hora.",
      filaMensualidad: "Mensualidad",
      operacion: "Al entregar, te transfiero todos los accesos y **no conservo ninguno**.",
    },
    gestionado: {
      label: "Gestionado",
      descripcion:
        "Lo construyo y además **yo lo opero, lo mantengo y lo mejoro** por ti: monitoreo, cambios " +
        "y soporte incluidos en tu mensualidad. Tú no tienes que aprender a operarlo. Se cancela " +
        "cuando quieras avisando con 30 días.",
      filaMensualidad: "Mensualidad (operación y mantenimiento)",
      operacion:
        "Para poder operar tu sistema, conservo un acceso **acotado, documentado y revocable** en " +
        "cualquier momento. La propiedad sigue siendo tuya: el acceso es para trabajar, no para " +
        "retener nada.",
    },
  },
  sinMensualidad: "$0 — tú operas tu sistema",
  bono: (titulo) => `${titulo} — sin costo (bono)`,

  terceros: {
    whatsapp: "WhatsApp",
    meta: "Meta",
    linea: "tu línea telefónica",
    ia: "los proveedores de inteligencia artificial",
    hosting: "tu hosting",
    dominio: "tu proveedor de dominio",
    internet: "tu internet",
  },
  cuentas: {
    ia: "las cuentas de inteligencia artificial",
    whatsapp: "la de WhatsApp",
    linea: "la línea telefónica",
  },
  unir: unirCon("y"),

  ui: {
    etiquetaAceptado: "Acuerdo aceptado",
    etiquetaActivo: "Acuerdo de servicio",
    verEnOtroIdioma: "View in English",
    avisoTraduccion:
      "Estás viendo la versión en español, que es la que gobierna este acuerdo.",
    aceptadoEl: (fechaHora) => `Aceptado el ${fechaHora} (hora de Miami)`,
    avisoCopia:
      "✅ Este acuerdo quedó aceptado y registrado. Te mandamos tu copia en PDF por correo; " +
      "aquí abajo la puedes volver a descargar cuando quieras.",
    descargarPdf: "Descargar el acuerdo en PDF",
    guardalo: "Guárdalo o mándaselo a tu contador.",
    dudas: "¿Dudas?",
    escribenos: "escríbenos por WhatsApp",
    noDisponible: "Este acuerdo no está disponible",
    noDisponibleNota:
      "Puede que el link esté incompleto. Escríbenos y te lo mandamos de nuevo.",
    hablarConUpcore: "Hablar con Upcore",
    paraAceptar: "Para aceptar, escribe tu nombre completo:",
    tuNombre: "Tu nombre completo",
    tuCorreo: "Tu correo",
    correoNota: "Aquí te llega tu copia del acuerdo en PDF, firmada y con la fecha.",
    leiTodo: "Leí el acuerdo completo y estoy de acuerdo con lo que dice.",
    aceptar: "Acepto el acuerdo",
    registrando: "Registrando…",
    errorAceptar:
      "No se pudo registrar. Revisa tu internet e inténtalo otra vez — si sigue fallando, " +
      "escríbenos por WhatsApp y lo resolvemos.",
    notaFinal:
      "Al aceptar queda registrada la fecha y la hora, y te mandamos tu copia en PDF. No te " +
      "compromete a pagar en ese momento: el anticipo lo haces cuando tú decidas arrancar.",
  },

  sec: {
    entregar: {
      titulo: "Qué voy a entregar",
      noIncluye: (lista) => `**Qué NO incluye:** ${lista}.`,
      recortar:
        "Si algo de esta lista no lo necesitas, dímelo y lo quitamos: el precio baja. Nada " +
        "aquí es un paquete cerrado.",
    },
    plan: { titulo: (label) => `Plan contratado: ${label}` },
    inversion: {
      titulo: "Inversión y forma de pago",
      construccion: "Construcción (pago único)",
      anticipo: "Para arrancar (al aceptar)",
      resto: "Contra entrega (al recibirlo)",
      dominioWebSola:
        "**El dominio del primer año va incluido en el precio**, a nombre de tu inmobiliaria " +
        "desde el primer día. A partir del segundo año se renueva por unos $15 a $25 " +
        "dólares al año, que pasan a tu tarjeta — o corren por cuenta de Upcore mientras " +
        "tengas el plan Gestionado. El hosting de un sitio así no tiene costo. Upcore no " +
        "le agrega ni un dólar de margen a nada de esto.",
      costosVariables: (cuentas) =>
        "**El dominio del primer año va incluido en el precio**, a nombre de tu inmobiliaria. " +
        `**Los demás costos variables son tuyos y van directo a tu tarjeta:** ${cuentas} ` +
        "se abren **a tu nombre**, con tope de gasto activado, y tú pagas su consumo. Upcore " +
        "no les agrega ni un dólar de margen y nunca cobra por adelantado algo que no " +
        "controla. Antes de arrancar te digo el estimado mensual con tu propio volumen.",
      facturacion:
        "**Cómo se paga y cómo se factura:** Upcore AI es un proveedor **extranjero** (opera " +
        "desde México) y por eso no emite factura fiscal de Estados Unidos ni te cobra " +
        "impuestos locales. Recibes un **invoice comercial** por cada pago, con el detalle del " +
        "servicio, para tu contabilidad. El pago se hace por **transferencia internacional** a " +
        "la cuenta que aparece en el invoice. Si tu contador necesita el formulario de " +
        "proveedor extranjero (W-8BEN o el que te pidan), me lo dices y te lo firmo antes de " +
        "la primera transferencia.",
    },
    tiempos: {
      titulo: "Tiempos",
      arranca:
        "**Arranca** cuando se confirma el anticipo **y** llega tu parte del checklist de " +
        "arranque (información de la inmobiliaria, proyectos, horarios y accesos a tus cuentas). " +
        "El reloj no corre sin esa información.",
      entrega: (plazo) => `**Entrega estimada: ${plazo}** desde el arranque.`,
      tuParte:
        "**Tu parte es poca:** alrededor de una hora en total — un checklist de unos 15 minutos, " +
        "decirme a qué correo quedan tus cuentas (las abro yo, a tu nombre), y probar el " +
        "sistema antes de que lo demos por entregado. Lo demás lo hago yo.",
      meta:
        "**La única cuenta que necesita tus manos** es el WhatsApp oficial: Meta exige " +
        "que salga del Facebook del dueño. Son ~10 minutos en videollamada, yo te voy " +
        "dictando cada clic. Todo lo demás lo abro yo.",
      incluye:
        "**La entrega incluye:** el sistema funcionando, un video corto explicando cómo usarlo, " +
        "una guía de 1 página y la documentación.",
    },
    cambios: {
      titulo: "Cambios y ajustes",
      items: [
        "**Durante la construcción:** los ajustes de tono, de respuestas y de detalles van " +
          "incluidos. Para eso son los avances que te voy mandando.",
        "**Después de entregar: 30 días de ajustes incluidos**, sin costo.",
        "**Lo que agranda el alcance** (piezas nuevas, integraciones que no están en el punto " +
          "1) se cotiza aparte y **siempre te aviso el precio antes de hacerlo**. Nunca se te " +
          "cobra algo que no aprobaste.",
        "Cualquier cambio de alcance queda por escrito antes de ejecutarse. Un mensaje de " +
          "WhatsApp cuenta como “por escrito”.",
      ],
    },
    garantia: {
      titulo: "Garantía",
      items: [
        "**Si no te entrego lo acordado funcionando, te devuelvo tu anticipo completo.** Sin " +
          "discutir y sin condiciones.",
        "Lo que sí garantizo: que el sistema haga lo que dice el punto 1, que quede a tu " +
          "nombre, y los 30 días de ajustes de arriba.",
        "Lo que no puedo garantizar —y te recomiendo desconfiar de quien te lo prometa— son " +
          "números de resultado: cuántas ventas más vas a cerrar o cuánto vas a facturar. Las " +
          "estimaciones de tu propuesta son eso, estimaciones, con los supuestos a la vista.",
      ],
    },
    atrasos: {
      titulo: "Si algo se atrasa",
      items: [
        "**Si me atraso yo:** te aviso en cuanto lo sepa, con la fecha nueva. Si el atraso pasa " +
          "de **15 días** sobre lo comprometido y no es por algo fuera de mi control, puedes " +
          "cancelar y te devuelvo el anticipo completo.",
        "**Si se atrasa tu parte** (información, accesos, aprobaciones): el reloj se pausa y la " +
          "fecha de entrega se recorre lo mismo que haya tardado. No hay penalización.",
        "**Si pasan 60 días sin tu información**, doy el trabajo por cerrado: te entrego lo " +
          "avanzado y los accesos, y el anticipo queda como pago del trabajo ya hecho. Si " +
          "después quieres retomarlo, se cotiza lo que falte.",
      ],
      fuerzaMayor: (terceros) =>
        `Quedan fuera de esto las cosas que ninguno de los dos controla: caídas de ${terceros}, ` +
        `cambios de política de un proveedor, o causas de fuerza mayor. Si pasa algo así, te lo ` +
        `digo de frente y buscamos la salida juntos.`,
    },
    cancelar: {
      titulo: "Si se cancela",
      items: [
        "**Antes de que arranque el trabajo:** te devuelvo el anticipo completo.",
        "**Ya arrancado, si tú cancelas:** el anticipo cubre el trabajo hecho hasta ese momento " +
          "y no se devuelve, pero **te entrego lo avanzado y todos los accesos** — no te quedas " +
          "sin nada.",
        "**Ya arrancado, si yo cancelo:** te devuelvo el anticipo completo, más lo avanzado y " +
          "los accesos.",
        "**Después de la entrega:** no hay devolución, porque el trabajo ya está entregado y es " +
          "tuyo. Lo que sigue corriendo son los 30 días de ajustes.",
      ],
      gestionado:
        "**La mensualidad se cancela cuando quieras, avisando con 30 días.** No hay " +
        "permanencia ni penalización. Al cancelar, te entrego la operación completa y " +
        "quito mis accesos.",
    },
    propiedad: {
      titulo: "Propiedad",
      todoTuyo: (empresa) =>
        `**Todo lo construido es tuyo al 100%,** desde el primer día: el código, las cuentas, ` +
        `el dominio y los accesos quedan a nombre de ${empresa}.`,
      portable:
        "Si mañana quieres que otra persona lo mantenga, se lo llevas sin pedirme permiso y sin " +
        "pagarme nada. Nunca quedas amarrado a mí, y no hay ninguna pieza escondida que solo yo " +
        "pueda tocar.",
    },
    datos: {
      titulo: "Datos de tus compradores y confidencialidad",
      items: [
        "**Los datos de tus compradores viven en tus cuentas, no en las mías.** Como todo se abre " +
          "a tu nombre, la información nunca sale de tu control.",
        "**No copio, no exporto ni comparto datos de tus compradores.** Cualquier acceso que necesite " +
          "para construir es acotado, documentado y lo puedes revocar cuando quieras.",
        "**Confidencialidad:** todo lo que me cuentes de tu inmobiliaria —números, procesos, " +
          "precios— se queda entre nosotros.",
        "**El responsable del manejo de datos personales ante la ley eres tú**, como inmobiliaria, " +
          "igual que hoy con tu CRM y tu lista de prospectos. Eso incluye tener tu aviso de " +
          "privacidad al día. Mi trabajo es dejarte la herramienta configurada para que puedas " +
          "cumplirlo, no sustituirte en esa responsabilidad.",
      ],
    },
    responsabilidad: {
      titulo: "Hasta dónde llega mi responsabilidad",
      intro: "Para que no haya malentendidos, y dicho de frente:",
      tope:
        "**Mi responsabilidad máxima es el monto que me hayas pagado por este trabajo.** No " +
        "respondo por ganancias que se hayan dejado de tener, ni por daños indirectos.",
      terceros: (lista) =>
        `**No respondo por fallas de servicios de terceros:** ${lista}. Si alguno se cae o ` +
        `cambia sus reglas, te aviso y ayudo a resolverlo, pero no está en mis manos.`,
      asistente:
        "**El asistente no da asesoría legal, fiscal ni migratoria, ni sustituye a un " +
        "asesor inmobiliario.** Atiende mensajes o llamadas, responde dudas con la " +
        "información que tú apruebes y agenda visitas. Impuestos, FIRPTA, cómo conviene " +
        "escriturar, condiciones de crédito o temas de visa se derivan a tu equipo, a tu " +
        "abogado o a tu contador — el asistente lo dice así de claro.",
      // 🔄 Reescrita el 2026-08-25. Antes prometía que el sistema NO da precios,
      // disponibilidad ni fechas — y desde esa fecha eso lo elige el CLIENTE. Un contrato
      // que promete lo contrario de lo que compró es justo el defecto del 21 de agosto.
      //
      // ⚠️ Y no puede nombrar el modo concreto: este acuerdo se firma ANTES del Portal de
      // Arranque, así que cuando lo lee todavía no ha elegido. Por eso dice que lo elige
      // él y con qué consecuencia, no lo que eligió.
      noDice: (conAsistente) =>
        `**Qué dice y qué no lo defines tú.** Al arrancar eliges qué hace el sistema con ` +
        `los precios, la disponibilidad y las fechas de entrega: no darlos y pasar la ` +
        `conversación a tu asesor —lo predeterminado—, repetir solo lo que ya publicas, o ` +
        `consultarlos en el momento en la fuente que tú mantengas. **Si eliges que los diga, ` +
        `salen de esa fuente y tú respondes por ella:** en preventa esos datos cambian por ` +
        `línea, piso y etapa, y un dato vencido por escrito es una promesa que alguien te va ` +
        `a reclamar. ` +
        (conAsistente
          ? `Con la opción predeterminada, cuando un comprador pregunta eso el asistente se ` +
            `lo dice con claridad y lo pasa a tu asesor. `
          : `El sitio no los publica salvo que tú lo indiques. `) +
        `\n\n**Lo que no se puede cambiar, y va siempre:** el sistema nunca opina sobre un ` +
        `vecindario ni sobre quién vive ahí —lo prohíbe la ley federal de vivienda justa y ` +
        `la responsabilidad recae en el bróker—, ` +
        // ⚠️ Identificarse y avisar de la grabación solo tiene sentido si hay algo que
        // conversa. En un contrato de solo-web o solo-panel, nombrar al asistente es
        // hablarle de una pieza que no compró (lección 2026-08-16).
        (conAsistente
          ? `siempre dice que es un asistente y avisa si la llamada puede grabarse —Florida ` +
            `exige el consentimiento de las dos partes—, y `
          : ``) +
        `nunca inventa: si no tiene el dato, lo dice o lo deja en manos de tu equipo. ` +
        `Son las reglas que no puedes quitar, y las ves en tu configuración.`,
      siResponde:
        "**Lo que sí responde es la información que tú apruebas** (ubicación, amenidades, " +
        "generalidades del desarrollo, cómo es el proceso de compra). Si cambia algo de tu " +
        "lado, hay que actualizarlo.",
    },
    vigencia: {
      titulo: "Vigencia y aceptación",
      validez:
        "El precio y el alcance de este acuerdo son válidos **15 días** a partir de la fecha de " +
        "arriba.",
      vigente: (gestionado) =>
        "El acuerdo está vigente desde que lo aceptas hasta la entrega, más los 30 días de " +
        "ajustes." +
        (gestionado ? " La parte de operación sigue mientras siga la mensualidad." : ""),
      ley: (ley, foro) =>
        `Lo que no esté previsto aquí se rige por los Términos de Servicio publicados en ` +
        `**upcoreai.com/terminos**, y por **${ley}**. Si alguna vez hubiera un desacuerdo que ` +
        `no podamos resolver hablando, se resuelve ante ${foro}.`,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// INGLÉS — traducción de cortesía. NO gobierna (ver `clausulaIdioma`).
//
// Se traduce el SENTIDO, no palabra por palabra: el contrato está escrito a
// propósito en lenguaje llano, sin jerga legal, y esa voz se conserva. Lo que sí
// se respeta al pie de la letra son las cifras, los plazos y las obligaciones —
// ahí una diferencia no es de estilo.
// ─────────────────────────────────────────────────────────────────────────────

const EN: Textos = {
  documento: "Service Agreement",
  acuerdoEntre: (empresa) => `Agreement between Upcore AI and ${empresa}`,
  aDistancia: "Agreed remotely",
  intro:
    "This is not a lock-in contract and there is no fine print. It is the written summary of " +
    "what we already discussed, so we both know exactly what is included, what it costs, by " +
    "when, and what happens if something goes off plan.",
  clausulaIdioma:
    "**This agreement was written in Spanish**, which is the language we did business in. This " +
    "English version is provided for your accountant or your attorney as a **courtesy " +
    "translation**: **if the two versions ever differ, the Spanish version governs.** " +
    "(Español: este acuerdo está escrito en español; la versión en inglés es una traducción de " +
    "cortesía y, si difieren, manda la versión en español.)",

  firmas: "Signatures",
  pendiente: "Not yet accepted",
  pendienteNota:
    "This document has not been accepted yet. It is accepted online, at the link you received, " +
    "by typing your full name.",
  aceptadoLinea: ({ fecha, correo, ip }) =>
    `Accepted electronically on ${fecha} (Miami time)` +
    (correo ? ` from ${correo}` : "") +
    (ip ? ` · IP ${ip}` : ""),
  notaLegalFirma:
    "This electronic acceptance has the same legal effect as a handwritten signature under the " +
    "federal E-SIGN Act and the Florida Uniform Electronic Transaction Act (Fla. Stat. §668.50). " +
    "The date and time were recorded by Upcore AI's server.",
  pie: (empresa) => `Upcore AI · Service Agreement · ${empresa}`,
  pagina: (n, de) => `Page ${n} of ${de}`,

  noIncluyeFijo: [
    "advertising campaigns or paid media",
    "social media content creation",
    "migrating your database from another CRM",
    "anything not listed above",
  ],
  planes: {
    llave: {
      label: "Turnkey",
      descripcion:
        "I build it, hand it over working, and train you. From then on you run it (or whoever " +
        "you choose). One-time payment, no monthly fee and no lock-in. If you later need " +
        "occasional support, it is billed by the hour.",
      filaMensualidad: "Monthly fee",
      operacion: "On delivery I transfer every credential to you and **keep none**.",
    },
    gestionado: {
      label: "Managed",
      descripcion:
        "I build it and **I also run it, maintain it and improve it** for you: monitoring, " +
        "changes and support are included in your monthly fee. You do not have to learn to " +
        "operate it. Cancel whenever you want with 30 days' notice.",
      filaMensualidad: "Monthly fee (operation and maintenance)",
      operacion:
        "In order to run your system, I keep access that is **limited, documented and " +
        "revocable** at any time. Ownership stays yours: the access is to do the work, not to " +
        "hold anything hostage.",
    },
  },
  sinMensualidad: "$0 — you run your own system",
  bono: (titulo) => `${titulo} — at no cost (included)`,

  terceros: {
    whatsapp: "WhatsApp",
    meta: "Meta",
    linea: "your phone line",
    ia: "the artificial intelligence providers",
    hosting: "your hosting",
    dominio: "your domain registrar",
    internet: "your internet connection",
  },
  cuentas: {
    ia: "the artificial intelligence accounts",
    whatsapp: "the WhatsApp account",
    linea: "the phone line",
  },
  unir: unirCon("and"),

  ui: {
    etiquetaAceptado: "Agreement accepted",
    etiquetaActivo: "Service agreement",
    verEnOtroIdioma: "Ver en español",
    avisoTraduccion:
      "This is a courtesy translation. The Spanish version is the one that governs this " +
      "agreement.",
    aceptadoEl: (fechaHora) => `Accepted on ${fechaHora} (Miami time)`,
    avisoCopia:
      "✅ This agreement has been accepted and recorded. We emailed you your copy as a PDF; " +
      "you can download it again below whenever you want.",
    descargarPdf: "Download the agreement as PDF",
    guardalo: "Keep it or forward it to your accountant.",
    dudas: "Questions?",
    escribenos: "message us on WhatsApp",
    noDisponible: "This agreement is not available",
    noDisponibleNota: "The link may be incomplete. Message us and we will send it again.",
    hablarConUpcore: "Talk to Upcore",
    paraAceptar: "To accept, type your full name:",
    tuNombre: "Your full name",
    tuCorreo: "Your email",
    correoNota: "This is where your signed, dated PDF copy of the agreement is sent.",
    leiTodo: "I have read the full agreement and I agree with what it says.",
    aceptar: "I accept the agreement",
    registrando: "Recording…",
    errorAceptar:
      "We could not record it. Check your connection and try again — if it keeps failing, " +
      "message us on WhatsApp and we will sort it out.",
    notaFinal:
      "Accepting records the date and time, and we email you your PDF copy. It does not " +
      "commit you to pay at that moment: you make the deposit when you decide to start.",
  },

  sec: {
    entregar: {
      titulo: "What I will deliver",
      noIncluye: (lista) => `**What is NOT included:** ${lista}.`,
      recortar:
        "If you do not need something on this list, tell me and we take it out: the price goes " +
        "down. Nothing here is a closed package.",
    },
    plan: { titulo: (label) => `Plan selected: ${label}` },
    inversion: {
      titulo: "Investment and payment terms",
      construccion: "Build (one-time payment)",
      anticipo: "To get started (on acceptance)",
      resto: "On delivery (when you receive it)",
      dominioWebSola:
        "**The first year of the domain is included in the price**, registered in your firm's " +
        "name from day one. From the second year on it renews for roughly $15 to $25 per year, " +
        "which moves to your card — or stays on Upcore while you are on the Managed plan. " +
        "Hosting for a site like this has no cost. Upcore does not add a single dollar of " +
        "margin to any of it.",
      costosVariables: (cuentas) =>
        "**The first year of the domain is included in the price**, registered in your firm's " +
        `name. **The remaining variable costs are yours and go straight to your card:** ${cuentas} ` +
        "are opened **in your name**, with a spending cap turned on, and you pay what they use. " +
        "Upcore does not add a single dollar of margin, and never charges you up front for " +
        "something it does not control. Before we start I give you the monthly estimate based " +
        "on your own volume.",
      facturacion:
        "**How you pay and how it is invoiced:** Upcore AI is a **foreign vendor** (it operates " +
        "from Mexico), so it does not issue a U.S. tax invoice and does not charge you local " +
        "taxes. You receive a **commercial invoice** for each payment, itemized, for your " +
        "records. Payment is made by **international wire transfer** to the account shown on the " +
        "invoice. If your accountant needs the foreign-vendor form (W-8BEN or whichever they " +
        "ask for), tell me and I will sign it before the first transfer.",
    },
    tiempos: {
      titulo: "Timeline",
      arranca:
        "**The clock starts** when the deposit clears **and** your part of the onboarding " +
        "checklist arrives (your firm's information, developments, hours, and access to your " +
        "accounts). The clock does not run without that information.",
      entrega: (plazo) => `**Estimated delivery: ${plazo}** from the start.`,
      tuParte:
        "**Your part is small:** about an hour in total — a checklist of roughly 15 minutes, " +
        "telling me which email your accounts should be under (I open them, in your name), and " +
        "testing the system before we call it delivered. I handle the rest.",
      meta:
        "**The only account that needs your hands** is the official WhatsApp: Meta requires it " +
        "to come from the owner's Facebook. It takes about 10 minutes on a video call, and I " +
        "walk you through every click. Everything else I open myself.",
      incluye:
        "**Delivery includes:** the working system, a short video explaining how to use it, a " +
        "1-page guide, and the documentation.",
    },
    cambios: {
      titulo: "Changes and adjustments",
      items: [
        "**During the build:** adjustments to tone, to answers and to details are included. " +
          "That is what the progress updates I send you are for.",
        "**After delivery: 30 days of adjustments included**, at no cost.",
        "**Anything that grows the scope** (new components, integrations not listed in section " +
          "1) is quoted separately and **I always tell you the price before doing it**. You are " +
          "never charged for something you did not approve.",
        "Any change of scope is put in writing before it is carried out. A WhatsApp message " +
          "counts as “in writing”.",
      ],
    },
    garantia: {
      titulo: "Guarantee",
      items: [
        "**If I do not deliver what we agreed, working, I return your full deposit.** No " +
          "argument and no conditions.",
        "What I do guarantee: that the system does what section 1 says, that it ends up in your " +
          "name, and the 30 days of adjustments above.",
        "What I cannot guarantee — and I would be wary of anyone who promises it — are outcome " +
          "numbers: how many more sales you will close or how much you will bill. The estimates " +
          "in your proposal are exactly that, estimates, with the assumptions in plain sight.",
      ],
    },
    atrasos: {
      titulo: "If something runs late",
      items: [
        "**If I am the one running late:** I tell you as soon as I know, with the new date. If " +
          "the delay goes beyond **15 days** past what was committed and it is not due to " +
          "something outside my control, you can cancel and I return your full deposit.",
        "**If your part runs late** (information, access, approvals): the clock pauses and the " +
          "delivery date moves by however long it took. There is no penalty.",
        "**If 60 days pass without your information**, I close the work out: I hand over what " +
          "is built and the credentials, and the deposit stands as payment for the work already " +
          "done. If you want to pick it back up later, whatever is left gets quoted.",
      ],
      fuerzaMayor: (terceros) =>
        `This does not cover the things neither of us controls: outages at ${terceros}, a ` +
        `provider changing its policies, or force majeure. If something like that happens, I ` +
        `tell you straight and we find the way out together.`,
    },
    cancelar: {
      titulo: "If it is cancelled",
      items: [
        "**Before the work starts:** I return your full deposit.",
        "**Once started, if you cancel:** the deposit covers the work done up to that point and " +
          "is not refunded, but **I hand over what is built and every credential** — you are not " +
          "left with nothing.",
        "**Once started, if I cancel:** I return your full deposit, plus what is built and the " +
          "credentials.",
        "**After delivery:** there is no refund, because the work has been delivered and it is " +
          "yours. What keeps running are the 30 days of adjustments.",
      ],
      gestionado:
        "**The monthly fee can be cancelled whenever you want, with 30 days' notice.** There is " +
        "no lock-in and no penalty. On cancellation I hand over the full operation and remove " +
        "my access.",
    },
    propiedad: {
      titulo: "Ownership",
      todoTuyo: (empresa) =>
        `**Everything built is 100% yours,** from day one: the code, the accounts, the domain ` +
        `and the credentials are all in the name of ${empresa}.`,
      portable:
        "If tomorrow you want someone else to maintain it, you take it to them without asking " +
        "my permission and without paying me anything. You are never locked in to me, and there " +
        "is no hidden piece that only I can touch.",
    },
    datos: {
      titulo: "Your buyers' data and confidentiality",
      items: [
        "**Your buyers' data lives in your accounts, not in mine.** Since everything is opened " +
          "in your name, the information never leaves your control.",
        "**I do not copy, export or share your buyers' data.** Any access I need in order to " +
          "build is limited, documented, and you can revoke it whenever you want.",
        "**Confidentiality:** everything you tell me about your firm — numbers, processes, " +
          "prices — stays between us.",
        "**You are the party responsible for personal data under the law**, as the firm, the " +
          "same as you are today with your CRM and your prospect list. That includes keeping " +
          "your privacy policy current. My job is to hand you the tool configured so that you " +
          "can comply, not to take that responsibility off your hands.",
      ],
    },
    responsabilidad: {
      titulo: "The limits of my liability",
      intro: "So there are no misunderstandings, said plainly:",
      tope:
        "**My maximum liability is the amount you have paid me for this work.** I am not liable " +
        "for lost profits or for indirect damages.",
      terceros: (lista) =>
        `**I am not liable for failures of third-party services:** ${lista}. If one of them goes ` +
        `down or changes its rules, I tell you and help resolve it, but it is not in my hands.`,
      asistente:
        "**The assistant does not give legal, tax or immigration advice, and does not replace a " +
        "real estate advisor.** It handles messages or calls, answers questions with the " +
        "information you approve, and books visits. Taxes, FIRPTA, how best to take title, " +
        "financing terms or visa matters are referred to your team, your attorney or your " +
        "accountant — and the assistant says so plainly.",
      noDice: (conAsistente) =>
        `**What it says and what it doesn't is up to you.** At kickoff you choose what the ` +
        `system does with prices, availability and delivery dates: withhold them and hand the ` +
        `conversation to your agent —the default—, repeat only what you already publish, or ` +
        `look them up in the moment from a source you keep current. **If you choose to have it ` +
        `state them, they come from that source and you stand behind it:** in preconstruction ` +
        `those figures change by line, floor and phase, and a stale one in writing is a promise ` +
        `someone will hold you to. ` +
        (conAsistente
          ? `On the default setting, when a buyer asks for that the assistant says so clearly ` +
            `and hands them to your agent. `
          : `The site does not publish them unless you say otherwise. `) +
        `\n\n**What cannot be changed, and always applies:** the system never comments on a ` +
        `neighborhood or on who lives there —federal fair housing law prohibits it and the ` +
        `liability falls on the broker—, ` +
        (conAsistente
          ? `it always states that it is an assistant and warns that a call may be recorded ` +
            `—Florida requires two-party consent—, and `
          : ``) +
        `it never makes anything up: if it lacks the answer, it says so or leaves it to your ` +
        `team. Those are the rules you cannot remove, and you see them in your settings.`,
      siResponde:
        "**What it does answer is the information you approve** (location, amenities, general " +
        "details of the development, how the buying process works). If something changes on " +
        "your side, it has to be updated.",
    },
    vigencia: {
      titulo: "Term and acceptance",
      validez:
        "The price and the scope of this agreement are valid for **15 days** from the date " +
        "shown above.",
      vigente: (gestionado) =>
        "The agreement is in force from the moment you accept it until delivery, plus the 30 " +
        "days of adjustments." +
        (gestionado ? " The operations portion continues for as long as the monthly fee does." : ""),
      ley: (ley, foro) =>
        `Anything not covered here is governed by the Terms of Service published at ` +
        `**upcoreai.com/terminos**, and by **${ley}**. If there is ever a disagreement we cannot ` +
        `resolve by talking, it is resolved before ${foro}.`,
    },
  },
};

export const TEXTOS: Record<Idioma, Textos> = { es: ES, en: EN };

// ─────────────────────────────────────────────────────────────────────────────
// EL CATÁLOGO, EN INGLÉS
//
// 🔴 POR QUÉ EXISTE. La primera versión de la traducción dejó el **punto 1 entero en
// español**: los nombres y alcances de las piezas salen de lib/calc.ts, que es el
// catálogo de ventas y está en español. O sea que el contrato en inglés decía
// "What I will deliver" y debajo cinco renglones que un lector de inglés no entiende —
// justo la sección que dice qué está comprando. Peor: mi propio guardián EXCLUÍA el
// punto 1 de la revisión de idioma "a propósito", así que salió verde y escondió el
// defecto. Se descubrió leyendo el documento completo, no corriendo la prueba.
//
// Se traduce por DICCIONARIO y no a mano en cada sitio: si mañana se agrega una pieza
// al catálogo y no se traduce, el guardián del prebuild truena. Es un candado, no un
// recordatorio.
// ─────────────────────────────────────────────────────────────────────────────

/** Clave: el nombre en español tal como sale del catálogo (lo de antes del " — "). */
// Se exporta solo para que los guardianes puedan leerlo (`probar-idiomas-
// producto.mjs` comprueba que el acuerdo no prometa menos idiomas que la
// propuesta). El acuerdo se arma con `traducirRenglon()`, no leyendo esto.
export const CATALOGO_EN_PARA_PRUEBAS = () => CATALOGO_EN;

const CATALOGO_EN: Record<string, { label: string; alcance: string }> = {
  "Agente de WhatsApp 24/7": {
    label: "24/7 WhatsApp agent",
    alcance:
      "answers WhatsApp in Spanish, English or Portuguese depending on the language they " +
      "write in, at any hour and in any time zone, handles the usual questions, qualifies " +
      "the buyer (budget, timeline, and whether they need financing) and books the visit " +
      "or the video call",
  },
  "Agente de WhatsApp esencial": {
    label: "Essential WhatsApp agent",
    alcance:
      "answers WhatsApp in Spanish only, at any hour, handles the usual questions " +
      "—location, what is available and how the buying process works— and books the " +
      "visit; it does not qualify the buyer and does not connect to your CRM: the full " +
      "agent is there for that",
  },
  "Agente de voz 24/7": {
    label: "24/7 voice agent",
    alcance:
      "answers the calls that go unanswered today, speaks Spanish or English depending on " +
      "who calls, handles questions out loud, books into your calendar and notifies the " +
      "agent — keeping your current number",
  },
  "Sitio web con agenda": {
    label: "Website with booking",
    alcance:
      "a site in Spanish and English, with a page for each development, a form that " +
      "qualifies, and online booking, ready to receive ad traffic",
  },
  "Seguimiento automático": {
    label: "Automated follow-up",
    alcance:
      "follow-up in each buyer's own language — Spanish or English — that holds up over " +
      "the months a preconstruction sale takes: reminders for each payment milestone, " +
      "construction progress updates, and re-engagement of the buyer who went quiet",
  },
  "Reactivación de prospectos": {
    label: "Prospect reactivation",
    alcance:
      "a campaign in Spanish or English to reach back out to the old prospects sitting in " +
      "your list who never bought",
  },
  // ⚠️ Tiene que decir lo MISMO que `CALC_TEXTOS.en.panelIncluye`, que es de donde
  // sale este renglón en la propuesta. Son dos copias de la misma frase y hay
  // guardián (`probar-consola.mjs`) que las compara: si se separan, el cliente
  // compraría leyendo una y firmaría leyendo la otra.
  "Panel del director comercial": {
    label: "Sales director's dashboard",
    alcance:
      "in Spanish and English: every agent with their own login, how each one is doing " +
      "and every buyer's path all the way to the sale, with your real return in plain view",
  },
};

/** Renglones sueltos del punto 1 que no vienen del catálogo (SEO y bonos). */
const RENGLONES_EN: Record<string, string> = {
  "Dejarlo listo para Google: su título y su descripción en los dos idiomas —cada uno con su propia dirección, para que el buscador indexe las dos versiones y no las tome por repetidas—, tu ficha de negocio declarada (nombre, dirección, teléfono y a qué te dedicas) y la página cargando rápido en el celular":
    "Set up for Google: its title and description in both languages —each with its own " +
    "address, so the search engine indexes both versions instead of treating them as " +
    "duplicates—, your business listing declared (name, address, phone and what you do) " +
    "and the page loading fast on a phone",
  "Tu ficha de Google, al día y conectada": "Your Google Business listing, updated and linked",
  "Tu agenda digital, montada": "Your digital calendar, set up",
};

/**
 * El renglón de la CONSOLA no cabe en un diccionario de frases exactas: se arma con
 * las piezas del cliente, así que hay una variante por cada combinación. Se traduce
 * **recomponiéndolo**: se mira qué mandos nombra el español y se vuelve a armar en
 * inglés con la misma función que lo generó.
 *
 * ⚠️ La red de seguridad es el paso de en medio: con los mandos reconocidos se
 * REHACE el español y se exige que salga idéntico al que entró. Si alguien agrega un
 * mando, cambia la frase o mete texto de más, no coincide, esto devuelve `null` y el
 * guardián truena — en vez de traducir a medias y perder un trozo en silencio, que es
 * como se cuela media frase en español dentro de un contrato en inglés.
 */
function traducirConsola(item: string): string | null {
  const es = CALC_TEXTOS.es.consola;
  const en = CALC_TEXTOS.en.consola;
  const cabeza = es.frase("").split(" — ")[0];
  if (!item.startsWith(`${cabeza} — `)) return null;

  const suyos = MANDOS.filter((m) => item.includes(es.mandos[m]));
  if (suyos.length === 0) return null;
  const rehecho = es.frase(es.une(suyos.map((m) => es.mandos[m])));
  if (rehecho !== item) return null;

  return en.frase(en.une(suyos.map((m) => en.mandos[m])));
}

/**
 * Traduce un renglón del punto 1. Devuelve `null` si no hay traducción — el que llama
 * decide: en producción se deja el español (mejor un renglón sin traducir que un
 * contrato que no se genera), y el guardián del prebuild TRUENA para que eso nunca
 * llegue a un cliente.
 */
export function traducirRenglon(item: string): string | null {
  const suelto = RENGLONES_EN[item];
  if (suelto) return suelto;

  // Antes de partir por " — ": el renglón de la consola también lo lleva, y si se
  // partiera acabaría buscando "Tus controles, incluidos" en el catálogo de piezas.
  const consola = traducirConsola(item);
  if (consola) return consola;
  const corte = item.indexOf(" — ");
  // ⚠️ Los nombres llegan de DOS formas: con alcance ("Sitio web con agenda — sitio en
  // español…") en el punto 1, y **pelados** ("Sitio web con agenda") en la lista de lo
  // que NO incluye. El primer intento solo cubría la forma larga, así que el "qué NO
  // incluye" del contrato en inglés se quedaba en español. Lo cazó el guardián.
  if (corte < 0) {
    const solo = CATALOGO_EN[item];
    return solo ? solo.label : null;
  }
  const cat = CATALOGO_EN[item.slice(0, corte)];
  return cat ? `${cat.label} — ${cat.alcance}` : null;
}

/** Los renglones que NO se pueden traducir. Para el guardián. */
export const sinTraducir = (items: string[]) =>
  items.filter((i) => traducirRenglon(i) === null);

/** La ley y el foro, en el idioma del documento. El español es el canónico:
 *  lib/acuerdo.ts exporta LEY_APLICABLE/FORO y el guardián comprueba que coincidan. */
export const LEY_POR_IDIOMA: Record<Idioma, { ley: string; foro: string }> = {
  es: {
    ley: "las leyes del Estado de Florida, Estados Unidos",
    foro: "los tribunales del Condado de Miami-Dade, Florida",
  },
  en: {
    ley: "the laws of the State of Florida, United States",
    foro: "the courts of Miami-Dade County, Florida",
  },
};
