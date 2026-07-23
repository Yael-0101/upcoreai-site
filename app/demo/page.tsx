import type { Metadata } from "next";
import { Backdrop } from "@/components/Backdrop";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { DemoChat } from "@/components/DemoChat";
import { AgendarCTA } from "@/components/AgendarCTA";
import { LiquidGlassFilter } from "@/components/LiquidGlassFilter";
import { sanitizeClinica, sanitizeGiro, GIROS } from "@/lib/demo-config";
import { metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  title: "Prueba el asistente",
  description:
    "Chatea con una demo del asistente de IA que responde, atiende y agenda citas por WhatsApp para clínicas. Juega a ser tu paciente.",
  path: "/demo",
});

const BULLETS = [
  {
    titulo: "Responde al instante, 24/7",
    texto: "Lo que acabas de vivir: cero esperas, aunque sean las 11 de la noche.",
  },
  {
    titulo: "Agenda solo",
    texto: "Ofrece horarios reales de tu calendario y confirma la cita sin que nadie de tu equipo toque el teléfono.",
  },
  {
    titulo: "Con tu información",
    texto: "En tu clínica respondería con TUS servicios, TUS horarios y TU forma de hablar.",
  },
];

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; g?: string }>;
}) {
  const { c, g } = await searchParams;
  const clinica = sanitizeClinica(c);
  const giro = sanitizeGiro(g);

  return (
    <>
      <LiquidGlassFilter />
      <Backdrop />
      <Nav />
      <main className="relative z-[2] px-[6%] pb-24 pt-32 md:px-[10%]">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <span className="mb-4 inline-block rounded-full border border-clay/40 bg-clay/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-clay">
              Demo en vivo
            </span>
            <h1 className="text-gradient mx-auto max-w-2xl text-[clamp(1.9rem,5vw,3rem)] font-semibold leading-tight tracking-tight">
              Juega a ser tu paciente
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base font-light leading-relaxed text-mocha">
              Este es el asistente que Upcore construye para {GIROS[giro].label === "clínica dental" ? "clínicas" : "clínicas"} como la tuya.
              Escríbele como si buscaras una cita — pide horarios, pregunta por servicios, ponlo a prueba.
            </p>
          </div>

          <DemoChat clinica={clinica} giro={giro} />

          <div className="mx-auto mt-14 grid max-w-3xl gap-4 md:grid-cols-3">
            {BULLETS.map((b) => (
              <div key={b.titulo} className="card-soft rounded-2xl p-5">
                <div className="mb-1 text-sm font-semibold text-sand">{b.titulo}</div>
                <p className="text-xs font-light leading-relaxed text-mocha">{b.texto}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="mb-4 text-sm font-light text-mocha">
              ¿Te imaginas esto contestando el WhatsApp de tu clínica?
            </p>
            <AgendarCTA
              label="Agenda tu diagnóstico gratis"
              className="btn-shine inline-block rounded-full bg-clay px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
