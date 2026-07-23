// ============================================================================
// Plantilla compartida para las imágenes OG (1200×630) — la usan
// app/opengraph-image.tsx, app/soluciones/[slug]/opengraph-image.tsx y
// app/blog/[slug]/opengraph-image.tsx. Se generan EN BUILD (estáticas).
// Reglas de satori/ImageResponse: solo flexbox (display:flex explícito en todo
// div con varios hijos), fuentes TTF (NO woff2), sin emojis.
// ============================================================================
import { readFileSync } from "node:fs";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

// La taza del logo, como data-URI (mismo dibujo que app/icon.svg).
const LOGO_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 48 48'>" +
  "<rect width='48' height='48' rx='13' fill='#C8623D'/>" +
  "<ellipse cx='24' cy='24' rx='14' ry='6' fill='none' stroke='#F7EFE6' stroke-opacity='0.28' stroke-width='1.4' transform='rotate(-22 24 24)'/>" +
  "<path d='M16 15.5 V25 a8 8 0 0 0 16 0 V15.5' fill='none' stroke='#F7EFE6' stroke-width='4.4' stroke-linecap='round'/>" +
  "<circle cx='24' cy='15.5' r='2.3' fill='#F7EFE6'/>" +
  "</svg>";
const LOGO_URI = `data:image/svg+xml;utf8,${encodeURIComponent(LOGO_SVG)}`;

/** Fuentes para ImageResponse — TTF de geist ya presentes en node_modules. */
export function fuentesOG() {
  const base = path.join(
    process.cwd(),
    "node_modules",
    "geist",
    "dist",
    "fonts",
    "geist-sans"
  );
  return [
    {
      name: "Geist",
      data: readFileSync(path.join(base, "Geist-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Geist",
      data: readFileSync(path.join(base, "Geist-SemiBold.ttf")),
      weight: 600 as const,
      style: "normal" as const,
    },
  ];
}

export function PlantillaOG({
  eyebrow,
  titulo,
}: {
  eyebrow?: string;
  titulo: string;
}) {
  // Títulos largos bajan de cuerpo para no desbordar las 3 líneas disponibles.
  const cuerpoTitulo = titulo.length > 70 ? 56 : titulo.length > 45 ? 64 : 76;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#1A1512",
        backgroundImage:
          "radial-gradient(900px 500px at 85% -10%, rgba(200,98,61,0.22), rgba(26,21,18,0))",
        padding: "56px 64px",
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          border: "1px solid rgba(242,231,219,0.14)",
          borderRadius: 28,
          padding: "48px 56px",
        }}
      >
        {/* Marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_URI} width={72} height={72} alt="" />
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 600,
              color: "#F2E7DB",
              letterSpacing: -1,
            }}
          >
            Upcore AI
          </div>
        </div>

        {/* Título */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {eyebrow ? (
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 600,
                color: "#C8623D",
                textTransform: "uppercase",
                letterSpacing: 4,
              }}
            >
              {eyebrow}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              fontSize: cuerpoTitulo,
              fontWeight: 600,
              color: "#F2E7DB",
              lineHeight: 1.08,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            {titulo}
          </div>
        </div>

        {/* Pie */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", fontSize: 26, color: "#B9A897" }}>
            upcoreai.com
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#B9A897" }}>
            Automatización con IA para clínicas
          </div>
        </div>
      </div>
    </div>
  );
}
