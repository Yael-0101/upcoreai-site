import type { ReactNode } from "react";
import { LOCALE, type Idioma } from "@/lib/idioma";

/**
 * Marca en qué idioma está el contenido de la página.
 *
 * ⚠️ POR QUÉ NO VA EN EL <html>. El `lang` del `<html>` lo pone `app/layout.tsx`, que
 * es UNO SOLO para todo el sitio: no puede saber si la ruta que se está pintando es
 * la española o la inglesa. El atributo `lang` es válido en CUALQUIER elemento y
 * manda el más cercano al texto, así que envolver el contenido resuelve lo mismo:
 * el lector de pantalla lee con la pronunciación correcta, el navegador ofrece
 * traducir la que toca, y el buscador no ve una página inglesa declarada como
 * española (que es lo que hace que una traducción no posicione).
 *
 * Es un `div` sin estilos a propósito: la barra de navegación es `position: fixed` y
 * eso solo se rompe si un ancestro tiene `transform`, `filter` o `perspective`.
 */
export function RaizIdioma({ idioma, children }: { idioma: Idioma; children: ReactNode }) {
  return <div lang={LOCALE[idioma].html}>{children}</div>;
}
