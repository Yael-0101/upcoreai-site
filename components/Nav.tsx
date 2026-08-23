import { SOLUCIONES } from "@/lib/soluciones";
import { HAY_BLOG } from "@/lib/blog";
import { contenido } from "@/lib/site-textos";
import type { Idioma } from "@/lib/idioma";
import { ruta } from "@/lib/rutas";
import { NavClient, type EnlaceNav } from "./NavClient";

// Server component: arma los enlaces (datos) y se los pasa serializados al
// cliente — así lib/soluciones.ts y lib/blog.ts no viajan al bundle del navegador.
//
// `path` es la ruta CANÓNICA de la página (siempre la española, sin prefijo):
// el selector de idioma la usa para llevar a la misma página en el otro idioma.
// Se pasa explícita en vez de leerla del router porque este es un componente de
// servidor — y porque un selector que adivina la pareja acaba mandando a la
// portada desde cualquier página, que es peor que no tenerlo.
export function Nav({ idioma = "es", path = "/" }: { idioma?: Idioma; path?: string }) {
  const t = contenido(idioma);

  const enlaces: EnlaceNav[] = [
    {
      label: t.nav.soluciones,
      items: SOLUCIONES.map((s) => ({
        href: ruta(idioma, `/soluciones/${s.slug}`),
        label: s.t[idioma].nombreCorto,
      })),
    },
    { label: t.nav.precios, href: ruta(idioma, "/precios") },
    ...(HAY_BLOG ? ([{ label: t.nav.blog, href: ruta(idioma, "/blog") }] as EnlaceNav[]) : []),
    { label: t.nav.nosotros, href: ruta(idioma, "/nosotros") },
  ];

  return (
    <NavClient
      enlaces={enlaces}
      idioma={idioma}
      inicio={ruta(idioma, "/")}
      otroIdiomaHref={ruta(idioma === "en" ? "es" : "en", path)}
      textos={{
        inicio: t.nav.inicio,
        abrirMenu: t.nav.abrirMenu,
        cerrarMenu: t.nav.cerrarMenu,
        cta: t.nav.cta,
        otroIdioma: t.nav.otroIdioma,
        otroIdiomaAria: t.nav.otroIdiomaAria,
      }}
    />
  );
}
