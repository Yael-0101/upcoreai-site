import { normalizarPiezas, pideTono } from "./arranque-copy";
// Los giros válidos de la demo salen de lib/nicho.json (fuente única del nicho).
import { GIROS_DEMO, DEMO_DEFAULTS } from "./demo-config";

// ============================================================================
// Portal de Arranque — tipos y helpers compartidos (página server + wizard client).
// La fila vive en la tabla `arranques` de n8n; `datos` es un JSON string con
// TODO el estado del cliente (autosave con last-write-wins: un usuario por token).
// ============================================================================

export type ServicioItem = { nombre: string; precio: string; duracion: string };

export type TextoItem = {
  id: string;
  titulo: string;
  borrador: string;
  estado: "pendiente" | "aprobado" | "con-cambios";
  comentario: string;
};

export type AvanceItem = {
  fase: string;
  estado: "pendiente" | "en-curso" | "hecha";
  nota?: string;
  fecha?: string;
};

export type CuentaEstado = { lista: boolean; correo: string };

/**
 * Los datos para crearle las cuentas.
 *
 * ⚠️ YA NO SE LE PREGUNTA QUIÉN LAS CREA (decisión de Yael, 2026-08-16): las crea
 * SIEMPRE Upcore, a nombre del cliente. El portal ofrecía un botón de "Yo las
 * creo" que contradecía el arranque concierge del manual — y el motivo de fondo
 * es de venta: un doctor no puede perder su tarde abriendo cuentas, y que no
 * tenga que hacerlo es justo la impresión que queremos que se lleve.
 *
 * El campo `modo` se conserva solo para no romper las filas viejas; nada lo
 * escribe ya. Lo único que necesitamos de él es a qué correo y teléfono quedan
 * (son SUYAS, a su nombre) y cuándo puede contestarnos, porque los códigos de
 * verificación le llegan a él y se vencen rápido.
 */
export type ConciergeDatos = {
  modo: "upcore" | "yo" | null;
  /** ⚠️ Ya no se pregunta (2026-08-16): el correo del proyecto SIEMPRE se crea
   *  nuevo. Se conserva para leer bien las filas que sí eligieron "mio". */
  correoTipo: "mio" | "nuevo" | null;
  correo: string; // si es "mio"
  correoIdea: string; // si es "nuevo": cómo le gustaría que se llame
  telefono: string; // a donde llegan los códigos por SMS
  horario: string; // cuándo le queda bien que le escribamos por WhatsApp
};

export type ArranqueDatos = {
  config: {
    nombre: string;
    clinica: string;
    giro: string; // clave de giro de lib/nicho.json (alimenta la demo)
    productos: string[]; // agente | voz | web | auto | reactivacion | panel
    plan: string; // llave | gestionado
  };
  checklist: {
    servicios: ServicioItem[];
    horarios: string;
    tono: string | null;
    faqs: string;
    indicaciones: string;
    logoColores: string;
  };
  numero: { decision: string | null }; // actual | nuevo | asesoria
  /** Solo agente de voz: qué pasa con su teléfono. desvio | nuevo | asesoria */
  linea: { decision: string | null };
  /** Solo con asistente (chat o voz): a quién avisamos cuando un comprador pide
   *  hablar con una persona. El teléfono es DIRECTO, nunca el público de la firma
   *  (con desvío, el agente entra porque ese ya no contestó). Ver `pideEscalacion`. */
  escalacion: { nombre: string; telefono: string; via: string | null };
  concierge: ConciergeDatos;
  cuentas: Record<string, CuentaEstado>;
  calendario: { compartido: boolean; tipo: string };
  prueba: { hecha: boolean; comentarios: string };
  /** Estilo del sitio (solo proyectos con web): paleta propia o de inspiración,
   *  y 1–3 páginas de referencia con qué le gusta de cada una. */
  web: { paleta: string; referencias: Array<{ url: string; nota: string }> };
  /** Borradores de recordatorios/confirmaciones — los siembra Upcore por cliente */
  textos: TextoItem[];
  /** Fases del proyecto — las actualiza Upcore; el cliente solo las ve */
  avances: AvanceItem[];
  progreso: { pasoActual: number; parteInicialEl?: string; completadoEl?: string };
  /**
   * El idioma en que el cliente está leyendo su portal.
   *
   * ⚠️ SE GUARDA, no vive solo en la URL. El portal no se llena de una sentada: se
   * entra, se deja a medias y se vuelve al día siguiente con el mismo link. Si el
   * idioma viviera solo en `?lang=en`, al volver lo encontraría en español y
   * pensaría que le cambiamos el portal. Cabe aquí sin tocar el esquema de n8n
   * porque `datos` es un JSON.
   */
  idioma?: "es" | "en";
};

/**
 * Las fases del proyecto (espejo del checklist interno de despliegue).
 *
 * 🔴 SE FILTRAN POR PIEZAS (lección 2026-08-24). Esta lista era fija, y a un cliente
 * que solo compró el agente de VOZ su propio avance le anunciaba "WhatsApp oficial
 * con Meta" — un trámite que nunca va a existir en su proyecto. Se descubrió abriendo
 * un portal de prueba y LEYÉNDOLO: el guardián revisaba el copy de los pasos, pero
 * las fases eran texto fijo que nadie miraba.
 *
 * Es exactamente el defecto del 2026-08-16 (el filtro llega hasta el texto, no solo
 * hasta qué bloques se muestran), en la única sección del portal donde no se había
 * aplicado.
 */
const FASE_WHATSAPP = "WhatsApp oficial con Meta";

export function fasesDe(productos: string[]): AvanceItem[] {
  const p = normalizarPiezas(productos);
  // El trámite de Meta solo existe si algo suyo escribe por WhatsApp.
  const conMeta = ["agente", "auto", "reactivacion"].some((x) => p.includes(x));
  return [
    { fase: "Preparación: checklist y cuentas", estado: "pendiente" },
    ...(conMeta ? [{ fase: FASE_WHATSAPP, estado: "pendiente" as const }] : []),
    { fase: "Construcción del sistema", estado: "pendiente" },
    { fase: "Pruebas contigo", estado: "pendiente" },
    { fase: "Entrega y capacitación", estado: "pendiente" },
  ];
}

/** Compatibilidad: la lista completa. Usar `fasesDe(productos)` en pantalla. */
export const FASES_DEFAULT: AvanceItem[] = fasesDe([]);

/** Rellena huecos con defaults — snapshots viejos o parciales no truenan. */
export function normalizarDatos(d: unknown): ArranqueDatos {
  const x = (d && typeof d === "object" ? d : {}) as Record<string, any>;
  return {
    config: {
      nombre: "",
      clinica: "",
      giro: DEMO_DEFAULTS.giro,
      // OJO: no hay endpoint que siembre esta fila desde la propuesta aceptada —
      // `productos` lo pone Yael a mano al crearla (claves crudas, ej. ["web"]).
      // Vacío = "no se sembró": el portal muestra TODOS los pasos (comportamiento
      // de las filas viejas). Antes el default era ["agente"] y a un cliente de
      // solo-web le pedía decidir su número de WhatsApp (lección 2026-08-10).
      productos: [],
      plan: "llave",
      ...(x.config ?? {}),
    },
    checklist: {
      servicios: [],
      horarios: "",
      tono: null,
      faqs: "",
      indicaciones: "",
      logoColores: "",
      ...(x.checklist ?? {}),
    },
    numero: { decision: null, ...(x.numero ?? {}) },
    linea: { decision: null, ...(x.linea ?? {}) },
    escalacion: { nombre: "", telefono: "", via: null, ...(x.escalacion ?? {}) },
    concierge: {
      modo: null,
      correoTipo: null,
      correo: "",
      correoIdea: "",
      telefono: "",
      horario: "",
      ...(x.concierge ?? {}),
    },
    cuentas: x.cuentas && typeof x.cuentas === "object" ? x.cuentas : {},
    calendario: { compartido: false, tipo: "", ...(x.calendario ?? {}) },
    prueba: { hecha: false, comentarios: "", ...(x.prueba ?? {}) },
    web: (() => {
      const w = (x.web ?? {}) as Record<string, any>;
      return {
        paleta: typeof w.paleta === "string" ? w.paleta : "",
        referencias: Array.isArray(w.referencias) ? w.referencias : [],
      };
    })(),
    textos: Array.isArray(x.textos) ? x.textos : [],
    // 🔴 Las fases se RECONCILIAN, no se leen tal cual (lección 2026-08-24).
    //
    // `avances` mezcla dos cosas distintas, y por eso el primer arreglo no sirvió:
    //   · la LISTA de fases → es un DERIVADO de sus piezas, y se recalcula siempre;
    //   · el ESTADO de cada fase → es un HECHO que pone Upcore, y se conserva.
    //
    // El portal hace autosave, así que la primera vez que se abre congela lo que
    // haya en pantalla. Con la lista fija anterior, un cliente de solo-voz guardaba
    // "WhatsApp oficial con Meta" en sus datos — y arreglar el default no lo
    // limpiaba: el valor guardado ganaba para siempre, en silencio.
    //
    // Reconciliar deja las tres cosas bien: aparece lo que le toca, desaparece lo
    // que no, y no se pierde el avance que Upcore ya marcó.
    avances: (() => {
      const guardadas = Array.isArray(x.avances) ? (x.avances as AvanceItem[]) : [];
      const previo = new Map(guardadas.map((a) => [a?.fase, a]));
      return fasesDe(Array.isArray(x.config?.productos) ? x.config.productos : []).map(
        (f) => previo.get(f.fase) ?? f
      );
    })(),
    progreso: { pasoActual: 1, ...(x.progreso ?? {}) },
    idioma: x.idioma === "en" ? "en" : "es",
  };
}

// ── Qué pasos del wizard aplican a ESTE proyecto ─────────────────────────────
// Antes los 9 pasos eran fijos y un cliente de solo-web tenía que "decidir su
// número de WhatsApp" y "jugar a ser su paciente" en el chat (lección 2026-08-10).
// Misma filosofía que cuentasRequeridas(): las piezas mandan.
export type PasoId =
  | "bienvenida"
  | "servicios"
  | "horarios"
  | "numero"
  | "linea"
  | "cuentas"
  | "calendario"
  | "demo"
  | "textos"
  | "resumen";

export function pasosVisibles(productos: string[]): PasoId[] {
  const p = productos ?? [];
  // Fila vieja sin sembrar (lista vacía): se muestra todo, como siempre — no se
  // le esconde un paso a un proyecto del que no sabemos sus piezas.
  const todos = p.length === 0;
  const tiene = (...c: string[]) => todos || c.some((x) => p.includes(x));
  const pasos: PasoId[] = ["bienvenida", "servicios", "horarios"];
  if (tiene("agente", "auto", "reactivacion")) pasos.push("numero");
  // El agente de voz vive del TELÉFONO: decidir si se desvía su número o estrena
  // línea es LA decisión de ese producto, y no se le preguntaba nunca
  // (lección 2026-08-16). Es un paso aparte del número de WhatsApp: un cliente
  // con las dos piezas tiene que decidir las dos cosas, no una.
  if (tiene("voz")) pasos.push("linea");
  pasos.push("cuentas");
  // La web también agenda (su botón de citas cae al calendario del cliente).
  if (tiene("agente", "voz", "auto", "web")) pasos.push("calendario");
  // La demo es el CHAT del agente: a voz-sola o web-sola no les aplica.
  if (tiene("agente")) pasos.push("demo");
  // El paso de textos solo tiene contenido si hay sitio (su estilo) o mensajes
  // que aprobar. A un cliente de solo-voz le salía una pantalla vacía.
  if (tiene("web", "agente", "auto", "reactivacion")) pasos.push("textos");
  pasos.push("resumen");
  return pasos;
}

export type CuentaDef = {
  id: string;
  titulo: string;
  para: string;
  /** Qué pasa con esa cuenta — escrito desde el lado del cliente, porque él ya
   *  no la abre: la abrimos nosotros y él solo se entera de lo que le toca. */
  pasos: string[];
  nota?: string;
  /** La única excepción al arranque concierge: cuentas donde el proveedor EXIGE
   *  los clics del dueño. Hoy solo Meta (lección 2026-07-15: automatizar su
   *  navegador nos restringió el negocio, así que los clics los da la persona).
   *  Se marca para poder decírselo de frente en vez de que le sorprenda. */
  tusManos?: boolean;
};

/** Qué cuentas necesita ESTE proyecto, según sus piezas y su plan. */
export function cuentasRequeridas(config: ArranqueDatos["config"]): CuentaDef[] {
  const p = config.productos ?? [];
  const usaWhatsApp =
    p.includes("agente") || p.includes("auto") || p.includes("reactivacion");
  const defs: CuentaDef[] = [];

  if (usaWhatsApp) {
    defs.push({
      id: "meta",
      titulo: "Meta — WhatsApp oficial",
      // Un cliente de solo recordatorios no tiene asistente: para él ese número
      // no ATIENDE a nadie, solo manda. Decírselo mal le vende algo que no compró.
      para: p.includes("agente")
        ? "El número que atenderá tu asistente, verificado a nombre de tu inmobiliaria"
        : "El número desde el que salen tus mensajes, verificado a nombre de tu inmobiliaria",
      pasos: [
        "Meta exige que salga del Facebook personal del dueño, así que esta es la única que no podemos abrir solos.",
        "Son ~10 minutos en videollamada: nosotros te dictamos cada clic, tú solo tecleas.",
        "En esa misma videollamada le pones tu método de pago — cada mensaje cuesta centavos.",
      ],
      nota: "Es el paso más tardado (Meta puede tardar días en verificar) — por eso lo arrancamos primero.",
      tusManos: true,
    });
  }
  // El cerebro lo usan las DOS piezas que conversan, no solo el chat: un cliente
  // de solo-voz se quedaba sin la cuenta que hace hablar a su asistente.
  if (p.includes("agente") || p.includes("voz")) {
    defs.push({
      id: "ia",
      titulo: "Anthropic — el cerebro de IA",
      para: "El modelo de inteligencia artificial que conversa con tus compradores",
      pasos: [
        "La abrimos nosotros a tu nombre, con el tope de gasto ya activado.",
        // ⚠️ La tarjeta va al ABRIRLA, no al entregar: el asistente consume desde
        // que lo construimos y lo probamos. Ponerla al final significaría que
        // Upcore adelanta tu consumo, y esa es la regla de oro que no se rompe.
        "En cuanto quede, te mandamos el link para que le pongas tu tarjeta: 2 minutos, la tecleas tú y nosotros nunca la vemos.",
        "Su llave de acceso jamás viaja por chat, ni contigo ni con nadie.",
      ],
    });
  }
  if (p.includes("voz")) {
    defs.push({
      id: "telefonia",
      titulo: "Tu línea de voz",
      para: "Por donde entran y se contestan las llamadas de tu asistente",
      pasos: [
        "La abrimos nosotros a tu nombre y te mandamos el link para que le pongas tu tarjeta: 2 minutos, la tecleas tú.",
        "Se cobra por minuto hablado — te decimos el estimado según tus llamadas y se activa un tope de gasto.",
        "Tu número de siempre no se toca: aquí solo vive la línea del asistente.",
      ],
      nota: "De todo lo que se consume al mes, esto es lo que más pesa — es normal, y te lo decimos de frente para que no te sorprenda.",
    });
  }
  if (p.includes("web")) {
    defs.push({
      id: "dominio",
      titulo: "Tu dominio (tuinmobiliaria.com)",
      para: "La dirección de tu sitio, a tu nombre desde el día uno",
      pasos: [
        "Si ya tienes dominio, dínoslo y lo usamos — no compres otro.",
        "Si no tienes, lo compramos NOSOTROS a tu nombre: ya va incluido en tu proyecto.",
        "Tú solo dinos cómo te gustaría que se llame y lo revisamos juntos.",
      ],
      nota:
        config.plan === "gestionado"
          ? "Mientras estemos contigo, el dominio va incluido en tu mensualidad."
          : "El primer año corre por nuestra cuenta. Del segundo en adelante la renovación es tuya — te dejamos un video de cómo se hace.",
    });
  }
  if (usaWhatsApp && config.plan === "llave") {
    defs.push({
      id: "hosting",
      titulo: "Tu servidor (hosting)",
      para: "Donde vive tu automatización — en tu propia cuenta, como todo lo demás",
      pasos: [
        "La abrimos y la configuramos nosotros, a tu nombre.",
        // ⚠️ Decía "~$110–220 MXN al mes": pesos mexicanos cotizados a un cliente
        // de Miami que paga en dólares. Se cachó abriendo el portal, no leyendo.
        "Te mandamos el link para que le pongas tu tarjeta (~$6–12 USD al mes) — la tecleas tú, nosotros nunca la vemos.",
      ],
    });
  }
  return defs;
}

/**
 * ¿Ya nos dio lo que necesitamos para crearle las cuentas nosotros? Necesitamos a
 * qué correo quedan y un teléfono donde nos conteste los códigos.
 */
export function conciergeListo(c: ConciergeDatos): boolean {
  // ⚠️ Ya NO exige `modo` ni `correoTipo`: desde el 2026-08-16 las cuentas las
  // crea siempre Upcore y el correo del proyecto SIEMPRE se crea nuevo, así que
  // la pantalla dejó de preguntar las dos cosas. Pedir un campo que ya nadie
  // llena dejaría todo arranque atascado en "en curso" para siempre — sin dar
  // un solo error. Lo único que de verdad necesitamos es su teléfono.
  // (Las filas viejas que eligieron "con un correo mío" siguen exigiendo ese
  //  correo: su arranque se sigue midiendo con lo que a ellos se les pidió.)
  const correoOk = c.correoTipo !== "mio" || c.correo.trim() !== "";
  return correoOk && c.telefono.trim() !== "";
}

/** Estado real del arranque según lo que ya está hecho. Consciente de piezas:
 *  a un proyecto de solo-web no se le espera por el número de WhatsApp ni por la
 *  prueba del chat — serían requisitos inalcanzables y jamás llegaría a "completado". */
export function estadoDe(d: ArranqueDatos): "en-curso" | "parte-inicial-lista" | "completado" {
  const visibles = new Set(pasosVisibles(d.config.productos ?? []));
  // El tono solo se le pide a quien tiene algo que le hable a un paciente: a un
  // proyecto de solo-panel esperarlo lo dejaría "en curso" para siempre.
  const tonoOk = !pideTono(d.config.productos ?? []) || !!d.checklist.tono;
  const nucleoListo =
    d.checklist.servicios.some((s) => s.nombre.trim() !== "") &&
    d.checklist.horarios.trim() !== "" &&
    tonoOk &&
    (!visibles.has("numero") || !!d.numero.decision) &&
    (!visibles.has("linea") || !!d.linea.decision);
  if (!nucleoListo) return "en-curso";

  // Las cuentas las creamos nosotros: el cliente no tiene ninguna casilla que
  // marcar, su parte termina cuando nos deja el correo y el teléfono. Antes esto
  // caía a "que él marque cada cuenta como lista", y esa pantalla ya no existe:
  // habría quedado esperando para siempre un clic que nadie le puede dar.
  // Las filas viejas donde SÍ marcó cuentas siguen contando.
  const reqs = cuentasRequeridas(d.config);
  const cuentasOk = conciergeListo(d.concierge) || reqs.every((r) => d.cuentas[r.id]?.lista);
  const calOk = !visibles.has("calendario") || d.calendario.compartido;
  const pruebaOk = !visibles.has("demo") || d.prueba.hecha;
  // Los `textos` son borradores de recordatorios: solo existen en proyectos con
  // piezas de WhatsApp (mismo criterio que el paso "numero").
  const textosOk = visibles.has("numero")
    ? d.textos.length > 0 && d.textos.every((t) => t.estado === "aprobado")
    : d.textos.length === 0 || d.textos.every((t) => t.estado === "aprobado");
  if (cuentasOk && calOk && pruebaOk && textosOk) {
    return "completado";
  }
  return "parte-inicial-lista";
}

/**
 * Giro del portal → parámetro `g` de la demo.
 *
 * ⚠️ Era la SÉPTIMA copia del concepto de giro, con los tres del nicho viejo escritos a
 * mano. Ahora valida contra los giros que de verdad tienen guion de demo (GIROS_DEMO sale
 * de lib/nicho.json) y, si el valor no existe, cae al de por defecto en vez de inventar uno.
 */
export function giroDemo(giro: string): string {
  return GIROS_DEMO.includes(giro) ? giro : DEMO_DEFAULTS.giro;
}
