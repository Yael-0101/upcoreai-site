import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { datosAcuerdo, type Snapshot, type TipoPlan } from "@/lib/acuerdo";

// Arma y CONGELA el acuerdo de un cliente. La llama n8n cuando el bot cierra la venta.
//
// El acuerdo se construye a partir de la PROPUESTA QUE EL CLIENTE YA VIO (se lee por su
// token), no de un cálculo nuevo: así el papel dice exactamente los mismos números que
// él aceptó, aunque los precios del sitio hayan cambiado desde entonces.
//
// Aquí no interviene ningún modelo de lenguaje: se copian campos. Si algo falta,
// devuelve ok:false y el bot le dice al cliente que Yael se lo manda — nunca se
// improvisa un acuerdo.
//
// Auth: header X-Panel-Secret.

export const dynamic = "force-dynamic";

const PLANES_VALIDOS = new Set<TipoPlan>(["llave", "gestionado"]);

export async function POST(req: Request) {
  const secret = process.env.N8N_PANEL_SECRET;
  if (!secret || req.headers.get("x-panel-secret") !== secret) {
    return NextResponse.json({ ok: false, motivo: "no_autorizado" }, { status: 401 });
  }

  const leerUrl = process.env.N8N_PROPUESTA_WEBHOOK_URL;
  const guardarUrl = process.env.N8N_ACUERDO_GUARDAR_URL;
  if (!leerUrl || !guardarUrl) {
    return NextResponse.json({ ok: false, motivo: "config" }, { status: 500 });
  }

  let tokenPropuesta: string;
  let plan: TipoPlan;
  try {
    const body = (await req.json()) as { token_propuesta?: unknown; plan?: unknown };
    tokenPropuesta = String(body.token_propuesta || "").trim();
    plan = String(body.plan || "").trim().toLowerCase() as TipoPlan;
  } catch {
    return NextResponse.json({ ok: false, motivo: "body_invalido" }, { status: 400 });
  }
  if (tokenPropuesta.length < 10) {
    return NextResponse.json({ ok: false, motivo: "falta_propuesta" }, { status: 400 });
  }
  if (!PLANES_VALIDOS.has(plan)) {
    return NextResponse.json({ ok: false, motivo: "plan_invalido" }, { status: 400 });
  }

  // 1. Traer la propuesta congelada del cliente.
  let fila: { lead_id?: number | string; clinica?: string; datos?: string } | undefined;
  try {
    const res = await fetch(`${leerUrl}?token=${encodeURIComponent(tokenPropuesta)}`, {
      headers: { "X-Panel-Secret": secret },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error("lectura");
    const items = (await res.json()) as Array<Record<string, string>>;
    fila = (Array.isArray(items) ? items : []).find(
      (i) => i && i.token === tokenPropuesta && i.datos
    );
  } catch {
    return NextResponse.json({ ok: false, motivo: "no_se_pudo_leer" });
  }
  if (!fila?.datos) return NextResponse.json({ ok: false, motivo: "propuesta_no_encontrada" });

  let snapshot: Snapshot;
  try {
    snapshot = JSON.parse(fila.datos) as Snapshot;
  } catch {
    return NextResponse.json({ ok: false, motivo: "propuesta_ilegible" });
  }

  // 2. Llenar los huecos. Puro copiado — si algo no cuadra, devuelve null.
  const doc = datosAcuerdo(snapshot, plan);
  if (!doc) return NextResponse.json({ ok: false, motivo: "datos_insuficientes" });

  // 3. Congelar el documento ARMADO (no los datos crudos): si mañana cambia la
  //    plantilla, lo que este cliente firmó sigue diciendo lo mismo.
  const token = randomBytes(18).toString("base64url");
  const fecha = new Date().toISOString();
  const congelado = { version: 1, fecha, plan, doc, propuesta: tokenPropuesta };

  try {
    const res = await fetch(guardarUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Panel-Secret": secret },
      body: JSON.stringify({
        token,
        fecha,
        lead_id: Number(fila.lead_id) || 0,
        clinica: doc.clinica,
        datos: JSON.stringify(congelado),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error("guardado");
    const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (!data?.ok) throw new Error("guardado no ok");
  } catch {
    return NextResponse.json({ ok: false, motivo: "no_se_pudo_guardar" });
  }

  return NextResponse.json({
    ok: true,
    url: `https://upcoreai.com/acuerdo/${token}`,
    resumen: {
      clinica: doc.clinica,
      contacto: doc.contacto,
      plan: doc.planLabel,
      precio: doc.precio,
      anticipo: doc.anticipo,
      entrega: doc.entrega,
    },
  });
}
