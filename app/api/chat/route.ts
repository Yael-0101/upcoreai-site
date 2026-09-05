import { NextResponse } from "next/server";
import { idiomaDe, type Idioma } from "@/lib/idioma";
import { CHAT_LIMITES, CHAT_RESPALDO, CHAT_TOPE, permitido, sesionValida, textoValido } from "@/lib/chat-web";

// ── /api/chat — la puerta del sitio al cerebro del bot (2026-09-05) ──────────────────────
//
// El sitio NO piensa: manda cada mensaje a la puerta web de n8n («Chat web — Puerta»), que
// llama al MISMO cerebro que atiende el WhatsApp y guarda el historial por sesión. Aquí solo
// se protege esa puerta (origen, forma del mensaje, ráfagas) y se degrada con elegancia si
// n8n no contesta: el visitante ve un mensaje amable y Yael recibe el aviso con el motivo,
// como en la demo (lección 2026-09-04: un console.error no lo lee nadie).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMEOUT_MS = 25_000;

function origenPermitido(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname;
    return host === "upcoreai.com" || host === "www.upcoreai.com" || host.endsWith(".vercel.app") || host === "localhost";
  } catch {
    return false;
  }
}

function ipDe(req: Request): string {
  // Detrás de Cloudflare la IP real viene en cf-connecting-ip (lección del acuerdo, 2026-08-21).
  return req.headers.get("cf-connecting-ip") || (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "sin-ip";
}

function avisarFallo(motivo: string, sesion: string) {
  const url = process.env.N8N_DEMO_ALERT_WEBHOOK_URL;
  const secret = process.env.N8N_PANEL_SECRET;
  if (!url || !secret) return;
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Panel-Secret": secret },
    body: JSON.stringify({ clinica: `Chat del sitio (sesión ${sesion.slice(0, 8)}…)`, giro: "", fecha: new Date().toISOString(), fallo: motivo }),
  }).catch(() => {});
}

export async function POST(req: Request) {
  if (!origenPermitido(req)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  let body: { sesion?: unknown; texto?: unknown; idioma?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  const idioma: Idioma = idiomaDe(body.idioma);
  if (!sesionValida(body.sesion)) return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  const texto = textoValido(body.texto);
  if (!texto) return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  const sesion = body.sesion;

  // Ráfagas: por IP (10 min) y por sesión (día). Al visitante se le manda al WhatsApp, no se le corta.
  if (!permitido(`ip:${ipDe(req)}`, CHAT_LIMITES.maxPorIp10min, 10 * 60_000)) {
    return NextResponse.json({ ok: true, respuesta: CHAT_TOPE[idioma], tope: true });
  }
  if (!permitido(`sesion:${sesion}`, CHAT_LIMITES.maxMensajesSesion, 24 * 60 * 60_000)) {
    return NextResponse.json({ ok: true, respuesta: CHAT_TOPE[idioma], tope: true });
  }

  const url = process.env.N8N_CHAT_WEBHOOK_URL;
  const secret = process.env.N8N_PANEL_SECRET;
  if (!url || !secret) {
    avisarFallo("falta N8N_CHAT_WEBHOOK_URL o N8N_PANEL_SECRET en Vercel", sesion);
    return NextResponse.json({ ok: true, respuesta: CHAT_RESPALDO[idioma], respaldo: true });
  }

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Panel-Secret": secret },
      body: JSON.stringify({ sesion, texto, idioma }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`la puerta web respondió ${r.status}`);
    const j = (await r.json()) as { ok?: boolean; respuesta?: string };
    const respuesta = typeof j.respuesta === "string" ? j.respuesta.trim() : "";
    if (!respuesta) throw new Error("la puerta web contestó sin texto");
    return NextResponse.json({ ok: true, respuesta });
  } catch (e) {
    const err = e as { name?: string; message?: string };
    const motivo = err?.name === "TimeoutError" ? "la puerta web de n8n no contestó a tiempo" : String(err?.message || "error de la puerta web");
    console.error("[chat] cayó al respaldo:", motivo);
    avisarFallo(motivo, sesion);
    return NextResponse.json({ ok: true, respuesta: CHAT_RESPALDO[idioma], respaldo: true });
  }
}
