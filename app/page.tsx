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
import { FAQ as FAQ_CONTENIDO } from "@/lib/content";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_CONTENIDO.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function Home() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <LiquidGlassFilter />
      <Backdrop />
      <Nav />
      <main className="relative z-[2]">
        <Hero />
        <Problema />
        <ComoFunciona />
        <Sistema />
        <DemoTeaser />
        <Comparativa />
        <Resultados />
        <Calculadora />
        <Garantia />
        <Planes />
        <FAQ />
        <SobreUpcore />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
