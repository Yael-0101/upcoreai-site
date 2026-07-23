import { SOLUCIONES } from "@/lib/soluciones";
import { HAY_BLOG } from "@/lib/blog";
import { NavClient, type EnlaceNav } from "./NavClient";

// Server component: arma los enlaces (datos) y se los pasa serializados al
// cliente — así lib/soluciones.ts y lib/blog.ts no viajan al bundle del navegador.
export function Nav() {
  const enlaces: EnlaceNav[] = [
    {
      label: "Soluciones",
      items: SOLUCIONES.map((s) => ({
        href: `/soluciones/${s.slug}`,
        label: s.nombreCorto,
      })),
    },
    { label: "Caso real", href: "/casos/clinica-dental-ejemplo" },
    { label: "Precios", href: "/precios" },
    ...(HAY_BLOG ? ([{ label: "Blog", href: "/blog" }] as EnlaceNav[]) : []),
    { label: "Nosotros", href: "/nosotros" },
  ];

  return <NavClient enlaces={enlaces} />;
}
