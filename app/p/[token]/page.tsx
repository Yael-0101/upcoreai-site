import type { Metadata } from "next";
import { CONTACT } from "@/lib/content";
import { TIEMPOS, TIEMPO_DEFAULT, ZONA_CLIENTE, plazoEn } from "@/lib/acuerdo";
import {
  piezasDeSnapshot,
  filaCostos,
  faq,
  dia1Desc,
  pruebasDesc,
  nuestraParte as nuestraParteDe,
  lineaAgendaPorPieza,
  noNecesitas,
  tuParte,
  mostrarDemo,
  mostrarPerdida,
  esWebSola,
  entregaDesc,
  copyBoceto,
  bonos,
  linkWhatsApp,
  invitacionRecortar,
} from "@/lib/propuesta-copy";
import { DescargarPDF } from "@/components/DescargarPDF";
import { TP } from "@/lib/propuesta-textos";
import { idiomaDe, traducirRenglon, type Idioma } from "@/lib/acuerdo-textos";

// Propuesta/diagnóstico con link secreto: upcoreai.com/p/[token].
// Los datos vienen congelados desde el panel (tabla `propuestas` de n8n) — así la
// propuesta que vio el cliente nunca cambia aunque los precios del sitio cambien.
// v2 (Diagnóstico 2.0): números del dolor, garantía, proceso paso a paso y FAQ —
// estructura de "oferta irresistible" con honestidad Upcore (supuestos a la vista).

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // El template del layout agrega "| Upcore AI".
  title: "Tu diagnóstico",
  robots: { index: false, follow: false },
};

// ⚠️ `Money` se importa de lib/calc (su dueño), no se redeclara aquí. Era una de tres
// copias del mismo tipo y al renombrar sus campos esta siguió compilando con los viejos.
import type { Money } from "@/lib/calc";
type Plan = {
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
  /** El consejo honesto tambien viaja en el plan congelado (y en su idioma). */
  recomendacion?: string;
};
type Numeros = {
  /** ⚠️ Es la COMISIÓN de una venta cerrada, no lo que vale un prospecto. El nombre
   *  se conserva porque hay propuestas congeladas que lo traen así. */
  ticket: number;
  ticketEstimado: boolean;
  citasPerdidasSemana: number;
  citasEstimado: boolean;
  perdidaMensual: number;
  perdidaAnual: number;
  recuperableMensual: number;
  /** v7 (2026-08-21). Ausentes en los snapshots viejos: esos se siguen explicando
   *  con su texto original, porque un documento que el cliente ya vio no cambia. */
  valorProspecto?: number;
  tasaCierre?: number;
};
type Snapshot = {
  version?: number;
  /** v5 — link a un adelanto ya construido de su producto. Vacío = no hay. */
  boceto?: string;
  /** v6 — quién contesta el "Me interesa": "bot" solo en las propuestas que
   *  generó el asistente. Ausente = Yael (default seguro para los snapshots
   *  viejos: siempre es mejor que conteste una persona). */
  contacto?: string;
  // v4: claves CRUDAS de lo cotizado (web/agente/voz/auto/reactivacion/panel) —
  // con ellas la página decide su copy por pieza sin adivinar desde los labels.
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
  // v3: piezas cotizadas APARTE. La propuesta solo cobra lo que ataca su dolor;
  // lo demás se muestra con su precio y el motivo por el que puede esperar.
  opcionales?: Array<{
    val: string;
    label: string;
    alcance: string;
    precio: Money;
    razon: string;
    /** v8 — el mismo motivo en inglés, congelado. Las propuestas anteriores no lo
     *  traen: ver el comentario del render, abajo. */
    razonEn?: string;
  }>;
  complejidad: string;
  llave: Plan;
  gestionado: Plan;
  /** v7 — las mismas cuentas con las notas en inglés, congeladas al crear la
   *  propuesta. Las v6 y anteriores no las traen y caen al español solas. */
  llaveEn?: Plan;
  gestionadoEn?: Plan;
  recomendacion: string;
};

const VIGENCIA_DIAS = 15;

// ⚠️ Formatea en la moneda del NICHO. Antes decía siempre "MXN" y con el nicho en
// dólares le habría enseñado pesos a un cliente de Miami — la misma fuga que ya se
// cazó en calc.ts. Se corrige aquí también porque esta página no usa precioFijo().
const dinero = (n: number) => "$" + Math.round(n).toLocaleString("en-US") + " USD";

async function getPropuesta(token: string): Promise<Snapshot | null> {
  const url = process.env.N8N_PROPUESTA_WEBHOOK_URL;
  const secret = process.env.N8N_PANEL_SECRET;
  if (!url || !secret || !token || token.length < 10) return null;
  try {
    const res = await fetch(`${url}?token=${encodeURIComponent(token)}`, {
      headers: { "X-Panel-Secret": secret },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const items = (await res.json()) as Array<{ token?: string; datos?: string; estado?: string }>;
    const fila = (Array.isArray(items) ? items : []).find(
      (i) => i && i.token === token && (i.estado === "activa" || i.estado === "vista") && i.datos
    );
    if (!fila) return null;
    const snap = JSON.parse(fila.datos as string) as Snapshot;
    // Vencimiento automático: la propuesta muere sola a los 15 días.
    const edadMs = Date.now() - new Date(snap.fecha).getTime();
    if (!snap.fecha || Number.isNaN(edadMs) || edadMs > VIGENCIA_DIAS * 24 * 60 * 60 * 1000) {
      return null;
    }
    // Marca "vista" para el seguimiento (primera vez). Se espera la llamada porque
    // en Vercel un fetch sin await muere al congelarse la función (lección 2026-07-21).
    const vistaUrl = process.env.N8N_PROPUESTA_VISTA_URL;
    if (vistaUrl && fila.estado === "activa") {
      await fetch(vistaUrl, {
        method: "POST",
        headers: { "X-Panel-Secret": secret, "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        signal: AbortSignal.timeout(4000),
      }).catch(() => {});
    }
    return snap;
  } catch {
    return null;
  }
}

const PIEZA_ICONS: Record<string, string> = {
  Agente: "💬",
  Sitio: "🌐",
  Automatizaciones: "🔄",
  Reactivación: "📈",
  Dashboard: "🧩",
  Panel: "🧩",
};
const icono = (texto: string) => {
  // La voz va primero: "Agente de voz…" también empieza con "Agente" y saldría 💬.
  if (texto.startsWith("Agente de voz")) return "📞";
  const clave = Object.keys(PIEZA_ICONS).find((k) => texto.startsWith(k));
  return clave ? PIEZA_ICONS[clave] : "→";
};

// El bot guarda la presencia digital con palabras fijas (para poder decidir si le
// proponemos un sitio web sin adivinar). Los textos legibles viven en la tabla
// bilingüe (lib/propuesta-textos.ts): aquí solo se elige cuál toca.
function presenciaTxt(v: string | undefined, T: (typeof TP)["es"]): string | false {
  const clave = (v || "").trim().toLowerCase();
  if (!clave) return false;
  // "whatsapp" era un valor FIJO que el bot escribía en `canales` para todos —
  // no es información del cliente y decía "Tus pacientes llegan por: whatsapp".
  if (clave === "whatsapp") return false;
  if (T.diag.presencia[clave]) return T.diag.presencia[clave];
  // Leads viejos (y los del formulario web) traían aquí texto libre de canales.
  return T.diag.prospectosPor(v || "");
}


function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-mocha">
        {titulo}
      </h2>
      {children}
    </>
  );
}

function PlanCard({
  titulo,
  icon,
  desc,
  plan,
  costos,
  destacado,
  mostrarRetorno = true,
  t,
}: {
  titulo: string;
  icon: string;
  desc: string;
  plan: Plan;
  // Nombre y nota de la fila de costos variables — cambian por pieza (una web
  // sola no gasta APIs: gasta dominio y hosting). El valor sigue congelado.
  costos: { k: string; n: string };
  destacado?: boolean;
  /** El retorno se calcula con SUS cifras. Si no las dio, no se enseña: un
   *  "recuperas tu inversión en 2 meses" sacado de valores por defecto es un
   *  número inventado sobre su negocio, y eso quema al cliente. Misma regla
   *  que ya apaga la sección de pérdida (ver mostrarPerdida). */
  mostrarRetorno?: boolean;
  t: (typeof TP)["es"];
}) {
  const filas = [
    { k: t.filas.inversion, v: plan.inversion.principal, n: plan.inversionNota },
    { k: t.filas.mensualidad, v: plan.mensualidadUpcore.principal, n: plan.upcoreNota },
    { k: costos.k, v: plan.costosCliente.principal, n: costos.n },
    // ⚠️ El múltiplo se calcula sobre el costo MENSUAL de operarlo, y la nota de al
    // lado habla de recuperar la INVERSIÓN inicial. Son dos cosas distintas y las dos
    // ciertas, pero con la etiqueta a secas ("Retorno estimado: 4.9x — recuperas tu
    // inversión en ~31 meses") se leen como una contradicción. Se dice sobre qué es.
    ...(mostrarRetorno
      ? [{ k: t.filas.retorno, v: plan.roi, n: plan.roiNota }]
      : []),
  ];
  return (
    <div
      className={`relative rounded-3xl border p-7 ${
        destacado
          ? "border-clay/50 bg-[rgba(200,98,61,0.06)]"
          : "border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)]"
      }`}
    >
      {destacado && (
        <span className="absolute -top-3 left-6 rounded-full bg-clay px-3 py-1 text-[0.68rem] font-bold text-obsidian">
          {t.planes.favorito}
        </span>
      )}
      <h3 className="text-lg font-semibold text-sand">
        {icon} {titulo}
      </h3>
      <p className="mb-5 text-sm font-light text-mocha">{desc}</p>
      {filas.map((f) => (
        <div key={f.k} className="border-t border-[rgba(242,231,219,0.08)] py-2.5">
          <div className="text-[0.68rem] uppercase tracking-[0.08em] text-mocha">{f.k}</div>
          <div className="font-semibold text-clay-bright">{f.v}</div>
          {f.n && <div className="text-xs font-light text-mocha">{f.n}</div>}
        </div>
      ))}
    </div>
  );
}

// ── Sección 6: "Así trabajaríamos juntos" (línea de tiempo + requisitos) ──────
// Los plazos viven en lib/acuerdo.ts, que es de donde también los lee el acuerdo:
// así la propuesta y el contrato nunca prometen fechas distintas.

function lineaDeTiempo(
  t: (typeof TIEMPOS)[string],
  textos: { dia1: string; pruebas: string; entrega: string; tituloEntrega: string },
  T: (typeof TP)["es"]
) {
  const t2 = T.pasos;
  return [
    {
      n: t2.dia0,
      t: t2.dia0Titulo,
      d: t2.dia0Desc,
    },
    {
      n: t2.dia1,
      t: t2.dia1Titulo,
      // El contenido del Día 1 depende de las piezas: número de WhatsApp solo si hay
      // agente; desvío solo si hay voz; textos/colores/referencias solo si hay web.
      d: textos.dia1,
    },
    {
      n: t.construccion,
      t: t2.construccionTitulo,
      d: t2.construccionDesc,
    },
    {
      n: t.pruebas,
      t: t2.pruebasTitulo,
      d: textos.pruebas,
    },
    {
      n: t.entrega,
      t: textos.tituloEntrega,
      d: textos.entrega,
    },
    {
      n: t2.mas30,
      t: t2.acompanamientoTitulo,
      d: t2.acompanamientoDesc,
    },
  ];
}

// "Tu parte", "Nuestra parte", NO_NECESITAS, FAQ y la línea de agenda viven ahora
// en lib/propuesta-copy.ts (fuente única por pieza, probada por el guardián
// scripts/probar-propuesta.mjs) — aquí solo se consumen.

export default async function PropuestaPublica({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await params;
  // El idioma se pide por la URL (?lang=en) y se valida contra la LISTA, nunca
  // indexando un objeto con texto que viene de fuera.
  const idioma: Idioma = idiomaDe((await searchParams)?.lang);
  const en = idioma === "en";
  const T = TP[idioma];
  const p = await getPropuesta(token);

  if (!p) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-obsidian px-6 text-center">
        <div>
          <div className="mb-4 text-3xl">🕰️</div>
          <h1 className="mb-2 text-2xl font-semibold text-sand">
            {TP.es.vencida.titulo}
          </h1>
          <p className="mb-8 font-light text-mocha">
            {TP.es.vencida.texto}
          </p>
          <a
            href={CONTACT.whatsapp}
            className="rounded-full bg-clay px-8 py-3.5 font-semibold text-obsidian transition-colors hover:bg-clay-bright"
          >
            💬 {TP.es.vencida.cta}
          </a>
        </div>
      </main>
    );
  }

  const nombreCorto = (p.lead.nombre || "").trim().split(" ")[0];
  // En la zona del CLIENTE, no en la del servidor (Vercel corre en UTC): una
  // propuesta hecha de noche salia fechada al dia siguiente, y de esa fecha
  // cuelga el vencimiento de abajo. Ver ZONA_CLIENTE en lib/acuerdo.ts.
  const fechaTxt = new Date(p.fecha).toLocaleDateString(en ? "en-US" : "es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: ZONA_CLIENTE,
  });
  const objetivo = T.objetivos[p.diag.objetivo || ""] || T.objetivos._default;
  const diag = [
    p.diag.volumen && T.diag.volumen(p.diag.volumen),
    p.diag.agenda_hoy && T.diag.agenda(p.diag.agenda_hoy),
    presenciaTxt(p.diag.presencia || p.diag.canales, T),
    p.diag.detalle,
    p.diag.mensaje && `“${p.diag.mensaje}”`,
  ].filter(Boolean) as string[];
  const n = p.numeros;
  // Las piezas cotizadas mandan sobre el copy: v4 las trae crudas; v3 se infieren.
  const piezas = piezasDeSnapshot(p);
  const conPerdida = mostrarPerdida(piezas, n);

  // Las notas de los planes vienen CONGELADAS del snapshot. Para el inglés se usan
  // las que se congelaron en inglés; si la propuesta es anterior al 2026-08-22 no
  // las trae y se queda con las españolas — mejor una nota en español que un texto
  // generado hoy que no es el que el cliente leyó.
  const llave = en ? p.llaveEn ?? p.llave : p.llave;
  const gestionado = en ? p.gestionadoEn ?? p.gestionado : p.gestionado;

  // 🔴 Los números de las secciones se contaban A MANO ("1 ·", "2 ·", "3 ·"…), y las
  // dos primeras son condicionales: si el cliente no declaró sus cifras, la sección 2
  // no sale y el prospecto veía 1, 3, 4, 5, 6, 7 — parece que la página se cargó mal,
  // en el documento con el que le estás pidiendo que confíe. Ahora se numeran solas.
  let nSeccion = 0;
  const num = () => ++nSeccion;
  const txtBoceto = copyBoceto(piezas, p.lead.clinica, idioma);
  // Los bonos se calculan al pintar, no viven en el snapshot: así una propuesta
  // ya mandada los recoge sola, sin regenerar el link que el cliente ya tiene.
  const txtBonos = bonos(piezas, p.diag.agenda_hoy, idioma);
  // Sección 6 (fusionada): tiempos por complejidad + requisitos por pieza.
  const tiemposEs = TIEMPOS[p.complejidad] ?? TIEMPO_DEFAULT;
  // Los plazos también son idioma: "Días 2–14" en medio de una página en inglés.
  const tiempos = {
    construccion: plazoEn(tiemposEs.construccion, idioma),
    pruebas: plazoEn(tiemposEs.pruebas, idioma),
    entrega: plazoEn(tiemposEs.entrega, idioma),
    total: plazoEn(tiemposEs.total, idioma),
  };
  const esWeb = esWebSola(piezas);
  const pasos = lineaDeTiempo(tiempos, {
    dia1: dia1Desc(piezas, idioma),
    pruebas: pruebasDesc(piezas, idioma),
    // Una web se entrega, no se "capacita": el título y el texto lo dicen así.
    tituloEntrega: esWeb ? T.pasos.entregaTitulo : T.pasos.entregaTituloCapacitacion,
    entrega: esWeb ? T.pasos.entregaWeb : T.pasos.entregaOtro,
  }, T);
  const parte = tuParte(piezas, idioma);
  const horasTuParte = parte.length <= 5 ? T.horasUna : T.horasDos;
  const nuestraParte = nuestraParteDe(piezas, lineaAgendaPorPieza(p.diag.agenda_hoy, piezas, idioma), idioma);
  const costosFila = filaCostos(piezas, idioma);
  // A quién le escribe: el bot solo contesta lo que el bot generó. Los snapshots
  // viejos no traen el campo y caen en Yael, que es el default seguro.
  const waPropuesta = linkWhatsApp(p.contacto, p.lead.clinica, idioma);
  const txtRecortar = invitacionRecortar(piezas, idioma);

  const vence = new Date(new Date(p.fecha).getTime() + VIGENCIA_DIAS * 24 * 60 * 60 * 1000);
  const venceTxt = vence.toLocaleDateString(en ? "en-US" : "es-MX", { day: "numeric", month: "long", timeZone: ZONA_CLIENTE });

  return (
    <main className="pagina-propuesta min-h-screen bg-obsidian px-[6%] py-12 text-sand md:px-[10%]">
      <div className="mx-auto max-w-[860px]">
        <div className="mb-14 text-lg font-semibold tracking-tight">
          Upcore <span className="text-clay-bright">AI</span>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-block rounded-full border border-clay/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-clay-bright">
            {T.etiquetaVigencia(venceTxt)}
          </span>
          {/* La propuesta se re-arma en cada visita desde el snapshot, así que los dos
              idiomas están siempre disponibles: aquí no hace falta la salvedad del
              acuerdo, que sí congela el documento ya redactado. */}
          <a
            href={`/p/${encodeURIComponent(token)}${en ? "" : "?lang=en"}`}
            className="no-print rounded-full border border-sand/25 px-4 py-1.5 text-xs font-semibold text-mocha transition-colors hover:border-clay hover:text-clay-bright"
          >
            {T.verEnOtroIdioma}
          </a>
        </div>
        <h1 className="mb-3 text-[clamp(2rem,5vw,3.1rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
          {T.titular(
            nombreCorto,
            p.lead.clinica || (en ? "your firm" : "tu inmobiliaria"),
            objetivo
          )}
        </h1>
        {/* El subtítulo NO puede decir siempre lo mismo: "calculado con los
            números que tú nos diste" es cierto después de un diagnóstico, y
            falso en una propuesta en frío con boceto, donde todavía no ha
            habido ninguna conversación. Se dice lo que corresponde a cada caso. */}
        <p className="mb-14 font-light text-mocha">
          {T.preparado(fechaTxt)} ·{" "}
          {conPerdida ? T.conSusNumeros : T.conInfoPublica}
        </p>

        {/* EL ADELANTO YA CONSTRUIDO (v5).
            Va antes que todo lo demás a propósito: cuando existe, es el
            argumento más fuerte de la propuesta entera. Cualquiera puede
            prometer un producto; enseñarlo hecho, con su nombre y sus datos,
            antes de cobrar un peso, no lo hace nadie. Si no hay boceto, la
            propuesta se ve exactamente como siempre. */}
        {p.boceto && (
          <a
            href={p.boceto}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-14 block rounded-3xl border border-clay/45 bg-clay/[0.07] p-7 transition-colors hover:border-clay hover:bg-clay/[0.11] sm:p-9"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-clay-bright">
              {txtBoceto.etiqueta}
            </span>
            <p className="mt-3 text-[1.35rem] font-semibold leading-snug sm:text-2xl">
              {txtBoceto.titulo}
            </p>
            <p className="mt-3 max-w-xl font-light leading-relaxed text-mocha">
              {txtBoceto.intro}
            </p>
            {/* QUÉ le construimos. Sin esto abre el link sin saber qué mira. */}
            <ul className="mt-5 grid max-w-xl gap-2.5">
              {txtBoceto.queLleva.map((linea) => (
                <li key={linea.slice(0, 24)} className="flex gap-3 font-light leading-relaxed text-mocha">
                  <span aria-hidden className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                  {linea}
                </li>
              ))}
            </ul>
            {/* Y que es un BOCETO. Un doctor al que no se lo dices cree que eso
                es el producto final, y un color que no le gusta le tumba la
                venta entera. */}
            <div className="mt-6 max-w-xl rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.04)] p-5">
              <p className="text-sm font-semibold text-sand">{txtBoceto.esBocetoTitulo}</p>
              <p className="mt-1.5 text-sm font-light leading-relaxed text-mocha">
                {txtBoceto.esBoceto}
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 text-sm font-semibold text-obsidian">
              {txtBoceto.cta}
            </span>
          </a>
        )}

        {diag.length > 0 && (
          <Seccion titulo={`${num()} · ${T.secciones.contaste}`}>
            <div className="mb-12 rounded-3xl border border-[rgba(242,231,219,0.1)] bg-[rgba(242,231,219,0.04)] p-7">
              {diag.map((d) => (
                <div
                  key={d}
                  className="border-b border-[rgba(242,231,219,0.07)] py-2.5 font-light last:border-none"
                >
                  {d}
                </div>
              ))}
            </div>
          </Seccion>
        )}

        {conPerdida && n && (
          <Seccion titulo={`${num()} · ${T.secciones.costando}`}>
            <div className="mb-12 rounded-3xl border border-clay/40 bg-[rgba(200,98,61,0.07)] p-7">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.08em] text-mocha">
                    {T.cadaMes}
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-clay-bright">
                    ~{dinero(n.perdidaMensual)}
                  </div>
                </div>
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.08em] text-mocha">
                    {T.enUnAno}
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-clay-bright">
                    ~{dinero(n.perdidaAnual)}
                  </div>
                </div>
              </div>
              {/* ⚠️ LA SUPOSICIÓN VA ESCRITA, no escondida (decisión de Yael, 2026-08-21).
                  Un prospecto que se enfría NO es una venta perdida: antes se
                  multiplicaba la comisión completa por cada prospecto, o sea se daba
                  por cerrado el 100%, y a un despacho de una persona le salía que
                  perdía $779,400 al año. Ahora se dice la tasa que usamos para que el
                  cliente la juzgue él — si le parece baja o alta, lo ve y lo discute. */}
              <p className="mt-5 border-t border-[rgba(242,231,219,0.08)] pt-4 text-sm font-light text-mocha">
                {n.valorProspecto && n.tasaCierre
                  ? T.calculo({
                      porSemana: n.citasPerdidasSemana,
                      estimado: n.citasEstimado,
                      unoDeCada: Math.round(1 / n.tasaCierre),
                      comision: dinero(n.ticket),
                      comisionEstimada: n.ticketEstimado,
                      valor: dinero(n.valorProspecto),
                    })
                  : T.calculoSimple({
                      porSemana: n.citasPerdidasSemana,
                      estimado: n.citasEstimado,
                      comision: dinero(n.ticket),
                      comisionEstimada: n.ticketEstimado,
                    })}
              </p>
            </div>
          </Seccion>
        )}

        <Seccion titulo={`${num()} · ${T.secciones.construiriamos(T.calc.complejidad[p.complejidad] ?? p.complejidad)}`}>
          <div className="mb-12 grid gap-3">
            {p.incluye.map((x) => (
              <div
                key={x}
                className="flex items-start gap-3 rounded-2xl bg-[rgba(242,231,219,0.03)] p-4 font-light"
              >
                {/* ⚠️ El icono se elige por el nombre EN ESPAÑOL (`icono()` compara
                    contra "Agente", "Sitio"…), así que se calcula ANTES de traducir.
                    Si se hiciera al revés, la versión en inglés perdería todos los
                    iconos y nadie se daría cuenta leyendo el código. */}
                <span className="text-xl">{icono(x)}</span>
                <span>{en ? traducirRenglon(x) ?? x : x}</span>
              </div>
            ))}
            <div className="flex items-start gap-3 rounded-2xl bg-[rgba(242,231,219,0.03)] p-4 font-light">
              <span className="text-xl">🎁</span>
              {/* Lo incluido se dice por pieza: una web no lleva "capacitación
                  + guía", que ahí es relleno (ver entregaDesc). */}
              <span>
                {T.incluidoSinCosto(entregaDesc(piezas, idioma).toLowerCase())}
              </span>
            </div>
          </div>

          {/* LOS BONOS.
              Van aquí, justo antes del precio, y no enterrados en la lista de
              arriba: un bono que se lee como una viñeta más no se siente como un
              bono. Cada uno es algo que NO estamos cobrando — el diseño, que fue
              la primera idea, se descartó porque ya se vende (ver bonos() en
              propuesta-copy.ts). */}
          {txtBonos.length > 0 && (
            <div className="mb-12 rounded-3xl border border-sage/40 bg-[rgba(138,154,133,0.07)] p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sage">
                {T.ademasSinCosto}
              </p>
              <div className="mt-4 grid gap-4">
                {txtBonos.map((b) => (
                  <div key={b.titulo}>
                    <p className="font-semibold text-sand">{b.titulo}</p>
                    <p className="mt-1 font-light leading-relaxed text-mocha">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lo que dejamos fuera A PROPÓSITO. Antes se metía todo al precio (el panel
              entraba solo por tener 2+ piezas) y encarecía la propuesta sin que nadie
              lo hubiera pedido. */}
          {p.opcionales && p.opcionales.length > 0 && (
            <div className="mb-8 rounded-3xl border border-[rgba(242,231,219,0.12)] p-6">
              <p className="mb-1 font-medium text-sand">{T.fueraAProposito.titulo}</p>
              <p className="text-sm font-light text-mocha">
                {T.fueraAProposito.texto}
              </p>
              <div className="mt-5 grid gap-3">
                {p.opcionales.map((o) => (
                  <div key={o.val} className="rounded-2xl bg-[rgba(242,231,219,0.03)] p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="font-light text-sand">
                        {icono(o.label)} {en ? traducirRenglon(o.label) ?? o.label : o.label}
                      </span>
                      <span className="text-sm font-medium text-clay-bright">+{o.precio.principal}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-light text-mocha">
                      {/* 🔴 2026-08-25. Este bloque salía ENTERO en español dentro de la
                          propuesta en inglés: el nombre de la pieza porque "Panel de control"
                          no estaba en el catálogo del acuerdo, y el motivo porque solo se
                          traducía si contenía "puede esperar" — y ninguno de los cinco motivos
                          la contiene. Se vio abriendo `?lang=en` y leyendo la página, no
                          revisando las tablas: el guardián de idioma miraba el copy del sitio,
                          y esto viaja congelado dentro del snapshot.
                          Ahora el motivo en inglés se congela junto al español (`razonEn`, v8).
                          El reconocimiento por frase se conserva SOLO para las propuestas
                          viejas, que no traen el campo. */}
                      {!en
                        ? o.razon
                        : (o.razonEn ??
                          (/puede esperar/i.test(o.razon) ? T.puedeEsperar : o.razon))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invitación explícita a recortar: sin esto, el cliente asume que es un
              paquete cerrado de tómalo o déjalo. */}
          <div className="mb-12 rounded-3xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-6 font-light">
            <span className="font-medium text-sand">{txtRecortar.titulo}</span>{" "}
            {txtRecortar.texto}
          </div>
        </Seccion>

        <Seccion titulo={`${num()} · ${T.secciones.inversion}`}>
          {conPerdida && n && (
            <p className="mb-5 font-light text-mocha">
              {T.contexto(dinero(n.perdidaMensual))}
            </p>
          )}
          <div className="mb-5 grid gap-5 md:grid-cols-2">
            <PlanCard
              titulo={T.planes.llaveTitulo}
              t={T}
              icon="🔑"
              desc={T.planes.llaveDesc}
              plan={llave}
              costos={costosFila}
              mostrarRetorno={conPerdida}
            />
            <PlanCard
              titulo={T.planes.gestionadoTitulo}
              t={T}
              icon="🛠️"
              desc={T.planes.gestionadoDesc}
              plan={gestionado}
              costos={costosFila}
              mostrarRetorno={conPerdida}
              destacado
            />
          </div>
          {/* El ahorro sale de SUS cifras (pacientes por semana, ticket, citas que
              se caen). Si no las dio —propuesta en frío con boceto— esta caja
              desaparece: prometer un ahorro calculado con valores por defecto es
              inventarle un número a su negocio. Misma condición que la sección de
              pérdida y que la fila de retorno. */}
          {conPerdida && (
            <div className="mb-12 rounded-3xl border border-sage/40 bg-[rgba(138,154,133,0.07)] p-7">
              <div className="text-[0.68rem] uppercase tracking-[0.08em] text-mocha">
                {T.filas.ahorro}
              </div>
              <div className="text-3xl font-bold tracking-tight">
                {llave.ahorro.principal} <span className="text-clay-bright">{llave.ahorro.equivalente}</span>
              </div>
              <div className="mt-1 text-sm font-light text-mocha">{llave.ahorroNota}</div>
            </div>
          )}
        </Seccion>

        <Seccion titulo={`${num()} · ${T.secciones.garantia}`}>
          <div className="mb-12 rounded-3xl border border-sage/50 bg-[rgba(138,154,133,0.1)] p-7">
            <div className="mb-2 text-2xl">🛡️</div>
            <p className="text-lg font-medium leading-relaxed">
              {T.garantia.titulo}
            </p>
            <p className="mt-2 font-light text-mocha">
              {T.garantia.texto}
            </p>
          </div>
        </Seccion>

        <Seccion titulo={`${num()} · ${T.secciones.proceso}`}>
          {/* Línea de tiempo con días */}
          <div className="mb-3 grid gap-3">
            {pasos.map((paso) => (
              <div
                key={paso.t}
                className="flex items-start gap-4 rounded-2xl bg-[rgba(242,231,219,0.03)] p-5"
              >
                <span className="mt-0.5 inline-flex min-w-[5.2rem] shrink-0 items-center justify-center rounded-full bg-clay px-3 py-1 text-xs font-bold text-obsidian">
                  {paso.n}
                </span>
                <div>
                  <div className="font-semibold">{paso.t}</div>
                  <div className="text-sm font-light text-mocha">{paso.d}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="mb-8 text-xs font-light text-mocha/85">
            {T.pasos.nota(tiempos.total)}
          </p>

          {/* Tu parte / Nuestra parte */}
          <div className="mb-5 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-7">
              <h3 className="mb-1 font-semibold text-sand">🤝 {T.tuParteTitulo}</h3>
              <p className="mb-4 text-sm font-light text-mocha">
                {horasTuParte} {T.tuParteNota}
              </p>
              <div className="grid gap-2.5">
                {parte.map((item) => (
                  <div key={item.t} className="flex gap-2.5 text-sm font-light">
                    <span className="text-sage">✓</span>
                    <span>
                      {item.t} <span className="text-mocha">({item.min})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-clay/40 bg-[rgba(200,98,61,0.06)] p-7">
              <h3 className="mb-1 font-semibold text-sand">🏗️ {T.nuestraParteTitulo}</h3>
              <p className="mb-4 text-sm font-light text-mocha">{T.nuestraParteNota}</p>
              <div className="grid gap-2.5">
                {nuestraParte.map((x) => (
                  <div key={x} className="flex gap-2.5 text-sm font-light">
                    <span className="text-clay-bright">✓</span>
                    <span>{x}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lo que NO necesitas */}
          <div className="mb-12 rounded-3xl border border-[rgba(242,231,219,0.1)] bg-[rgba(242,231,219,0.04)] p-7">
            <h3 className="mb-3 font-semibold text-sand">{T.noNecesitasTitulo}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {noNecesitas(piezas, idioma).map((x) => (
                <div key={x} className="flex gap-2.5 text-sm font-light text-mocha">
                  <span className="text-clay-bright">✗</span>
                  <span>{x}</span>
                </div>
              ))}
            </div>
          </div>
        </Seccion>

        {p.recomendacion && (
          <div className="mb-12 flex gap-4 rounded-3xl border border-sage/35 bg-[rgba(138,154,133,0.08)] p-6 font-light">
            <span className="text-xl">💡</span>
            <p>
              <span className="font-semibold">{T.consejoHonesto}</span>{" "}
              {/* El consejo tambien viene congelado. Se toma el del plan en el idioma
                  que se esta leyendo; si la propuesta es vieja, cae al espanol. */}
              {(en ? gestionado.recomendacion || llave.recomendacion : "") || p.recomendacion}
            </p>
          </div>
        )}

        <Seccion titulo={`${num()} · ${T.secciones.dudas}`}>
          <div className="mb-12 grid gap-3">
            {faq(piezas, conPerdida, idioma).map((f) => (
              <div key={f.q} className="rounded-2xl bg-[rgba(242,231,219,0.03)] p-5">
                <div className="mb-1 font-semibold">{f.q}</div>
                <div className="text-sm font-light text-mocha">{f.a}</div>
              </div>
            ))}
          </div>
        </Seccion>

        {/* La demo pública es el agente de WhatsApp: invitar a probarla solo tiene
            sentido si el agente está cotizado (a un cliente de solo-web o de voz le
            estaríamos enseñando un producto que no pidió). */}
        {mostrarDemo(piezas) && (
          <div className="no-print mb-12 rounded-3xl border border-[rgba(242,231,219,0.1)] bg-[rgba(242,231,219,0.03)] p-6 text-center font-light text-mocha">
            {T.probarDemo}{" "}
            <a
              href={`https://upcoreai.com/demo${p.lead.clinica ? `?c=${encodeURIComponent(p.lead.clinica)}` : ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sand underline hover:text-clay-bright"
            >
              {en ? "Try it yourself here" : "Pruébalo tú mismo aquí"}
            </a>{" "}
            — juega a ser tu propio comprador.
          </div>
        )}

        <div className="no-print my-16 text-center">
          <a
            href={waPropuesta}
            className="inline-block animate-pulse-ring rounded-full bg-clay px-9 py-4 text-lg font-bold text-obsidian transition-all duration-300 hover:scale-[1.03] hover:bg-clay-bright"
          >
            💬 {T.meInteresa}
          </a>
          <p className="mt-5 text-sm font-light text-mocha">
            {T.sinCompromiso(venceTxt)}
          </p>
          <div className="mt-6">
            <DescargarPDF />
          </div>
        </div>

        <footer className="border-t border-[rgba(242,231,219,0.08)] pt-7 text-center text-xs font-light text-mocha/80">
          {T.pie(p.lead.clinica || p.lead.nombre)}
        </footer>
      </div>
    </main>
  );
}
