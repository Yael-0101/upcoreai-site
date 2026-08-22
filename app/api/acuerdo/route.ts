import { NextResponse } from "next/server";
import { idiomaDe } from "@/lib/acuerdo";

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

  let body: { token?: unknown; nombre?: unknown; correo?: unknown; idioma?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const nombre = typeof body.nombre === "string" ? body.nombre.trim().slice(0, 120) : "";
  const correo = typeof body.correo === "string" ? body.correo.trim().slice(0, 160) : "";
  if (token.length < 10 || nombre.length < 3) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  // El correo es a dónde va su copia en PDF. Se comprueba también AQUÍ, no solo en el
  // navegador: lo que valida el cliente no protege nada — cualquiera puede llamar a
  // esta ruta sin pasar por la pantalla.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
    return NextResponse.json({ ok: false, error: "correo_invalido" }, { status: 400 });
  }

  // La IP de quien acepta — el dato que más pesa el día que alguien diga "yo nunca
  // firmé eso".
  //
  // ⚠️ NO se lee de `x-forwarded-for` a secas. upcoreai.com está detrás de Cloudflare,
  // y ahí el primer valor de esa cabecera es la IP del **borde de Cloudflare**, no la
  // del cliente: en la prueba del 2026-08-21 se guardó 172.71.167.29 cuando la IP real
  // era 189.135.8.5. Una IP equivocada en un contrato es peor que ninguna — parece
  // válida, nadie la revisa, y falla justo el día que hay que usarla. `cf-connecting-ip`
  // la pone Cloudflare con la IP verdadera del cliente.
  const ip =
    req.headers.get("cf-connecting-ip")?.trim().slice(0, 45) ||
    req.headers.get("true-client-ip")?.trim().slice(0, 45) ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim().slice(0, 45) ||
    req.headers.get("x-real-ip")?.trim().slice(0, 45) ||
    "";

  try {
    const upstream = await fetch(ACEPTAR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Panel-Secret": SECRET },
      body: JSON.stringify({
        token,
        nombre,
        correo,
        ip,
        // El idioma en que LEYÓ el contrato al aceptarlo. Es el que se le manda por
        // correo: mandarle el PDF en español a quien acaba de leerlo en inglés se
        // ve como si le hubieran cambiado el documento.
        idioma: idiomaDe(body.idioma),
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
