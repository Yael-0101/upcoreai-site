import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SolucionPagina } from "@/components/paginas/SolucionPagina";
import { getSolucion } from "@/lib/soluciones";
import { slugsDe } from "@/lib/rutas";
import { metaPagina } from "@/lib/seo";

const IDIOMA = "en" as const;

// Los parámetros son los slugs INGLESES (`ai-voice-agent-for-real-estate`), y
// `dynamicParams = false` hace que cualquier otro dé 404 en vez de renderizarse
// bajo demanda. Sin eso, la dirección española seguiría sirviendo esta misma
// página y tendríamos la traducción publicada en dos sitios — justo el
// contenido duplicado que traducir las direcciones venía a evitar. Las viejas
// se resuelven con redirección permanente, en next.config.mjs.
export const dynamicParams = false;

export function generateStaticParams() {
  return slugsDe("soluciones", IDIOMA).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getSolucion(slug, IDIOMA);
  if (!s) return {};
  return metaPagina({
    title: s.t[IDIOMA].title,
    description: s.t[IDIOMA].metaDescription,
    // `path` va SIEMPRE en su forma canónica española: metaPagina() y ruta()
    // ponen el prefijo y traducen el slug. Pasar aquí el slug inglés rompería
    // el par de hreflang.
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
  const s = getSolucion(slug, IDIOMA);
  if (!s) notFound();
  return <SolucionPagina s={s} idioma={IDIOMA} />;
}
