/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Serve modern, smaller formats; the browser picks the best it supports.
    formats: ['image/avif', 'image/webp'],
    // Allowed quality values for next/image (Next 16 requires this allow-list).
    qualities: [75, 85],
  },
};

export default nextConfig;
