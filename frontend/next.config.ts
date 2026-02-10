import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/tasks/:path*',
        destination: 'http://localhost:5000/api/tasks/:path*',
      },
      {
        source: '/api/projects/:path*',
        destination: 'http://localhost:5000/api/projects/:path*',
      },
    ];
  },
};

export default nextConfig;
