import { Analytics } from "@vercel/analytics/react";
import { JsonLd } from "@/components/JsonLd";
import { ChatWeb } from "@/components/ChatWeb";
import { jsonLdGlobal } from "@/lib/seo";

/**
 * El cuerpo del sitio: lo mismo para las dos versiones, en los dos idiomas.
 *
 * 🔴 POR QUÉ ESTÁ APARTE (2026-09-07)
 * Desde hoy el sitio tiene DOS esqueletos —app/(es) y app/(en)— porque el idioma del
 * documento (`<html lang>`) solo se puede declarar ahí, y hasta ahora las páginas en
 * inglés se servían anunciadas como españolas. Lo único que puede cambiar entre los dos
 * esqueletos es el idioma; todo lo demás vive aquí, para que no existan dos sitios que
 * se van separando sin que nadie se entere. Hay guardián que lo exige.
 */
export function CuerpoRaiz({ children }: { children: React.ReactNode }) {
  return (
    <body className="font-sans antialiased">
      {children}
      <ChatWeb />
      <JsonLd data={jsonLdGlobal()} />
      <Analytics />
    </body>
  );
}
