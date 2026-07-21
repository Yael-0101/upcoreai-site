import type { Metadata } from "next";
import { Backdrop } from "@/components/Backdrop";
import { LiquidGlassFilter } from "@/components/LiquidGlassFilter";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAFinal } from "@/components/CTAFinal";
import { SectionTitle } from "@/components/SectionTitle";
import { Reveal } from "@/components/Reveal";

const title =
  "Qué hace el agente de IA en una clínica dental (caso de ejemplo con ROI) | Upcore AI";
const description =
  "Escenario modelado con cifras del sector: qué pasa cuando una clínica dental típica en México automatiza su WhatsApp y sus citas, número por número.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/casos/clinica-dental-ejemplo" },
  openGraph: { title, description },
};

// Escenario modelado (NO es un cliente real): consultorio dental típico en México.
// Cifras alineadas a los benchmarks del sector que usa la calculadora del sitio.
const ESCENARIO = {
  perfil: [
    { label: "Tipo", value: "Consultorio dental, 1 doctor + 1 asistente" },
    { label: "Citas al mes", value: "~120" },
    { label: "Ticket promedio", value: "$1,000 MXN por cita" },
    { label: "No-shows", value: "~18 al mes (15%)" },
  ],
  antesDespues: [
    {
      tema: "Mensajes fuera de horario",
      antes: "Se responden al día siguiente (o nunca)",
      despues: "Respondidos al instante, 24/7",
    },
    {
      tema: "Citas sin confirmar",
      antes: "Se confirman llamando, cuando hay tiempo",
      despues: "100% con recordatorio automático un día antes",
    },
    {
      tema: "No-shows",
      antes: "~18 al mes",
      despues: "~13–14 al mes (4–5 citas recuperadas)",
    },
    {
      tema: "Horas de recepción en WhatsApp",
      antes: "~12 horas a la semana",
      despues: "~2 horas (solo casos que el agente escala)",
    },
    {
      tema: "Pacientes que preguntaban y se enfriaban",
      antes: "Sin seguimiento",
      despues: "+8–12 citas al mes por responder al momento",
    },
  ],
  roi: [
    { label: "Citas recuperadas de no-shows", value: "4–5 × $1,000 = $4,000–5,000 MXN/mes" },
    { label: "Citas nuevas por responder 24/7", value: "8–12 × $1,000 = $8,000–12,000 MXN/mes" },
    { label: "Tiempo de recepción liberado", value: "~10 h/semana para atender mejor" },
    { label: "Total estimado", value: "$12,000–17,000 MXN/mes recuperados" },
  ],
};

export default function CasoDentalPage() {
  return (
    <>
      <LiquidGlassFilter />
      <Backdrop />
      <Nav />
      <main className="relative z-[2]">
        {/* Hero */}
        <section className="px-[6%] pb-14 pt-36 text-center md:px-[10%] md:pb-20 md:pt-44">
          <Reveal>
            <div className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
              Caso de ejemplo · Clínica dental
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mx-auto max-w-4xl text-[clamp(2.2rem,6vw,3.8rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Qué cambia cuando una clínica dental automatiza su WhatsApp
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-mocha">
              Número por número, con un consultorio dental típico en México. Es un{" "}
              <strong className="font-medium text-sand">
                escenario modelado con cifras del sector
              </strong>{" "}
              — no un cliente real ni una garantía — para que veas exactamente de
              dónde sale el retorno.
            </p>
          </Reveal>
        </section>

        {/* Perfil del escenario */}
        <section className="px-[6%] py-14 md:px-[10%]">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-[rgba(242,231,219,0.1)] bg-[rgba(242,231,219,0.08)] sm:grid-cols-4">
            {ESCENARIO.perfil.map((p) => (
              <div key={p.label} className="bg-[#1c1613] px-4 py-8 text-center">
                <div className="text-xs font-light uppercase tracking-[0.08em] text-mocha">
                  {p.label}
                </div>
                <div className="mt-2 text-sm font-medium text-sand">{p.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Antes / Después */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle title="Antes y después" variant="maskReveal" />
          <div className="mx-auto max-w-4xl space-y-3">
            {ESCENARIO.antesDespues.map((r, i) => (
              <Reveal key={r.tema} delay={i * 0.05}>
                <div className="card-soft rounded-2xl p-6">
                  <div className="glass-body grid gap-3 md:grid-cols-[1fr_1fr_1fr] md:items-center">
                    <div className="font-medium text-sand">{r.tema}</div>
                    <div className="text-sm font-light text-mocha">
                      <span className="mr-2 text-xs uppercase tracking-wide text-mocha/60 md:hidden">
                        Antes:
                      </span>
                      {r.antes}
                    </div>
                    <div className="text-sm font-light text-sage">
                      <span className="mr-2 text-xs uppercase tracking-wide text-sage/70 md:hidden">
                        Después:
                      </span>
                      {r.despues}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ROI */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle
            title="¿De dónde sale el retorno?"
            sub="El desglose honesto del escenario. Tu clínica tendrá números distintos — por eso el diagnóstico es gratis y personalizado."
            variant="fadeUp"
          />
          <div className="mx-auto max-w-3xl space-y-3">
            {ESCENARIO.roi.map((r, i) => (
              <Reveal key={r.label} delay={i * 0.05}>
                <div
                  className={`card-soft rounded-2xl p-6 ${
                    i === ESCENARIO.roi.length - 1
                      ? "border border-clay/40"
                      : ""
                  }`}
                >
                  <div className="glass-body flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div
                      className={`font-medium ${
                        i === ESCENARIO.roi.length - 1
                          ? "text-clay"
                          : "text-sand"
                      }`}
                    >
                      {r.label}
                    </div>
                    <div className="text-sm font-light text-mocha">{r.value}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-8 max-w-2xl text-center text-xs font-light leading-relaxed text-mocha/60">
              * Escenario modelado con cifras y benchmarks del sector, no resultados
              de un cliente real ni una garantía. Tu estimación personalizada sale
              de la calculadora de la página principal y de tu diagnóstico gratis.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/demo?g=dental"
                className="btn-shine w-full rounded-full bg-clay px-8 py-4 font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright sm:w-auto"
              >
                Vive la experiencia en la demo
              </a>
              <a
                href="/empezar"
                className="w-full rounded-full border border-[rgba(242,231,219,0.2)] px-8 py-4 font-medium text-sand transition-colors hover:border-clay hover:text-clay sm:w-auto"
              >
                Calcula el tuyo — diagnóstico gratis
              </a>
            </div>
          </Reveal>
        </section>

        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
