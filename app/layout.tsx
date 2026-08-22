import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/react";
import { JsonLd } from "@/components/JsonLd";
import { jsonLdGlobal, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const title = "Upcore AI | Automatización con IA para inmobiliarias";
const description =
  "Ningún comprador sin respuesta. Automatización con IA que atiende tu WhatsApp y tu teléfono en español a cualquier hora, califica al comprador y agenda la visita — para inmobiliarias de preventa en Miami.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Las páginas ponen su título "a secas" y el template agrega la marca.
  title: { default: title, template: `%s | ${SITE_NAME}` },
  description,
  keywords: [
    "automatización para inmobiliarias",
    "IA para inmobiliarias",
    "agente de WhatsApp para inmobiliarias",
    "seguimiento de leads inmobiliarios",
    "chatbot inmobiliario",
    "preventa Miami",
    "agente de voz inmobiliario",
    "panel para inmobiliarias",
  ],
  authors: [{ name: "Upcore AI" }],
  // "./" se resuelve a la URL de cada ruta (con metadataBase); un valor fijo
  // haría que todas las páginas declaren la home como su canonical.
  alternates: { canonical: "./" },
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "es_MX",
    // Sin `images`: la provee app/opengraph-image.tsx (convención de archivo),
    // que sobrevive al merge superficial en todas las rutas.
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-MX" className={GeistSans.variable}>
      <body className="font-sans antialiased">
        {children}
        <JsonLd data={jsonLdGlobal()} />
        <Analytics />
      </body>
    </html>
  );
}
