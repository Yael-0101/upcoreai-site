import { SectionTitle } from "./SectionTitle";
import { Reveal } from "./Reveal";
import { FAQ as FAQ_DATA } from "@/lib/content";

export function FAQ({
  heading = FAQ_DATA.heading,
  items = FAQ_DATA.items,
}: {
  heading?: string;
  items?: { q: string; a: string }[];
} = {}) {
  return (
    <section id="faq" className="px-[6%] py-24 md:px-[10%] md:py-32">
      <SectionTitle title={heading} variant="maskReveal" />
      <div className="mx-auto max-w-3xl space-y-3">
        {items.map((f, i) => (
          <Reveal key={f.q} delay={i * 0.05}>
            <details className="card-soft group rounded-2xl">
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
