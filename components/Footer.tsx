import { Logo } from "./Logo";
import { SOLUCIONES } from "@/lib/soluciones";
import { HAY_BLOG } from "@/lib/blog";
import { contenido } from "@/lib/site-textos";
import type { Idioma } from "@/lib/idioma";
import { ruta } from "@/lib/rutas";

export function Footer({ idioma = "es" }: { idioma?: Idioma }) {
  const t = contenido(idioma);

  return (
    <footer className="border-t border-[rgba(242,231,219,0.06)] px-[6%] pb-12 pt-20 text-center md:px-[10%]">
      <div className="mb-6 flex justify-center">
        <a href="#top" aria-label={t.nav.inicio} className="inline-flex">
          <Logo />
        </a>
      </div>
      <nav aria-label={t.footer.soluciones} className="mb-8">
        <div className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-mocha/60">
          {t.footer.soluciones}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {SOLUCIONES.map((s) => (
            <a
              key={s.slug}
              href={ruta(idioma, `/soluciones/${s.slug}`)}
              className="text-xs text-mocha transition-colors hover:text-clay"
            >
              {s.t[idioma].nombreCorto}
            </a>
          ))}
        </div>
      </nav>
      <nav aria-label="Upcore" className="mb-8">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <a
            href={ruta(idioma, "/precios")}
            className="text-xs text-mocha transition-colors hover:text-clay"
          >
            {t.nav.precios}
          </a>
          <a
            href={ruta(idioma, "/nosotros")}
            className="text-xs text-mocha transition-colors hover:text-clay"
          >
            {t.nav.nosotros}
          </a>
          {HAY_BLOG && (
            <a
              href={ruta(idioma, "/blog")}
              className="text-xs text-mocha transition-colors hover:text-clay"
            >
              {t.nav.blog}
            </a>
          )}
          <a
            href={ruta(idioma, "/demo")}
            className="text-xs text-mocha transition-colors hover:text-clay"
          >
            {t.nav.demoEnVivo}
          </a>
          <a
            href={ruta(idioma, "/empezar")}
            className="text-xs text-mocha transition-colors hover:text-clay"
          >
            {t.nav.diagnosticoGratis}
          </a>
        </div>
      </nav>
      <div className="mb-8 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
        <a
          href={ruta(idioma, "/privacidad")}
          className="text-xs uppercase tracking-[0.1em] text-mocha transition-colors hover:text-clay"
        >
          {t.footer.privacidad}
        </a>
        <a
          href={ruta(idioma, "/terminos")}
          className="text-xs uppercase tracking-[0.1em] text-mocha transition-colors hover:text-clay"
        >
          {t.footer.terminos}
        </a>
      </div>
      <div className="text-xs tracking-wide text-mocha/50">{t.footer.derechos}</div>
    </footer>
  );
}
