import { Logo } from "./Logo";
import { SOLUCIONES } from "@/lib/soluciones";
import { HAY_BLOG } from "@/lib/blog";
import { contenido } from "@/lib/site-textos";
import type { Idioma } from "@/lib/idioma";
import { ruta } from "@/lib/rutas";

// Los enlaces del pie se tocan con el dedo: con `py-1` medían 24 px de alto, por debajo del
// mínimo de control en móvil (44×44, y 28 como piso absoluto). Con `py-2.5` quedan en 38 y el
// espacio vertical entre filas sube, que según la guía pesa tanto como el tamaño. No se agranda
// el texto para no rehacer el pie: son enlaces secundarios, no acciones principales.
const ENLACE_PIE =
  "inline-block px-1 py-2.5 text-xs text-mocha transition-colors hover:text-clay-bright";

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
        <div className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-mocha/80">
          {t.footer.soluciones}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          {SOLUCIONES.map((s) => (
            <a
              key={s.slug}
              href={ruta(idioma, `/soluciones/${s.slug}`)}
              className={ENLACE_PIE}
            >
              {s.t[idioma].nombreCorto}
            </a>
          ))}
        </div>
      </nav>
      <nav aria-label="Upcore" className="mb-8">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          <a
            href={ruta(idioma, "/precios")}
            className={ENLACE_PIE}
          >
            {t.nav.precios}
          </a>
          <a
            href={ruta(idioma, "/nosotros")}
            className={ENLACE_PIE}
          >
            {t.nav.nosotros}
          </a>
          {HAY_BLOG && (
            <a
              href={ruta(idioma, "/blog")}
              className={ENLACE_PIE}
            >
              {t.nav.blog}
            </a>
          )}
          <a
            href={ruta(idioma, "/demo")}
            className={ENLACE_PIE}
          >
            {t.nav.demoEnVivo}
          </a>
          <a
            href={ruta(idioma, "/empezar")}
            className={ENLACE_PIE}
          >
            {t.nav.diagnosticoGratis}
          </a>
        </div>
      </nav>
      <div className="mb-8 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
        <a
          href={ruta(idioma, "/privacidad")}
          className="inline-flex min-h-[44px] items-center px-1 text-xs uppercase tracking-[0.1em] text-mocha transition-colors hover:text-clay-bright"
        >
          {t.footer.privacidad}
        </a>
        <a
          href={ruta(idioma, "/terminos")}
          className="inline-flex min-h-[44px] items-center px-1 text-xs uppercase tracking-[0.1em] text-mocha transition-colors hover:text-clay-bright"
        >
          {t.footer.terminos}
        </a>
      </div>
      <div className="text-xs tracking-wide text-mocha/75">{t.footer.derechos}</div>
    </footer>
  );
}
