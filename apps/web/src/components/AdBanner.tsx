"use client";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";

interface Props {
  slot: string;           // AdSense ad slot ID
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

/**
 * AdBanner — hiển thị quảng cáo Google AdSense.
 * - Không hiển thị cho user VIP (isPremium)
 * - Chỉ load khi có NEXT_PUBLIC_ADSENSE_ID
 * - Dùng: <AdBanner slot="1234567890" format="horizontal" />
 */
export default function AdBanner({ slot, format = "auto", className = "" }: Props) {
  const { user } = useAuthStore();
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  // VIP users don't see ads
  if (user?.isPremium) return null;
  // No publisher ID configured
  if (!publisherId) return null;

  useEffect(() => {
    if (pushed.current) return;
    try {
      const adsbygoogle = (window as any).adsbygoogle;
      if (adsbygoogle) {
        adsbygoogle.push({});
        pushed.current = true;
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <div className={`ad-banner-wrapper ${className}`} style={{ overflow: "hidden", textAlign: "center" }}>
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
