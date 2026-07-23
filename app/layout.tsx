import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/react";
import { JsonLd } from "@/components/JsonLd";
import { jsonLdGlobal, SITE_NAME } from "@/lib/seo";
import "./globals.css";

const title = "Upcore AI | Automatización con IA para clínicas";
const description =
  "Llena tu agenda sin mover un dedo. Automatización con IA que confirma citas, responde WhatsApp 24/7 y recupera pacientes — para clínicas de salud y estética.";

export const metadata: Metadata = {
  metadataBase: new URL("https://upcoreai.com"),
  // Las páginas ponen su título "a secas" y el template agrega la marca.
  title: { default: title, template: `%s | ${SITE_NAME}` },
  description,
  keywords: [
    "automatización para clínicas",
    "IA para clínicas",
    "agente de WhatsApp para clínicas",
    "reducir no-shows",
    "chatbot de citas médicas",
    "automatización clínica dental",
    "medicina estética automatización",
    "dashboard para clínicas",
  ],
  authors: [{ name: "Upcore AI" }],
  // "./" se resuelve a la URL de cada ruta (con metadataBase); un valor fijo
  // haría que todas las páginas declaren la home como su canonical.
  alternates: { canonical: "./" },
  openGraph: {
    title,
    description,
    url: "https://upcoreai.com",
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
