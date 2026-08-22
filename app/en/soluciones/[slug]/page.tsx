import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SolucionPagina } from "@/components/paginas/SolucionPagina";
import { SOLUCIONES, getSolucion } from "@/lib/soluciones";
import { metaPagina } from "@/lib/seo";

const IDIOMA = "en" as const;

export function generateStaticParams() {
  return SOLUCIONES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getSolucion(slug);
  if (!s) return {};
  return metaPagina({
    title: s.t[IDIOMA].title,
    description: s.t[IDIOMA].metaDescription,
    path: `/soluciones/${s.slug}`,
    idioma: IDIOMA,
  });
}

export default async function Pagina({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getSolucion(slug);
  if (!s) notFound();
  return <SolucionPagina s={s} idioma={IDIOMA} />;
}
