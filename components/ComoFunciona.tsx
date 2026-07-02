import { SectionTitle } from "./SectionTitle";
import { Reveal } from "./Reveal";
import { PASOS } from "@/lib/content";

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="px-[6%] py-24 md:px-[10%] md:py-32">
      <SectionTitle title={PASOS.heading} sub={PASOS.sub} variant="blurIn" />
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3 md:gap-8">
        {PASOS.items.map((s, i) => (
          <Reveal key={s.n} variant="fadeUp" delay={i * 0.14}>
            <div className="relative text-center md:text-left">
              {/* Hilo conector (solo escritorio) */}
              {i < PASOS.items.length - 1 && (
                <span
                  className="absolute left-16 right-[-2rem] top-7 hidden h-px bg-gradient-to-r from-clay/40 to-transparent md:block"
                  aria-hidden
                />
              )}
              <div className="relative z-10 mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-clay/40 bg-[rgba(200,98,61,0.1)] text-lg font-semibold text-clay md:mx-0">
                {s.n}
              </div>
              <h3 className="mb-2 text-xl font-semibold tracking-tight text-sand">
                {s.title}
              </h3>
              <p className="text-sm font-light leading-relaxed text-mocha">
                {s.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
