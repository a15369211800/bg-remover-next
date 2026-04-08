/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to support API routes and NextAuth
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
