// ============================================================================
// DEMO DE VOZ — crea una llamada web con el agente de Retell.
//
// Reglas de gasto (la voz se cobra POR MINUTO, ~$0.13 USD — 100x más cara que
// la demo de chat). Tres candados, de fuera hacia dentro:
//   1. Origen: solo desde nuestro dominio.
//   2. Rate limit por IP: una llamada por visitante cada 30 min.
//   3. TOPE DE GASTO MENSUAL: se suma lo gastado en el mes con el agente de
//      demo y, si pasa del tope, se corta. Este es el candado que de verdad
//      protege — los otros dos solo reducen ruido.
// El agente además corta solo a los 3 minutos y a los 20 s de silencio.
// ============================================================================

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AGENT_ID = "agent_88479b5a08405dde52c84f7f5e"; // DEMO del sitio (no el molde)
const TOPE_USD_MES = 10;

// Rate limit best-effort por IP. En serverless es efímero (cada instancia fría
// empieza de cero) — el tope real es el de gasto mensual de abajo.
const ipHits = new Map<string, number>();
const ESPERA_MS = 30 * 60 * 1000;

function origenValido(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin sin header
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

/** Suma lo gastado este mes con el agente de demo. Devuelve USD. */
async function gastoDelMes(key: string): Promise<number> {
  const inicioMes = new Date();
  inicioMes.setUTCDate(1);
  inicioMes.setUTCHours(0, 0, 0, 0);

  const r = await fetch("https://api.retellai.com/v2/list-calls", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      filter_criteria: {
        agent_id: [AGENT_ID],
        start_timestamp: { lower_threshold: inicioMes.getTime() },
      },
      limit: 1000,
    }),
    cache: "no-store",
  });
  if (!r.ok) return 0; // si Retell no responde, no bloqueamos la demo por eso
  const calls = (await r.json()) as Array<{ call_cost?: { combined_cost?: number } }>;
  if (!Array.isArray(calls)) return 0;
  // combined_cost viene en centavos de dólar
  return calls.reduce((t, c) => t + (c.call_cost?.combined_cost ?? 0) / 100, 0);
}

export async function POST(req: Request) {
  if (!origenValido(req)) {
    return NextResponse.json({ error: "origen no permitido" }, { status: 403 });
  }

  const key = process.env.RETELL_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "no_disponible", motivo: "La demo de voz no está configurada." },
      { status: 503 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "sin-ip";
  const ahora = Date.now();
  const ultima = ipHits.get(ip);
  if (ultima && ahora - ultima < ESPERA_MS) {
    return NextResponse.json(
      {
        error: "espera",
        motivo:
          "Ya probaste la demo hace poco. Si quieres verlo con los números de tu firma, haz tu diagnóstico gratis.",
      },
      { status: 429 }
    );
  }

  const gastado = await gastoDelMes(key);
  if (gastado >= TOPE_USD_MES) {
    return NextResponse.json(
      {
        error: "tope",
        motivo:
          "La demo de voz alcanzó su límite de este mes. Haz tu diagnóstico y te la mostramos en vivo.",
      },
      { status: 503 }
    );
  }

  let body: { clinica?: string; giro?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* sin cuerpo: se usan los valores por defecto */
  }
  const clinica = (body.clinica || "").trim().slice(0, 60) || "Brickell Preventa Realty";
  const giroRaw = (body.giro || "").trim().toLowerCase();
  const giro =
    giroRaw === "equipo"
      ? "equipo inmobiliario"
      : giroRaw === "desarrolladora"
      ? "desarrolladora"
      : "comercializadora de preventa";

  const r = await fetch("https://api.retellai.com/v2/create-web-call", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      agent_id: AGENT_ID,
      retell_llm_dynamic_variables: { clinica, giro },
    }),
    cache: "no-store",
  });

  if (!r.ok) {
    return NextResponse.json(
      { error: "retell", motivo: "No se pudo iniciar la llamada. Inténtalo en un momento." },
      { status: 502 }
    );
  }

  const data = (await r.json()) as { access_token?: string; call_id?: string };
  if (!data.access_token) {
    return NextResponse.json({ error: "sin_token" }, { status: 502 });
  }

  ipHits.set(ip, ahora);

  return NextResponse.json({
    accessToken: data.access_token,
    callId: data.call_id,
    clinica,
    restanteUSD: Math.max(0, TOPE_USD_MES - gastado),
  });
}
