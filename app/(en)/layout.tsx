import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { CuerpoRaiz } from "@/components/CuerpoRaiz";
import { metaRaiz } from "@/lib/seo";
import "../globals.css";

// Esqueleto de las páginas en INGLÉS (/en/...). Existe por una sola razón: el idioma
// del documento. Hasta el 2026-09-07 todo el sitio se servía con `lang="es-MX"`, así
// que un lector de pantalla leía las páginas en inglés con pronunciación española y el
// navegador ofrecía traducirlas "del español". El `<html lang>` no se puede cambiar
// desde una página: hace falta un esqueleto propio.
//
// Todo lo demás es compartido, a propósito. Ver CuerpoRaiz.

export const metadata: Metadata = metaRaiz("en");

export default function EsqueletoIngles({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={GeistSans.variable}>
      <CuerpoRaiz>{children}</CuerpoRaiz>
    </html>
  );
}
