import type { Metadata } from "next";
import { CONTACT } from "@/lib/content";
import { ZONA_CLIENTE, idiomaDe, type Idioma, type DatosAcuerdo, type Bloque } from "@/lib/acuerdo";
import { TEXTOS } from "@/lib/acuerdo-textos";
import { AcuerdoAceptar } from "@/components/AcuerdoAceptar";

// Acuerdo de servicio con link secreto: upcoreai.com/acuerdo/[token].
//
// El documento viene CONGELADO desde la tabla `acuerdos` de n8n: se arma una sola vez,
// al cerrar la venta, con los datos de la propuesta que el cliente ya había visto. Si
// mañana cambia el texto de la plantilla, lo que este cliente aceptó no cambia — que es
// justo lo que uno espera de un contrato.
//
// A diferencia de la propuesta, este documento NO vence.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tu acuerdo",
  robots: { index: false, follow: false },
};

type Congelado = {
  version?: number;
  fecha: string;
  plan: string;
  /** Español: la versión que GOBIERNA. */
  doc: DatosAcuerdo;
  /** Inglés: traducción de cortesía, congelada igual. Falta en los acuerdos v1. */
  docEn?: DatosAcuerdo;
};

type Fila = {
  token: string;
  estado: string;
  congelado: Congelado;
  aceptadoPor: string;
  aceptadoEl: string;
};

async function getAcuerdo(token: string): Promise<Fila | null> {
  const url = process.env.N8N_ACUERDO_WEBHOOK_URL;
  const secret = process.env.N8N_PANEL_SECRET;
  if (!url || !secret || !token || token.length < 10) return null;
  try {
    const res = await fetch(`${url}?token=${encodeURIComponent(token)}`, {
      headers: { "X-Panel-Secret": secret },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const items = (await res.json()) as Array<Record<string, string>>;
    const fila = (Array.isArray(items) ? items : []).find(
      (i) => i && i.token === token && i.datos
    );
    if (!fila) return null;
    let congelado: Congelado;
    try {
      congelado = JSON.parse(fila.datos) as Congelado;
    } catch {
      return null;
    }
    if (!congelado?.doc?.secciones?.length) return null;
    return {
      token,
      estado: fila.estado || "activo",
      congelado,
      aceptadoPor: fila.aceptado_por || "",
      aceptadoEl: fila.aceptado_el || "",
    };
  } catch {
    return null;
  }
}

// ── Render del texto ──────────────────────────────────────────────────────────
// Los bloques traen **negritas** en markdown; aquí se convierten a <strong>. Es el
// único formato que se permite, para que el .docx y la web se vean igual.

function Texto({ children }: { children: string }) {
  const partes = children.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold text-sand">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function RenderBloque({ bloque }: { bloque: Bloque }) {
  if (bloque.tipo === "texto") {
    return (
      <p className="mb-4 font-light leading-relaxed text-mocha">
        <Texto>{bloque.texto}</Texto>
      </p>
    );
  }
  if (bloque.tipo === "lista") {
    return (
      <ul className="mb-4 space-y-2.5">
        {bloque.items.map((item, i) => (
          <li key={i} className="flex gap-3 font-light leading-relaxed text-mocha">
            <span aria-hidden className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-clay" />
            <span>
              <Texto>{item}</Texto>
            </span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="mb-5 overflow-x-auto">
      <table className="w-full min-w-[380px] border-collapse text-left">
        <tbody>
          {bloque.filas.map(([concepto, monto], i) => (
            <tr key={i} className="border-b border-sand/10">
              <td className="py-2.5 pr-4 font-light text-mocha">{concepto}</td>
              <td className="py-2.5 text-right font-semibold text-sand">{monto}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

export default async function AcuerdoPublico({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await params;
  const fila = await getAcuerdo(token);

  if (!fila) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-obsidian px-6 text-center">
        <div>
          <div className="mb-4 text-3xl">📄</div>
          <h1 className="mb-2 text-2xl font-semibold text-sand">
            {TEXTOS.es.ui.noDisponible}
          </h1>
          <p className="mb-8 font-light text-mocha">
            {TEXTOS.es.ui.noDisponibleNota}
          </p>
          <a
            href={CONTACT.whatsapp}
            className="rounded-full bg-clay px-8 py-3.5 font-semibold text-obsidian transition-colors hover:bg-clay-bright"
          >
            💬 {TEXTOS.es.ui.hablarConUpcore}
          </a>
        </div>
      </main>
    );
  }

  // El idioma se pide por la URL (?lang=en) y se valida contra la LISTA, nunca
  // indexando un objeto con texto que viene de fuera. Solo se ofrece el inglés si
  // este acuerdo lo tiene congelado: los de antes del 2026-08-22 no lo traen, y
  // generarlo al vuelo rompería la promesa de que el documento no cambia.
  const hayIngles = Boolean(fila.congelado.docEn?.secciones?.length);
  const idioma: Idioma = hayIngles ? idiomaDe((await searchParams)?.lang) : "es";
  const en = idioma === "en";
  const doc = en ? fila.congelado.docEn! : fila.congelado.doc;

  const t = TEXTOS[idioma];
  const aceptado = fila.estado === "aceptado";
  // Las fechas van en la hora del CLIENTE (Miami), no en la del servidor, que en
  // Vercel es UTC. Ver ZONA_CLIENTE en lib/acuerdo.ts: sin esto, quien acepta de
  // noche recibe un contrato fechado al día siguiente.
  const fechaTxt = new Date(fila.congelado.fecha).toLocaleDateString(en ? "en-US" : "es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: ZONA_CLIENTE,
  });
  const firma = process.env.FIRMA_YAEL_BASE64 || "";

  return (
    <main className="pagina-propuesta min-h-screen bg-obsidian px-[6%] py-12 text-sand md:px-[10%]">
      <div className="mx-auto max-w-[820px]">
        <div className="mb-12 text-lg font-semibold tracking-tight">
          Upcore <span className="text-clay-bright">AI</span>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-block rounded-full border border-clay/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-clay-bright">
            {aceptado ? t.ui.etiquetaAceptado : t.ui.etiquetaActivo}
          </span>
          {/* El cambio de idioma solo aparece si ESTE acuerdo trae la versión en inglés
              congelada. Ofrecer un idioma que habría que generar al vuelo rompería la
              promesa de que el documento no cambia después de firmado. */}
          {hayIngles && (
            <a
              href={`/acuerdo/${encodeURIComponent(token)}${en ? "" : "?lang=en"}`}
              className="no-print rounded-full border border-sand/25 px-4 py-1.5 text-xs font-semibold text-mocha transition-colors hover:border-clay hover:text-clay-bright"
            >
              {t.ui.verEnOtroIdioma}
            </a>
          )}
        </div>

        {/* Quien lee la traducción tiene que saber que es traducción, arriba y no
            enterrado en la cláusula 12. */}
        {en && (
          <p className="mb-6 rounded-xl border border-sand/15 bg-sand/[0.03] px-4 py-3 text-xs font-light text-mocha/80">
            {t.ui.avisoTraduccion}
          </p>
        )}

        <h1 className="mb-3 text-[clamp(1.9rem,4.5vw,2.8rem)] font-semibold leading-[1.12] tracking-[-0.03em]">
          {en ? "Agreement between Upcore AI and" : "Acuerdo entre Upcore AI y"}{" "}
          <em className="not-italic text-clay-bright">{doc.clinica}</em>
        </h1>

        <p className="mb-8 font-light text-mocha">
          {doc.contacto}
          {doc.puesto ? `, ${doc.puesto}` : ""} · {fechaTxt} · {t.aDistancia}
        </p>

        <blockquote className="mb-12 border-l-2 border-clay/50 pl-5 font-light italic leading-relaxed text-mocha">
          {doc.intro}
        </blockquote>

        {doc.secciones.map((sec) => (
          <section key={sec.n} className="mb-10">
            <h2 className="mb-4 text-xl font-semibold tracking-tight text-sand">
              {sec.n}. {sec.titulo}
            </h2>
            {sec.bloques.map((b, i) => (
              <RenderBloque key={i} bloque={b} />
            ))}
          </section>
        ))}

        {/* ── Firmas ─────────────────────────────────────────────────────── */}
        <section className="mt-14 border-t border-sand/15 pt-10">
          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <div className="flex h-20 items-end">
                {firma ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={firma}
                    alt="Firma de Yael López"
                    className="max-h-20 max-w-[220px] object-contain"
                  />
                ) : null}
              </div>
              <div className="border-t border-sand/40 pt-2">
                <p className="font-semibold text-sand">Yael López</p>
                <p className="text-sm font-light text-mocha">Upcore AI</p>
                <p className="mt-1 text-sm font-light text-mocha/85">{fechaTxt}</p>
              </div>
            </div>

            <div>
              {aceptado ? (
                <>
                  <div className="flex h-20 items-end">
                    <p className="font-serif text-2xl italic text-sand">{fila.aceptadoPor}</p>
                  </div>
                  <div className="border-t border-sand/40 pt-2">
                    <p className="font-semibold text-sand">{fila.aceptadoPor}</p>
                    <p className="text-sm font-light text-mocha">{doc.clinica}</p>
                    <p className="mt-1 text-sm font-light text-mocha/85">
                      {t.ui.aceptadoEl(
                        new Date(fila.aceptadoEl).toLocaleString(en ? "en-US" : "es-MX", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: ZONA_CLIENTE,
                        })
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <AcuerdoAceptar token={token} clinica={doc.clinica} idioma={idioma} />
              )}
            </div>
          </div>

          {aceptado && (
            <p className="mt-10 rounded-2xl border border-clay/30 bg-clay/5 px-5 py-4 text-sm font-light text-mocha">
              {t.ui.avisoCopia}
            </p>
          )}

          {/* La copia que el cliente se guarda. Antes no existía: aceptaba y se quedaba
              con un link secreto y nada más — si lo perdía, se quedaba sin contrato. Es
              el MISMO documento congelado, no una versión aparte que se pueda desfasar. */}
          <div className="no-print mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              href={`/api/acuerdo-pdf?token=${encodeURIComponent(token)}${en ? "&lang=en" : ""}`}
              className="rounded-full border border-sand/30 px-6 py-3 text-sm font-semibold text-sand transition-colors hover:border-clay hover:text-clay-bright"
            >
              {t.ui.descargarPdf}
            </a>
            <span className="text-xs font-light text-mocha/80">
              {t.ui.guardalo}
            </span>
          </div>
        </section>

        <p className="mt-12 text-center text-xs font-light text-mocha/80">
          Upcore AI · upcoreai.com · {t.ui.dudas}{" "}
          <a href={CONTACT.whatsapp} className="text-clay-bright underline">
            {t.ui.escribenos}
          </a>
        </p>
      </div>
    </main>
  );
}
