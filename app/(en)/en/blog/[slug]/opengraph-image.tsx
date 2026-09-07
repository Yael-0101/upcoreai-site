import { ImageResponse } from "next/og";
import { OG_SIZE, PlantillaOG, fuentesOG } from "@/lib/og";
import { getArticulo } from "@/lib/blog";
import { slugsDe } from "@/lib/rutas";

// Imagen OG por artículo, en inglés. Slugs ingleses; ver la nota de la imagen
// de /en/solutions.
const IDIOMA = "en" as const;

export function generateStaticParams() {
  return slugsDe("blog", IDIOMA).map((slug) => ({ slug }));
}

export const dynamic = "force-static";
export const dynamicParams = false;
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Upcore AI — Blog for real estate firms";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArticulo(slug, IDIOMA);
  return new ImageResponse(
    (
      <PlantillaOG
        idioma={IDIOMA}
        eyebrow="Blog"
        titulo={a?.t.en.h1 ?? "Clear AI guides for real estate firms"}
      />
    ),
    { ...OG_SIZE, fonts: fuentesOG() }
  );
}
