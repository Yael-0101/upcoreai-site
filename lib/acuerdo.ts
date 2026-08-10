// Acuerdo de servicio — FUENTE ÚNICA del texto y de los datos.
//
// De aquí salen las DOS versiones del acuerdo, para que jamás digan cosas distintas:
//   1. La página web  → app/acuerdo/[token]/page.tsx
//   2. El .docx       → plantillas/cierre/acuerdo.md (generado, con guardián en el prebuild)
//
// REGLA QUE SOSTIENE LA GARANTÍA DE "SIN ERRORES": aquí NADA se redacta al vuelo.
// Cada hueco se llena copiando un campo ya congelado en la propuesta del cliente, o
// eligiendo entre textos fijos según el plan. Si un dato falta, `datosAcuerdo` devuelve
// null y no se genera acuerdo — nunca se inventa una cifra ni un alcance.

import { partirEnDosPagos } from "./calc";
import { piezasDeSnapshot, esWebSola } from "./propuesta-copy";

// ── Lo que viene congelado de la propuesta ────────────────────────────────────
// Espejo del snapshot que produce snapshotDeLead() del panel (upcore-panel/lib/propuesta.ts).

export type Money = { mxn: string; usd: string };

export type Plan = {
  inversion: Money;
  inversionNota: string;
  costosCliente: Money;
  costosNota: string;
  mensualidadUpcore: Money;
  upcoreNota: string;
  ahorro: Money;
  ahorroNota: string;
  roi: string;
  roiNota: string;
};

export type Numeros = {
  ticket: number;
  ticketEstimado: boolean;
  citasPerdidasSemana: number;
  citasEstimado: boolean;
  perdidaMensual: number;
  perdidaAnual: number;
  recuperableMensual: number;
};

export type Snapshot = {
  version?: number;
  // v4: claves crudas de lo cotizado (web/agente/voz/auto/reactivacion/panel).
  piezas?: string[];
  fecha: string;
  lead: { nombre: string; clinica: string; decisor: string; tipo_clinica: string; tamano: string };
  diag: {
    volumen: string;
    agenda_hoy: string;
    canales: string;
    detalle: string;
    urgencia: string;
    mensaje: string;
    objetivo?: string;
    presencia?: string;
  };
  numeros?: Numeros;
  incluye: string[];
  opcionales?: Array<{ val: string; label: string; alcance: string; precio: Money; razon: string }>;
  complejidad: string;
  llave: Plan;
  gestionado: Plan;
  recomendacion: string;
};

// ── Plazos por complejidad ────────────────────────────────────────────────────
// Vivían dentro de app/p/[token]/page.tsx; se mueven aquí para que la propuesta y el
// acuerdo prometan EXACTAMENTE el mismo plazo. Estimado honesto, nunca promesa cerrada.

export const TIEMPOS: Record<
  string,
  { construccion: string; pruebas: string; entrega: string; total: string }
> = {
  "Solución esencial": {
    construccion: "Días 2–6",
    pruebas: "Días 7–9",
    entrega: "≈ Día 10",
    total: "≈ 2 semanas",
  },
  "Sistema a la medida": {
    construccion: "Días 2–10",
    pruebas: "Días 11–14",
    entrega: "≈ Día 15",
    total: "≈ 3 semanas",
  },
  "Infraestructura completa": {
    construccion: "Días 2–14",
    pruebas: "Días 15–18",
    entrega: "≈ Día 20",
    total: "3–4 semanas",
  },
};

export const TIEMPO_DEFAULT = TIEMPOS["Solución esencial"];

// ── Forma del documento ───────────────────────────────────────────────────────
// Estructura, no HTML ni markdown: la página la pinta en JSX y el generador la vuelca
// a .md. El **negrita** se marca con asteriscos y cada salida lo interpreta a su modo.

export type Bloque =
  | { tipo: "texto"; texto: string }
  | { tipo: "lista"; items: string[] }
  | { tipo: "tabla"; filas: Array<[string, string]> };

export type Seccion = { n: number; titulo: string; bloques: Bloque[] };

export type TipoPlan = "llave" | "gestionado";

export type DatosAcuerdo = {
  clinica: string;
  contacto: string;
  puesto: string;
  plan: TipoPlan;
  planLabel: string;
  precio: string;
  anticipo: string;
  resto: string;
  entrega: string;
  intro: string;
  secciones: Seccion[];
};

// ── Textos fijos ──────────────────────────────────────────────────────────────

const INTRO =
  "Esto no es un contrato de permanencia ni tiene letras chiquitas. Es el resumen por escrito " +
  "de lo que ya platicamos, para que los dos tengamos claro qué entra, cuánto cuesta, para " +
  "cuándo, y qué pasa si algo se sale del plan.";

/** Lo que nunca entra, sin importar qué piezas haya comprado. A esto se le suman las
 *  piezas del catálogo que NO contrató (vienen en `opcionales` de su propia propuesta). */
const NO_INCLUYE_FIJO = [
  "campañas de publicidad o pauta",
  "creación de contenido para redes sociales",
  "migración de tu expediente clínico",
  "cualquier pieza que no esté en la lista de arriba",
];

const PLANES: Record<
  TipoPlan,
  { label: string; descripcion: string; filaMensualidad: string; operacion: string }
> = {
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
};

// ── El armador ────────────────────────────────────────────────────────────────

/**
 * Convierte la propuesta congelada del cliente + el plan que aceptó en el acuerdo completo.
 * Devuelve null si falta un dato esencial (precio ilegible o sin piezas): más vale no generar
 * acuerdo que generar uno con un hueco o una cifra inventada.
 */
export function datosAcuerdo(snap: Snapshot, plan: TipoPlan): DatosAcuerdo | null {
  const cfg = PLANES[plan];
  if (!cfg) return null;

  const planDatos = snap[plan];
  if (!planDatos?.inversion?.mxn) return null;

  const pagos = partirEnDosPagos(planDatos.inversion.mxn);
  if (!pagos) return null;

  const incluye = (snap.incluye || []).filter(Boolean);
  if (!incluye.length) return null;

  const clinica = (snap.lead?.clinica || snap.lead?.nombre || "").trim();
  const contacto = (snap.lead?.nombre || "").trim();
  if (!clinica || !contacto) return null;

  const tiempo = TIEMPOS[snap.complejidad] || TIEMPO_DEFAULT;
  const mensualidad =
    plan === "gestionado"
      ? snap.gestionado?.mensualidadUpcore?.mxn || ""
      : "$0 — tú operas tu sistema";
  if (plan === "gestionado" && !mensualidad) return null;

  // Lo que NO incluye: las piezas que su propia propuesta dejó como opcionales, más la
  // lista fija. Así el documento nombra exactamente lo que él vio cotizado aparte.
  const noIncluye = [
    ...(snap.opcionales || []).map((o) => o.label.toLowerCase()),
    ...NO_INCLUYE_FIJO,
  ];

  const secciones: Seccion[] = [
    {
      n: 1,
      titulo: "Qué voy a entregar",
      bloques: [
        { tipo: "lista", items: incluye },
        { tipo: "texto", texto: `**Qué NO incluye:** ${noIncluye.join(", ")}.` },
        {
          tipo: "texto",
          texto:
            "Si algo de esta lista no lo necesitas, dímelo y lo quitamos: el precio baja. Nada " +
            "aquí es un paquete cerrado.",
        },
      ],
    },
    {
      n: 2,
      titulo: `Plan contratado: ${cfg.label}`,
      bloques: [{ tipo: "texto", texto: cfg.descripcion }],
    },
    {
      n: 3,
      titulo: "Inversión y forma de pago",
      bloques: [
        {
          tipo: "tabla",
          filas: [
            ["Construcción (pago único)", planDatos.inversion.mxn],
            ["Para arrancar (50%)", pagos.anticipo.mxn],
            ["Contra entrega (50%)", pagos.resto.mxn],
            [cfg.filaMensualidad, mensualidad],
          ],
        },
        {
          tipo: "texto",
          // El texto nombra SOLO las cuentas que este proyecto abre de verdad: a una
          // web-sola no se le habla de cuentas de IA ni de WhatsApp (lección 2026-08-10).
          texto: esWebSola(piezasDeSnapshot(snap))
            ? "**Los costos variables son tuyos y van directo a tu tarjeta:** el dominio y el " +
              "hosting se abren **a tu nombre** y tú pagas su consumo. Upcore no les agrega ni " +
              "un peso de margen y nunca cobra por adelantado algo que no controla. Es poco — " +
              "el dominio ronda los $200 a $400 pesos al año — y antes de arrancar te digo el " +
              "estimado anual exacto."
            : "**Los costos variables son tuyos y van directo a tu tarjeta:** las cuentas de " +
              "inteligencia artificial, WhatsApp, dominio y hosting se abren **a tu nombre**, con " +
              "tope de gasto activado, y tú pagas su consumo. Upcore no les agrega ni un peso de " +
              "margen y nunca cobra por adelantado algo que no controla. Antes de arrancar te digo " +
              "el estimado mensual con tu propio volumen.",
        },
        {
          tipo: "texto",
          texto:
            "**Facturación:** por ahora emito **recibo simple**. La factura está disponible **a " +
            "partir de octubre de 2026**. Si la necesitas desde el día uno, mejor lo dejamos " +
            "agendado para entonces.",
        },
      ],
    },
    {
      n: 4,
      titulo: "Tiempos",
      bloques: [
        {
          tipo: "lista",
          items: [
            "**Arranca** cuando se confirma el anticipo **y** llega tu parte del checklist de " +
              "arranque (información de la clínica, servicios, horarios y accesos a tus cuentas). " +
              "El reloj no corre sin esa información.",
            `**Entrega estimada: ${tiempo.total}** desde el arranque.`,
            "**Tu parte es poca:** alrededor de 1 hora en total — un checklist de unos 15 minutos, " +
              "crear tus cuentas siguiendo un video (a tu nombre y con tus propios clics), y probar " +
              "el sistema antes de que lo demos por entregado. Lo demás lo hago yo.",
            "**La entrega incluye:** el sistema funcionando, un video corto explicando cómo usarlo, " +
              "una guía de 1 página y la documentación.",
          ],
        },
      ],
    },
    {
      n: 5,
      titulo: "Cambios y ajustes",
      bloques: [
        {
          tipo: "lista",
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
      ],
    },
    {
      n: 6,
      titulo: "Garantía",
      bloques: [
        {
          tipo: "texto",
          texto:
            "**Si no te entrego lo acordado funcionando, te devuelvo tu anticipo completo.** Sin " +
            "discutir y sin condiciones.",
        },
        {
          tipo: "texto",
          texto:
            "Lo que sí garantizo: que el sistema haga lo que dice el punto 1, que quede a tu " +
            "nombre, y los 30 días de ajustes de arriba.",
        },
        {
          tipo: "texto",
          texto:
            "Lo que no puedo garantizar —y te recomiendo desconfiar de quien te lo prometa— son " +
            "números de resultado: cuántos pacientes más vas a tener o cuánto vas a vender. Las " +
            "estimaciones de tu propuesta son eso, estimaciones, con los supuestos a la vista.",
        },
      ],
    },
    {
      n: 7,
      titulo: "Si algo se atrasa",
      bloques: [
        {
          tipo: "lista",
          items: [
            "**Si me atraso yo:** te aviso en cuanto lo sepa, con la fecha nueva. Si el atraso pasa " +
              "de **15 días** sobre lo comprometido y no es por algo fuera de mi control, puedes " +
              "cancelar y te devuelvo el anticipo completo.",
            "**Si se atrasa tu parte** (información, accesos, aprobaciones): el reloj se pausa y la " +
              "fecha de entrega se recorre lo mismo que haya tardado. No hay penalización.",
            "**Si pasan 60 días sin tu información**, doy el trabajo por cerrado: te entrego lo " +
              "avanzado y los accesos, y el anticipo queda como pago del trabajo ya hecho. Si " +
              "después quieres retomarlo, se cotiza lo que falte.",
            "Quedan fuera de esto las cosas que ninguno de los dos controla: caídas de WhatsApp o " +
              "de Meta, cambios de política de un proveedor, fallas de internet, o causas de fuerza " +
              "mayor. Si pasa algo así, te lo digo de frente y buscamos la salida juntos.",
          ],
        },
      ],
    },
    {
      n: 8,
      titulo: "Si se cancela",
      bloques: [
        {
          tipo: "lista",
          items: [
            "**Antes de que arranque el trabajo:** te devuelvo el anticipo completo.",
            "**Ya arrancado, si tú cancelas:** el anticipo cubre el trabajo hecho hasta ese momento " +
              "y no se devuelve, pero **te entrego lo avanzado y todos los accesos** — no te quedas " +
              "sin nada.",
            "**Ya arrancado, si yo cancelo:** te devuelvo el anticipo completo, más lo avanzado y " +
              "los accesos.",
            "**Después de la entrega:** no hay devolución, porque el trabajo ya está entregado y es " +
              "tuyo. Lo que sigue corriendo son los 30 días de ajustes.",
            ...(plan === "gestionado"
              ? [
                  "**La mensualidad se cancela cuando quieras, avisando con 30 días.** No hay " +
                    "permanencia ni penalización. Al cancelar, te entrego la operación completa y " +
                    "quito mis accesos.",
                ]
              : []),
          ],
        },
      ],
    },
    {
      n: 9,
      titulo: "Propiedad",
      bloques: [
        {
          tipo: "texto",
          texto:
            `**Todo lo construido es tuyo al 100%,** desde el primer día: el código, las cuentas, ` +
            `el dominio y los accesos quedan a nombre de ${clinica}.`,
        },
        {
          tipo: "texto",
          texto:
            "Si mañana quieres que otra persona lo mantenga, se lo llevas sin pedirme permiso y sin " +
            "pagarme nada. Nunca quedas amarrado a mí, y no hay ninguna pieza escondida que solo yo " +
            "pueda tocar.",
        },
        { tipo: "texto", texto: cfg.operacion },
      ],
    },
    {
      n: 10,
      titulo: "Datos de pacientes y confidencialidad",
      bloques: [
        {
          tipo: "lista",
          items: [
            "**Los datos de tus pacientes viven en tus cuentas, no en las mías.** Como todo se abre " +
              "a tu nombre, la información nunca sale de tu control.",
            "**No copio, no exporto ni comparto datos de pacientes.** Cualquier acceso que necesite " +
              "para construir es acotado, documentado y lo puedes revocar cuando quieras.",
            "**Confidencialidad:** todo lo que me cuentes de tu clínica —números, procesos, " +
              "precios— se queda entre nosotros.",
            "**El responsable del manejo de datos personales ante la ley eres tú**, como clínica, " +
              "igual que hoy con tu expediente y tu agenda. Eso incluye tener tu aviso de " +
              "privacidad al día. Mi trabajo es dejarte la herramienta configurada para que puedas " +
              "cumplirlo, no sustituirte en esa responsabilidad.",
          ],
        },
      ],
    },
    {
      n: 11,
      titulo: "Hasta dónde llega mi responsabilidad",
      bloques: [
        { tipo: "texto", texto: "Para que no haya malentendidos, y dicho de frente:" },
        {
          tipo: "lista",
          items: [
            "**Mi responsabilidad máxima es el monto que me hayas pagado por este trabajo.** No " +
              "respondo por ganancias que se hayan dejado de tener, ni por daños indirectos.",
            "**No respondo por fallas de servicios de terceros:** WhatsApp, Meta, los proveedores " +
              "de inteligencia artificial, tu hosting o tu internet. Si alguno se cae o cambia sus " +
              "reglas, te aviso y ayudo a resolverlo, pero no está en mis manos.",
            "**El asistente no da consejos médicos ni sustituye criterio clínico.** Atiende " +
              "mensajes o llamadas, agenda y responde dudas de servicio con la información que tú " +
              "apruebes. Todo lo que tenga que ver con diagnóstico o tratamiento lo define tu " +
              "clínica.",
            "**La información que el sistema le da a tus pacientes es la que tú validas** (precios, " +
              "horarios, servicios). Si cambia algo de tu lado, hay que actualizarlo.",
          ],
        },
      ],
    },
    {
      n: 12,
      titulo: "Vigencia y aceptación",
      bloques: [
        {
          tipo: "lista",
          items: [
            "El precio y el alcance de este acuerdo son válidos **15 días** a partir de la fecha de " +
              "arriba.",
            "El acuerdo está vigente desde que lo aceptas hasta la entrega, más los 30 días de " +
              "ajustes." +
              (plan === "gestionado"
                ? " La parte de operación sigue mientras siga la mensualidad."
                : ""),
            "Lo que no esté previsto aquí se rige por los Términos de Servicio publicados en " +
              "**upcoreai.com/terminos**, y por las leyes de los Estados Unidos Mexicanos.",
          ],
        },
      ],
    },
  ];

  return {
    clinica,
    contacto,
    puesto: (snap.lead?.decisor || "").trim(),
    plan,
    planLabel: cfg.label,
    precio: planDatos.inversion.mxn,
    anticipo: pagos.anticipo.mxn,
    resto: pagos.resto.mxn,
    entrega: tiempo.total,
    intro: INTRO,
    secciones,
  };
}

/** Fecha larga en español, para encabezados. */
export function fechaLarga(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}
