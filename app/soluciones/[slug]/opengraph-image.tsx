import { ImageResponse } from "next/og";
import { OG_SIZE, PlantillaOG, fuentesOG } from "@/lib/og";
import { getSolucion, SOLUCIONES } from "@/lib/soluciones";

// Imagen OG por solución. generateStaticParams + force-static: se PRE-generan
// las 5 en el build (leer los TTF con fs en runtime tronaba con 500 en Vercel).
export function generateStaticParams() {
  return SOLUCIONES.map((s) => ({ slug: s.slug }));
}

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Upcore AI — Automatización con IA para clínicas";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getSolucion(slug);
  return new ImageResponse(
    (
      <PlantillaOG
        eyebrow={s?.eyebrow ?? "Upcore AI"}
        titulo={s?.h1 ?? "Automatización con IA para clínicas"}
      />
    ),
    { ...OG_SIZE, fonts: fuentesOG() }
  );
}
