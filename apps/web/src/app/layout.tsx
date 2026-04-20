import type { Metadata } from "next";
import "./globals.css";
import AppInit from "@/components/AppInit";
import { GlobalErrorHandler } from "@/components/ErrorBoundary";
import Script from "next/script";

export const metadata: Metadata = {
  title: "LinguaAI - Learn Languages with AI",
  description: "AI-powered language learning app",
  other: {
    "google-adsense-account": "ca-pub-9757340188160338",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9757340188160338"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
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
