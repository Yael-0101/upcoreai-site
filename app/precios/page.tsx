import type { Metadata } from "next";
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
import { metaPagina, breadcrumbJsonLd } from "@/lib/seo";

const title = "Precios: así se calcula tu inversión, sin letra chica";
const description =
  "Nada de precios escondidos ni módulos sorpresa: te explicamos qué define tu inversión, qué incluye, y tu precio exacto sale gratis en 3 minutos con el diagnóstico.";

export const metadata: Metadata = metaPagina({
  title,
  description,
  path: "/precios",
});

// Qué define el precio de cada proyecto (los 4 factores reales).
const FACTORES = [
  {
    n: "01",
    title: "El alcance",
    body: "No es lo mismo un agente de WhatsApp que un sistema completo con panel, automatizaciones y web. Puedes empezar con una pieza y crecer después.",
  },
  {
    n: "02",
    title: "Quién lo opera",
    body: "Llave en Mano (pago único, tú lo operas) o Gestionado (mensualidad, nosotros lo operamos, mantenemos y mejoramos por ti).",
  },
  {
    n: "03",
    title: "El tamaño de tu clínica",
    body: "Volumen de mensajes y citas, número de sillones o consultorios, sucursales. Cobrarle igual a todos sería inflarle el precio a alguien.",
  },
  {
    n: "04",
    title: "Tus integraciones",
    body: "A qué nos conectamos: tu calendario, tu software de agenda o expediente, tu hoja de cálculo. Integrar lo que ya usas es parte del proyecto.",
  },
];

// Transparencia radical: lo que en otros lados es letra chica, aquí es política.
const CLARIDADES = [
  {
    title: "La implementación va incluida",
    body: "La puesta en marcha, las pruebas y la capacitación son parte del proyecto — no un cargo sorpresa aparte.",
  },
  {
    title: "Sin módulos sorpresa",
    body: "Lo acordado incluye lo acordado. No te cobramos aparte “el módulo de WhatsApp”, “la app” o “el CRM” a medio camino.",
  },
  {
    title: "Sin cobros por usuario",
    body: "Tu equipo completo puede usar el sistema. No pagas más por cada persona que se conecta.",
  },
  {
    title: "Las APIs, a TU nombre y con tope",
    body: "El consumo de WhatsApp e inteligencia artificial se paga directo al proveedor, en tus cuentas, con tope de gasto activado. No lo intermediamos ni le ganamos de más.",
  },
];

const FAQS_PRECIOS = [
  {
    q: "¿Por qué no publican una lista de precios?",
    a: "Porque sería mentirte: cobrarle lo mismo a un consultorio de un doctor que a una clínica de cinco sillones es inflarle el precio a uno de los dos. En lugar de una tabla genérica, tu diagnóstico gratis te da tu precio exacto en 3 minutos, con los números de TU clínica.",
  },
  {
    q: "¿Hay mensualidad obligatoria?",
    a: "No. En Llave en Mano pagas una sola vez y el sistema es tuyo. La mensualidad solo existe si eliges el plan Gestionado, donde nosotros lo operamos, mantenemos y mejoramos por ti.",
  },
  {
    q: "¿Cuánto cuestan las APIs (WhatsApp, IA)?",
    a: "Depende de tu volumen, y se paga directo al proveedor en TUS cuentas — típicamente desde unos cientos de pesos al mes en clínicas chicas. Siempre con tope de gasto activado y visible para ti. En tu diagnóstico te damos el estimado con tus números.",
  },
  {
    q: "¿Piden todo el pago por adelantado?",
    a: "No. Se arranca con un anticipo del 50% y el resto se paga contra entrega, con todo funcionando y probado.",
  },
  {
    q: "¿Qué incluye el precio del proyecto?",
    a: "Construcción completa, integración con tus herramientas, pruebas contigo, capacitación con video y guía de 1 página, y la garantía de entrega con 30 días de ajustes.",
  },
  {
    q: "¿Y si mi presupuesto es limitado?",
    a: "Empezamos por la pieza que más dinero te recupera (casi siempre el agente de WhatsApp) y el sistema crece después, cuando ya se está pagando solo. También existe el plan Gestionado sin inversión inicial fuerte.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    breadcrumbJsonLd([
      { nombre: "Inicio", path: "/" },
      { nombre: "Precios", path: "/precios" },
    ]),
    {
      "@type": "FAQPage",
      mainEntity: FAQS_PRECIOS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function PreciosPage() {
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
              Precios claros
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mx-auto max-w-4xl text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Sin precios escondidos. Sin letra chica.
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-mocha">
              Otros te piden “solicitar cotización” y te contestan cuando pueden, o
              publican un precio que luego se infla módulo por módulo. Aquí es al
              revés: te explicamos exactamente cómo se calcula tu inversión — y tu
              precio exacto sale <strong className="font-medium text-sand">gratis, al instante,</strong>{" "}
              con tu diagnóstico de 3 minutos.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/empezar"
                className="btn-shine w-full rounded-full bg-clay px-8 py-4 font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright sm:w-auto"
              >
                Mi precio exacto en 3 minutos →
              </a>
              <a
                href="/demo"
                className="w-full rounded-full border border-[rgba(242,231,219,0.2)] px-8 py-4 font-medium text-sand transition-colors hover:border-clay hover:text-clay sm:w-auto"
              >
                Primero quiero probar la demo
              </a>
            </div>
          </Reveal>
        </section>

        {/* Qué define tu precio */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle
            title="Qué define tu inversión"
            sub="Cuatro factores — los mismos que revisamos contigo en el diagnóstico."
            variant="maskReveal"
          />
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
            {FACTORES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <div className="card-soft h-full rounded-2xl p-7">
                  <div className="glass-body">
                    <div className="mb-3 text-sm font-semibold text-clay">{f.n}</div>
                    <h3 className="mb-2 font-semibold text-sand">{f.title}</h3>
                    <p className="text-sm font-light leading-relaxed text-mocha">
                      {f.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <Planes />

        {/* Transparencia radical */}
        <section className="px-[6%] py-20 md:px-[10%] md:py-24">
          <SectionTitle
            title="Lo que en otros lados es letra chica"
            sub="Políticas fijas de Upcore, en cualquier plan."
            variant="fadeUp"
          />
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
            {CLARIDADES.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.06}>
                <div className="card-soft h-full rounded-2xl p-7">
                  <div className="glass-body">
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

        <Calculadora />
        <Garantia />
        <FAQ heading="Preguntas sobre precios" items={FAQS_PRECIOS} />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
