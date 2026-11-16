/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only *.page.ts(x) files are routes, so game logic and components can live beside their pages.
  pageExtensions: ["page.tsx", "page.ts"],
};

module.exports = nextConfig;
