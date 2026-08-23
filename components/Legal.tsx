import { RaizIdioma } from "@/components/RaizIdioma";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { Backdrop } from "./Backdrop";
import { legal, MARCA_WHATSAPP, type DocLegal, type Frag } from "@/lib/legal-textos";
import { linkWhatsApp } from "@/lib/content";
import type { Idioma } from "@/lib/idioma";
import { ruta } from "@/lib/rutas";

// Shell de las páginas legales. El texto es DATO (lib/legal-textos.ts) y aquí solo
// se pinta: así los dos idiomas tienen la misma forma y no puede quedarse media
// frase sin traducir dentro de un <strong>, que es lo que pasó en la propuesta.

function Trozo({ f, idioma }: { f: Frag; idioma: Idioma }) {
  if (typeof f === "string") return <>{f}</>;
  if ("fuerte" in f) return <strong className="font-medium text-sand">{f.fuerte}</strong>;
  const href = f.href === MARCA_WHATSAPP ? linkWhatsApp(idioma) : f.href;
  return (
    <a
      href={href}
      {...(f.externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="break-all text-clay transition-colors hover:text-clay-bright"
    >
      {f.enlace}
    </a>
  );
}

function Frase({ frags, idioma }: { frags: Frag[]; idioma: Idioma }) {
  return (
    <>
      {frags.map((f, i) => (
        <Trozo key={i} f={f} idioma={idioma} />
      ))}
    </>
  );
}

export function PaginaLegal({
  doc,
  idioma,
  path,
}: {
  doc: DocLegal;
  idioma: Idioma;
  /** Ruta canónica ("/privacidad"), para que el selector de idioma lleve a su pareja. */
  path: string;
}) {
  const t = legal(idioma);

  return (
    <RaizIdioma idioma={idioma}>
      <Backdrop />
      <Nav idioma={idioma} path={path} />
      <main className="relative z-[2] px-[6%] pb-24 pt-32 md:px-[10%]">
        <div className="mx-auto max-w-3xl">
          <a
            href={ruta(idioma, "/")}
            className="mb-8 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-mocha transition-colors hover:text-clay"
          >
            {t.volver}
          </a>
          <h1 className="text-gradient text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.03em]">
            {doc.titulo}
          </h1>
          <p className="mb-10 mt-2 text-xs uppercase tracking-[0.15em] text-mocha/70">
            {t.ultimaActualizacion} {doc.actualizado}
          </p>
          <div className="card-soft rounded-[28px] p-8 md:p-12">
            <p className="mb-8 text-sm font-light leading-relaxed text-sand/90">{doc.intro}</p>
            <div className="space-y-8">
              {doc.secciones.map((s) => (
                <section key={s.titulo}>
                  <h2 className="mb-2 text-lg font-semibold tracking-tight text-sand">
                    {s.titulo}
                  </h2>
                  <div className="space-y-3 text-sm font-light leading-relaxed text-mocha">
                    {s.bloques.map((b, i) =>
                      "ul" in b ? (
                        <ul key={i} className="list-disc space-y-1 pl-5">
                          {b.ul.map((li, j) => (
                            <li key={j}>
                              <Frase frags={li} idioma={idioma} />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p key={i}>
                          <Frase frags={b.p} idioma={idioma} />
                        </p>
                      )
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>
          <p className="mt-8 text-xs font-light leading-relaxed text-mocha/50">{t.aviso}</p>
        </div>
      </main>
      <Footer idioma={idioma} />
    </RaizIdioma>
  );
}
