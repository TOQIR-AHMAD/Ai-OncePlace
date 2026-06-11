/** @type {import('next').NextConfig} */
const nextConfig = {
  // Full static site generation for production (deployable on Cloudflare Pages /
  // Vercel free tier). Gated to production builds only: `output: 'export'` breaks
  // on-demand rendering of dynamic routes in `next dev` (it wrongly reports
  // generateStaticParams as missing), so dev runs as a normal server instead.
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  // next/image optimization requires a server; disable it for a pure static export.
  images: {
    unoptimized: true,
  },
  // Emit /tool/x/index.html instead of /tool/x.html — most compatible with static hosts.
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
