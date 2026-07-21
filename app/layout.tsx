import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/react";
import { JsonLd } from "@/components/JsonLd";
import "./globals.css";

const title = "Upcore AI | Automatización con IA para clínicas";
const description =
  "Llena tu agenda sin mover un dedo. Automatización con IA que confirma citas, responde WhatsApp 24/7 y recupera pacientes — para clínicas de salud y estética.";

export const metadata: Metadata = {
  metadataBase: new URL("https://upcoreai.com"),
  title,
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
    siteName: "Upcore AI",
    images: ["/social.png"],
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/social.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": "https://upcoreai.com/#organizacion",
      name: "Upcore AI",
      url: "https://upcoreai.com",
      logo: "https://upcoreai.com/apple-icon",
      description:
        "Automatización con IA para clínicas privadas de salud y estética: agentes de WhatsApp, reducción de no-shows, sistemas y dashboards a la medida.",
      areaServed: { "@type": "Country", name: "México" },
      knowsAbout: [
        "automatización para clínicas",
        "agentes de WhatsApp con IA",
        "reducción de no-shows",
        "dashboards para clínicas",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        url: "https://cal.com/yael-upcore-ai/diagnostico-gratis",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://upcoreai.com/#sitio",
      url: "https://upcoreai.com",
      name: "Upcore AI",
      inLanguage: "es-MX",
      publisher: { "@id": "https://upcoreai.com/#organizacion" },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={GeistSans.variable}>
      <body className="font-sans antialiased">
        {children}
        <JsonLd data={jsonLd} />
        <Analytics />
      </body>
    </html>
  );
}
