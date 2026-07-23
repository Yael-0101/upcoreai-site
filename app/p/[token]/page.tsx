import type { Metadata } from "next";
import { CONTACT } from "@/lib/content";
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
  };
  numeros?: Numeros;
  incluye: string[];
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
};
const icono = (texto: string) => {
  const clave = Object.keys(PIEZA_ICONS).find((k) => texto.startsWith(k));
  return clave ? PIEZA_ICONS[clave] : "→";
};

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
  destacado,
}: {
  titulo: string;
  icon: string;
  desc: string;
  plan: Plan;
  destacado?: boolean;
}) {
  const filas = [
    { k: "Inversión (una vez)", v: plan.inversion.mxn, n: plan.inversion.usd },
    { k: "Mensualidad Upcore", v: plan.mensualidadUpcore.mxn, n: plan.upcoreNota },
    { k: "Costos de APIs (tuyos)", v: plan.costosCliente.mxn, n: "Directo a los proveedores, a tu nombre — sin margen de Upcore" },
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
// Días hábiles aproximados desde el anticipo, escalados por la complejidad del
// proyecto (viene en el snapshot). Estimado honesto, nunca promesa cerrada.
const TIEMPOS: Record<
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
const TIEMPO_DEFAULT = TIEMPOS["Solución esencial"];

function lineaDeTiempo(t: (typeof TIEMPOS)[string]) {
  return [
    {
      n: "Día 0",
      t: "Aceptas y das el anticipo (50%)",
      d: "Me confirmas por WhatsApp con un “va”, te mando el acuerdo simple de 1 página (sin letras chiquitas) y, en cuanto llega tu anticipo por transferencia, arranco ese mismo día.",
    },
    {
      n: "Día 1",
      t: "Recibes tu Portal de Arranque",
      d: "Un link privado donde haces tu parte a tu ritmo: el checklist de tu clínica (15 min), la decisión de tu número y las guías para crear tus cuentas — a TU nombre y con tus propios clics. Todo se guarda solo.",
    },
    {
      n: t.construccion,
      t: "Construcción con avances",
      d: "Construyo todo y lo conecto con tus herramientas. Te comparto avances por WhatsApp o video corto — tú solo opinas si quieres.",
    },
    {
      n: t.pruebas,
      t: "TÚ lo pruebas",
      d: "Lo usas como si fueras tu propio paciente y ajustamos lo que pidas antes de salir en vivo.",
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

// "Tu parte": lo que necesitamos del cliente, por pieza del proyecto. Las claves
// son los mismos prefijos de `incluye[]` que usa PIEZA_ICONS (startsWith).
const TU_PARTE: Record<string, { t: string; min: string }[]> = {
  Agente: [
    { t: "Contestar el checklist de tu clínica: servicios, precios, horarios y tu tono", min: "15 min" },
    { t: "Decidir qué número de WhatsApp usará el asistente — te explico la diferencia antes", min: "5 min" },
    { t: "Crear tus cuentas viendo nuestro video — tú das los clics; contraseñas por chat, jamás", min: "20–30 min" },
    { t: "Darme acceso a tu calendario o agenda", min: "5 min" },
    { t: "Probarlo como si fueras tu paciente antes de salir en vivo", min: "15 min" },
  ],
  Sitio: [
    { t: "Pasarme los textos, fotos y logo que ya tengas de tu clínica", min: "20 min" },
    { t: "Tu dominio (o lo compramos juntos, a tu nombre)", min: "10 min" },
    { t: "Revisar el borrador y pedirme cambios", min: "15 min" },
  ],
  Automatizaciones: [
    { t: "Darme acceso a tu calendario o agenda", min: "5 min" },
    { t: "Aprobar los textos de recordatorios y confirmaciones (van con tu tono)", min: "10 min" },
    { t: "Probar el flujo completo con una cita de mentira", min: "10 min" },
  ],
  Reactivación: [
    { t: "Sacar tu lista de pacientes inactivos — te digo exactamente cómo exportarla", min: "15 min" },
    { t: "Aprobar los mensajes de reactivación", min: "10 min" },
  ],
  Dashboard: [
    { t: "Una revisión corta de avances para dejar tu panel a tu gusto", min: "15 min" },
  ],
};
const TU_PARTE_GENERICA = [
  { t: "Contestar el checklist de tu clínica", min: "15 min" },
  { t: "Crear tus cuentas viendo nuestro video — tú das los clics", min: "20–30 min" },
  { t: "Probar el sistema antes de la entrega", min: "15 min" },
];

function tuParte(incluye: string[]) {
  const items: { t: string; min: string }[] = [];
  const vistos = new Set<string>();
  for (const clave of Object.keys(TU_PARTE)) {
    if (!incluye.some((x) => x.startsWith(clave))) continue;
    for (const item of TU_PARTE[clave]) {
      if (vistos.has(item.t)) continue; // dedup entre piezas (ej. acceso al calendario)
      vistos.add(item.t);
      items.push(item);
    }
  }
  return items.length > 0 ? items : TU_PARTE_GENERICA;
}

// Personalización ligera: qué dijo el cliente sobre cómo maneja su agenda hoy.
// El nombre de su software viene embebido entre paréntesis en `agenda_hoy`
// (ej. "Un software o sistema (Dentalink)").
function lineaAgenda(agendaHoy: string): string | null {
  const a = (agendaHoy || "").trim();
  if (!a) return null;
  const software = a.match(/\(([^)]+)\)/)?.[1]?.trim();
  if (software)
    return `Integrarnos a tu ${software} — tus datos y tu expediente se quedan donde están`;
  if (/software|sistema/i.test(a))
    return "Integrarnos al sistema que ya usas — tus datos se quedan donde están";
  if (/papel|excel/i.test(a))
    return "Dejarte la agenda ordenada en un calendario digital (hoy la llevas en papel/Excel) — sin costo extra";
  return "Conectarnos a tu forma actual de agendar — sin obligarte a cambiar nada";
}

const NUESTRA_PARTE = [
  "Construir el sistema completo, de punta a punta",
  "Probarlo contigo hasta que quede como acordamos",
  "Capacitarte con un video corto + guía de 1 página",
  "La garantía: si no entrego lo acordado funcionando, te devuelvo tu anticipo",
  "30 días de ajustes después de la entrega, por mi cuenta",
];

const NO_NECESITAS = [
  "Saber de tecnología",
  "Cambiar tu software o tu forma de trabajar",
  "Contratar a alguien más",
  "Pagar todo por adelantado",
  "Compartir contraseñas por chat (eso jamás)",
];

const FAQ = [
  {
    q: "¿Es difícil de usar? No soy de tecnología.",
    a: "Está pensado justo para eso: tú sigues trabajando como siempre y el sistema hace la parte pesada. Te entrego un video corto y una guía de 1 página; si algo no queda claro, me escribes y lo vemos.",
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
  {
    q: "¿Los números de esta propuesta son reales?",
    a: "Son estimaciones conservadoras calculadas con los datos que TÚ nos diste (los supuestos están a la vista). Preferimos quedarnos cortos a prometerte de más.",
  },
  {
    q: "¿Por qué los costos de APIs van aparte?",
    a: "Porque son tuyos y así lo ves todo transparente: pagas el consumo real directo al proveedor, sin margen escondido de Upcore. Suelen ser unos cuantos dólares al mes, con tope de gasto activado.",
  },
];

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
    p.diag.canales && `Tus pacientes llegan por: ${p.diag.canales}`,
    p.diag.detalle,
    p.diag.mensaje && `“${p.diag.mensaje}”`,
  ].filter(Boolean) as string[];
  const n = p.numeros;
  // Sección 6 (fusionada): tiempos por complejidad + requisitos por pieza.
  const tiempos = TIEMPOS[p.complejidad] ?? TIEMPO_DEFAULT;
  const pasos = lineaDeTiempo(tiempos);
  const parte = tuParte(p.incluye ?? []);
  const horasTuParte = parte.length <= 5 ? "~1 hora" : "~1 a 2 horas";
  const agendaTxt = lineaAgenda(p.diag.agenda_hoy);
  const nuestraParte = agendaTxt ? [NUESTRA_PARTE[0], agendaTxt, ...NUESTRA_PARTE.slice(1)] : NUESTRA_PARTE;
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

        {n && n.perdidaMensual > 0 && (
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
        </Seccion>

        <Seccion titulo="4 · Tu inversión, con números honestos">
          {n && n.perdidaMensual > 0 && (
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
            />
            <PlanCard
              titulo="Gestionado"
              icon="🛠️"
              desc="Lo construimos Y lo operamos por ti: monitoreo, cambios y soporte"
              plan={p.gestionado}
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
              {NO_NECESITAS.map((x) => (
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
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl bg-[rgba(242,231,219,0.03)] p-5">
                <div className="mb-1 font-semibold">{f.q}</div>
                <div className="text-sm font-light text-mocha">{f.a}</div>
              </div>
            ))}
          </div>
        </Seccion>

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

        <div className="no-print my-16 text-center">
          <a
            href={waPropuesta}
            className="inline-block animate-pulse-ring rounded-full bg-clay px-9 py-4 text-lg font-bold text-obsidian transition-all duration-300 hover:scale-[1.03] hover:bg-clay-bright"
          >
            💬 Me interesa — hablemos por WhatsApp
          </a>
          <p className="mt-5 text-sm font-light text-mocha">
            ¿Prefieres platicarlo con calma?{" "}
            <a
              href={CONTACT.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sand underline hover:text-clay"
            >
              Agenda una llamada de 15 min
            </a>{" "}
            · Este diagnóstico no te compromete a nada · Válido hasta el {venceTxt}
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
