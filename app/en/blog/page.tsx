import type { Metadata } from "next";
import { BlogIndice } from "@/components/paginas/BlogIndice";
import { metaPagina } from "@/lib/seo";
import { paginas } from "@/lib/paginas-textos";

const IDIOMA = "en" as const;
const t = paginas(IDIOMA).blog;

export const metadata: Metadata = metaPagina({
  title: t.metaTitle,
  description: t.metaDescription,
  path: "/blog",
  idioma: IDIOMA,
});

export default function Pagina() {
  return <BlogIndice idioma={IDIOMA} />;
}
