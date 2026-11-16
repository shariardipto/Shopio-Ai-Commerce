/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Product images uploaded by the admin are served from Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Admin product forms send images (max 4 MB) through a Server Action.
      // The default limit is 1 MB, so we allow a little more than 4 MB.
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
