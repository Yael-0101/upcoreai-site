import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { CuerpoRaiz } from "@/components/CuerpoRaiz";
import { metaRaiz } from "@/lib/seo";
import "../globals.css";

// Esqueleto de las páginas en ESPAÑOL. Lo único suyo es el idioma: el cuerpo y la
// metadata salen de piezas compartidas con el esqueleto en inglés — ver CuerpoRaiz.
//
// ⚠️ Los paréntesis del nombre de la carpeta hacen que NO aparezca en la dirección:
// app/(es)/precios/page.tsx se sigue sirviendo en /precios. Las direcciones no
// cambiaron con esta separación.

export const metadata: Metadata = metaRaiz("es");

export default function EsqueletoEspanol({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={GeistSans.variable}>
      <CuerpoRaiz>{children}</CuerpoRaiz>
    </html>
  );
}
