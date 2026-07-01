function Logo() {
  return (
    <a href="#top" className="flex items-center justify-center text-[1.4rem] font-semibold tracking-tight">
      <span className="text-clay">UP</span>
      <span className="text-sand">CORE</span>
      <span className="text-clay">AI</span>
    </a>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[rgba(242,231,219,0.06)] px-[6%] pb-12 pt-20 text-center md:px-[10%]">
      <div className="mb-6">
        <Logo />
      </div>
      <div className="mb-8 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
        <a
          href="/privacy-policy.html"
          className="text-xs uppercase tracking-[0.1em] text-mocha transition-colors hover:text-clay"
        >
          Política de Privacidad
        </a>
        <a
          href="/terms-of-service.html"
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
