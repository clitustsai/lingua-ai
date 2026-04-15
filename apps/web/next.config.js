/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ai-lang/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

module.exports = nextConfig;
