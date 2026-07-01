import { Reveal } from "./Reveal";
import { GlassCard } from "./GlassCard";

const FASES = [
  { fase: "Fase 01", title: "Diagnóstico", tag: "Entregable", detail: "Mapa de optimización." },
  { fase: "Fase 02", title: "Arquitectura", tag: "Entregable", detail: "Plano técnico escalable." },
  { fase: "Fase 03", title: "Activación", tag: "Resultado", detail: "Funcionamiento en vivo." },
  { fase: "Fase 04", title: "Evolución", tag: "Resultado", detail: "Mejora continua 24/7." },
];

const RESULTADOS = [
  "Menos tareas manuales",
  "Respuesta instantánea",
  "Eficiencia operativa",
  "Procesos escalables",
];

export function Proceso() {
  return (
    <section id="proceso" className="px-[6%] py-28 md:px-[10%] md:py-36">
      <Reveal variant="maskReveal" duration={0.9}>
        <h2 className="mb-16 text-center text-[clamp(2.2rem,5vw,3.2rem)] font-semibold tracking-[-0.03em]">
          El Proceso
        </h2>
      </Reveal>

      <div className="relative mx-auto max-w-6xl">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-[42px] hidden h-px bg-gradient-to-r from-transparent via-[rgba(200,98,61,0.45)] to-transparent lg:block"
        />
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-4">
          {FASES.map((f, i) => (
            <Reveal key={f.fase} variant="blurIn" delay={i * 0.14}>
              <GlassCard className="h-full p-8">
                <div className="mb-4 inline-flex h-8 items-center rounded-full border border-[rgba(200,98,61,0.35)] bg-[rgba(200,98,61,0.1)] px-3 text-xs font-semibold uppercase tracking-[0.18em] text-clay">
                  {f.fase}
                </div>
                <h3 className="mb-3 text-xl font-semibold tracking-tight text-sand">
                  {f.title}
                </h3>
                <p className="text-sm font-light text-mocha">
                  <span className="font-medium text-clay">{f.tag}:</span> {f.detail}
                </p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal variant="scaleIn" delay={0.1}>
        <div className="glass mx-auto mt-16 max-w-4xl rounded-[36px] border-dashed border-[rgba(200,98,61,0.35)] p-12 text-center">
          <div className="glass-body">
            <h3 className="mb-8 text-2xl font-semibold tracking-tight md:text-3xl">
              Resultados Esperados
            </h3>
            <div className="mb-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-mocha">
              {RESULTADOS.map((r) => (
                <span key={r} className="flex items-center gap-2">
                  <span className="text-clay">✔</span>
                  {r}
                </span>
              ))}
            </div>
            <a
              href="#calculadora"
              className="btn-shine inline-block rounded-full bg-clay px-8 py-3.5 font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright"
            >
              Agendar una llamada
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
