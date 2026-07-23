import type { Metadata } from "next";
import { Backdrop } from "@/components/Backdrop";
import { Nav } from "@/components/Nav";
import { EmpezarForm } from "@/components/EmpezarForm";
import { Footer } from "@/components/Footer";
import { metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  title: "Empieza sin llamada: tu diagnóstico gratis al instante",
  description:
    "Cuéntanos de tu clínica en 3 minutos, sin agendar ninguna llamada. Tu diagnóstico con números aparece al instante y también te llega por correo.",
  path: "/empezar",
});

export default function EmpezarPage() {
  return (
    <>
      <Backdrop />
      <Nav />
      <main className="relative z-[2] pt-20">
        <EmpezarForm />
      </main>
      <Footer />
    </>
  );
}
