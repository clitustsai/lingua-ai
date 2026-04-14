"use client";
import { useEffect } from "react";
import NotificationManager from "@/components/NotificationManager";

export default function AppInit() {
  useEffect(() => {
    // Register service worker for offline support
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return <NotificationManager />;
}
