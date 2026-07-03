import { Reveal } from "./Reveal";
import { CTA_FINAL, CONTACT } from "@/lib/content";

export function CTAFinal() {
  return (
    <section id="contacto" className="px-[6%] py-28 md:px-[10%] md:py-36">
      <Reveal variant="scaleIn">
        <div className="glass mx-auto max-w-3xl rounded-[40px] p-12 text-center md:p-16">
          <div className="glass-body">
            <h2 className="text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.03em]">
              {CTA_FINAL.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-light leading-relaxed text-mocha">
              {CTA_FINAL.sub}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={CONTACT.calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine w-full rounded-full bg-clay px-8 py-4 font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright sm:w-auto"
              >
                {CTA_FINAL.ctaCalendly}
              </a>
              <a
                href="/empezar"
                className="w-full rounded-full border border-[rgba(242,231,219,0.25)] px-8 py-4 font-semibold text-sand transition-all duration-300 hover:border-clay hover:text-clay sm:w-auto"
              >
                {CTA_FINAL.ctaEmpezar}
              </a>
            </div>
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block text-sm text-mocha underline-offset-4 transition-colors hover:text-clay hover:underline"
            >
              {CTA_FINAL.ctaWhatsapp}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
