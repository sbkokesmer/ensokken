const nextConfig = {
  reactStrictMode: true,

  output: 'export',

  // 🔑 BU SATIR HER ŞEYİ DÜZELTİR
  trailingSlash: true,

  swcMinify: false,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
