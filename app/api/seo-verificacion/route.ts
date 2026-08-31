// El sitio se verifica A SÍ MISMO: lo llama el vigilante de n8n (lunes y
// jueves) y devuelve {ok, paginas, fallos[]}. La lógica vive en
// lib/verificacion-seo.ts — la misma que el CLI probar-produccion.mjs — así
// que se actualiza sola con cada deploy, sin espejos que desfasar.
//
// Protegido con X-Seo-Secret (env var SEO_VERIFICACION_SECRET en Vercel):
// es barato de servir, pero un endpoint que dispara ~40 fetches no se deja
// abierto a cualquiera.

import { NextResponse } from "next/server";
import { verificarSeoEnVivo } from "@/lib/verificacion-seo";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secreto = process.env.SEO_VERIFICACION_SECRET;
  if (!secreto) {
    // Sin configurar: se dice claro, no se finge que se verificó nada.
    return NextResponse.json({ ok: false, error: "config" }, { status: 500 });
  }
  if (req.headers.get("x-seo-secret") !== secreto) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const resultado = await verificarSeoEnVivo();
    return NextResponse.json(resultado);
  } catch (e) {
    // Un fallo del verificador NO es un fallo del sitio: se distingue.
    return NextResponse.json(
      { ok: false, error: "verificador", detalle: (e as Error).message },
      { status: 500 }
    );
  }
}
