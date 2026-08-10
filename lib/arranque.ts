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
 * Quién crea las cuentas. La propuesta le promete al cliente que "te las creamos
 * nosotros a tu nombre, o las creas tú" — así que el portal tiene que ofrecer las
 * dos. En modo "upcore" el cliente no crea nada: solo nos dice a qué correo y
 * teléfono quedan (son SUYAS, a su nombre) y cuándo puede contestarnos, porque los
 * códigos de verificación le llegan a él y se vencen rápido.
 */
export type ConciergeDatos = {
  modo: "upcore" | "yo" | null;
  correoTipo: "mio" | "nuevo" | null; // usa un correo suyo, o le creamos uno del negocio
  correo: string; // si es "mio"
  correoIdea: string; // si es "nuevo": cómo le gustaría que se llame
  telefono: string; // a donde llegan los códigos por SMS
  horario: string; // cuándo le queda bien que le escribamos por WhatsApp
};

export type ArranqueDatos = {
  config: {
    nombre: string;
    clinica: string;
    giro: string; // dental | estetica | medica (alimenta la demo)
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
};

/** Las 5 fases del proyecto (espejo del checklist interno de despliegue). */
export const FASES_DEFAULT: AvanceItem[] = [
  { fase: "Preparación: checklist y cuentas", estado: "pendiente" },
  { fase: "WhatsApp oficial con Meta", estado: "pendiente" },
  { fase: "Construcción del sistema", estado: "pendiente" },
  { fase: "Pruebas contigo", estado: "pendiente" },
  { fase: "Entrega y capacitación", estado: "pendiente" },
];

/** Rellena huecos con defaults — snapshots viejos o parciales no truenan. */
export function normalizarDatos(d: unknown): ArranqueDatos {
  const x = (d && typeof d === "object" ? d : {}) as Record<string, any>;
  return {
    config: {
      nombre: "",
      clinica: "",
      giro: "dental",
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
    avances: Array.isArray(x.avances) && x.avances.length > 0 ? x.avances : FASES_DEFAULT,
    progreso: { pasoActual: 1, ...(x.progreso ?? {}) },
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
  pasos.push("cuentas");
  // La web también agenda (su botón de citas cae al calendario del cliente).
  if (tiene("agente", "voz", "auto", "web")) pasos.push("calendario");
  // La demo es el CHAT del agente: a voz-sola o web-sola no les aplica.
  if (tiene("agente")) pasos.push("demo");
  pasos.push("textos", "resumen");
  return pasos;
}

export type CuentaDef = {
  id: string;
  titulo: string;
  para: string;
  pasos: string[];
  nota?: string;
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
      para: "El número que atenderá tu asistente, verificado a nombre de tu clínica",
      pasos: [
        "Se crea con la cuenta personal de Facebook del DUEÑO (una con historia, no recién creada).",
        "Cuando llegues a este paso, escríbenos: te dictamos cada clic por WhatsApp — tú tecleas, nosotros guiamos.",
        "Agrega tu método de pago (los recordatorios cuestan centavos por mensaje) y listo.",
      ],
      nota: "Es el paso más tardado (Meta puede tardar días en verificar) — por eso lo arrancamos primero.",
    });
  }
  if (p.includes("agente")) {
    defs.push({
      id: "ia",
      titulo: "Anthropic — el cerebro de IA",
      para: "El modelo de inteligencia artificial que conversa con tus pacientes",
      pasos: [
        "Crea tu cuenta en console.anthropic.com con tu correo.",
        "Agrega tu tarjeta y ACTIVA el tope de gasto (te decimos el monto sugerido para tu volumen).",
        "La llave de la API la generas tú y va directo a tu lugar seguro — jamás nos la mandes por chat.",
      ],
    });
  }
  if (p.includes("web")) {
    defs.push({
      id: "dominio",
      titulo: "Tu dominio",
      para: "La dirección de tu sitio (tuclinica.com), a tu nombre",
      pasos: [
        "Si ya tienes dominio, solo confírmalo aquí abajo.",
        "Si no, lo compramos juntos a TU nombre con nuestra guía (~$200–400 MXN al año).",
      ],
    });
  }
  if (usaWhatsApp && config.plan === "llave") {
    defs.push({
      id: "hosting",
      titulo: "Tu servidor (hosting)",
      para: "Donde vive tu automatización — en tu propia cuenta, como todo lo demás",
      pasos: [
        "Creamos juntos tu cuenta del servidor (~$110–220 MXN/mes), a tu nombre y con tu tarjeta.",
        "Nosotros lo configuramos todo — tú solo creas la cuenta con nuestra guía.",
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
  if (c.modo !== "upcore") return false;
  const correoOk = c.correoTipo === "nuevo" || (c.correoTipo === "mio" && c.correo.trim() !== "");
  return correoOk && c.telefono.trim() !== "";
}

/** Estado real del arranque según lo que ya está hecho. Consciente de piezas:
 *  a un proyecto de solo-web no se le espera por el número de WhatsApp ni por la
 *  prueba del chat — serían requisitos inalcanzables y jamás llegaría a "completado". */
export function estadoDe(d: ArranqueDatos): "en-curso" | "parte-inicial-lista" | "completado" {
  const visibles = new Set(pasosVisibles(d.config.productos ?? []));
  const nucleoListo =
    d.checklist.servicios.some((s) => s.nombre.trim() !== "") &&
    d.checklist.horarios.trim() !== "" &&
    !!d.checklist.tono &&
    (!visibles.has("numero") || !!d.numero.decision);
  if (!nucleoListo) return "en-curso";

  const reqs = cuentasRequeridas(d.config);
  // Si las creamos nosotros, el cliente no tiene nada que marcar: su parte termina
  // cuando nos deja sus datos. Si no, se le esperaría por algo que no le toca hacer.
  const cuentasOk = conciergeListo(d.concierge)
    ? true
    : reqs.every((r) => d.cuentas[r.id]?.lista);
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

/** Giro del portal → parámetro g de la demo. */
export function giroDemo(giro: string): "dental" | "estetica" | "medica" {
  if (giro === "dental" || giro === "estetica") return giro;
  return "medica";
}
