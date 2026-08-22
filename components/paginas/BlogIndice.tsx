import { RaizIdioma } from "@/components/RaizIdioma";
import { Backdrop } from "@/components/Backdrop";
import { LiquidGlassFilter } from "@/components/LiquidGlassFilter";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CTAFinal } from "@/components/CTAFinal";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { ARTICULOS, fechaBonita } from "@/lib/blog";
import { breadcrumbJsonLd } from "@/lib/seo";
import { paginas } from "@/lib/paginas-textos";
import { ruta, type Idioma } from "@/lib/idioma";

export function BlogIndice({ idioma }: { idioma: Idioma }) {
  const t = paginas(idioma).blog;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbJsonLd(
        [
          { nombre: t.migaInicio, path: "/" },
          { nombre: t.migaAqui, path: "/blog" },
        ],
        idioma
      ),
    ],
  };

  const articulos = [...ARTICULOS].sort((a, b) =>
    b.fechaPublicado.localeCompare(a.fechaPublicado)
  );

  return (
    <RaizIdioma idioma={idioma}>
      <JsonLd data={jsonLd} />
      <LiquidGlassFilter />
      <Backdrop />
      <Nav idioma={idioma} path="/blog" />
      <main className="relative z-[2]">
        {/* Hero */}
        <section className="px-[6%] pb-14 pt-36 text-center md:px-[10%] md:pb-16 md:pt-44">
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

        {/* Artículos */}
        <section className="px-[6%] pb-24 md:px-[10%]">
          <div className="mx-auto max-w-3xl space-y-4">
            {articulos.map((a, i) => (
              <Reveal key={a.slug} delay={i * 0.05}>
                <a
                  href={ruta(idioma, `/blog/${a.slug}`)}
                  className="card-soft block rounded-2xl p-7 transition-colors hover:border-clay"
                >
                  <div className="glass-body">
                    <div className="mb-2 text-xs font-light uppercase tracking-[0.08em] text-mocha/70">
                      {fechaBonita(a.fechaPublicado, idioma)}
                    </div>
                    <h2 className="mb-2 text-xl font-semibold leading-snug text-sand">
                      {a.t[idioma].h1}
                    </h2>
                    <p className="text-sm font-light leading-relaxed text-mocha">
                      {a.t[idioma].resumen}
                    </p>
                    <div className="mt-3 text-sm font-medium text-clay">{t.leer}</div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        <CTAFinal idioma={idioma} />
      </main>
      <Footer idioma={idioma} />
    </RaizIdioma>
  );
}
