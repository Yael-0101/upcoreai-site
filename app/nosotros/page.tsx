import type { Metadata } from "next";
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
import { CONTACT } from "@/lib/content";
import { metaPagina, breadcrumbJsonLd, ORGANIZACION, SITE_URL } from "@/lib/seo";

const title = "Quiénes somos";
const description =
  "Upcore AI (upcoreai.com) es una agencia mexicana de automatización con IA especializada en clínicas privadas: agentes de WhatsApp, automatizaciones y sistemas que quedan a tu nombre.";

export const metadata: Metadata = metaPagina({
  title,
  description,
  path: "/nosotros",
});

// Los principios con los que trabajamos — la diferencia real contra un SaaS.
const PRINCIPIOS = [
  {
    title: "Nos integramos, no te migramos",
    body: "Tu agenda, tu software, tu hoja de cálculo se quedan. Construimos encima de lo que ya usas — no te obligamos a mudar tu clínica a nuestra plataforma.",
  },
  {
    title: "Todo queda a tu nombre",
    body: "Cuentas, número de WhatsApp, APIs y datos son tuyos desde el día uno. Si mañana no seguimos juntos, tu sistema sigue funcionando y sigue siendo tuyo.",
  },
  {
    title: "Hecho por ti, no hazlo-tú-mismo",
    body: "Nada de trials para que lo configures solo: lo construimos, lo probamos contigo y te lo entregamos funcionando, con video y guía. Y si quieres, lo operamos por ti.",
  },
  {
    title: "Honestidad en los números",
    body: "Estimaciones conservadoras, supuestos a la vista y cero cifras infladas. Si a tu volumen algo no te conviene, te lo decimos — aunque vendamos menos.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${SITE_URL}/nosotros`,
      url: `${SITE_URL}/nosotros`,
      name: "Quiénes somos — Upcore AI",
      inLanguage: "es-MX",
      mainEntity: { "@id": `${SITE_URL}/#organizacion` },
    },
    breadcrumbJsonLd([
      { nombre: "Inicio", path: "/" },
      { nombre: "Nosotros", path: "/nosotros" },
    ]),
  ],
};

export default function NosotrosPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <LiquidGlassFilter />
      <Backdrop />
      <Nav />
      <main className="relative z-[2]">
        {/* Hero */}
        <section className="px-[6%] pb-16 pt-36 text-center md:px-[10%] md:pb-20 md:pt-44">
          <Reveal>
            <div className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
              Nosotros
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mx-auto max-w-4xl text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Automatización con IA, hecha para clínicas.
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-mocha">
              Upcore AI es una agencia mexicana que construye agentes de
              inteligencia artificial, automatizaciones y sistemas completos para
              clínicas privadas de salud y estética. No vendemos software genérico:
              construimos el sistema de TU clínica, y todo queda a tu nombre.
            </p>
          </Reveal>
        </section>

        {/* Principios */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle
            title="Cómo trabajamos"
            sub="Cuatro principios fijos — aplican en cualquier plan y en cualquier proyecto."
            variant="maskReveal"
          />
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
            {PRINCIPIOS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.06}>
                <div className="card-soft h-full rounded-2xl p-7">
                  <div className="glass-body">
                    <h3 className="mb-2 font-semibold text-sand">{p.title}</h3>
                    <p className="text-sm font-light leading-relaxed text-mocha">
                      {p.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <SobreUpcore />

        {/* Qué construimos (enlaces internos) */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle
            title="Qué construimos"
            sub="Cada solución tiene su propia página, con el paso a paso y sus preguntas frecuentes."
            variant="fadeUp"
          />
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3">
            {SOLUCIONES.map((s) => (
              <a
                key={s.slug}
                href={`/soluciones/${s.slug}`}
                className="rounded-full border border-[rgba(242,231,219,0.2)] px-5 py-2.5 text-sm font-medium text-sand transition-colors hover:border-clay hover:text-clay"
              >
                {s.nombreCorto}
              </a>
            ))}
            <a
              href="/casos/clinica-dental-ejemplo"
              className="rounded-full border border-[rgba(242,231,219,0.2)] px-5 py-2.5 text-sm font-medium text-sand transition-colors hover:border-clay hover:text-clay"
            >
              Caso: clínica dental
            </a>
          </div>
        </section>

        {/* Contacto directo */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle
            title="Habla directo con nosotros"
            sub="Sin menús telefónicos ni tickets de soporte."
            variant="fadeUp"
          />
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
            <Reveal>
              <a href={CONTACT.whatsapp} className="card-soft block h-full rounded-2xl p-6 transition-colors hover:border-clay">
                <div className="glass-body">
                  <h3 className="mb-1 font-semibold text-sand">WhatsApp</h3>
                  <p className="text-sm font-light text-mocha">{CONTACT.whatsappDisplay}</p>
                </div>
              </a>
            </Reveal>
            <Reveal delay={0.06}>
              {/* Gmail compose en vez de mailto: en compus sin app de correo
                  configurada el mailto "no hace nada" (reporte de Yael 2026-07-23). */}
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${ORGANIZACION.email}&su=${encodeURIComponent("Consulta para Upcore AI")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="card-soft block h-full rounded-2xl p-6 transition-colors hover:border-clay"
              >
                <div className="glass-body">
                  <h3 className="mb-1 font-semibold text-sand">Correo</h3>
                  <p className="break-all text-sm font-light text-mocha">{ORGANIZACION.email}</p>
                  <p className="mt-1 text-xs font-light text-mocha/70">Clic para escribirnos →</p>
                </div>
              </a>
            </Reveal>
            <Reveal delay={0.12}>
              <a href={CONTACT.calendly} className="card-soft block h-full rounded-2xl p-6 transition-colors hover:border-clay">
                <div className="glass-body">
                  <h3 className="mb-1 font-semibold text-sand">Videollamada</h3>
                  <p className="text-sm font-light text-mocha">Diagnóstico gratis de 15 min</p>
                </div>
              </a>
            </Reveal>
          </div>
        </section>

        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
