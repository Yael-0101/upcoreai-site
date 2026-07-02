import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/react";
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
  alternates: { canonical: "https://upcoreai.com" },
  openGraph: {
    title,
    description,
    url: "https://upcoreai.com",
    siteName: "Upcore AI",
    images: ["/social.png"],
    type: "website",
    locale: "es_ES",
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
  "@type": "Organization",
  name: "Upcore AI",
  url: "https://upcoreai.com",
  logo: "https://upcoreai.com/apple-icon",
  description:
    "Automatización con IA para clínicas privadas de salud y estética: agentes de WhatsApp, reducción de no-shows, sistemas y dashboards a la medida.",
  areaServed: "MX",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    url: "https://calendly.com/upcoreai",
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
