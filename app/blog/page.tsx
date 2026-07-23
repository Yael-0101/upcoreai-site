import type { Metadata } from "next";
import { Backdrop } from "@/components/Backdrop";
import { LiquidGlassFilter } from "@/components/LiquidGlassFilter";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAFinal } from "@/components/CTAFinal";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { ARTICULOS, fechaBonita } from "@/lib/blog";
import { metaPagina, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  title: "Blog: guías claras de IA y automatización para clínicas",
  description:
    "Guías sin tecnicismos para dueños de clínica: cuánto cuesta un chatbot de WhatsApp, qué es la IA de verdad, cómo funciona la API de WhatsApp y cuántos pacientes pierdes por no contestar.",
  path: "/blog",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    breadcrumbJsonLd([
      { nombre: "Inicio", path: "/" },
      { nombre: "Blog", path: "/blog" },
    ]),
  ],
};

export default function BlogPage() {
  const articulos = [...ARTICULOS].sort((a, b) =>
    b.fechaPublicado.localeCompare(a.fechaPublicado)
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <LiquidGlassFilter />
      <Backdrop />
      <Nav />
      <main className="relative z-[2]">
        {/* Hero */}
        <section className="px-[6%] pb-14 pt-36 text-center md:px-[10%] md:pb-16 md:pt-44">
          <Reveal>
            <div className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
              Blog
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mx-auto max-w-4xl text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Guías claras, sin tecnicismos.
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-mocha">
              Lo que un dueño de clínica necesita saber sobre IA, WhatsApp y
              automatización — con números reales y cero humo.
            </p>
          </Reveal>
        </section>

        {/* Artículos */}
        <section className="px-[6%] pb-24 md:px-[10%]">
          <div className="mx-auto max-w-3xl space-y-4">
            {articulos.map((a, i) => (
              <Reveal key={a.slug} delay={i * 0.05}>
                <a
                  href={`/blog/${a.slug}`}
                  className="card-soft block rounded-2xl p-7 transition-colors hover:border-clay"
                >
                  <div className="glass-body">
                    <div className="mb-2 text-xs font-light uppercase tracking-[0.08em] text-mocha/70">
                      {fechaBonita(a.fechaPublicado)}
                    </div>
                    <h2 className="mb-2 text-xl font-semibold leading-snug text-sand">
                      {a.h1}
                    </h2>
                    <p className="text-sm font-light leading-relaxed text-mocha">
                      {a.resumen}
                    </p>
                    <div className="mt-3 text-sm font-medium text-clay">
                      Leer la guía →
                    </div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
