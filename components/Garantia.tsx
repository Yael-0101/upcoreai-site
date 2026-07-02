import { Reveal } from "./Reveal";
import { Icon } from "./Icons";
import { GARANTIA } from "@/lib/content";

export function Garantia() {
  return (
    <section className="px-[6%] py-16 md:px-[10%]">
      <Reveal variant="scaleIn">
        <div className="glass mx-auto max-w-3xl rounded-[36px] p-10 text-center md:p-12">
          <div className="glass-body">
            <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(200,98,61,0.35)] bg-[rgba(200,98,61,0.1)] text-clay">
              <Icon name="IconShield" className="h-7 w-7" />
            </span>
            <h2 className="mb-3 text-2xl font-semibold tracking-tight md:text-3xl">
              {GARANTIA.heading}
            </h2>
            <p className="mx-auto max-w-xl text-lg font-light leading-relaxed text-sand/90">
              {GARANTIA.body}
            </p>
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.15em] text-clay">
              {GARANTIA.note}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
