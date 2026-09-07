import { GeistSans } from "geist/font/sans";
import "./globals.css";

// La página que ve alguien cuando escribe mal una dirección o sigue un enlace roto.
//
// 🔴 POR QUÉ RENDERIZA SU PROPIO <html> (2026-09-07)
// El sitio tiene DOS esqueletos —uno por idioma— y Next no envuelve el 404 global con
// ninguno de los dos: no sabe a qué idioma pertenece una dirección que no existe. Sin
// este archivo, Next sirve su página de fábrica: fondo blanco, "404: This page could not
// be found." y ni siquiera un `<html lang>`. Aquí se arma el documento completo.
//
// Va en los DOS idiomas a propósito: no sabemos en cuál llegó quien se perdió. Por eso el
// `lang` del documento se queda en español (el idioma principal del sitio) y la línea en
// inglés lleva el suyo, que es como se marca una frase en otro idioma.

export default function NoEncontrada() {
  return (
    <html lang="es-MX" className={GeistSans.variable}>
      <body className="font-sans antialiased">
        <main className="flex min-h-screen items-center justify-center bg-obsidian px-6 text-center">
          <div>
            <div className="mb-4 text-3xl">🧭</div>
            <h1 className="mb-2 text-2xl font-semibold text-sand">Esta página no existe</h1>
            <p className="mb-1 font-light text-mocha">
              Puede que el enlace esté incompleto o que la hayamos movido.
            </p>
            <p lang="en-US" className="mb-8 font-light text-mocha/80">
              This page does not exist. The link may be incomplete or the page may have moved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="/"
                className="inline-flex min-h-[44px] items-center rounded-full bg-clay px-7 py-3 font-semibold text-obsidian transition-colors hover:bg-clay-bright"
              >
                Ir al inicio
              </a>
              <a
                href="/en"
                lang="en-US"
                className="inline-flex min-h-[44px] items-center rounded-full border border-sand/30 px-7 py-3 font-semibold text-sand transition-colors hover:border-clay hover:text-clay-bright"
              >
                Go to homepage
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
