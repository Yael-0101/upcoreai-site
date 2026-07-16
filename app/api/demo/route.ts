import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  DEMO_CIERRE,
  DEMO_FALLBACK,
  DEMO_LIMITS,
  sanitizeClinica,
  sanitizeGiro,
} from "@/lib/demo-config";
import { buildSystemPrompt, demoTools, runDemoTool } from "@/lib/demo";
import { demoGreeting } from "@/lib/demo-config";

// Motor de la demo del agente. Stateless: el cliente manda el historial (solo texto);
// aquí corre el loop de herramientas con la API de Anthropic. Las tools son simuladas.
// La llave vive en ANTHROPIC_DEMO_KEY — una key de un workspace con límite duro de
// gasto mensual: ese límite es el respaldo REAL contra abuso; lo de abajo son capas.

export const maxDuration = 30;

const MODEL = "claude-haiku-4-5-20251001"; // el mismo tier que el agente real
const MAX_TOOL_ITER = 5;

type MsgIn = { role: "user" | "assistant"; content: string };

// Rate limit best-effort por IP. En serverless es efímero (cada instancia fría
// empieza de cero) — el tope real es el spend limit del workspace.
const ipHits = new Map<string, { n: number; resetAt: number }>();
const RATE = { max: 40, ventanaMs: 10 * 60 * 1000 };

function rateLimited(ip: string): boolean {
  const ahora = Date.now();
  const h = ipHits.get(ip);
  if (!h || h.resetAt < ahora) {
    ipHits.set(ip, { n: 1, resetAt: ahora + RATE.ventanaMs });
    return false;
  }
  h.n++;
  return h.n > RATE.max;
}

function origenValido(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // curl / same-origin sin header
  try {
    const host = new URL(origin).hostname;
    return (
      host === "upcoreai.com" ||
      host === "www.upcoreai.com" ||
      host.endsWith(".vercel.app") ||
      host === "localhost"
    );
  } catch {
    return false;
  }
}

const bad = () => NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });

export async function POST(req: Request) {
  // --- Validaciones (antes de gastar un solo token) --------------------------------
  if (!origenValido(req)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const ip = (req.headers.get("x-forwarded-for") ?? "?").split(",")[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: true, reply: "Vas muy rápido 🙂 dame un minuto y seguimos.", done: false },
      { status: 429 }
    );
  }

  let body: { clinica?: unknown; giro?: unknown; messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return bad();
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 60)
    return bad();

  const mensajes: MsgIn[] = [];
  for (const m of body.messages) {
    if (!m || typeof m !== "object") return bad();
    const { role, content } = m as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") return bad();
    if (typeof content !== "string" || content.length === 0) return bad();
    if (role === "user" && content.length > DEMO_LIMITS.maxCharsMensaje) return bad();
    if (role === "assistant" && content.length > 1200) return bad();
    mensajes.push({ role, content });
  }
  if (mensajes[mensajes.length - 1].role !== "user") return bad();

  const clinica = sanitizeClinica(typeof body.clinica === "string" ? body.clinica : null);
  const giro = sanitizeGiro(typeof body.giro === "string" ? body.giro : null);

  // Tope de la demo: al turno 16 se cierra amable, sin llamar a la API.
  const turnosUsuario = mensajes.filter((m) => m.role === "user").length;
  if (turnosUsuario > DEMO_LIMITS.maxTurnosUsuario) {
    return NextResponse.json({ ok: true, reply: DEMO_CIERRE, done: true });
  }

  // Aviso a Yael cuando un PROSPECTO (demo personalizada) llega a su 3er mensaje.
  if (clinica !== "Clínica Demo" && turnosUsuario === 3) {
    avisarDemoProbada(clinica, giro);
  }

  // Historial truncado + quitar el saludo local si viene al inicio (la API exige
  // que la conversación empiece con "user"; el saludo ya va citado en el system).
  let recorte = mensajes.slice(-DEMO_LIMITS.maxMensajesHistorial);
  while (recorte.length && recorte[0].role === "assistant") recorte = recorte.slice(1);
  if (recorte.length === 0) return bad();

  const apiKey = process.env.ANTHROPIC_DEMO_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: true, reply: DEMO_FALLBACK, done: true });
  }

  // --- Loop de herramientas ---------------------------------------------------------
  try {
    const client = new Anthropic({ apiKey });
    const system = buildSystemPrompt(clinica, giro, demoGreeting(clinica));
    const conversacion: Anthropic.MessageParam[] = recorte.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let agendado = false;
    for (let i = 0; i < MAX_TOOL_ITER; i++) {
      const res = await client.messages.create({
        model: MODEL,
        max_tokens: 300,
        temperature: 0.4,
        system,
        tools: demoTools,
        messages: conversacion,
      });

      if (res.stop_reason === "tool_use") {
        const resultados: Anthropic.ToolResultBlockParam[] = [];
        for (const bloque of res.content) {
          if (bloque.type !== "tool_use") continue;
          const { result, agendo } = runDemoTool(
            bloque.name,
            (bloque.input ?? {}) as Record<string, unknown>
          );
          if (agendo) agendado = true;
          resultados.push({
            type: "tool_result",
            tool_use_id: bloque.id,
            content: JSON.stringify(result),
          });
        }
        conversacion.push({ role: "assistant", content: res.content });
        conversacion.push({ role: "user", content: resultados });
        continue;
      }

      const texto = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join(" ")
        .trim()
        .slice(0, 1200);

      return NextResponse.json({
        ok: true,
        reply: texto || "Perdón, se me trabó un segundo. ¿Me lo repites?",
        agendado,
        done: false,
      });
    }
    // Se agotaron las iteraciones de tools (rarísimo): disculpa fija.
    return NextResponse.json({
      ok: true,
      reply: "Perdón, tuve un detalle técnico. ¿Me repites lo último?",
      agendado,
      done: false,
    });
  } catch {
    // Límite del workspace agotado, timeout o error de la API → degradación elegante.
    return NextResponse.json({ ok: true, reply: DEMO_FALLBACK, done: true });
  }
}

// Fire-and-forget: avisa a Yael (vía n8n) que un prospecto está usando SU demo.
// Reusa el secreto que el sitio ya tiene para leer propuestas. Si falta la URL,
// la función queda apagada sin romper nada.
function avisarDemoProbada(clinica: string, giro: string) {
  const url = process.env.N8N_DEMO_ALERT_WEBHOOK_URL;
  const secret = process.env.N8N_PANEL_SECRET;
  if (!url || !secret) return;
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Panel-Secret": secret },
    body: JSON.stringify({ clinica, giro, fecha: new Date().toISOString() }),
  }).catch(() => {});
}
