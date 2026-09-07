import { ImageResponse } from "next/og";
import { OG_SIZE, PlantillaOG, fuentesOG } from "@/lib/og";

// Imagen OG por defecto de TODO el árbol inglés: la heredan /en, /en/pricing,
// /en/about, /en/start, /en/demo y las legales.
//
// 🔴 POR QUÉ EXISTE. Hasta el 2026-08-22 las páginas inglesas heredaban la
// imagen de la raíz, que está escrita EN ESPAÑOL ("Ningún comprador sin
// respuesta"). O sea: alguien compartía la página inglesa en LinkedIn o por
// WhatsApp y la tarjeta salía en otro idioma que la página. No se ve abriendo
// el sitio —solo al compartirlo—, que es justo por lo que llevaba ahí desde
// que el inglés existe.
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Upcore AI — AI automation for real estate firms";

export default async function Image() {
  return new ImageResponse(
    (
      <PlantillaOG
        idioma="en"
        eyebrow="AI automation for real estate firms"
        titulo="No buyer left unanswered."
      />
    ),
    { ...OG_SIZE, fonts: fuentesOG() }
  );
}
