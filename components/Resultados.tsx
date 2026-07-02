import { SectionTitle } from "./SectionTitle";
import { Reveal } from "./Reveal";
import { RESULTADOS } from "@/lib/content";

export function Resultados() {
  return (
    <section id="resultados" className="px-[6%] py-24 md:px-[10%] md:py-32">
      <SectionTitle
        title={RESULTADOS.heading}
        sub={RESULTADOS.sub}
        variant="fadeUp"
      />
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {RESULTADOS.stats.map((s, i) => (
          <Reveal key={s.label} variant="scaleIn" delay={i * 0.1}>
            <div className="glass rounded-[28px] p-8 text-center">
              <div className="glass-body">
                <div className="text-gradient text-[clamp(2rem,5vw,2.8rem)] font-semibold tracking-tight">
                  {s.value}
                </div>
                <div className="mt-2 text-sm font-light text-mocha">{s.label}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.2}>
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs font-light leading-relaxed text-mocha/60">
          {RESULTADOS.disclaimer}
        </p>
      </Reveal>
    </section>
  );
}
