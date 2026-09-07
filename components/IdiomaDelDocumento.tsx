"use client";

import { useEffect } from "react";

/**
 * Le dice al navegador en qué idioma está ESTA página.
 *
 * 🔴 POR QUÉ (lección 2026-09-07, pasada móvil del acuerdo)
 * El `<html lang="es-MX">` está escrito en el layout raíz, así que el acuerdo, la
 * propuesta y el Portal de Arranque en INGLÉS se anunciaban como si fueran español.
 * No se ve en pantalla y rompe dos cosas reales:
 *
 *   · Un lector de pantalla lee el contrato en inglés con pronunciación española —
 *     queda ininteligible justo para quien más depende de él.
 *   · El navegador ofrece "traducir del español" sobre un texto que ya está en inglés.
 *
 * Estos tres documentos son privados y `force-dynamic`, así que se corrige aquí, en el
 * navegador, sin volver dinámico el sitio entero (leer la URL en el layout raíz habría
 * dejado sin generación estática a todas las páginas públicas).
 *
 * ⚠️ Lo que esto NO arregla: el HTML que se sirve sigue diciendo es-MX, así que un robot
 * que no ejecute JavaScript ve el idioma viejo. Para las páginas públicas en inglés eso
 * sí importa, y se arregla partiendo el layout raíz — es un cambio de estructura aparte.
 */
export function useDocumentoEn(lang: string) {
  useEffect(() => {
    const antes = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = antes;
    };
  }, [lang]);
}

/**
 * La misma idea para una página que se pinta en el servidor (el acuerdo y la propuesta,
 * donde el idioma se elige recargando con `?lang=`). En el Portal de Arranque, que lo
 * cambia sin recargar, se usa el hook desde dentro del componente.
 */
export function IdiomaDelDocumento({ lang }: { lang: string }) {
  useDocumentoEn(lang);
  return null;
}
