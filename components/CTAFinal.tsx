import { Reveal } from "./Reveal";
import { linkWhatsApp } from "@/lib/content";
import { contenido } from "@/lib/site-textos";
import type { Idioma } from "@/lib/idioma";
import { AgendarCTA } from "./AgendarCTA";

export function CTAFinal({ idioma = "es" }: { idioma?: Idioma }) {
  const CTA_FINAL = contenido(idioma).ctaFinal;
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
            <div className="mt-9 flex justify-center">
              <AgendarCTA
                idioma={idioma}
                label={CTA_FINAL.ctaAgenda}
                className="btn-shine w-full rounded-full bg-clay px-9 py-4 font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright sm:w-auto"
              />
            </div>
            <a
              href={linkWhatsApp(idioma)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block text-sm text-mocha underline-offset-4 transition-colors hover:text-clay-bright hover:underline"
            >
              {CTA_FINAL.ctaWhatsapp}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
