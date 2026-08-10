import { NextResponse } from "next/server";

// Aceptación del acuerdo: el navegador manda token + nombre, y aquí se reenvía a n8n
// (webhook protegido con X-Panel-Secret, que nunca sale del servidor).
//
// La fecha y hora las pone n8n al guardar, NO el navegador: un sello de tiempo que el
// cliente pudiera cambiar no serviría como prueba de nada.

const ACEPTAR_URL = process.env.N8N_ACUERDO_ACEPTAR_URL;
const SECRET = process.env.N8N_PANEL_SECRET;

export async function POST(req: Request) {
  if (!ACEPTAR_URL || !SECRET) {
    return NextResponse.json({ ok: false, error: "config" }, { status: 500 });
  }

  let body: { token?: unknown; nombre?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const nombre = typeof body.nombre === "string" ? body.nombre.trim().slice(0, 120) : "";
  if (token.length < 10 || nombre.length < 3) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  try {
    const upstream = await fetch(ACEPTAR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Panel-Secret": SECRET },
      body: JSON.stringify({
        token,
        nombre,
        // Contexto de la aceptación, para que quede constancia de desde dónde se hizo.
        agente: req.headers.get("user-agent")?.slice(0, 200) || "",
      }),
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
