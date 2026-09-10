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
import { breadcrumbJsonLd, preciosJsonLd } from "@/lib/seo";
import { paginas } from "@/lib/paginas-textos";
import { LOCALE, type Idioma } from "@/lib/idioma";
import { ruta } from "@/lib/rutas";
// 🔴 Las cifras salen de la FUENTE ÚNICA, nunca escritas a mano aquí (2026-09-10). Antes
// esta página prometía «cada pieza tiene un precio cerrado, lo ves abajo» y abajo no había
// ninguna: para verlas había que terminar el cuestionario de la calculadora. Y el guion de
// llamadas afirma por teléfono que están publicadas, así que la promesa era falsa por dos
// lados. Los precios ya se publicaban en los datos estructurados para Google (preciosJsonLd,
// justo abajo) — o sea que el buscador los veía y la persona no.
import { PANEL_ADICIONAL, PRODUCTO_OPTIONS, opcionEn, precioFijo } from "@/lib/calc";

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
      // Los precios propios como datos estructurados — leídos de lib/calc.ts.
      preciosJsonLd(idioma),
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

        {/* El precio de cada pieza, a la vista y sin cuestionario de por medio. */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle title={t.tablaTitulo} sub={t.tablaSub} variant="fadeUp" />
          <Reveal>
            <div className="card-soft mx-auto max-w-3xl rounded-2xl p-4 sm:p-7">
              <div className="glass-body">
                {/* Sin ancho mínimo: en un teléfono angosto los precios se apilan, no se
                    esconden detrás de un desplazamiento lateral que nadie descubre. */}
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[rgba(242,231,219,0.15)]">
                      <th className="py-3 pr-3 text-xs font-semibold uppercase tracking-[0.14em] text-mocha">
                        {t.tablaCabPieza}
                      </th>
                      <th className="py-3 pl-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-mocha">
                        {t.tablaCabPrecio}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRODUCTO_OPTIONS.map((p) => {
                      const o = opcionEn(p, idioma);
                      return (
                        <tr key={p.val} className="border-b border-[rgba(242,231,219,0.08)]">
                          <td className="py-4 pr-3 align-top">
                            <div className="font-medium text-sand">{o.label}</div>
                            <div className="mt-1 text-sm font-light leading-relaxed text-mocha">
                              {o.desc}
                            </div>
                          </td>
                          <td className="whitespace-nowrap py-4 pl-3 text-right align-top font-semibold text-sand">
                            {precioFijo(p.setupUSD).principal}
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td className="py-4 pr-3 align-top font-medium text-sand">{t.tablaPanel}</td>
                      <td className="whitespace-nowrap py-4 pl-3 text-right align-top font-semibold text-sand">
                        {precioFijo(PANEL_ADICIONAL.setupUSD).principal}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="mt-5 border-t border-[rgba(242,231,219,0.15)] pt-5 text-sm font-medium text-clay-bright">
                  {t.tablaDescuento}
                </p>
                <p className="mt-3 text-sm font-light leading-relaxed text-mocha">{t.tablaNota}</p>
              </div>
            </div>
          </Reveal>
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
