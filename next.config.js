/** @type {import('next').NextConfig} */

// WebContainer ortamında "process.stdout._handle.setBlocking is not a function" hatasını düzeltmek için yama
try {
  if (process.stdout && !process.stdout._handle) {
    process.stdout._handle = {};
  }
  if (process.stdout && process.stdout._handle && !process.stdout._handle.setBlocking) {
    process.stdout._handle.setBlocking = () => {};
  }

  if (process.stderr && !process.stderr._handle) {
    process.stderr._handle = {};
  }
  if (process.stderr && process.stderr._handle && !process.stderr._handle.setBlocking) {
    process.stderr._handle.setBlocking = () => {};
  }
} catch (e) {
  console.warn("Could not patch process.stdout/stderr", e);
}

const nextConfig = {
  reactStrictMode: true,

  // 🔑 NETLIFY İÇİN EN KRİTİK SATIR
  output: 'export',

  // WebContainer uyumu
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
