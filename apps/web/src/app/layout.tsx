import type { Metadata } from "next";
import "./globals.css";
import AppInit from "@/components/AppInit";

export const metadata: Metadata = {
  title: "LinguaAI - Learn Languages with AI",
  description: "AI-powered language learning app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppInit>{children}</AppInit>
      </body>
    </html>
  );
}
