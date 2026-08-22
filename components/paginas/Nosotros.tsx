import { RaizIdioma } from "@/components/RaizIdioma";
import { Backdrop } from "@/components/Backdrop";
import { LiquidGlassFilter } from "@/components/LiquidGlassFilter";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAFinal } from "@/components/CTAFinal";
import { SobreUpcore } from "@/components/SobreUpcore";
import { SectionTitle } from "@/components/SectionTitle";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { SOLUCIONES } from "@/lib/soluciones";
import { CONTACT, linkWhatsApp } from "@/lib/content";
import { breadcrumbJsonLd, ORGANIZACION, SITE_URL } from "@/lib/seo";
import { paginas } from "@/lib/paginas-textos";
import { ruta, LOCALE, type Idioma } from "@/lib/idioma";

export function Nosotros({ idioma }: { idioma: Idioma }) {
  const t = paginas(idioma).nosotros;
  const propia = ruta(idioma, "/nosotros");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${SITE_URL}${propia}`,
        url: `${SITE_URL}${propia}`,
        name: t.jsonLdNombre,
        inLanguage: LOCALE[idioma].html,
        mainEntity: { "@id": `${SITE_URL}/#organizacion` },
      },
      breadcrumbJsonLd(
        [
          { nombre: t.migaInicio, path: "/" },
          { nombre: t.migaAqui, path: "/nosotros" },
        ],
        idioma
      ),
    ],
  };

  return (
    <RaizIdioma idioma={idioma}>
      <JsonLd data={jsonLd} />
      <LiquidGlassFilter />
      <Backdrop />
      <Nav idioma={idioma} path="/nosotros" />
      <main className="relative z-[2]">
        {/* Hero */}
        <section className="px-[6%] pb-16 pt-36 text-center md:px-[10%] md:pb-20 md:pt-44">
          <Reveal>
            <div className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
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
              {t.intro}
            </p>
          </Reveal>
        </section>

        {/* Principios */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle title={t.principiosTitulo} sub={t.principiosSub} variant="maskReveal" />
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
            {t.principios.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.06}>
                <div className="card-soft h-full rounded-2xl p-7">
                  <div className="glass-body">
                    <h3 className="mb-2 font-semibold text-sand">{p.title}</h3>
                    <p className="text-sm font-light leading-relaxed text-mocha">{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <SobreUpcore idioma={idioma} />

        {/* Qué construimos (enlaces internos) */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle title={t.queTitulo} sub={t.queSub} variant="fadeUp" />
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3">
            {SOLUCIONES.map((s) => (
              <a
                key={s.slug}
                href={ruta(idioma, `/soluciones/${s.slug}`)}
                className="rounded-full border border-[rgba(242,231,219,0.2)] px-5 py-2.5 text-sm font-medium text-sand transition-colors hover:border-clay hover:text-clay"
              >
                {s.t[idioma].nombreCorto}
              </a>
            ))}
          </div>
        </section>

        {/* Contacto directo */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle title={t.contactoTitulo} sub={t.contactoSub} variant="fadeUp" />
          <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
            <Reveal>
              <a
                href={linkWhatsApp(idioma)}
                className="card-soft block h-full rounded-2xl p-6 transition-colors hover:border-clay"
              >
                <div className="glass-body">
                  <h3 className="mb-1 font-semibold text-sand">{t.whatsapp}</h3>
                  <p className="text-sm font-light text-mocha">{CONTACT.whatsappDisplay}</p>
                </div>
              </a>
            </Reveal>
            <Reveal delay={0.06}>
              {/* Gmail compose en vez de mailto: en compus sin app de correo
                  configurada el mailto "no hace nada" (reporte de Yael 2026-07-23). */}
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${ORGANIZACION.email}&su=${encodeURIComponent(t.correoAsunto)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="card-soft block h-full rounded-2xl p-6 transition-colors hover:border-clay"
              >
                <div className="glass-body">
                  <h3 className="mb-1 font-semibold text-sand">{t.correo}</h3>
                  <p className="break-all text-sm font-light text-mocha">{ORGANIZACION.email}</p>
                  <p className="mt-1 text-xs font-light text-mocha/70">{t.correoPie}</p>
                </div>
              </a>
            </Reveal>
          </div>
        </section>

        <CTAFinal idioma={idioma} />
      </main>
      <Footer idioma={idioma} />
    </RaizIdioma>
  );
}
