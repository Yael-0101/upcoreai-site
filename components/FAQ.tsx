import { SectionTitle } from "./SectionTitle";
import { Reveal } from "./Reveal";
import { FAQ as FAQ_DATA } from "@/lib/content";

export function FAQ() {
  return (
    <section id="faq" className="px-[6%] py-24 md:px-[10%] md:py-32">
      <SectionTitle title={FAQ_DATA.heading} variant="maskReveal" />
      <div className="mx-auto max-w-3xl space-y-3">
        {FAQ_DATA.items.map((f, i) => (
          <Reveal key={f.q} delay={i * 0.05}>
            <details className="glass group rounded-2xl">
              <summary className="glass-body flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-left font-medium text-sand [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="shrink-0 text-xl text-clay transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="glass-body px-6 pb-5 text-sm font-light leading-relaxed text-mocha">
                {f.a}
              </div>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
