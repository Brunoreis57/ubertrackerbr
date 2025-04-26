/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignorar erros ESLint durante build de produção
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar erros de TypeScript durante build de produção
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 