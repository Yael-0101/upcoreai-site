import { readFileSync } from "node:fs";

// Las direcciones VIEJAS del inglés (`/en/precios`, `/en/soluciones/…`), que
// estuvieron publicadas antes de que las rutas se tradujeran el 2026-08-22.
// La lista la escribe `scripts/generar-redirecciones.mjs` leyendo lib/rutas.ts,
// y el prebuild falla si se desfasa: este archivo es JavaScript y no puede
// importar TypeScript, así que el JSON es el puente. Se lee con fs y no con
// `import ... with { type: "json" }` para no depender de los atributos de
// importación en la versión de Node con la que compile Vercel.
const REDIRECCIONES_IDIOMA = JSON.parse(
  readFileSync(new URL("./redirecciones.json", import.meta.url), "utf8")
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Las imágenes OG leen los TTF de geist con fs; sin esto, el trazador de
  // Vercel no mete las fuentes al bundle de la función y las rutas
  // /**/opengraph-image truenan con 500 en producción (visto 2026-07-22).
  outputFileTracingIncludes: {
    "/**/opengraph-image": ["./node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf", "./node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf"],
  },
  async redirects() {
    return [
      {
        source: "/privacy-policy.html",
        destination: "/privacidad",
        permanent: true,
      },
      {
        source: "/terms-of-service.html",
        destination: "/terminos",
        permanent: true,
      },
      ...REDIRECCIONES_IDIOMA,
    ];
  },
};

export default nextConfig;
