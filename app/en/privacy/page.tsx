import type { Metadata } from "next";
import { PaginaLegal } from "@/components/Legal";
import { legal } from "@/lib/legal-textos";
import { metaPagina } from "@/lib/seo";

const IDIOMA = "en" as const;
const doc = legal(IDIOMA).privacidad;

export const metadata: Metadata = metaPagina({
  title: doc.metaTitle,
  description: doc.metaDescription,
  path: "/privacidad",
  idioma: IDIOMA,
});

export default function Pagina() {
  return <PaginaLegal doc={doc} idioma={IDIOMA} path="/privacidad" />;
}
