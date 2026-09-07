import type { Metadata } from "next";
import { RaizIdioma } from "@/components/RaizIdioma";
import { Backdrop } from "@/components/Backdrop";
import { Nav } from "@/components/Nav";
import { EmpezarForm } from "@/components/EmpezarForm";
import { Footer } from "@/components/Footer";
import { metaPagina } from "@/lib/seo";
import { empezar } from "@/lib/empezar-textos";

const IDIOMA = "es" as const;
const t = empezar(IDIOMA);

export const metadata: Metadata = metaPagina({
  title: t.h1,
  description: t.subA + t.subFuerte + t.subB,
  path: "/empezar",
  idioma: IDIOMA,
});

export default function Pagina() {
  return (
    <RaizIdioma idioma={IDIOMA}>
      <Backdrop />
      <Nav idioma={IDIOMA} path="/empezar" />
      <main className="relative z-[2] pt-20">
        <EmpezarForm idioma={IDIOMA} />
      </main>
      <Footer idioma={IDIOMA} />
    </RaizIdioma>
  );
}
