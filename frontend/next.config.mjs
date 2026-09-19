/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/portal', destination: '/dashboard', permanent: true },
      { source: '/portal/:path*', destination: '/dashboard', permanent: true },
      { source: '/portal/admin', destination: '/admin', permanent: true },
    ];
  },
};

export default nextConfig;
