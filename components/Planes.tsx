import { SectionTitle } from "./SectionTitle";
import { Reveal } from "./Reveal";
import { GlassCard } from "./GlassCard";
import { PLANES, CONTACT } from "@/lib/content";

export function Planes() {
  return (
    <section id="planes" className="px-[6%] py-24 md:px-[10%] md:py-32">
      <SectionTitle title={PLANES.heading} sub={PLANES.sub} />
      <div className="mx-auto grid max-w-5xl items-stretch gap-6 md:grid-cols-3">
        {PLANES.items.map((p, i) => (
          <Reveal key={p.name} variant="fadeUp" delay={i * 0.1} className="h-full">
            <GlassCard
              liquid={p.destacado}
              className={`relative flex h-full flex-col p-8 ${
                p.destacado ? "border-clay/50" : ""
              }`}
            >
              {p.destacado && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-clay px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-wider text-obsidian">
                  Recomendado
                </span>
              )}
              <h3 className="text-xl font-semibold tracking-tight text-sand">
                {p.name}
              </h3>
              <p className="mt-1 text-sm text-clay">{p.tagline}</p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-mocha">
                {p.pago}
              </p>
              <p className="mt-3 text-sm font-light leading-relaxed text-mocha">
                {p.desc}
              </p>
              <ul className="mb-6 mt-5 space-y-2">
                {p.incluye.map((x) => (
                  <li key={x} className="flex items-center gap-2 text-sm text-sand/90">
                    <span className="text-clay">✔</span>
                    {x}
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <p className="mb-4 text-center text-[0.7rem] font-medium uppercase tracking-[0.12em] text-mocha/70">
                  {PLANES.precioNota}
                </p>
                <a
                  href={CONTACT.calendly}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block rounded-full px-6 py-3 text-center text-sm font-semibold transition-all duration-300 hover:scale-[1.03] ${
                    p.destacado
                      ? "bg-clay text-obsidian hover:bg-clay-bright"
                      : "border border-[rgba(242,231,219,0.2)] text-sand hover:border-clay hover:text-clay"
                  }`}
                >
                  {PLANES.cta}
                </a>
              </div>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
