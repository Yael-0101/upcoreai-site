import type { Metadata } from "next";
import { Nosotros } from "@/components/paginas/Nosotros";
import { metaPagina } from "@/lib/seo";
import { paginas } from "@/lib/paginas-textos";

const IDIOMA = "es" as const;
const t = paginas(IDIOMA).nosotros;

export const metadata: Metadata = metaPagina({
  title: t.metaTitle,
  description: t.metaDescription,
  path: "/nosotros",
  idioma: IDIOMA,
});

export default function Pagina() {
  return <Nosotros idioma={IDIOMA} />;
}
