import { SectionTitle } from "./SectionTitle";
import { Reveal } from "./Reveal";
import { GlassCard } from "./GlassCard";
import { Icon } from "./Icons";
import { SOBRE } from "@/lib/content";

export function SobreUpcore() {
  return (
    <section id="sobre" className="px-[6%] py-24 md:px-[10%] md:py-32">
      <SectionTitle title={SOBRE.heading} variant="blurIn" />
      <Reveal variant="scaleIn">
        <GlassCard className="mx-auto max-w-3xl p-10 text-center md:p-12">
          <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-sand/90">
            {SOBRE.body}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {SOBRE.badges.map((b) => (
              <span key={b.label} className="flex items-center gap-2 text-sm text-mocha">
                <Icon name={b.icon} className="h-5 w-5 text-sage" />
                {b.label}
              </span>
            ))}
          </div>
        </GlassCard>
      </Reveal>
    </section>
  );
}
