/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['bstore'],
    experimental: {
      serverActions: {
        bodySizeLimit: '1000mb',
      },
  }
};


export default nextConfig;
