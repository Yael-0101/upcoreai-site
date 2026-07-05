import { NextResponse } from "next/server";

const WEBHOOK_URL = process.env.N8N_LEAD_WEBHOOK_URL;

export async function POST(req: Request) {
  if (!WEBHOOK_URL) {
    return NextResponse.json({ ok: false, error: "config" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const {
    nombre,
    clinica,
    tipo_clinica,
    tamano,
    volumen,
    canales,
    productos,
    agenda_hoy,
    detalle,
    urgencia,
    decisor,
    horario_contacto,
    mensaje,
    contacto,
    correo,
  } = body;
  if (!nombre || !contacto) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  try {
    const upstream = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        clinica,
        tipo_clinica,
        tamano,
        volumen,
        canales,
        productos,
        agenda_hoy,
        detalle,
        urgencia,
        decisor,
        horario_contacto,
        mensaje,
        contacto,
        correo,
      }),
    });
    if (!upstream.ok) throw new Error("upstream error");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
  }
}
