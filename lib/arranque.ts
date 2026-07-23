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

export type ArranqueDatos = {
  config: {
    nombre: string;
    clinica: string;
    giro: string; // dental | estetica | medica (alimenta la demo)
    productos: string[]; // agente | web | auto | reactivacion
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
  cuentas: Record<string, CuentaEstado>;
  calendario: { compartido: boolean; tipo: string };
  prueba: { hecha: boolean; comentarios: string };
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
      productos: ["agente"],
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
    cuentas: x.cuentas && typeof x.cuentas === "object" ? x.cuentas : {},
    calendario: { compartido: false, tipo: "", ...(x.calendario ?? {}) },
    prueba: { hecha: false, comentarios: "", ...(x.prueba ?? {}) },
    textos: Array.isArray(x.textos) ? x.textos : [],
    avances: Array.isArray(x.avances) && x.avances.length > 0 ? x.avances : FASES_DEFAULT,
    progreso: { pasoActual: 1, ...(x.progreso ?? {}) },
  };
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

/** Estado real del arranque según lo que ya está hecho. */
export function estadoDe(d: ArranqueDatos): "en-curso" | "parte-inicial-lista" | "completado" {
  const nucleoListo =
    d.checklist.servicios.some((s) => s.nombre.trim() !== "") &&
    d.checklist.horarios.trim() !== "" &&
    !!d.checklist.tono &&
    !!d.numero.decision;
  if (!nucleoListo) return "en-curso";

  const reqs = cuentasRequeridas(d.config);
  const cuentasOk = reqs.every((r) => d.cuentas[r.id]?.lista);
  const textosOk = d.textos.length > 0 && d.textos.every((t) => t.estado === "aprobado");
  if (cuentasOk && d.calendario.compartido && d.prueba.hecha && textosOk) {
    return "completado";
  }
  return "parte-inicial-lista";
}

/** Giro del portal → parámetro g de la demo. */
export function giroDemo(giro: string): "dental" | "estetica" | "medica" {
  if (giro === "dental" || giro === "estetica") return giro;
  return "medica";
}
