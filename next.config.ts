// next.config.ts
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// ✅ Initialize Cloudflare context for local development ONLY
// This does NOT run in production - safe to add
initOpenNextCloudflareForDev();

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
    ],
    unoptimized: true, 
  },
  // Fix for SQLITE_BUSY: Force sequential page generation
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  // Increase timeout for the larger production dataset
  staticPageGenerationTimeout: 300,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
};

export default nextConfig;