import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-[rgba(242,231,219,0.06)] px-[6%] pb-12 pt-20 text-center md:px-[10%]">
      <div className="mb-6 flex justify-center">
        <a href="#top" aria-label="Upcore AI — inicio" className="inline-flex">
          <Logo />
        </a>
      </div>
      <div className="mb-8 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
        <a
          href="/privacidad"
          className="text-xs uppercase tracking-[0.1em] text-mocha transition-colors hover:text-clay"
        >
          Política de Privacidad
        </a>
        <a
          href="/terminos"
          className="text-xs uppercase tracking-[0.1em] text-mocha transition-colors hover:text-clay"
        >
          Términos de Servicio
        </a>
      </div>
      <div className="text-xs tracking-wide text-mocha/50">
        © 2026 UPCORE AI. TODOS LOS DERECHOS RESERVADOS.
      </div>
    </footer>
  );
}
