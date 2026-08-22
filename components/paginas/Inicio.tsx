import { RaizIdioma } from "@/components/RaizIdioma";
import { Backdrop } from "@/components/Backdrop";
import { LiquidGlassFilter } from "@/components/LiquidGlassFilter";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Problema } from "@/components/Problema";
import { ComoFunciona } from "@/components/ComoFunciona";
import { Sistema } from "@/components/Sistema";
import { DemoTeaser } from "@/components/DemoTeaser";
import { Comparativa } from "@/components/Comparativa";
import { Resultados } from "@/components/Resultados";
import { Calculadora } from "@/components/Calculadora";
import { Garantia } from "@/components/Garantia";
import { Planes } from "@/components/Planes";
import { FAQ } from "@/components/FAQ";
import { SobreUpcore } from "@/components/SobreUpcore";
import { CTAFinal } from "@/components/CTAFinal";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { contenido } from "@/lib/site-textos";
import { LOCALE, type Idioma } from "@/lib/idioma";

// El CUERPO de la portada, en el idioma que se le pida. `app/page.tsx` (español) y
// `app/en/page.tsx` (inglés) son envoltorios de cinco líneas que solo lo llaman con
// su idioma y su metadata. Así no hay dos portadas que mantener.
export function Inicio({ idioma }: { idioma: Idioma }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: LOCALE[idioma].html,
    mainEntity: contenido(idioma).faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <RaizIdioma idioma={idioma}>
      <JsonLd data={faqJsonLd} />
      <LiquidGlassFilter />
      <Backdrop />
      <Nav idioma={idioma} path="/" />
      <main className="relative z-[2]">
        <Hero idioma={idioma} />
        <Problema idioma={idioma} />
        <ComoFunciona idioma={idioma} />
        <Sistema idioma={idioma} />
        <DemoTeaser idioma={idioma} />
        <Comparativa idioma={idioma} />
        <Resultados idioma={idioma} />
        <Calculadora idioma={idioma} />
        <Garantia idioma={idioma} />
        <Planes idioma={idioma} />
        <FAQ idioma={idioma} />
        <SobreUpcore idioma={idioma} />
        <CTAFinal idioma={idioma} />
      </main>
      <Footer idioma={idioma} />
    </RaizIdioma>
  );
}
