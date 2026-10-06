import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The floating dev badge sits over the bottom-left of the page (filter sheet buttons) on mobile.
  devIndicators: false,
};

export default nextConfig;
