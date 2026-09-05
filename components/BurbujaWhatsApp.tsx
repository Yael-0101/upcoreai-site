"use client";

import { usePathname } from "next/navigation";
import { linkWhatsApp } from "@/lib/content";
import { contenido } from "@/lib/site-textos";
import type { Idioma } from "@/lib/idioma";

// ── Burbuja flotante de WhatsApp (decisión de Yael, 2026-09-04) ─────────────────────
//
// La puerta al bot desde cualquier página pública. Hasta hoy, quien llegaba de Google de
// noche tenía dos caminos —el formulario y la demo— y ninguno era «escríbeme ahorita». El
// bot ya sabe vender, dar el diagnóstico, mandar la propuesta y avisar a Yael; solo le
// faltaba la puerta desde el sitio. Y es coherente con lo que vendemos: nuestro sitio te
// manda al WhatsApp igual que el de nuestros clientes mandaría al suyo.
//
// Va en el layout raíz para no olvidarla en ninguna página. Se esconde sola en los
// documentos privados del cliente (propuesta, acuerdo, Portal de Arranque): ahí el cliente ya
// está en conversación con Yael y un «escríbenos» de captación lo confunde. El idioma sale
// de la ruta (/en), igual que el resto del sitio.
//
// Diseño (guías de la casa, 2026-09-04): objetivo táctil de 56 px (≥ 44 pt), glifo en
// obsidiana sobre el verde de WhatsApp (≈ 9.5:1; blanco sobre ese verde no llega a 3:1),
// etiqueta visible solo en pantallas anchas, respeta el área segura inferior del teléfono y
// `prefers-reduced-motion` (sin animación de entrada). Por debajo de los diálogos (z-90) y
// por encima de la barra de navegación (z-50). El número NO vive aquí: sale de
// lib/content.ts vía linkWhatsApp(), que ya lleva el mensaje precargado por idioma.

const RUTAS_PRIVADAS = ["/p/", "/acuerdo/", "/arranque/"];

export function BurbujaWhatsApp() {
  const pathname = usePathname() ?? "/";
  if (RUTAS_PRIVADAS.some((r) => pathname.startsWith(r))) return null;

  const idioma: Idioma = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "es";
  const t = contenido(idioma).burbujaWa;

  return (
    <a
      href={linkWhatsApp(idioma)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.aria}
      title={t.aria}
      className="burbuja-wa fixed right-4 z-[60] flex h-14 items-center gap-2.5 rounded-full bg-[#25D366] pl-4 pr-4 text-obsidian shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98] md:right-6 md:pl-4 md:pr-5"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-7 w-7 shrink-0"
        fill="currentColor"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.23 8.24m4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18l-.55-.27" />
      </svg>
      <span className="hidden text-[0.95rem] font-semibold leading-none md:inline">{t.label}</span>
    </a>
  );
}
