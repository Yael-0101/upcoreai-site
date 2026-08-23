import { SectionTitle } from "./SectionTitle";
import { Reveal } from "./Reveal";
import { contenido } from "@/lib/site-textos";
import type { Idioma } from "@/lib/idioma";
import { ruta } from "@/lib/rutas";

// Comparación por CATEGORÍA (sin nombrar marcas): las 3 formas reales de
// resolver la atención de una inmobiliaria. Los textos viven en
// `lib/site-textos.ts`, en los dos idiomas.
export function Comparativa({ idioma = "es" }: { idioma?: Idioma }) {
  const t = contenido(idioma).comparativa;

  return (
    <section className="px-[6%] py-20 md:px-[10%] md:py-24">
      <SectionTitle title={t.heading} sub={t.sub} variant="maskReveal" />
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {t.opciones.map((o, i) => (
          <Reveal key={o.title} delay={i * 0.08}>
            <div
              className={`card-soft h-full rounded-2xl p-7 ${
                o.destacado ? "border border-clay/50" : ""
              }`}
            >
              <div className="glass-body flex h-full flex-col">
                <div
                  className={`mb-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                    o.destacado ? "text-clay-bright" : "text-mocha/85"
                  }`}
                >
                  {o.sub}
                </div>
                <h3 className="mb-4 text-lg font-semibold text-sand">{o.title}</h3>
                <ul className="mb-6 space-y-2.5">
                  {o.puntos.map((p) => (
                    <li key={p.texto} className="flex gap-2.5 text-sm font-light leading-snug">
                      <span
                        aria-hidden
                        className={`mt-0.5 shrink-0 ${p.ok ? "text-sage" : "text-mocha/75"}`}
                      >
                        {p.ok ? "✓" : "✗"}
                      </span>
                      <span className={p.ok ? "text-mocha" : "text-mocha/85"}>{p.texto}</span>
                    </li>
                  ))}
                </ul>
                <div
                  className={`mt-auto border-t border-[rgba(242,231,219,0.1)] pt-4 text-sm ${
                    o.destacado ? "font-medium text-clay-bright" : "font-light text-mocha"
                  }`}
                >
                  {o.costo}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.25}>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm font-light leading-relaxed text-mocha">
          {t.cierre}{" "}
          <a
            href={ruta(idioma, "/demo")}
            className="font-medium text-clay-bright transition-colors hover:text-sand"
          >
            {t.cierreEnlace}
          </a>
        </p>
      </Reveal>
    </section>
  );
}
