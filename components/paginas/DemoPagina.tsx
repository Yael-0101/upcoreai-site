import { RaizIdioma } from "@/components/RaizIdioma";
import { Backdrop } from "@/components/Backdrop";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { DemoChat } from "@/components/DemoChat";
import { AgendarCTA } from "@/components/AgendarCTA";
import { LiquidGlassFilter } from "@/components/LiquidGlassFilter";
import type { Giro } from "@/lib/demo-config";
import { paginas } from "@/lib/paginas-textos";
import type { Idioma } from "@/lib/idioma";

export function DemoPagina({
  clinica,
  giro,
  idioma,
}: {
  clinica: string;
  giro: Giro;
  idioma: Idioma;
}) {
  const t = paginas(idioma).demo;

  return (
    <RaizIdioma idioma={idioma}>
      <LiquidGlassFilter />
      <Backdrop />
      <Nav idioma={idioma} path="/demo" />
      <main className="relative z-[2] px-[6%] pb-24 pt-32 md:px-[10%]">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <span className="mb-4 inline-block rounded-full border border-clay/40 bg-clay/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-clay">
              {t.etiqueta}
            </span>
            <h1 className="text-gradient mx-auto max-w-2xl text-[clamp(1.9rem,5vw,3rem)] font-semibold leading-tight tracking-tight">
              {t.h1}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base font-light leading-relaxed text-mocha">
              {t.intro}
            </p>
          </div>

          <DemoChat clinica={clinica} giro={giro} idioma={idioma} />

          <div className="mx-auto mt-14 grid max-w-3xl gap-4 md:grid-cols-3">
            {t.bullets.map((b) => (
              <div key={b.titulo} className="card-soft rounded-2xl p-5">
                <div className="mb-1 text-sm font-semibold text-sand">{b.titulo}</div>
                <p className="text-xs font-light leading-relaxed text-mocha">{b.texto}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="mb-4 text-sm font-light text-mocha">{t.cierre}</p>
            <AgendarCTA
              idioma={idioma}
              label={t.cta}
              className="btn-shine inline-block rounded-full bg-clay px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
            />
          </div>
        </div>
      </main>
      <Footer idioma={idioma} />
    </RaizIdioma>
  );
}
