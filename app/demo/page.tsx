import type { Metadata } from "next";
import { DemoPagina } from "@/components/paginas/DemoPagina";
import { sanitizeClinica, sanitizeGiro } from "@/lib/demo-config";
import { metaPagina } from "@/lib/seo";
import { paginas } from "@/lib/paginas-textos";

const IDIOMA = "es" as const;
const t = paginas(IDIOMA).demo;

export const metadata: Metadata = metaPagina({
  title: t.metaTitle,
  description: t.metaDescription,
  path: "/demo",
  idioma: IDIOMA,
});

export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; g?: string }>;
}) {
  const { c, g } = await searchParams;
  return (
    <DemoPagina clinica={sanitizeClinica(c)} giro={sanitizeGiro(g)} idioma={IDIOMA} />
  );
}
