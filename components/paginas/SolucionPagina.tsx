import { RaizIdioma } from "@/components/RaizIdioma";
import { Backdrop } from "@/components/Backdrop";
import { LiquidGlassFilter } from "@/components/LiquidGlassFilter";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAFinal } from "@/components/CTAFinal";
import { FAQ } from "@/components/FAQ";
import { SectionTitle } from "@/components/SectionTitle";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { DemoVoz } from "@/components/DemoVoz";
import { getSolucion, type Solucion } from "@/lib/soluciones";
import { contenido } from "@/lib/site-textos";
import { paginas } from "@/lib/paginas-textos";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo";
import { LOCALE, type Idioma } from "@/lib/idioma";
import { ruta } from "@/lib/rutas";

export const SLUG_VOZ = "agente-de-voz-para-inmobiliarias";

export function SolucionPagina({ s, idioma }: { s: Solucion; idioma: Idioma }) {
  const c = s.t[idioma];
  const t = paginas(idioma).solucion;
  // La demo de voz solo vive en su propia página (se cobra por minuto: ver /api/demo-voz)
  const esVoz = s.slug === SLUG_VOZ;
  const propia = ruta(idioma, `/soluciones/${s.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: c.eyebrow,
        description: c.metaDescription,
        url: `${SITE_URL}${propia}`,
        provider: { "@id": `${SITE_URL}/#organizacion` },
        areaServed: { "@type": "AdministrativeArea", name: "South Florida, United States" },
      },
      {
        "@type": "FAQPage",
        inLanguage: LOCALE[idioma].html,
        mainEntity: c.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      // 2 niveles a propósito: no existe una página índice /soluciones.
      breadcrumbJsonLd(
        [
          { nombre: t.migaInicio, path: "/" },
          { nombre: c.nombreCorto, path: `/soluciones/${s.slug}` },
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
      <Nav idioma={idioma} path={`/soluciones/${s.slug}`} />
      <main className="relative z-[2]">
        {/* Hero */}
        <section className="px-[6%] pb-16 pt-36 text-center md:px-[10%] md:pb-24 md:pt-44">
          <Reveal>
            <div className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
              {c.eyebrow}
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mx-auto max-w-4xl text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              {c.h1}
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-mocha">
              {c.intro}
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={esVoz ? "#demo-voz" : `${ruta(idioma, "/demo")}?g=${s.giroDemo}`}
                className="btn-shine w-full rounded-full bg-clay px-8 py-4 font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright sm:w-auto"
              >
                {esVoz ? t.ctaVoz : t.ctaDemo}
              </a>
              <a
                href={ruta(idioma, "/empezar")}
                className="w-full rounded-full border border-[rgba(242,231,219,0.2)] px-8 py-4 font-medium text-sand transition-colors hover:border-clay hover:text-clay sm:w-auto"
              >
                {t.ctaDiagnostico}
              </a>
            </div>
          </Reveal>
        </section>

        {/* Demo de voz en vivo — solo en la página del agente de voz */}
        {esVoz && (
          <section id="demo-voz" className="scroll-mt-24 px-[6%] pb-4 md:px-[10%]">
            <div className="mx-auto max-w-3xl">
              <Reveal>
                <DemoVoz giro={s.giroDemo} idioma={idioma} />
              </Reveal>
            </div>
          </section>
        )}

        {/* Dolores */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle title={t.doloresTitulo} variant="maskReveal" />
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
            {c.dolores.map((d, i) => (
              <Reveal key={d.title} delay={i * 0.08}>
                <div className="card-soft h-full rounded-2xl p-7">
                  <div className="glass-body">
                    <h3 className="mb-2 font-semibold text-sand">{d.title}</h3>
                    <p className="text-sm font-light leading-relaxed text-mocha">{d.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Cómo ayuda */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle title={t.comoTitulo} sub={t.comoSub} variant="fadeUp" />
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
            {c.comoAyuda.map((x, i) => (
              <Reveal key={x.title} delay={i * 0.08}>
                <div className="card-soft h-full rounded-2xl p-7">
                  <div className="glass-body">
                    <div className="mb-3 text-sm font-semibold text-clay">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mb-2 font-semibold text-sand">{x.title}</h3>
                    <p className="text-sm font-light leading-relaxed text-mocha">{x.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Cómo funciona, paso a paso */}
        {c.pasos && (
          <section className="px-[6%] py-20 md:px-[10%] md:py-24">
            <SectionTitle title={t.pasosTitulo} sub={t.pasosSub} variant="fadeUp" />
            <div className="mx-auto max-w-3xl space-y-3">
              {c.pasos.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.05}>
                  <div className="card-soft rounded-2xl p-6">
                    <div className="glass-body flex gap-5">
                      <div className="pt-0.5 text-sm font-semibold text-clay">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-sand">{p.title}</h3>
                        <p className="text-sm font-light leading-relaxed text-mocha">{p.body}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Stats */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <Reveal variant="fadeUp">
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-[rgba(242,231,219,0.1)] bg-[rgba(242,231,219,0.08)] sm:grid-cols-4">
              {c.stats.map((st) => (
                <div key={st.label} className="bg-[#1c1613] px-4 py-10 text-center">
                  <div className="text-gradient text-[clamp(1.9rem,5vw,2.7rem)] font-semibold tracking-tight">
                    {st.value}
                  </div>
                  <div className="mt-2 text-xs font-light uppercase tracking-[0.08em] text-mocha">
                    {st.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-8 max-w-2xl text-center text-xs font-light leading-relaxed text-mocha/60">
              {contenido(idioma).resultados.disclaimer}
            </p>
          </Reveal>
        </section>

        {/* Integraciones */}
        {c.integraciones && (
          <section className="px-[6%] py-20 md:px-[10%] md:py-24">
            <SectionTitle
              title={t.integracionesTitulo}
              sub={t.integracionesSub}
              variant="fadeUp"
            />
            <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
              {c.integraciones.map((it, i) => (
                <Reveal key={it.nombre} delay={i * 0.06}>
                  <div className="card-soft h-full rounded-2xl p-6">
                    <div className="glass-body">
                      <h3 className="mb-1 font-semibold text-sand">{it.nombre}</h3>
                      <p className="text-sm font-light leading-relaxed text-mocha">{it.detalle}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Seguridad y propiedad */}
        {c.seguridad && (
          <section className="px-[6%] py-20 md:px-[10%] md:py-24">
            <SectionTitle title={t.seguridadTitulo} variant="fadeUp" />
            <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
              {c.seguridad.map((sg, i) => (
                <Reveal key={sg.title} delay={i * 0.08}>
                  <div className="card-soft h-full rounded-2xl p-7">
                    <div className="glass-body">
                      <h3 className="mb-2 font-semibold text-sand">{sg.title}</h3>
                      <p className="text-sm font-light leading-relaxed text-mocha">{sg.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <FAQ idioma={idioma} heading={t.faqTitulo} items={c.faqs} />

        {/* Soluciones relacionadas (enlaces internos) */}
        {s.relacionadas && s.relacionadas.length > 0 && (
          <section className="px-[6%] pb-20 md:px-[10%]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 text-sm font-light text-mocha">{t.tambien}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {s.relacionadas.map((slugRel) => {
                  const rel = getSolucion(slugRel);
                  if (!rel) return null;
                  return (
                    <a
                      key={slugRel}
                      href={ruta(idioma, `/soluciones/${rel.slug}`)}
                      className="rounded-full border border-[rgba(242,231,219,0.2)] px-5 py-2.5 text-sm font-medium text-sand transition-colors hover:border-clay hover:text-clay"
                    >
                      {rel.t[idioma].nombreCorto}
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <CTAFinal idioma={idioma} />
      </main>
      <Footer idioma={idioma} />
    </RaizIdioma>
  );
}
