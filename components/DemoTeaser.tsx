import Link from "next/link";
import { Reveal } from "./Reveal";
import { SectionTitle } from "./SectionTitle";
import { contenido } from "@/lib/site-textos";
import { ruta, type Idioma } from "@/lib/idioma";

// Teaser de la demo en el home: mini-teléfono ESTÁTICO (no gasta API) + CTA a /demo.
//
// ⚠️ Las burbujas del chat se quedan en ESPAÑOL también en la versión inglesa,
// a propósito: lo que se está enseñando es cómo atiende el asistente al
// comprador latinoamericano. Traducirlas diría que vendemos atención en inglés,
// que es lo contrario de nuestro posicionamiento. El texto de alrededor sí se
// traduce, y dice explícitamente que las demos corren en español.
export function DemoTeaser({ idioma = "es" }: { idioma?: Idioma }) {
  const t = contenido(idioma).demoTeaser;

  return (
    <section id="demo" className="px-[6%] py-24 md:px-[10%] md:py-32">
      <SectionTitle title={t.heading} sub={t.sub} />

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 md:flex-row md:gap-14">
        {/* Mini-teléfono estático */}
        <Reveal className="w-full md:w-1/2">
          <div className="glass animate-float mx-auto max-w-[330px] rounded-[2rem] p-2">
            <div className="glass-body space-y-2.5 rounded-[1.6rem] bg-[#141310] px-3 py-4">
              <div className="mb-1 flex items-center gap-2 border-b border-white/[0.07] pb-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-clay text-xs font-bold text-obsidian">
                  I
                </span>
                <div>
                  <div className="text-xs font-semibold text-sand">{t.chatTitulo}</div>
                  <div className="text-[0.6rem] text-sage">{t.chatEstado}</div>
                </div>
              </div>
              {t.burbujas.map((b, i) => (
                <div
                  key={i}
                  className={b.de === "comprador" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-1.5 text-[0.72rem] leading-relaxed text-sand ${
                      b.de === "comprador"
                        ? "rounded-br-sm bg-[rgba(200,98,61,0.22)]"
                        : "rounded-bl-sm bg-white/[0.06]"
                    }`}
                  >
                    {b.texto}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Copy + CTA */}
        <Reveal delay={0.15} className="w-full text-center md:w-1/2 md:text-left">
          <h3 className="text-2xl font-semibold tracking-tight text-sand">{t.copyTitulo}</h3>
          <p className="mt-3 text-base font-light leading-relaxed text-mocha">{t.copyBody}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Link
              href={ruta(idioma, "/demo")}
              className="btn-shine inline-block rounded-full bg-clay px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
            >
              {t.ctaChat}
            </Link>
            <Link
              href={ruta(idioma, "/soluciones/agente-de-voz-para-inmobiliarias#demo-voz")}
              className="inline-block rounded-full border border-[rgba(242,231,219,0.25)] px-7 py-3.5 text-sm font-semibold text-sand transition-colors hover:border-clay hover:text-clay"
            >
              {t.ctaVoz}
            </Link>
          </div>

          <p className="mt-3 text-xs font-light text-mocha/70">{t.nota}</p>
        </Reveal>
      </div>
    </section>
  );
}
