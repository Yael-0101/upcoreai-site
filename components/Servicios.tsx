import { Reveal, type RevealVariant } from "./Reveal";
import { GlassCard } from "./GlassCard";
import { IconChip, IconChat, IconSparkle } from "./Icons";

const SERVICIOS = [
  {
    Icon: IconChip,
    title: "Automatización Operativa",
    body: "Sistemas autónomos que ejecutan procesos de principio a fin de forma impecable.",
  },
  {
    Icon: IconChat,
    title: "Agentes de IA",
    body: "Asistentes inteligentes para ventas y atención que califican leads sin descanso.",
  },
  {
    Icon: IconSparkle,
    title: "Inteligencia Aplicada",
    body: "Optimización continua mediante el uso de datos en tiempo real.",
  },
];

export function Servicios() {
  return (
    <section id="servicios" className="px-[6%] py-28 md:px-[10%] md:py-36">
      <Reveal variant="blurIn">
        <h2 className="mb-16 text-center text-[clamp(2.2rem,5vw,3.2rem)] font-semibold tracking-[-0.03em]">
          Servicios
        </h2>
      </Reveal>

      <div className="mx-auto grid max-w-6xl gap-7 md:grid-cols-3">
        {SERVICIOS.map((s, i) => {
          const variant: RevealVariant =
            i === 0 ? "slideLeft" : i === 2 ? "slideRight" : "fadeUp";
          return (
            <Reveal key={s.title} variant={variant} delay={i * 0.08}>
              <GlassCard className="h-full p-9">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(138,154,133,0.35)] bg-[rgba(138,154,133,0.12)] text-sage shadow-[0_0_22px_rgba(138,154,133,0.18)]">
                  <s.Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-4 text-2xl font-semibold tracking-tight text-sand">
                  {s.title}
                </h3>
                <p className="font-light text-sand/80">{s.body}</p>
              </GlassCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
