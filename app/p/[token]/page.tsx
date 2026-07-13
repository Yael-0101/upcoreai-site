import type { Metadata } from "next";
import { CONTACT } from "@/lib/content";
import { DescargarPDF } from "@/components/DescargarPDF";

// Propuesta personalizada con link secreto: upcoreai.com/p/[token].
// Los datos vienen congelados desde el panel (tabla `propuestas` de n8n) — así la
// propuesta que vio el cliente nunca cambia aunque los precios del sitio cambien.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tu propuesta — Upcore AI",
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
type Snapshot = {
  fecha: string;
  lead: { nombre: string; clinica: string; decisor: string; tipo_clinica: string; tamano: string };
  diag: {
    volumen: string;
    agenda_hoy: string;
    canales: string;
    detalle: string;
    urgencia: string;
    mensaje: string;
  };
  incluye: string[];
  complejidad: string;
  llave: Plan;
  gestionado: Plan;
  recomendacion: string;
};

const VIGENCIA_DIAS = 15;

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
      (i) => i && i.token === token && i.estado === "activa" && i.datos
    );
    if (!fila) return null;
    const snap = JSON.parse(fila.datos as string) as Snapshot;
    // Vencimiento automático: la propuesta muere sola a los 15 días.
    const edadMs = Date.now() - new Date(snap.fecha).getTime();
    if (!snap.fecha || Number.isNaN(edadMs) || edadMs > VIGENCIA_DIAS * 24 * 60 * 60 * 1000) {
      return null;
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
  const diag = [
    p.diag.volumen && `Volumen: ${p.diag.volumen}`,
    p.diag.agenda_hoy && `Hoy la agenda se maneja con: ${p.diag.agenda_hoy}`,
    p.diag.canales && `Tus pacientes llegan por: ${p.diag.canales}`,
    p.diag.detalle,
    p.diag.mensaje && `“${p.diag.mensaje}”`,
  ].filter(Boolean) as string[];
  const waPropuesta =
    "https://wa.me/14244472698?text=" +
    encodeURIComponent(
      `Hola Yael, vi la propuesta para ${p.lead.clinica || "mi clínica"} y me interesa.`
    );

  const vence = new Date(new Date(p.fecha).getTime() + 15 * 24 * 60 * 60 * 1000);
  const venceTxt = vence.toLocaleDateString("es-MX", { day: "numeric", month: "long" });

  return (
    <main className="pagina-propuesta min-h-screen bg-obsidian px-[6%] py-12 text-sand md:px-[10%]">
      <div className="mx-auto max-w-[860px]">
        <div className="mb-14 text-lg font-semibold tracking-tight">
          Upcore <span className="text-clay">AI</span>
        </div>

        <span className="mb-6 inline-block rounded-full border border-clay/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-clay">
          Propuesta personalizada · válida hasta el {venceTxt}
        </span>
        <h1 className="mb-3 text-[clamp(2rem,5vw,3.1rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
          {nombreCorto ? `${nombreCorto}, ` : ""}así trabajaría{" "}
          <em className="not-italic text-clay">{p.lead.clinica || "tu clínica"}</em> sin perder
          pacientes
        </h1>
        <p className="mb-14 font-light text-mocha">
          Preparada el {fechaTxt} · con los números que tú nos diste, sin promesas infladas
        </p>

        {diag.length > 0 && (
          <>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-mocha">
              Lo que nos contaste
            </h2>
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
          </>
        )}

        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-mocha">
          Lo que construiríamos para ti ({p.complejidad})
        </h2>
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
        </div>

        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-mocha">
          Tu inversión, con números honestos
        </h2>
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

        {p.recomendacion && (
          <div className="mb-12 flex gap-4 rounded-3xl border border-sage/35 bg-[rgba(138,154,133,0.08)] p-6 font-light">
            <span className="text-xl">💡</span>
            <p>
              <span className="font-semibold">Nuestro consejo honesto:</span> {p.recomendacion}
            </p>
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
            ¿Prefieres platicarlo con calma?{" "}
            <a
              href={CONTACT.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sand underline hover:text-clay"
            >
              Agenda una llamada de 15 min
            </a>{" "}
            · Esta propuesta no te compromete a nada
          </p>
          <div className="mt-6">
            <DescargarPDF />
          </div>
        </div>

        <footer className="border-t border-[rgba(242,231,219,0.08)] pt-7 text-center text-xs font-light text-mocha/60">
          Upcore AI · upcoreai.com · Propuesta privada para {p.lead.clinica || p.lead.nombre} — no
          compartas este link
        </footer>
      </div>
    </main>
  );
}
