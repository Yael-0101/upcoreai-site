import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Backdrop } from "@/components/Backdrop";
import { LiquidGlassFilter } from "@/components/LiquidGlassFilter";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAFinal } from "@/components/CTAFinal";
import { FAQ } from "@/components/FAQ";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { ARTICULOS, getArticulo, fechaBonita } from "@/lib/blog";
import { getSolucion } from "@/lib/soluciones";
import { SITE_URL, metaPagina, breadcrumbJsonLd, articleJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return ARTICULOS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticulo(slug);
  if (!a) return {};
  return metaPagina({
    title: a.title,
    description: a.metaDescription,
    path: `/blog/${a.slug}`,
    tipo: "article",
  });
}

export default async function ArticuloPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArticulo(slug);
  if (!a) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      articleJsonLd({
        titulo: a.title,
        descripcion: a.metaDescription,
        path: `/blog/${a.slug}`,
        fechaPublicado: a.fechaPublicado,
        fechaActualizado: a.fechaActualizado,
        imagen: `${SITE_URL}/blog/${a.slug}/opengraph-image`,
      }),
      breadcrumbJsonLd([
        { nombre: "Inicio", path: "/" },
        { nombre: "Blog", path: "/blog" },
        { nombre: a.h1, path: `/blog/${a.slug}` },
      ]),
      ...(a.faqs
        ? [
            {
              "@type": "FAQPage",
              mainEntity: a.faqs.map((f) => ({
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
    <>
      <JsonLd data={jsonLd} />
      <LiquidGlassFilter />
      <Backdrop />
      <Nav />
      <main className="relative z-[2]">
        {/* Hero del artículo */}
        <section className="px-[6%] pb-12 pt-36 md:px-[10%] md:pb-14 md:pt-44">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
                <a href="/blog" className="transition-colors hover:text-clay-bright">
                  Blog
                </a>
                <span className="font-light normal-case tracking-normal text-mocha/70">
                  {fechaBonita(a.fechaPublicado)}
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="text-[clamp(2rem,5vw,3.2rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
                {a.h1}
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 text-lg font-light leading-relaxed text-mocha">
                {a.resumen}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Cuerpo */}
        <article className="px-[6%] pb-10 md:px-[10%]">
          <div className="mx-auto max-w-3xl">
            {a.secciones.map((sec, i) => (
              <Reveal key={sec.h2} delay={Math.min(i * 0.04, 0.2)}>
                <section className="mt-12 first:mt-0">
                  <h2 className="mb-4 text-2xl font-semibold leading-snug tracking-[-0.01em] text-sand">
                    {sec.h2}
                  </h2>
                  {sec.parrafos.map((p) => (
                    <p
                      key={p.slice(0, 40)}
                      className="mb-4 font-light leading-relaxed text-mocha"
                    >
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

        {a.faqs && <FAQ heading="Preguntas frecuentes" items={a.faqs} />}

        {/* Soluciones relacionadas (enlaces internos) */}
        {relacionadas.length > 0 && (
          <section className="px-[6%] pb-20 md:px-[10%]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 text-sm font-light text-mocha">
                Esto lo resolvemos por ti:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {relacionadas.map((rel) => (
                  <a
                    key={rel.slug}
                    href={`/soluciones/${rel.slug}`}
                    className="rounded-full border border-[rgba(242,231,219,0.2)] px-5 py-2.5 text-sm font-medium text-sand transition-colors hover:border-clay hover:text-clay"
                  >
                    {rel.nombreCorto}
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
