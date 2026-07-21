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
    citas_perdidas,
    ticket_promedio,
    objetivo,
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
        citas_perdidas,
        ticket_promedio,
        objetivo,
      }),
    });
    if (!upstream.ok) throw new Error("upstream error");
    // n8n regresa {ok, propuesta_url} cuando el diagnóstico se pudo generar al instante;
    // se pasa tal cual para que el formulario muestre el link de inmediato.
    const data = (await upstream.json().catch(() => null)) as { propuesta_url?: string } | null;
    return NextResponse.json({ ok: true, propuesta_url: data?.propuesta_url ?? null });
  } catch {
    return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
  }
}
