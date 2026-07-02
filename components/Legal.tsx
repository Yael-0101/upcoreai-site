import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { Backdrop } from "./Backdrop";

// Shell compartido para las páginas legales — usa el mismo diseño/paleta del sitio.
export function Legal({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <>
      <Backdrop />
      <Nav />
      <main className="relative z-[2] px-[6%] pb-24 pt-32 md:px-[10%]">
        <div className="mx-auto max-w-3xl">
          <a
            href="/"
            className="mb-8 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-mocha transition-colors hover:text-clay"
          >
            ← Volver al inicio
          </a>
          <h1 className="text-gradient text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.03em]">
            {title}
          </h1>
          <p className="mb-10 mt-2 text-xs uppercase tracking-[0.15em] text-mocha/70">
            Última actualización: {updated}
          </p>
          <div className="card-soft rounded-[28px] p-8 md:p-12">
            <p className="mb-8 text-sm font-light leading-relaxed text-sand/90">
              {intro}
            </p>
            <div className="space-y-8">{children}</div>
          </div>
          <p className="mt-8 text-xs font-light leading-relaxed text-mocha/50">
            Este documento es informativo y no constituye asesoría legal. Te
            recomendamos que un profesional del derecho lo revise antes de
            considerarlo definitivo.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold tracking-tight text-sand">
        {title}
      </h2>
      <div className="space-y-3 text-sm font-light leading-relaxed text-mocha">
        {children}
      </div>
    </section>
  );
}
