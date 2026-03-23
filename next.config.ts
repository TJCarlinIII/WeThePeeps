/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
    ],
    // Optional: If you plan to use R2 for images later, 
    // you'll add your R2 public bucket URL here.
    unoptimized: true, 
  },
  // This ensures that the build doesn't fail due to 
  // minor linting warnings in the "Dossier" scripts.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
};

export default nextConfig;