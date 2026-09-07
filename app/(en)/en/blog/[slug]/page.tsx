import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticulo } from "@/components/paginas/BlogArticulo";
import { getArticulo } from "@/lib/blog";
import { slugsDe } from "@/lib/rutas";
import { metaPagina } from "@/lib/seo";

const IDIOMA = "en" as const;

// Slugs ingleses, y nada más: ver la nota en app/en/solutions/[slug]/page.tsx.
export const dynamicParams = false;

export function generateStaticParams() {
  return slugsDe("blog", IDIOMA).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticulo(slug, IDIOMA);
  if (!a) return {};
  return metaPagina({
    title: a.t[IDIOMA].title,
    description: a.t[IDIOMA].metaDescription,
    // Canónica española: el prefijo y la traducción del slug los pone ruta().
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
  const a = getArticulo(slug, IDIOMA);
  if (!a) notFound();
  return <BlogArticulo a={a} idioma={IDIOMA} />;
}
