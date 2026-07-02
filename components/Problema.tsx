import { SectionTitle } from "./SectionTitle";
import { Reveal } from "./Reveal";
import { GlassCard } from "./GlassCard";
import { Icon } from "./Icons";
import { PROBLEMAS } from "@/lib/content";

export function Problema() {
  return (
    <section id="problema" className="px-[6%] py-24 md:px-[10%] md:py-32">
      <SectionTitle title={PROBLEMAS.heading} sub={PROBLEMAS.sub} />
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
        {PROBLEMAS.items.map((p, i) => (
          <Reveal key={p.title} variant="fadeUp" delay={i * 0.1}>
            <GlassCard variant="soft" className="flex h-full items-start gap-4 p-7">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[rgba(200,98,61,0.3)] bg-[rgba(200,98,61,0.1)] text-clay">
                <Icon name={p.icon} className="h-5 w-5" />
              </span>
              <div>
                <h3 className="mb-1.5 text-lg font-semibold tracking-tight text-sand">
                  {p.title}
                </h3>
                <p className="text-sm font-light leading-relaxed text-mocha">
                  {p.body}
                </p>
              </div>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
