/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
