/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pjkquawlmwlndskktfgs.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Configurações para melhorar tempo real
  // Headers globais para evitar cache
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, private',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
  // Configurações para resolver problemas de hidratação
  compiler: {
    // Desabilitar minificação durante desenvolvimento para melhor debug
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig
