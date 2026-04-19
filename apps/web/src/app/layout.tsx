import type { Metadata } from "next";
import "./globals.css";
import AppInit from "@/components/AppInit";
import { GlobalErrorHandler } from "@/components/ErrorBoundary";
import Script from "next/script";

export const metadata: Metadata = {
  title: "LinguaAI - Learn Languages with AI",
  description: "AI-powered language learning app",
};

// Thay YOUR_PUBLISHER_ID bằng ca-pub-XXXXXXXXXXXXXXXXX của bạn
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID ?? "";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense Auto Ads — chỉ load khi có publisher ID */}
        {ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>
        <AppInit>
          <GlobalErrorHandler />
          {children}
        </AppInit>
      </body>
    </html>
  );
}
