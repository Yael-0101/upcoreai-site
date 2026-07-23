import { ImageResponse } from "next/og";
import { OG_SIZE, PlantillaOG, fuentesOG } from "@/lib/og";
import { ARTICULOS, getArticulo } from "@/lib/blog";

// Imagen OG por artículo. generateStaticParams + force-static: se PRE-generan
// en el build (leer los TTF con fs en runtime tronaba con 500 en Vercel).
export function generateStaticParams() {
  return ARTICULOS.map((a) => ({ slug: a.slug }));
}

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Upcore AI — Blog para clínicas";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArticulo(slug);
  return new ImageResponse(
    (
      <PlantillaOG
        eyebrow="Blog"
        titulo={a?.h1 ?? "Guías claras de IA para clínicas"}
      />
    ),
    { ...OG_SIZE, fonts: fuentesOG() }
  );
}
