import { Backdrop } from "@/components/Backdrop";
import { LiquidGlassFilter } from "@/components/LiquidGlassFilter";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Problema } from "@/components/Problema";
import { ComoFunciona } from "@/components/ComoFunciona";
import { Sistema } from "@/components/Sistema";
import { DemoTeaser } from "@/components/DemoTeaser";
import { Resultados } from "@/components/Resultados";
import { Calculadora } from "@/components/Calculadora";
import { Garantia } from "@/components/Garantia";
import { Planes } from "@/components/Planes";
import { FAQ } from "@/components/FAQ";
import { SobreUpcore } from "@/components/SobreUpcore";
import { CTAFinal } from "@/components/CTAFinal";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <LiquidGlassFilter />
      <Backdrop />
      <Nav />
      <main className="relative z-[2]">
        <Hero />
        <Problema />
        <ComoFunciona />
        <Sistema />
        <DemoTeaser />
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
