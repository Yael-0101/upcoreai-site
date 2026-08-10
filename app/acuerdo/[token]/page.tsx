import type { Metadata } from "next";
import { CONTACT } from "@/lib/content";
import type { DatosAcuerdo, Bloque } from "@/lib/acuerdo";
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
  doc: DatosAcuerdo;
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
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const fila = await getAcuerdo(token);

  if (!fila) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-obsidian px-6 text-center">
        <div>
          <div className="mb-4 text-3xl">📄</div>
          <h1 className="mb-2 text-2xl font-semibold text-sand">
            Este acuerdo no está disponible
          </h1>
          <p className="mb-8 font-light text-mocha">
            Puede que el link esté incompleto. Escríbenos y te lo mandamos de nuevo.
          </p>
          <a
            href={CONTACT.whatsapp}
            className="rounded-full bg-clay px-8 py-3.5 font-semibold text-obsidian transition-colors hover:bg-clay-bright"
          >
            💬 Hablar con Upcore
          </a>
        </div>
      </main>
    );
  }

  const { doc } = fila.congelado;
  const aceptado = fila.estado === "aceptado";
  const fechaTxt = new Date(fila.congelado.fecha).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const firma = process.env.FIRMA_YAEL_BASE64 || "";

  return (
    <main className="pagina-propuesta min-h-screen bg-obsidian px-[6%] py-12 text-sand md:px-[10%]">
      <div className="mx-auto max-w-[820px]">
        <div className="mb-12 text-lg font-semibold tracking-tight">
          Upcore <span className="text-clay">AI</span>
        </div>

        <span className="mb-6 inline-block rounded-full border border-clay/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-clay">
          {aceptado ? "Acuerdo aceptado" : "Acuerdo de servicio"}
        </span>

        <h1 className="mb-3 text-[clamp(1.9rem,4.5vw,2.8rem)] font-semibold leading-[1.12] tracking-[-0.03em]">
          Acuerdo entre Upcore AI y{" "}
          <em className="not-italic text-clay">{doc.clinica}</em>
        </h1>

        <p className="mb-8 font-light text-mocha">
          {doc.contacto}
          {doc.puesto ? `, ${doc.puesto}` : ""} · {fechaTxt} · Acordado a distancia
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
                <p className="mt-1 text-sm font-light text-mocha/70">{fechaTxt}</p>
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
                    <p className="mt-1 text-sm font-light text-mocha/70">
                      Aceptado el{" "}
                      {new Date(fila.aceptadoEl).toLocaleString("es-MX", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </>
              ) : (
                <AcuerdoAceptar token={token} clinica={doc.clinica} />
              )}
            </div>
          </div>

          {aceptado && (
            <p className="mt-10 rounded-2xl border border-clay/30 bg-clay/5 px-5 py-4 text-sm font-light text-mocha">
              ✅ Este acuerdo quedó aceptado y registrado. Guarda este link: aquí lo puedes
              volver a leer cuando quieras.
            </p>
          )}
        </section>

        <p className="mt-12 text-center text-xs font-light text-mocha/60">
          Upcore AI · upcoreai.com · ¿Dudas?{" "}
          <a href={CONTACT.whatsapp} className="text-clay underline">
            escríbenos por WhatsApp
          </a>
        </p>
      </div>
    </main>
  );
}
