import { SectionTitle } from "./SectionTitle";
import { Reveal } from "./Reveal";
import { GlassCard } from "./GlassCard";
import { Icon } from "./Icons";
import { SISTEMA } from "@/lib/content";

export function Sistema() {
  return (
    <section id="sistema" className="px-[6%] py-24 md:px-[10%] md:py-32">
      <SectionTitle title={SISTEMA.heading} sub={SISTEMA.sub} />

      {/* Dashboard destacado — el centro */}
      <Reveal variant="blurIn">
        <GlassCard liquid className="mx-auto mb-6 max-w-5xl p-8 md:p-10">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <span className="mb-4 inline-flex items-center rounded-full border border-[rgba(200,98,61,0.35)] bg-[rgba(200,98,61,0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-clay">
                {SISTEMA.dashboard.tag}
              </span>
              <h3 className="mb-3 flex items-center gap-3 text-2xl font-semibold tracking-tight text-sand md:text-3xl">
                <Icon name="IconGauge" className="h-7 w-7 text-clay" />
                {SISTEMA.dashboard.title}
              </h3>
              <p className="font-light leading-relaxed text-mocha">
                {SISTEMA.dashboard.body}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SISTEMA.dashboard.views.map((v) => (
                <div
                  key={v}
                  className="rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.04)] px-4 py-3"
                >
                  <div className="mb-2 h-1.5 w-8 rounded-full bg-clay/60" />
                  <div className="text-sm font-medium text-sand">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </Reveal>

      {/* Los demás bloques del sistema */}
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SISTEMA.items.map((it, i) => (
          <Reveal
            key={it.title}
            variant={i % 2 === 0 ? "slideLeft" : "slideRight"}
            delay={(i % 3) * 0.08}
          >
            <GlassCard className="h-full p-7">
              <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(138,154,133,0.35)] bg-[rgba(138,154,133,0.12)] text-sage">
                <Icon name={it.icon} className="h-5 w-5" />
              </span>
              <h3 className="mb-2 text-lg font-semibold tracking-tight text-sand">
                {it.title}
              </h3>
              <p className="text-sm font-light leading-relaxed text-mocha">
                {it.body}
              </p>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
