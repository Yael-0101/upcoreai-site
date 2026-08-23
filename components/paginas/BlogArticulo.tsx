import { RaizIdioma } from "@/components/RaizIdioma";
import { Backdrop } from "@/components/Backdrop";
import { LiquidGlassFilter } from "@/components/LiquidGlassFilter";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAFinal } from "@/components/CTAFinal";
import { FAQ } from "@/components/FAQ";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { fechaBonita, type Articulo } from "@/lib/blog";
import { getSolucion } from "@/lib/soluciones";
import { SITE_URL, breadcrumbJsonLd, articleJsonLd } from "@/lib/seo";
import { paginas } from "@/lib/paginas-textos";
import { LOCALE, type Idioma } from "@/lib/idioma";
import { ruta } from "@/lib/rutas";

export function BlogArticulo({ a, idioma }: { a: Articulo; idioma: Idioma }) {
  const c = a.t[idioma];
  const t = paginas(idioma).blog;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      articleJsonLd({
        titulo: c.title,
        descripcion: c.metaDescription,
        path: `/blog/${a.slug}`,
        fechaPublicado: a.fechaPublicado,
        fechaActualizado: a.fechaActualizado,
        imagen: `${SITE_URL}/blog/${a.slug}/opengraph-image`,
        idioma,
      }),
      breadcrumbJsonLd(
        [
          { nombre: t.migaInicio, path: "/" },
          { nombre: t.migaAqui, path: "/blog" },
          { nombre: c.h1, path: `/blog/${a.slug}` },
        ],
        idioma
      ),
      ...(c.faqs
        ? [
            {
              "@type": "FAQPage",
              inLanguage: LOCALE[idioma].html,
              mainEntity: c.faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ],
  };

  const relacionadas = (a.solucionesRelacionadas ?? [])
    .map((s) => getSolucion(s))
    .filter((s) => s !== undefined);

  return (
    <RaizIdioma idioma={idioma}>
      <JsonLd data={jsonLd} />
      <LiquidGlassFilter />
      <Backdrop />
      <Nav idioma={idioma} path={`/blog/${a.slug}`} />
      <main className="relative z-[2]">
        {/* Hero del artículo */}
        <section className="px-[6%] pb-12 pt-36 md:px-[10%] md:pb-14 md:pt-44">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
                <a
                  href={ruta(idioma, "/blog")}
                  className="transition-colors hover:text-clay-bright"
                >
                  {t.migaAqui}
                </a>
                <span className="font-light normal-case tracking-normal text-mocha/70">
                  {fechaBonita(a.fechaPublicado, idioma)}
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="text-[clamp(2rem,5vw,3.2rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
                {c.h1}
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 text-lg font-light leading-relaxed text-mocha">{c.resumen}</p>
            </Reveal>
          </div>
        </section>

        {/* Cuerpo */}
        <article className="px-[6%] pb-10 md:px-[10%]">
          <div className="mx-auto max-w-3xl">
            {c.secciones.map((sec, i) => (
              <Reveal key={sec.h2} delay={Math.min(i * 0.04, 0.2)}>
                <section className="mt-12 first:mt-0">
                  <h2 className="mb-4 text-2xl font-semibold leading-snug tracking-[-0.01em] text-sand">
                    {sec.h2}
                  </h2>
                  {sec.parrafos.map((p) => (
                    <p key={p.slice(0, 40)} className="mb-4 font-light leading-relaxed text-mocha">
                      {p}
                    </p>
                  ))}
                  {sec.lista && (
                    <ul className="mb-4 space-y-2.5 pl-1">
                      {sec.lista.map((item) => (
                        <li
                          key={item.slice(0, 40)}
                          className="flex gap-3 font-light leading-relaxed text-mocha"
                        >
                          <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </Reveal>
            ))}
          </div>
        </article>

        {c.faqs && (
          <FAQ idioma={idioma} heading={paginas(idioma).solucion.faqTitulo} items={c.faqs} />
        )}

        {/* Soluciones relacionadas (enlaces internos) */}
        {relacionadas.length > 0 && (
          <section className="px-[6%] pb-20 md:px-[10%]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 text-sm font-light text-mocha">{t.tambien}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {relacionadas.map((rel) => (
                  <a
                    key={rel.slug}
                    href={ruta(idioma, `/soluciones/${rel.slug}`)}
                    className="rounded-full border border-[rgba(242,231,219,0.2)] px-5 py-2.5 text-sm font-medium text-sand transition-colors hover:border-clay hover:text-clay"
                  >
                    {rel.t[idioma].nombreCorto}
                  </a>
                ))}
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
