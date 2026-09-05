import { NextResponse } from "next/server";
import { permitido, sesionValida } from "@/lib/chat-web";

// ── /api/chat/sondeo — lo que Yael escribe desde el panel llega al navegador (2026-09-05) ──
//
// El takeover del chat web es el mismo que el de WhatsApp: Yael responde desde /agente, n8n
// guarda su mensaje con rol «yael» y pausa el bot 24 h. Como el navegador no tiene un número
// de WhatsApp al que mandarle nada, pregunta cada pocos segundos qué hay nuevo para su sesión.
// Solo devuelve mensajes de Yael con id mayor al último visto, y si el chat está pausado.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ipDe(req: Request): string {
  return req.headers.get("cf-connecting-ip") || (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "sin-ip";
}

export async function POST(req: Request) {
  let body: { sesion?: unknown; desde?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  if (!sesionValida(body.sesion)) return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  const desde = Number(body.desde) || 0;
  // Un sondeo cada 5 s por sesión abierta: 120 por IP en 10 min cubre a un visitante y frena a un bot.
  if (!permitido(`sondeo:${ipDe(req)}`, 120, 10 * 60_000)) return NextResponse.json({ ok: true, pausado: false, ultimo: desde, mensajes: [] });

  const base = process.env.N8N_CHAT_WEBHOOK_URL;
  const secret = process.env.N8N_PANEL_SECRET;
  if (!base || !secret) return NextResponse.json({ ok: true, pausado: false, ultimo: desde, mensajes: [] });
  const url = base.replace(/chat-web-x7k2$/, "chat-web-sondeo-x7k2");
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Panel-Secret": secret },
      body: JSON.stringify({ sesion: body.sesion, desde }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`sondeo ${r.status}`);
    const j = (await r.json()) as { pausado?: boolean; ultimo?: number; mensajes?: { id: number; rol: string; texto: string; fecha: string }[] };
    return NextResponse.json({
      ok: true,
      pausado: j.pausado === true,
      ultimo: Number(j.ultimo) || desde,
      mensajes: Array.isArray(j.mensajes) ? j.mensajes.filter((m) => m && m.rol === "yael" && typeof m.texto === "string") : [],
    });
  } catch (e) {
    console.error("[chat/sondeo]", (e as Error)?.message);
    return NextResponse.json({ ok: true, pausado: false, ultimo: desde, mensajes: [] });
  }
}
