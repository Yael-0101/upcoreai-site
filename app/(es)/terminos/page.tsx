import type { Metadata } from "next";
import { PaginaLegal } from "@/components/Legal";
import { legal } from "@/lib/legal-textos";
import { metaPagina } from "@/lib/seo";

const IDIOMA = "es" as const;
const doc = legal(IDIOMA).terminos;

export const metadata: Metadata = metaPagina({
  title: doc.metaTitle,
  description: doc.metaDescription,
  path: "/terminos",
  idioma: IDIOMA,
});

export default function Pagina() {
  return <PaginaLegal doc={doc} idioma={IDIOMA} path="/terminos" />;
}
