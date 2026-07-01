import { Reveal } from "./Reveal";
import { GlassCard } from "./GlassCard";

const SERVICIOS = [
  {
    title: "Automatización Operativa",
    body: "Sistemas autónomos que ejecutan procesos de principio a fin de forma impecable.",
  },
  {
    title: "Agentes de IA",
    body: "Asistentes inteligentes para ventas y atención que califican leads sin descanso.",
  },
  {
    title: "Inteligencia Aplicada",
    body: "Optimización continua mediante el uso de datos en tiempo real.",
  },
];

export function Servicios() {
  return (
    <section id="servicios" className="px-[6%] py-28 md:px-[10%] md:py-36">
      <Reveal>
        <h2 className="mb-16 text-center text-[clamp(2.2rem,5vw,3.2rem)] font-semibold tracking-[-0.03em]">
          Servicios
        </h2>
      </Reveal>

      <div className="mx-auto grid max-w-6xl gap-7 md:grid-cols-3">
        {SERVICIOS.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.12}>
            <GlassCard className="h-full p-9">
              <h3 className="mb-4 text-2xl font-semibold tracking-tight text-clay">
                {s.title}
              </h3>
              <p className="font-light text-sand/90">{s.body}</p>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
