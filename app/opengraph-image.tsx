import { ImageResponse } from "next/og";
import { OG_SIZE, PlantillaOG, fuentesOG } from "@/lib/og";

// Imagen OG por defecto de TODO el sitio (la heredan las rutas sin imagen propia).
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Upcore AI — Automatización con IA para clínicas";

export default async function Image() {
  return new ImageResponse(
    (
      <PlantillaOG
        eyebrow="Automatización con IA para clínicas"
        titulo="Tu clínica llena. Sin mover un dedo."
      />
    ),
    { ...OG_SIZE, fonts: fuentesOG() }
  );
}
