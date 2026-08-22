import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticulo } from "@/components/paginas/BlogArticulo";
import { ARTICULOS, getArticulo } from "@/lib/blog";
import { metaPagina } from "@/lib/seo";

const IDIOMA = "en" as const;

export function generateStaticParams() {
  return ARTICULOS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticulo(slug);
  if (!a) return {};
  return metaPagina({
    title: a.t[IDIOMA].title,
    description: a.t[IDIOMA].metaDescription,
    path: `/blog/${a.slug}`,
    tipo: "article",
    idioma: IDIOMA,
  });
}

export default async function Pagina({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArticulo(slug);
  if (!a) notFound();
  return <BlogArticulo a={a} idioma={IDIOMA} />;
}
