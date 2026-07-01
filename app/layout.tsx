import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://upcoreai.com"),
  title: "Upcore AI | Operando solo.",
  description:
    "Automatización inteligente que ejecuta, optimiza y escala tu empresa 24/7.",
  openGraph: {
    title: "Upcore AI | Operando solo.",
    description:
      "Automatización inteligente que ejecuta, optimiza y escala tu empresa 24/7.",
    images: ["/social.png"],
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={GeistSans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
