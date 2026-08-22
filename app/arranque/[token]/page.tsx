import type { Metadata } from "next";
import { CONTACT } from "@/lib/content";
import { Logo } from "@/components/Logo";
import { ArranquePortal } from "@/components/ArranquePortal";
import { TA } from "@/lib/arranque-textos";
import { idiomaDe, type Idioma } from "@/lib/acuerdo-textos";
import { normalizarDatos, type ArranqueDatos } from "@/lib/arranque";

// Portal de Arranque con link secreto: upcoreai.com/arranque/[token].
// El cliente hace aquí TODA su parte del onboarding (checklist, número, cuentas,
// calendario, probar el bot, aprobar textos) y ve el avance de su proyecto.
// La fila vive en la tabla `arranques` de n8n. Sin vencimiento (a diferencia de /p).

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // El template del layout agrega "| Upcore AI".
  title: "Tu Portal de Arranque",
  robots: { index: false, follow: false },
};

type Fila = { token: string; clinica: string; estado: string; datos: ArranqueDatos };

async function getArranque(token: string): Promise<Fila | null> {
  const url = process.env.N8N_ARRANQUE_WEBHOOK_URL;
  const secret = process.env.N8N_PANEL_SECRET;
  if (!url || !secret || !token || token.length < 10) return null;
  try {
    const res = await fetch(`${url}?token=${encodeURIComponent(token)}`, {
      headers: { "X-Panel-Secret": secret },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const items = (await res.json()) as Array<{
      token?: string;
      clinica?: string;
      estado?: string;
      datos?: string;
    }>;
    const fila = (Array.isArray(items) ? items : []).find(
      (i) => i && i.token === token && i.datos
    );
    if (!fila) return null;
    let crudo: unknown = null;
    try {
      crudo = JSON.parse(fila.datos as string);
    } catch {
      return null;
    }
    return {
      token,
      clinica: fila.clinica || "",
      estado: fila.estado || "pendiente",
      datos: normalizarDatos(crudo),
    };
  } catch {
    return null;
  }
}

const AVANCE_ICON: Record<string, string> = {
  hecha: "✓",
  "en-curso": "▶",
  pendiente: "·",
};

export default async function ArranquePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await params;
  const fila = await getArranque(token);

  if (!fila) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-obsidian px-6 text-center">
        <div>
          <div className="mb-4 text-3xl">🔒</div>
          <h1 className="mb-2 text-2xl font-semibold text-sand">
            Este portal no está disponible
          </h1>
          <p className="mb-8 font-light text-mocha">
            Revisa que el link esté completo, o escríbenos y te lo reenviamos.
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

  const d = fila.datos;
  // El idioma que se abre: manda lo que el cliente eligió la última vez (guardado
  // en `datos`), y `?lang=` lo puede pisar — así el link que le mandemos en inglés
  // funciona la primera vez, y a partir de ahí se acuerda solo.
  const pedido = (await searchParams)?.lang;
  const idioma: Idioma = pedido ? idiomaDe(pedido) : d.idioma === "en" ? "en" : "es";
  const T = TA[idioma];

  return (
    <main className="min-h-screen bg-obsidian px-[6%] py-10 text-sand md:px-[10%]">
      <div className="mx-auto max-w-[820px]">
        {/* Header minimal (sin nav de marketing: el cliente viene a trabajar) */}
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <Logo markClass="h-8 w-8" textClass="text-[1.35rem]" />
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">
            {T.bienvenida.etiqueta(
              fila.clinica || d.config.clinica || (idioma === "en" ? "your firm" : "tu inmobiliaria")
            )}
          </div>
        </div>

        <ArranquePortal
          token={token}
          datosIniciales={d}
          estadoInicial={fila.estado}
          idiomaInicial={idioma}
        />

        {/* Avance del proyecto (lo actualiza Upcore; el cliente solo lo ve) */}
        <section className="mt-12">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-mocha">
            {T.ui.avance}
          </h2>
          <div className="rounded-3xl border border-[rgba(242,231,219,0.1)] bg-[rgba(242,231,219,0.04)] p-7">
            {d.avances.map((a) => (
              <div
                key={a.fase}
                className="flex items-start gap-4 border-b border-[rgba(242,231,219,0.07)] py-3 last:border-none"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    a.estado === "hecha"
                      ? "bg-sage text-obsidian"
                      : a.estado === "en-curso"
                        ? "bg-clay text-obsidian"
                        : "border border-[rgba(242,231,219,0.25)] text-mocha"
                  }`}
                >
                  {AVANCE_ICON[a.estado] ?? "·"}
                </span>
                <div>
                  <div
                    className={`font-medium ${a.estado === "pendiente" ? "text-mocha" : "text-sand"}`}
                  >
                    {/* La clave guardada es el nombre EN ESPAÑOL: es lo que Upcore
                        escribe al actualizar el avance. Aquí solo se traduce cómo se
                        lee, para no romper los datos que ya existen. */}
                    {T.ui.fases[a.fase] ?? a.fase}
                    {a.estado === "en-curso" && (
                      <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-clay">
                        {T.ui.estados["en-curso"]}
                      </span>
                    )}
                  </div>
                  {a.nota && (
                    <div className="text-sm font-light text-mocha">{a.nota}</div>
                  )}
                </div>
              </div>
            ))}
            <p className="mt-4 text-xs font-light text-mocha/70">
              {T.ui.notaAvance}
            </p>
          </div>
        </section>

        <footer className="mt-12 border-t border-[rgba(242,231,219,0.08)] pt-6 text-center text-xs font-light text-mocha/60">
          {T.ui.pie(fila.clinica || (idioma === "en" ? "your firm" : "tu inmobiliaria"))} ·{" "}
          {T.ui.dudas} {T.ui.escribenos.replace(/ ?WhatsApp$/, "")}{" "}
          <a href={CONTACT.whatsapp} className="underline hover:text-clay">
            WhatsApp
          </a>
        </footer>
      </div>
    </main>
  );
}
