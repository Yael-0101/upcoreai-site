import type { Metadata } from "next";
import { Inicio } from "@/components/paginas/Inicio";
import { metaPagina } from "@/lib/seo";
import { contenido } from "@/lib/site-textos";

const IDIOMA = "es" as const;
const t = contenido(IDIOMA).meta;

export const metadata: Metadata = metaPagina({
  title: t.title,
  description: t.description,
  path: "/",
  idioma: IDIOMA,
  // El título de la portada YA trae la marca al principio: sin esto el layout
  // se la pega otra vez al final.
  tituloAbsoluto: true,
});

export default function Pagina() {
  return <Inicio idioma={IDIOMA} />;
}
