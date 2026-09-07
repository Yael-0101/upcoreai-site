import { ImageResponse } from "next/og";
import { OG_SIZE, PlantillaOG, fuentesOG } from "@/lib/og";
import { getSolucion } from "@/lib/soluciones";
import { slugsDe } from "@/lib/rutas";

// Imagen OG por solución, en inglés. Los parámetros son los slugs INGLESES,
// igual que la página de al lado. force-static: se pre-generan en el build
// (leer los TTF con fs en runtime tronaba con 500 en Vercel).
const IDIOMA = "en" as const;

export function generateStaticParams() {
  return slugsDe("soluciones", IDIOMA).map((slug) => ({ slug }));
}

export const dynamic = "force-static";
export const dynamicParams = false;
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Upcore AI — AI automation for real estate firms";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getSolucion(slug, IDIOMA);
  return new ImageResponse(
    (
      <PlantillaOG
        idioma={IDIOMA}
        eyebrow={s?.t.en.eyebrow ?? "Upcore AI"}
        titulo={s?.t.en.h1 ?? "AI automation for real estate firms"}
      />
    ),
    { ...OG_SIZE, fonts: fuentesOG() }
  );
}
