import { NextResponse } from "next/server";

// Guardado del Portal de Arranque: el wizard manda su estado completo en cada
// paso y aquí se reenvía a n8n (webhook protegido con X-Panel-Secret).
const GUARDAR_URL = process.env.N8N_ARRANQUE_GUARDAR_URL;
const SECRET = process.env.N8N_PANEL_SECRET;

const ESTADOS = ["en-curso", "parte-inicial-lista", "completado"];

export async function POST(req: Request) {
  if (!GUARDAR_URL || !SECRET) {
    return NextResponse.json({ ok: false, error: "config" }, { status: 500 });
  }

  let body: { token?: unknown; datos?: unknown; estado?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const datos = body.datos;
  const estado =
    typeof body.estado === "string" && ESTADOS.includes(body.estado)
      ? body.estado
      : "en-curso";
  if (token.length < 10 || !datos || typeof datos !== "object") {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  try {
    const upstream = await fetch(GUARDAR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Panel-Secret": SECRET },
      body: JSON.stringify({ token, datos, estado }),
      signal: AbortSignal.timeout(8000),
    });
    if (!upstream.ok) throw new Error("upstream error");
    const data = (await upstream.json().catch(() => null)) as { ok?: boolean } | null;
    if (!data?.ok) throw new Error("upstream not ok");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
  }
}
