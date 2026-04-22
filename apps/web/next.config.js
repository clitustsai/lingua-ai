/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ai-lang/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "img.vietqr.io" },
    ],
    // Enable Next.js image optimization (WebP/AVIF auto-conversion)
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24h cache
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  // Compress responses
  compress: true,
  // Production optimizations
  poweredByHeader: false,
  // Security headers + performance caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com https://pagead2.googlesyndication.com https://adservice.google.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://img.youtube.com https://i.ytimg.com https://*.ytimg.com https://i9.ytimg.com https://lh3.googleusercontent.com https://img.vietqr.io https://pagead2.googlesyndication.com https://*.googleusercontent.com https://*.youtube.com",
              "media-src 'self' blob: https://www.youtube.com https://www.youtube-nocookie.com",
              "connect-src 'self' https://*.supabase.co https://api.groq.com https://api.resend.com https://pagead2.googlesyndication.com https://adservice.google.com https://www.googleapis.com",
              "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.youtube.com",
              "font-src 'self' data:",
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Cache public assets (images, fonts, icons)
        source: "/(.*)\\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|otf|webp|avif)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
