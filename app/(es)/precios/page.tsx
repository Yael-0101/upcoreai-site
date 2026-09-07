import type { Metadata } from "next";
import { Precios } from "@/components/paginas/Precios";
import { metaPagina } from "@/lib/seo";
import { paginas } from "@/lib/paginas-textos";

const IDIOMA = "es" as const;
const t = paginas(IDIOMA).precios;

export const metadata: Metadata = metaPagina({
  title: t.metaTitle,
  description: t.metaDescription,
  path: "/precios",
  idioma: IDIOMA,
});

export default function Pagina() {
  return <Precios idioma={IDIOMA} />;
}
