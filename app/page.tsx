import { Backdrop } from "@/components/Backdrop";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Beneficios } from "@/components/Beneficios";
import { Servicios } from "@/components/Servicios";
import { Calculadora } from "@/components/Calculadora";
import { Proceso } from "@/components/Proceso";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Backdrop />
      <Nav />
      <main className="relative z-[2]">
        <Hero />
        <Beneficios />
        <Servicios />
        <Calculadora />
        <Proceso />
      </main>
      <Footer />
    </>
  );
}
