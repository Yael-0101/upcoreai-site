import { SectionTitle } from "./SectionTitle";
import { Reveal } from "./Reveal";
import { GlassCard } from "./GlassCard";
import { PASOS } from "@/lib/content";

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="px-[6%] py-24 md:px-[10%] md:py-32">
      <SectionTitle title={PASOS.heading} sub={PASOS.sub} variant="blurIn" />
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        {PASOS.items.map((s, i) => (
          <Reveal key={s.n} variant="scaleIn" delay={i * 0.12}>
            <GlassCard className="h-full p-8">
              <div className="mb-5 text-4xl font-semibold tracking-tight text-clay/90">
                {s.n}
              </div>
              <h3 className="mb-2 text-xl font-semibold tracking-tight text-sand">
                {s.title}
              </h3>
              <p className="text-sm font-light leading-relaxed text-mocha">
                {s.body}
              </p>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
