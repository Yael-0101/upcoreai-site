import { RaizIdioma } from "@/components/RaizIdioma";
import { Backdrop } from "@/components/Backdrop";
import { LiquidGlassFilter } from "@/components/LiquidGlassFilter";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAFinal } from "@/components/CTAFinal";
import { FAQ } from "@/components/FAQ";
import { Planes } from "@/components/Planes";
import { Calculadora } from "@/components/Calculadora";
import { Garantia } from "@/components/Garantia";
import { SectionTitle } from "@/components/SectionTitle";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import { paginas } from "@/lib/paginas-textos";
import { LOCALE, type Idioma } from "@/lib/idioma";
import { ruta } from "@/lib/rutas";

export function Precios({ idioma }: { idioma: Idioma }) {
  const t = paginas(idioma).precios;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbJsonLd(
        [
          { nombre: t.migaInicio, path: "/" },
          { nombre: t.migaAqui, path: "/precios" },
        ],
        idioma
      ),
      {
        "@type": "FAQPage",
        inLanguage: LOCALE[idioma].html,
        mainEntity: t.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <RaizIdioma idioma={idioma}>
      <JsonLd data={jsonLd} />
      <LiquidGlassFilter />
      <Backdrop />
      <Nav idioma={idioma} path="/precios" />
      <main className="relative z-[2]">
        {/* Hero */}
        <section className="px-[6%] pb-16 pt-36 text-center md:px-[10%] md:pb-20 md:pt-44">
          <Reveal>
            <div className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-clay-bright">
              {t.eyebrow}
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mx-auto max-w-4xl text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              {t.h1}
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-mocha">
              {t.introA}
              <strong className="font-medium text-sand">{t.introFuerte}</strong>
              {t.introB}
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={ruta(idioma, "/empezar")}
                className="btn-shine w-full rounded-full bg-clay px-8 py-4 font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright sm:w-auto"
              >
                {t.ctaPrimario}
              </a>
              <a
                href={ruta(idioma, "/demo")}
                className="w-full rounded-full border border-[rgba(242,231,219,0.2)] px-8 py-4 font-medium text-sand transition-colors hover:border-clay hover:text-clay-bright sm:w-auto"
              >
                {t.ctaSecundario}
              </a>
            </div>
          </Reveal>
        </section>

        {/* Qué define tu precio */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle title={t.factoresTitulo} sub={t.factoresSub} variant="maskReveal" />
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
            {t.factores.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <div className="card-soft h-full rounded-2xl p-7">
                  <div className="glass-body">
                    <div className="mb-3 text-sm font-semibold text-clay-bright">{f.n}</div>
                    <h3 className="mb-2 font-semibold text-sand">{f.title}</h3>
                    <p className="text-sm font-light leading-relaxed text-mocha">{f.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <Planes idioma={idioma} />

        {/* Transparencia radical */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle title={t.claridadesTitulo} sub={t.claridadesSub} variant="fadeUp" />
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
            {t.claridades.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.06}>
                <div className="card-soft h-full rounded-2xl p-7">
                  <div className="glass-body">
                    <h3 className="mb-2 font-semibold text-sand">{c.title}</h3>
                    <p className="text-sm font-light leading-relaxed text-mocha">{c.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <Calculadora idioma={idioma} />
        <Garantia idioma={idioma} />
        <FAQ idioma={idioma} heading={t.faqTitulo} items={t.faqs} />
        <CTAFinal idioma={idioma} />
      </main>
      <Footer idioma={idioma} />
    </RaizIdioma>
  );
}
