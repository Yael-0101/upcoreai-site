import type { Metadata } from "next";
import { CONTACT } from "@/lib/content";
import { TIEMPOS, TIEMPO_DEFAULT } from "@/lib/acuerdo";
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
} from "@/lib/propuesta-copy";
import { DescargarPDF } from "@/components/DescargarPDF";

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

type Money = { mxn: string; usd: string };
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
};
type Numeros = {
  ticket: number;
  ticketEstimado: boolean;
  citasPerdidasSemana: number;
  citasEstimado: boolean;
  perdidaMensual: number;
  perdidaAnual: number;
  recuperableMensual: number;
};
type Snapshot = {
  version?: number;
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
  }>;
  complejidad: string;
  llave: Plan;
  gestionado: Plan;
  recomendacion: string;
};

const VIGENCIA_DIAS = 15;

const mxn = (n: number) => "$" + Math.round(n).toLocaleString("es-MX") + " MXN";

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
// proponemos un sitio web sin adivinar). Aquí se traducen a algo que se lea humano.
const PRESENCIA_TXT: Record<string, string> = {
  "web-y-redes": "Hoy te encuentran por tu sitio web y tus redes",
  "solo-web": "Hoy te encuentran por tu sitio web",
  "solo-redes": "Hoy te encuentran solo por redes — no tienes sitio web",
  nada: "Hoy no tienes sitio web ni redes activas",
};
function presenciaTxt(v: string | undefined): string | false {
  const clave = (v || "").trim().toLowerCase();
  if (!clave) return false;
  // "whatsapp" era un valor FIJO que el bot escribía en `canales` para todos —
  // no es información del cliente y decía "Tus pacientes llegan por: whatsapp".
  if (clave === "whatsapp") return false;
  if (PRESENCIA_TXT[clave]) return PRESENCIA_TXT[clave];
  // Leads viejos (y los del formulario web) traían aquí texto libre de canales.
  return `Tus pacientes llegan por: ${v}`;
}

const OBJETIVO_TXT: Record<string, string> = {
  "llenar-agenda": "llenar tu agenda con más pacientes",
  "no-perder-citas": "dejar de perder citas y pacientes",
  "recuperar-pacientes": "recuperar a los pacientes que no vuelven",
  imagen: "que tu clínica se vea tan profesional como es",
};

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
}: {
  titulo: string;
  icon: string;
  desc: string;
  plan: Plan;
  // Nombre y nota de la fila de costos variables — cambian por pieza (una web
  // sola no gasta APIs: gasta dominio y hosting). El valor sigue congelado.
  costos: { k: string; n: string };
  destacado?: boolean;
}) {
  const filas = [
    { k: "Inversión (una vez)", v: plan.inversion.mxn, n: plan.inversion.usd },
    { k: "Mensualidad Upcore", v: plan.mensualidadUpcore.mxn, n: plan.upcoreNota },
    { k: costos.k, v: plan.costosCliente.mxn, n: costos.n },
    { k: "Retorno estimado", v: plan.roi, n: plan.roiNota },
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
          El favorito de las clínicas
        </span>
      )}
      <h3 className="text-lg font-semibold text-sand">
        {icon} {titulo}
      </h3>
      <p className="mb-5 text-sm font-light text-mocha">{desc}</p>
      {filas.map((f) => (
        <div key={f.k} className="border-t border-[rgba(242,231,219,0.08)] py-2.5">
          <div className="text-[0.68rem] uppercase tracking-[0.08em] text-mocha">{f.k}</div>
          <div className="font-semibold text-clay">{f.v}</div>
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
  textos: { dia1: string; pruebas: string }
) {
  return [
    {
      n: "Día 0",
      t: "Aceptas y das el anticipo (50%)",
      d: "Me confirmas por WhatsApp con un “va”, te mando el acuerdo simple de 1 página (sin letras chiquitas) y, en cuanto llega tu anticipo por transferencia, arranco ese mismo día.",
    },
    {
      n: "Día 1",
      t: "Recibes tu Portal de Arranque",
      // El contenido del Día 1 depende de las piezas: número de WhatsApp solo si hay
      // agente; desvío solo si hay voz; textos/colores/referencias solo si hay web.
      d: textos.dia1,
    },
    {
      n: t.construccion,
      t: "Construcción con avances",
      d: "Construyo todo y lo conecto con tus herramientas. Te comparto avances por WhatsApp o video corto — tú solo opinas si quieres.",
    },
    {
      n: t.pruebas,
      t: "TÚ lo pruebas",
      d: textos.pruebas,
    },
    {
      n: t.entrega,
      t: "Entrega y capacitación",
      d: "Todo funcionando y a tu nombre, con video de cómo usarlo + guía de 1 página. Aquí se liquida el resto.",
    },
    {
      n: "+30 días",
      t: "Acompañamiento",
      d: "Ajustes incluidos por mi cuenta. Y si elegiste Gestionado, lo operamos, vigilamos y mejoramos por ti cada mes.",
    },
  ];
}

// "Tu parte", "Nuestra parte", NO_NECESITAS, FAQ y la línea de agenda viven ahora
// en lib/propuesta-copy.ts (fuente única por pieza, probada por el guardián
// scripts/probar-propuesta.mjs) — aquí solo se consumen.

export default async function PropuestaPublica({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const p = await getPropuesta(token);

  if (!p) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-obsidian px-6 text-center">
        <div>
          <div className="mb-4 text-3xl">🕰️</div>
          <h1 className="mb-2 text-2xl font-semibold text-sand">
            Esta propuesta ya no está disponible
          </h1>
          <p className="mb-8 font-light text-mocha">
            Puede que haya vencido. Escríbenos y te preparamos una nueva en el día.
          </p>
          <a
            href={CONTACT.whatsapp}
            className="rounded-full bg-clay px-8 py-3.5 font-semibold text-obsidian transition-colors hover:bg-clay-bright"
          >
            💬 Hablar con Upcore
          </a>
        </div>
      </main>
    );
  }

  const nombreCorto = (p.lead.nombre || "").trim().split(" ")[0];
  const fechaTxt = new Date(p.fecha).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const objetivo = OBJETIVO_TXT[p.diag.objetivo || ""] || "dejar de perder pacientes";
  const diag = [
    p.diag.volumen && `Volumen: ${p.diag.volumen}`,
    p.diag.agenda_hoy && `Hoy la agenda se maneja con: ${p.diag.agenda_hoy}`,
    presenciaTxt(p.diag.presencia || p.diag.canales),
    p.diag.detalle,
    p.diag.mensaje && `“${p.diag.mensaje}”`,
  ].filter(Boolean) as string[];
  const n = p.numeros;
  // Las piezas cotizadas mandan sobre el copy: v4 las trae crudas; v3 se infieren.
  const piezas = piezasDeSnapshot(p);
  const conPerdida = mostrarPerdida(piezas, n);
  // Sección 6 (fusionada): tiempos por complejidad + requisitos por pieza.
  const tiempos = TIEMPOS[p.complejidad] ?? TIEMPO_DEFAULT;
  const pasos = lineaDeTiempo(tiempos, { dia1: dia1Desc(piezas), pruebas: pruebasDesc(piezas) });
  const parte = tuParte(piezas);
  const horasTuParte = parte.length <= 5 ? "~1 hora" : "~1 a 2 horas";
  const nuestraParte = nuestraParteDe(piezas, lineaAgendaPorPieza(p.diag.agenda_hoy, piezas));
  const costosFila = filaCostos(piezas);
  const waPropuesta =
    "https://wa.me/14244472698?text=" +
    encodeURIComponent(
      `Hola, vi el diagnóstico de ${p.lead.clinica || "mi clínica"} y me interesa.`
    );

  const vence = new Date(new Date(p.fecha).getTime() + VIGENCIA_DIAS * 24 * 60 * 60 * 1000);
  const venceTxt = vence.toLocaleDateString("es-MX", { day: "numeric", month: "long" });

  return (
    <main className="pagina-propuesta min-h-screen bg-obsidian px-[6%] py-12 text-sand md:px-[10%]">
      <div className="mx-auto max-w-[860px]">
        <div className="mb-14 text-lg font-semibold tracking-tight">
          Upcore <span className="text-clay">AI</span>
        </div>

        <span className="mb-6 inline-block rounded-full border border-clay/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-clay">
          Diagnóstico personalizado · válido hasta el {venceTxt}
        </span>
        <h1 className="mb-3 text-[clamp(2rem,5vw,3.1rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
          {nombreCorto ? `${nombreCorto}, ` : ""}esto es lo que necesita{" "}
          <em className="not-italic text-clay">{p.lead.clinica || "tu clínica"}</em> para {objetivo}
        </h1>
        <p className="mb-14 font-light text-mocha">
          Preparado el {fechaTxt} · calculado con los números que tú nos diste, sin promesas
          infladas
        </p>

        {diag.length > 0 && (
          <Seccion titulo="1 · Lo que nos contaste">
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
          <Seccion titulo="2 · Lo que te está costando seguir igual">
            <div className="mb-12 rounded-3xl border border-clay/40 bg-[rgba(200,98,61,0.07)] p-7">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.08em] text-mocha">
                    Cada mes que pasa
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-clay">
                    ~{mxn(n.perdidaMensual)}
                  </div>
                </div>
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.08em] text-mocha">
                    En un año
                  </div>
                  <div className="text-3xl font-bold tracking-tight text-clay">
                    ~{mxn(n.perdidaAnual)}
                  </div>
                </div>
              </div>
              <p className="mt-5 border-t border-[rgba(242,231,219,0.08)] pt-4 text-sm font-light text-mocha">
                El cálculo, a la vista: ~{n.citasPerdidasSemana} citas perdidas por semana
                {n.citasEstimado ? " (estimado conservador)" : " (tu dato)"} × ticket promedio de{" "}
                {mxn(n.ticket)}
                {n.ticketEstimado ? " (promedio del giro)" : " (tu dato)"}. No todo se recupera —
                por eso estimamos recuperable solo la mitad: ~{mxn(n.recuperableMensual)} al mes.
              </p>
            </div>
          </Seccion>
        )}

        <Seccion titulo={`3 · Lo que construiríamos para ti (${p.complejidad})`}>
          <div className="mb-12 grid gap-3">
            {p.incluye.map((x) => (
              <div
                key={x}
                className="flex items-start gap-3 rounded-2xl bg-[rgba(242,231,219,0.03)] p-4 font-light"
              >
                <span className="text-xl">{icono(x)}</span>
                <span>{x}</span>
              </div>
            ))}
            <div className="flex items-start gap-3 rounded-2xl bg-[rgba(242,231,219,0.03)] p-4 font-light">
              <span className="text-xl">🎁</span>
              <span>
                Incluido sin costo extra: entrega con video + guía de 1 página, capacitación, y 30
                días de ajustes por nuestra cuenta.
              </span>
            </div>
          </div>

          {/* Lo que dejamos fuera A PROPÓSITO. Antes se metía todo al precio (el panel
              entraba solo por tener 2+ piezas) y encarecía la propuesta sin que nadie
              lo hubiera pedido. */}
          {p.opcionales && p.opcionales.length > 0 && (
            <div className="mb-8 rounded-3xl border border-[rgba(242,231,219,0.12)] p-6">
              <p className="mb-1 font-medium text-sand">Esto lo dejamos fuera a propósito</p>
              <p className="text-sm font-light text-mocha">
                No está incluido en el precio de abajo. Sirve, y en algún momento te va a
                convenir — pero primero se resuelve lo que hoy te está costando pacientes. Si lo
                quieres desde el arranque, esto es lo que sumaría:
              </p>
              <div className="mt-5 grid gap-3">
                {p.opcionales.map((o) => (
                  <div key={o.val} className="rounded-2xl bg-[rgba(242,231,219,0.03)] p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="font-light text-sand">
                        {icono(o.label)} {o.label}
                      </span>
                      <span className="text-sm font-medium text-clay">+{o.precio.mxn}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-light text-mocha">{o.razon}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invitación explícita a recortar: sin esto, el cliente asume que es un
              paquete cerrado de tómalo o déjalo. */}
          <div className="mb-12 rounded-3xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-6 font-light">
            <span className="font-medium text-sand">¿Algo de aquí no lo necesitas?</span> Dímelo
            por WhatsApp y te mando tu propuesta ajustada en el momento — si quitamos una pieza, el
            precio baja. No vendemos paquetes cerrados: pagas por lo que de verdad vas a usar.
          </div>
        </Seccion>

        <Seccion titulo="4 · Tu inversión, con números honestos">
          {conPerdida && n && (
            <p className="mb-5 font-light text-mocha">
              Para ponerla en contexto: compárala contra los ~{mxn(n.perdidaMensual)} que hoy se
              van cada mes.
            </p>
          )}
          <div className="mb-5 grid gap-5 md:grid-cols-2">
            <PlanCard
              titulo="Llave en Mano"
              icon="🔑"
              desc="Lo construimos y es 100% tuyo — tú lo operas, sin mensualidad"
              plan={p.llave}
              costos={costosFila}
            />
            <PlanCard
              titulo="Gestionado"
              icon="🛠️"
              desc="Lo construimos Y lo operamos por ti: monitoreo, cambios y soporte"
              plan={p.gestionado}
              costos={costosFila}
              destacado
            />
          </div>
          <div className="mb-12 rounded-3xl border border-sage/40 bg-[rgba(138,154,133,0.07)] p-7">
            <div className="text-[0.68rem] uppercase tracking-[0.08em] text-mocha">
              Ahorro estimado para tu clínica
            </div>
            <div className="text-3xl font-bold tracking-tight">
              {p.llave.ahorro.mxn} <span className="text-clay">{p.llave.ahorro.usd}</span>
            </div>
            <div className="mt-1 text-sm font-light text-mocha">{p.llave.ahorroNota}</div>
          </div>
        </Seccion>

        <Seccion titulo="5 · Nuestra garantía (el riesgo lo tomamos nosotros)">
          <div className="mb-12 rounded-3xl border border-sage/50 bg-[rgba(138,154,133,0.1)] p-7">
            <div className="mb-2 text-2xl">🛡️</div>
            <p className="text-lg font-medium leading-relaxed">
              Si no te entrego lo acordado funcionando, te devuelvo tu anticipo.
            </p>
            <p className="mt-2 font-light text-mocha">
              Y los primeros 30 días después de la entrega, todos los ajustes van por mi cuenta.
              Tú solo arriesgas seguir como estás.
            </p>
          </div>
        </Seccion>

        <Seccion titulo="6 · Si dices que sí, así trabajaríamos juntos">
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
          <p className="mb-8 text-xs font-light text-mocha/70">
            * Días hábiles aproximados desde tu anticipo — entrega total {tiempos.total}. También
            dependen de tus tiempos de respuesta: si tú vas rápido, esto vuela.
          </p>

          {/* Tu parte / Nuestra parte */}
          <div className="mb-5 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-7">
              <h3 className="mb-1 font-semibold text-sand">🤝 Tu parte</h3>
              <p className="mb-4 text-sm font-light text-mocha">
                {horasTuParte} en total, repartida en los primeros días:
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
              <h3 className="mb-1 font-semibold text-sand">🏗️ Nuestra parte</h3>
              <p className="mb-4 text-sm font-light text-mocha">Todo lo demás:</p>
              <div className="grid gap-2.5">
                {nuestraParte.map((x) => (
                  <div key={x} className="flex gap-2.5 text-sm font-light">
                    <span className="text-clay">✓</span>
                    <span>{x}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lo que NO necesitas */}
          <div className="mb-12 rounded-3xl border border-[rgba(242,231,219,0.1)] bg-[rgba(242,231,219,0.04)] p-7">
            <h3 className="mb-3 font-semibold text-sand">Y lo que NO vas a necesitar:</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {noNecesitas(piezas).map((x) => (
                <div key={x} className="flex gap-2.5 text-sm font-light text-mocha">
                  <span className="text-clay">✗</span>
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
              <span className="font-semibold">Nuestro consejo honesto:</span> {p.recomendacion}
            </p>
          </div>
        )}

        <Seccion titulo="7 · Las dudas que seguro tienes">
          <div className="mb-12 grid gap-3">
            {faq(piezas).map((f) => (
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
            ¿Quieres ver el agente en acción antes de decidir?{" "}
            <a
              href={`https://upcoreai.com/demo${p.lead.clinica ? `?c=${encodeURIComponent(p.lead.clinica)}` : ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sand underline hover:text-clay"
            >
              Pruébalo tú mismo aquí
            </a>{" "}
            — juega a ser tu propio paciente.
          </div>
        )}

        <div className="no-print my-16 text-center">
          <a
            href={waPropuesta}
            className="inline-block animate-pulse-ring rounded-full bg-clay px-9 py-4 text-lg font-bold text-obsidian transition-all duration-300 hover:scale-[1.03] hover:bg-clay-bright"
          >
            💬 Me interesa — hablemos por WhatsApp
          </a>
          <p className="mt-5 text-sm font-light text-mocha">
            Este diagnóstico no te compromete a nada · Válido hasta el {venceTxt}
          </p>
          <div className="mt-6">
            <DescargarPDF />
          </div>
        </div>

        <footer className="border-t border-[rgba(242,231,219,0.08)] pt-7 text-center text-xs font-light text-mocha/60">
          Upcore AI · upcoreai.com · Diagnóstico privado para {p.lead.clinica || p.lead.nombre} —
          no compartas este link
        </footer>
      </div>
    </main>
  );
}
