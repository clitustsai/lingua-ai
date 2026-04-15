/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ai-lang/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;
