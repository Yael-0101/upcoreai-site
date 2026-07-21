import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Backdrop } from "@/components/Backdrop";
import { LiquidGlassFilter } from "@/components/LiquidGlassFilter";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAFinal } from "@/components/CTAFinal";
import { FAQ } from "@/components/FAQ";
import { SectionTitle } from "@/components/SectionTitle";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { SOLUCIONES, getSolucion } from "@/lib/soluciones";
import { RESULTADOS } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return SOLUCIONES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getSolucion(slug);
  if (!s) return {};
  return {
    title: s.title,
    description: s.metaDescription,
    alternates: { canonical: `/soluciones/${s.slug}` },
    openGraph: { title: s.title, description: s.metaDescription },
  };
}

export default async function SolucionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getSolucion(slug);
  if (!s) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: s.eyebrow,
        description: s.metaDescription,
        url: `${SITE_URL}/soluciones/${s.slug}`,
        provider: { "@id": `${SITE_URL}/#organizacion` },
        areaServed: { "@type": "Country", name: "México" },
      },
      {
        "@type": "FAQPage",
        mainEntity: s.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <LiquidGlassFilter />
      <Backdrop />
      <Nav />
      <main className="relative z-[2]">
        {/* Hero */}
        <section className="px-[6%] pb-16 pt-36 text-center md:px-[10%] md:pb-24 md:pt-44">
          <Reveal>
            <div className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
              {s.eyebrow}
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mx-auto max-w-4xl text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              {s.h1}
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-mocha">
              {s.intro}
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={`/demo?g=${s.giroDemo}`}
                className="btn-shine w-full rounded-full bg-clay px-8 py-4 font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright sm:w-auto"
              >
                Pruébalo en la demo
              </a>
              <a
                href="/empezar"
                className="w-full rounded-full border border-[rgba(242,231,219,0.2)] px-8 py-4 font-medium text-sand transition-colors hover:border-clay hover:text-clay sm:w-auto"
              >
                Empieza tu diagnóstico gratis
              </a>
            </div>
          </Reveal>
        </section>

        {/* Dolores */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle title="¿Te está pasando esto?" variant="maskReveal" />
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
            {s.dolores.map((d, i) => (
              <Reveal key={d.title} delay={i * 0.08}>
                <div className="card-soft h-full rounded-2xl p-7">
                  <div className="glass-body">
                    <h3 className="mb-2 font-semibold text-sand">{d.title}</h3>
                    <p className="text-sm font-light leading-relaxed text-mocha">
                      {d.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Cómo ayuda */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle
            title="Así lo resolvemos"
            sub="Lo construimos por ti, lo conectamos a tus herramientas y tú no tienes que aprender nada técnico."
            variant="fadeUp"
          />
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
            {s.comoAyuda.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <div className="card-soft h-full rounded-2xl p-7">
                  <div className="glass-body">
                    <div className="mb-3 text-sm font-semibold text-clay">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mb-2 font-semibold text-sand">{c.title}</h3>
                    <p className="text-sm font-light leading-relaxed text-mocha">
                      {c.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <Reveal variant="fadeUp">
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-[rgba(242,231,219,0.1)] bg-[rgba(242,231,219,0.08)] sm:grid-cols-4">
              {s.stats.map((st) => (
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
              {RESULTADOS.disclaimer}
            </p>
          </Reveal>
        </section>

        <FAQ heading="Preguntas frecuentes" items={s.faqs} />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
