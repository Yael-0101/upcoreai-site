// Acuerdo de servicio — FUENTE ÚNICA de la estructura y de los datos.
//
// De aquí salen TODAS las versiones del acuerdo, para que jamás digan cosas distintas:
//   1. La página web  → app/acuerdo/[token]/page.tsx
//   2. El PDF         → lib/acuerdo-pdf.ts (lo que el cliente descarga y recibe por correo)
//   3. El .docx       → plantillas/cierre/acuerdo.md (generado, con guardián en el prebuild)
//   4. En español y en inglés → los textos viven en lib/acuerdo-textos.ts
//
// REGLA QUE SOSTIENE LA GARANTÍA DE "SIN ERRORES": aquí NADA se redacta al vuelo.
// Cada hueco se llena copiando un campo ya congelado en la propuesta del cliente, o
// eligiendo entre textos fijos según el plan. Si un dato falta, `datosAcuerdo` devuelve
// null y no se genera acuerdo — nunca se inventa una cifra ni un alcance.
//
// ⚠️ EL ARMADOR ES UNO SOLO PARA LOS DOS IDIOMAS. Las secciones, los números, el orden y
// las reglas por pieza se deciden aquí una vez; el idioma solo cambia las palabras. Dos
// armadores paralelos se habrían desfasado igual que la propuesta contra el portal.

import { partirEnDosPagos, type Money } from "./calc";
import {
  piezasDeSnapshot,
  esWebSola,
  usaApis,
  bonos,
  lineaSeo,
  type PiezaClave,
} from "./propuesta-copy";
import {
  TEXTOS,
  LEY_POR_IDIOMA,
  traducirRenglon,
  type Idioma,
  type Textos,
} from "./acuerdo-textos";

export type { Idioma };
export { IDIOMAS, idiomaDe } from "./acuerdo-textos";

// ── Lo que viene congelado de la propuesta ────────────────────────────────────
// Espejo del snapshot que produce snapshotDeLead() del panel (upcore-panel/lib/propuesta.ts).

// ⚠️ `Money` ya NO se declara aquí: se importa de ./calc, que es su dueño. Había TRES
// declaraciones paralelas del mismo tipo (calc.ts, este archivo y p/[token]/page.tsx), y
// al renombrar sus campos las copias siguieron compilando con los nombres viejos. Mismo
// patrón que las cinco listas de giros: una definición, un dueño, todos leen de ahí.
export type { Money };

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
  // Bajado de ~2 semanas a 4 días (2026-08-16). Una pieza sola —un sitio, un
  // agente— no necesita dos semanas, y prometer de más es regalarle al cliente
  // tiempo para enfriarse. La construcción arranca el mismo día 1, mientras él
  // llena su parte en el Portal de Arranque.
  "Solución esencial": {
    construccion: "Días 1–2",
    pruebas: "Día 3",
    entrega: "≈ Día 4",
    total: "≈ 4 días",
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

/**
 * Los plazos, dichos en inglés. Se TRADUCEN, no se recalculan: si aquí saliera un
 * número distinto al del español, el documento prometería dos cosas.
 *
 * 🔴 Al principio solo estaban los totales, y la propuesta en inglés salía con
 * "Días 2–14", "≈ Día 20" y "3–4 semanas" en medio de una página entera en inglés.
 * No lo vio ningún guardián: los plazos viven aquí, no en la tabla de textos — es
 * la misma lección de siempre, el defecto está donde el guardián no mira.
 */
const PLAZO_EN: Record<string, string> = {
  "≈ 4 días": "≈ 4 days",
  "≈ 3 semanas": "≈ 3 weeks",
  "3–4 semanas": "3–4 weeks",
  "Días 1–2": "Days 1–2",
  "Día 3": "Day 3",
  "≈ Día 4": "≈ Day 4",
  "Días 2–10": "Days 2–10",
  "Días 11–14": "Days 11–14",
  "≈ Día 15": "≈ Day 15",
  "Días 2–14": "Days 2–14",
  "Días 15–18": "Days 15–18",
  "≈ Día 20": "≈ Day 20",
};

/** Un plazo en el idioma pedido. Si falta la traducción devuelve el español, y el
 *  guardián truena — mejor un plazo en español que un plazo inventado. */
export const plazoEn = (v: string, idioma: Idioma) =>
  idioma === "en" ? PLAZO_EN[v] ?? v : v;

/** Los plazos que NO tienen traducción. Para el guardián. */
export const plazosSinTraducir = () =>
  Object.values(TIEMPOS)
    .flatMap((t) => [t.construccion, t.pruebas, t.entrega, t.total])
    .filter((v) => !PLAZO_EN[v]);

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
  /** Opcional: los acuerdos congelados antes del 2026-08-22 no lo traen y son español. */
  idioma?: Idioma;
};

// ── Qué toca cada pieza ───────────────────────────────────────────────────────
// La sección 3 ya filtraba por pieza desde el 2026-08-10, pero las secciones 4, 7
// y 11 seguían siendo texto FIJO para todos. Resultado: a un cliente que solo
// compró su sitio el contrato le hablaba del asistente, de Meta, de WhatsApp y de
// los proveedores de IA — piezas que no compró. Es el mismo defecto que Yael cazó
// en el Portal de Arranque, aquí dentro de un documento que se firma.

/** Piezas que le hablan al comprador por WhatsApp — las únicas que necesitan Meta. */
const usaWhatsApp = (p: PiezaClave[]) =>
  p.includes("agente") || p.includes("agente-basico") || p.includes("auto") || p.includes("reactivacion");

/** ¿Hay algo que ATIENDA al comprador (contesta, responde dudas, agenda)? */
const hayAsistente = (p: PiezaClave[]) =>
  p.includes("agente") || p.includes("agente-basico") || p.includes("voz");

/**
 * Los terceros de los que de verdad depende ESTE proyecto.
 *
 * ⚠️ Ningún elemento de la lista puede llevar "y"/"and" adentro, ni empezar con "el":
 * el primero va detrás de "caídas de …" —y "de el" es "del"— y el último se une con
 * " y ", así que un "WhatsApp y Meta" producía "…de tu dominio y tu internet" con dos
 * "y" seguidas. Es la lección de la plantilla que no cabe en la frase: el dato
 * interpolado tiene que leerse como un idioma, no solo compilar.
 */
function tercerosDe(p: PiezaClave[], t: Textos): string {
  const lista: string[] = [];
  if (usaWhatsApp(p)) lista.push(t.terceros.whatsapp, t.terceros.meta);
  if (p.includes("voz")) lista.push(t.terceros.linea);
  if (usaApis(p)) lista.push(t.terceros.ia);
  if (p.includes("web")) lista.push(t.terceros.hosting, t.terceros.dominio);
  lista.push(t.terceros.internet);
  return t.unir(lista);
}

// ── El armador ────────────────────────────────────────────────────────────────

/**
 * Convierte la propuesta congelada del cliente + el plan que aceptó en el acuerdo completo.
 * Devuelve null si falta un dato esencial (precio ilegible o sin piezas): más vale no generar
 * acuerdo que generar uno con un hueco o una cifra inventada.
 *
 * `idioma` solo cambia las palabras: la estructura, los números y las reglas por pieza
 * son las mismas. El ESPAÑOL es la versión que gobierna (ver la cláusula de idioma).
 */
export function datosAcuerdo(
  snap: Snapshot,
  plan: TipoPlan,
  idioma: Idioma = "es"
): DatosAcuerdo | null {
  const t = TEXTOS[idioma];
  if (!t) return null;
  const cfg = t.planes[plan];
  if (!cfg) return null;

  const planDatos = snap[plan];
  if (!planDatos?.inversion?.principal) return null;

  const pagos = partirEnDosPagos(planDatos.inversion.principal);
  if (!pagos) return null;

  const incluye = (snap.incluye || []).filter(Boolean);
  if (!incluye.length) return null;

  // Los BONOS que la propuesta le prometió van también aquí, calculados con la
  // MISMA función. Si el acuerdo no los nombrara, el cliente tendría dos textos
  // del mismo trato diciendo cosas distintas — que es exactamente el error del
  // dominio (2026-08-16): la propuesta se lo regalaba y el portal se lo cobraba.
  const piezasSnap = piezasDeSnapshot({ piezas: snap.piezas, incluye });
  const bonosDelTrato = bonos(piezasSnap, snap.diag?.agenda_hoy || "").map((b) =>
    t.bono(idioma === "en" ? traducirRenglon(b.titulo) ?? b.titulo : b.titulo)
  );
  // El SEO del sitio va incluido: si la propuesta lo promete, el contrato lo
  // nombra. Misma función, para que no puedan decir cosas distintas.
  const seoDelTrato = lineaSeo(piezasSnap);

  // Las cuentas que ESTE proyecto abre de verdad. Decía siempre "las cuentas de
  // inteligencia artificial y WhatsApp", así que a un cliente de solo voz —que no
  // lleva WhatsApp— el contrato le nombraba una cuenta que nunca se le va a abrir.
  const cuentasVariables = t.unir([
    usaApis(piezasSnap) ? t.cuentas.ia : "",
    usaWhatsApp(piezasSnap) ? t.cuentas.whatsapp : "",
    piezasSnap.includes("voz") ? t.cuentas.linea : "",
  ]);

  const clinica = (snap.lead?.clinica || snap.lead?.nombre || "").trim();
  const contacto = (snap.lead?.nombre || "").trim();
  if (!clinica || !contacto) return null;

  const tiempo = TIEMPOS[snap.complejidad] || TIEMPO_DEFAULT;
  const plazo = idioma === "en" ? PLAZO_EN[tiempo.total] || tiempo.total : tiempo.total;
  const mensualidad =
    plan === "gestionado"
      ? snap.gestionado?.mensualidadUpcore?.principal || ""
      : t.sinMensualidad;
  if (plan === "gestionado" && !mensualidad) return null;

  // 🔴 El punto 1 y el "qué NO incluye" salen del CATÁLOGO (lib/calc.ts), que está en
  // español. En la versión en inglés hay que traducirlos: si no, el contrato dice
  // "What I will deliver" y debajo cinco renglones en español — la sección más
  // importante del documento, ilegible para quien lo pidió en inglés.
  //
  // Si un renglón no tiene traducción se deja en español (mejor eso que no poder
  // generar el contrato) y el guardián del prebuild truena, para que nunca llegue así
  // a un cliente.
  const alIdioma = (item: string) =>
    idioma === "en" ? traducirRenglon(item) ?? item : item;

  const noIncluye = [
    ...(snap.opcionales || []).map((o) => alIdioma(o.label).toLowerCase()),
    ...t.noIncluyeFijo,
  ];

  const ley = LEY_POR_IDIOMA[idioma];

  const secciones: Seccion[] = [
    {
      n: 1,
      titulo: t.sec.entregar.titulo,
      bloques: [
        {
          tipo: "lista",
          items: [
            ...incluye.map(alIdioma),
            ...(seoDelTrato ? [alIdioma(seoDelTrato)] : []),
            ...bonosDelTrato,
          ],
        },
        { tipo: "texto", texto: t.sec.entregar.noIncluye(noIncluye.join(", ")) },
        { tipo: "texto", texto: t.sec.entregar.recortar },
      ],
    },
    {
      n: 2,
      titulo: t.sec.plan.titulo(cfg.label),
      bloques: [{ tipo: "texto", texto: cfg.descripcion }],
    },
    {
      n: 3,
      titulo: t.sec.inversion.titulo,
      bloques: [
        {
          tipo: "tabla",
          filas: [
            [t.sec.inversion.construccion, planDatos.inversion.principal],
            // ⛔ Antes decía "(50%)" en las dos filas. `partirEnDosPagos` redondea a
            // centenas para que las cifras sean limpias al transferir, así que un
            // precio de $4,500 se parte en $2,300 y $2,200 — o sea 51% y 49%. Poner
            // "50%" junto a un número que no lo es, en un documento que se firma, es
            // justo lo que un abogado circula. Se dice CUÁNDO se paga, que además le
            // sirve más al cliente que el porcentaje.
            [t.sec.inversion.anticipo, pagos.anticipo.principal],
            [t.sec.inversion.resto, pagos.resto.principal],
            [cfg.filaMensualidad, mensualidad],
          ],
        },
        {
          tipo: "texto",
          // El texto nombra SOLO las cuentas que este proyecto abre de verdad: a una
          // web-sola no se le habla de cuentas de IA ni de WhatsApp (lección 2026-08-10).
          // ⚠️ El dominio del PRIMER AÑO lo pone Upcore y va dentro del precio
          // (decisión 2026-08-16). Este texto decía lo contrario —"va directo a
          // tu tarjeta"— y el acuerdo habría contradicho a la propuesta que el
          // cliente acababa de aceptar. Se corrigió el 2026-08-16.
          texto: esWebSola(piezasSnap)
            ? t.sec.inversion.dominioWebSola
            : t.sec.inversion.costosVariables(cuentasVariables),
        },
        { tipo: "texto", texto: t.sec.inversion.facturacion },
      ],
    },
    {
      n: 4,
      titulo: t.sec.tiempos.titulo,
      bloques: [
        {
          tipo: "lista",
          items: [
            t.sec.tiempos.arranca,
            t.sec.tiempos.entrega(plazo),
            // ⛔ Antes decía "crear tus cuentas siguiendo un video (a tu nombre y
            // con tus propios clics)". Ya no: las cuentas las abre Upcore
            // (arranque concierge, 2026-08-16). La única excepción es Meta, que
            // exige los clics del dueño, y se nombra tal cual para no prometer
            // de menos.
            t.sec.tiempos.tuParte,
            // ⛔ Este punto decía "el WhatsApp oficial, **y solo si tu proyecto lo
            // lleva**". Ese "si" era la confesión de que el texto no sabía qué había
            // comprado el cliente — y nosotros sí lo sabemos.
            ...(usaWhatsApp(piezasSnap) ? [t.sec.tiempos.meta] : []),
            t.sec.tiempos.incluye,
          ],
        },
      ],
    },
    {
      n: 5,
      titulo: t.sec.cambios.titulo,
      bloques: [{ tipo: "lista", items: t.sec.cambios.items }],
    },
    {
      n: 6,
      titulo: t.sec.garantia.titulo,
      bloques: t.sec.garantia.items.map((texto) => ({ tipo: "texto" as const, texto })),
    },
    {
      n: 7,
      titulo: t.sec.atrasos.titulo,
      bloques: [
        {
          tipo: "lista",
          items: [...t.sec.atrasos.items, t.sec.atrasos.fuerzaMayor(tercerosDe(piezasSnap, t))],
        },
      ],
    },
    {
      n: 8,
      titulo: t.sec.cancelar.titulo,
      bloques: [
        {
          tipo: "lista",
          items: [
            ...t.sec.cancelar.items,
            ...(plan === "gestionado" ? [t.sec.cancelar.gestionado] : []),
          ],
        },
      ],
    },
    {
      n: 9,
      titulo: t.sec.propiedad.titulo,
      bloques: [
        { tipo: "texto", texto: t.sec.propiedad.todoTuyo(clinica) },
        { tipo: "texto", texto: t.sec.propiedad.portable },
        { tipo: "texto", texto: cfg.operacion },
      ],
    },
    {
      n: 10,
      titulo: t.sec.datos.titulo,
      bloques: [{ tipo: "lista", items: t.sec.datos.items }],
    },
    {
      n: 11,
      titulo: t.sec.responsabilidad.titulo,
      bloques: [
        { tipo: "texto", texto: t.sec.responsabilidad.intro },
        {
          tipo: "lista",
          items: [
            t.sec.responsabilidad.tope,
            t.sec.responsabilidad.terceros(tercerosDe(piezasSnap, t)),
            // ⛔ Este punto solo aplica si de verdad hay algo que ATIENDA al comprador.
            // A un cliente que compró únicamente su sitio, el contrato le hablaba de
            // "el asistente" — una pieza que no compró.
            ...(hayAsistente(piezasSnap) ? [t.sec.responsabilidad.asistente] : []),
            // 🔴 CORREGIDO 2026-08-21. Este punto decía: "La información que el sistema
            // le da a tus compradores es la que tú validas (precios, disponibilidad,
            // fechas de entrega, planes de pago)". Es exactamente lo contrario de la
            // línea roja nº1 de LOS CUATRO productos: en preventa esos tres datos
            // caducan solos. O sea que el contrato prometía por escrito justo lo que el
            // sistema se niega a decir — y encima dentro de la cláusula de
            // responsabilidad, que es la que se lee cuando algo ya salió mal.
            t.sec.responsabilidad.noDice(hayAsistente(piezasSnap)),
            t.sec.responsabilidad.siResponde,
          ],
        },
      ],
    },
    {
      n: 12,
      titulo: t.sec.vigencia.titulo,
      bloques: [
        {
          tipo: "lista",
          items: [
            t.sec.vigencia.validez,
            t.sec.vigencia.vigente(plan === "gestionado"),
            t.sec.vigencia.ley(ley.ley, ley.foro),
            t.clausulaIdioma,
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
    precio: planDatos.inversion.principal,
    anticipo: pagos.anticipo.principal,
    resto: pagos.resto.principal,
    entrega: plazo,
    intro: t.intro,
    secciones,
    idioma,
  };
}

/**
 * La zona del CLIENTE, no la del servidor.
 *
 * 🔴 El servidor de Vercel corre en UTC, y `toLocaleDateString` sin zona usa la del
 * servidor. Un cliente de Miami que acepta a las 10:15 p.m. del 20 de agosto recibía
 * un contrato que decía "aceptado el 21 de agosto a las 02:15 a.m." — fecha equivocada
 * y una hora a la que estaba dormido. Y no es cosmético: la sección 12 hace correr los
 * 15 días de vigencia desde esa fecha.
 */
export const ZONA_CLIENTE = "America/New_York";

/**
 * LA LEY QUE RIGE — FUENTE ÚNICA (decisión de Yael, 2026-08-21).
 *
 * Antes decía "las leyes de los Estados Unidos Mexicanos". Yael decidió que se rija
 * por ley de Estados Unidos.
 *
 * ⚠️ Se escribe **Florida**, no "Estados Unidos" a secas, porque en EE.UU. los
 * contratos NO se rigen por ley federal: el derecho de contratos es estatal. Un
 * acuerdo que dijera "las leyes de Estados Unidos" no señalaría ninguna ley
 * concreta, y el abogado del cliente lo devolvería. Florida es donde están los
 * clientes (Miami-Dade, Broward y Palm Beach), así que es la que su propio abogado
 * espera leer.
 *
 * Estas dos constantes son las que importa la página /terminos, que va solo en
 * español; el acuerdo las toma de LEY_POR_IDIOMA. El guardián comprueba que las dos
 * fuentes digan lo mismo: si cada una nombrara su ley por su cuenta, el contrato
 * remitiría a unos términos regidos por otra ley, sin dar ningún error.
 */
export const LEY_APLICABLE = LEY_POR_IDIOMA.es.ley;
export const FORO = LEY_POR_IDIOMA.es.foro;

/** Fecha larga, en la zona del cliente y en el idioma del documento. */
export function fechaLarga(iso: string, idioma: Idioma = "es"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(idioma === "en" ? "en-US" : "es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: ZONA_CLIENTE,
  });
}
