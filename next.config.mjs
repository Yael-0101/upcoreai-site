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
    ];
  },
};

export default nextConfig;
