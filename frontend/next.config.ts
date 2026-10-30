import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'store.storeimages.cdn-apple.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.samsung.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.apple.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fdn2.gsmarena.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'phonedb.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Proxy browser API calls to the backend so auth cookies remain
  // first-party (the browser only ever talks to this origin).
  // BACKEND_URL may be a bare hostname (Render blueprint fromService host)
  // or a full URL.
  async rewrites() {
    const backend = process.env.BACKEND_URL || 'http://localhost:3001';
    const destination = backend.startsWith('http') ? backend : `https://${backend}`;
    return [
      {
        source: '/api/:path*',
        destination: `${destination}/:path*`,
      },
    ];
  },
};

export default nextConfig;
