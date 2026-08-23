import { SectionTitle } from "./SectionTitle";
import { Reveal } from "./Reveal";
import { contenido } from "@/lib/site-textos";
import type { Idioma } from "@/lib/idioma";

export function Resultados({ idioma = "es" }: { idioma?: Idioma }) {
  const RESULTADOS = contenido(idioma).resultados;
  return (
    <section id="resultados" className="px-[6%] py-24 md:px-[10%] md:py-32">
      <SectionTitle
        title={RESULTADOS.heading}
        sub={RESULTADOS.sub}
        variant="fadeUp"
      />
      <Reveal variant="fadeUp">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-[rgba(242,231,219,0.1)] bg-[rgba(242,231,219,0.08)] sm:grid-cols-4">
          {RESULTADOS.stats.map((s) => (
            <div key={s.label} className="bg-[#1c1613] px-4 py-10 text-center">
              <div className="text-gradient text-[clamp(1.9rem,5vw,2.7rem)] font-semibold tracking-tight">
                {s.value}
              </div>
              <div className="mt-2 text-xs font-light uppercase tracking-[0.08em] text-mocha">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-mocha/80">
          {RESULTADOS.disclaimer}
        </p>
      </Reveal>
    </section>
  );
}
