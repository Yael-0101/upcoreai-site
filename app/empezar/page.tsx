import type { Metadata } from "next";
import { Backdrop } from "@/components/Backdrop";
import { Nav } from "@/components/Nav";
import { EmpezarForm } from "@/components/EmpezarForm";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Empieza sin llamada | Upcore AI",
  description:
    "Cuéntanos de tu clínica en 2 minutos, sin agendar ninguna llamada. Te contactamos por WhatsApp con tu diagnóstico.",
};

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
