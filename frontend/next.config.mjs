/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 强制使用新端口，避免浏览器缓存
  env: {
    PORT: '3001',
    NEXT_PUBLIC_PORT: '3001',
  },
  // 禁用缓存以确保完全重新加载
  generateEtags: false,
  poweredByHeader: false,
}

export default nextConfig
