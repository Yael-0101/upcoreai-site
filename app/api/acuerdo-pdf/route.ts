import { NextResponse } from "next/server";
import { ZONA_CLIENTE, idiomaDe, type DatosAcuerdo } from "@/lib/acuerdo";
import { pdfDeAcuerdo, noRepresentables, textoDelPdf } from "@/lib/acuerdo-pdf";

// El acuerdo en PDF: upcoreai.com/api/acuerdo-pdf?token=...
//
// Sirve para dos cosas, y por eso vive aquí y no dentro de la página:
//   1. El botón "Descargar en PDF" que ve el cliente.
//   2. n8n lo descarga al aceptar, para adjuntarlo al correo que le manda.
//
// Se arma SIEMPRE del documento congelado en la tabla `acuerdos`, nunca de un
// cálculo nuevo: el PDF dice exactamente lo mismo que la página que él leyó.
//
// Seguridad: el token es el mismo secreto que la página del acuerdo (link no
// adivinable, `noindex`). No se protege con más que eso a propósito — si pidiera
// una contraseña, ni el cliente podría bajarlo ni n8n adjuntarlo.

export const dynamic = "force-dynamic";

type Congelado = { fecha: string; doc: DatosAcuerdo; docEn?: DatosAcuerdo };

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const token = params.get("token") || "";
  const pedido = idiomaDe(params.get("lang"));
  const url = process.env.N8N_ACUERDO_WEBHOOK_URL;
  const secret = process.env.N8N_PANEL_SECRET;
  if (!url || !secret || token.length < 10) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let fila: Record<string, string> | undefined;
  try {
    const res = await fetch(`${url}?token=${encodeURIComponent(token)}`, {
      headers: { "X-Panel-Secret": secret },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error("lectura");
    const items = (await res.json()) as Array<Record<string, string>>;
    fila = (Array.isArray(items) ? items : []).find((i) => i && i.token === token && i.datos);
  } catch {
    return NextResponse.json({ ok: false, motivo: "no_se_pudo_leer" }, { status: 502 });
  }
  if (!fila?.datos) return NextResponse.json({ ok: false }, { status: 404 });

  let congelado: Congelado;
  try {
    congelado = JSON.parse(fila.datos) as Congelado;
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  // El idioma pedido, pero solo si ESTE acuerdo lo tiene congelado. Los de antes del
  // 2026-08-22 solo traen el espanol; generar la traduccion al vuelo haria que el PDF
  // dijera algo que el cliente nunca vio al firmar.
  const hayIngles = Boolean(congelado?.docEn?.secciones?.length);
  const doc = pedido === "en" && hayIngles ? congelado.docEn! : congelado?.doc;
  if (!doc?.secciones?.length) return NextResponse.json({ ok: false }, { status: 500 });

  // ⚠️ Antes que imprimir un cuadrito en un contrato, no se emite el PDF. El
  // guardián del prebuild ya prueba todas las combinaciones, así que llegar aquí
  // significa que alguien metió un carácter nuevo en un acuerdo ya congelado.
  const malos = noRepresentables(textoDelPdf(doc));
  if (malos.length) {
    return NextResponse.json(
      { ok: false, motivo: "caracteres_no_imprimibles", malos },
      { status: 500 }
    );
  }

  const fmt = (iso: string, conHora: boolean) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(doc.idioma === "en" ? "en-US" : "es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
      ...(conHora ? { hour: "2-digit" as const, minute: "2-digit" as const } : {}),
      timeZone: ZONA_CLIENTE,
    });
  };

  const aceptado = fila.estado === "aceptado";

  // El correo y la IP de quien aceptó viven en una tabla APARTE (`acuerdos_aceptacion`),
  // no en la de acuerdos. Motivo: en n8n el esquema de una tabla es inmutable por API
  // —las columnas nuevas solo se agregan a mano— y la alternativa era reescribir el
  // campo `datos`, que es el contrato congelado. Un contrato no se toca para guardarle
  // un dato al lado.
  let correo = "";
  let ip = "";
  if (aceptado && process.env.N8N_ACEPTACION_WEBHOOK_URL) {
    try {
      const r = await fetch(
        `${process.env.N8N_ACEPTACION_WEBHOOK_URL}?token=${encodeURIComponent(token)}`,
        { headers: { "X-Panel-Secret": secret }, cache: "no-store", signal: AbortSignal.timeout(8000) }
      );
      if (r.ok) {
        const items = (await r.json()) as Array<Record<string, string>>;
        const a = (Array.isArray(items) ? items : []).find((i) => i && i.token === token);
        correo = a?.correo || "";
        ip = a?.ip || "";
      }
    } catch {
      // Si no se puede leer, el PDF sale igual pero SIN esa línea. Un contrato sin el
      // renglón del correo sigue valiendo; uno que no se puede descargar, no.
    }
  }

  const bytes = pdfDeAcuerdo(doc, {
    fecha: fmt(congelado.fecha, false),
    aceptadoPor: aceptado ? fila.aceptado_por || "" : "",
    aceptadoEl: aceptado ? fmt(fila.aceptado_el || "", true) : "",
    correo,
    ip,
    // La misma firma que ya sale en la página del acuerdo, para que el papel y la
    // pantalla se vean igual. Si la variable no está, el PDF sale sin ella y con el
    // nombre mecanografiado — nunca se cae por eso.
    firmaPng: process.env.FIRMA_YAEL_BASE64 || "",
  });

  // Nombre de archivo legible para el cliente: es lo que va a ver en su carpeta y
  // lo que le reenvía a su contador. Solo letras, números y guiones — un nombre con
  // acentos o espacios se rompe en algunos clientes de correo.
  // Sin regex de caracteres combinantes: se filtra por punto de codigo, que se lee
  // y se prueba sin sorpresas. NFD separa la tilde de la letra y aqui se tira la tilde.
  const sinAcentos = [...doc.clinica.normalize("NFD")]
    .filter((c) => {
      const n = c.codePointAt(0) ?? 0;
      return n < 0x300 || n > 0x36f;
    })
    .join("");
  const limpio =
    sinAcentos
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "acuerdo";

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      // El nombre del archivo también va en su idioma: es lo que el cliente ve en su
      // carpeta y lo que reenvía a su contador. Un PDF en inglés llamado "Acuerdo-…"
      // delata que la traducción fue un añadido.
      "Content-Disposition": `attachment; filename="${
        doc.idioma === "en" ? "Agreement" : "Acuerdo"
      }-Upcore-AI-${limpio}.pdf"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
