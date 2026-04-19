"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Bell, BellOff, X } from "lucide-react";

export default function NotificationManager() {
  const { stats, streak, settings, notificationsEnabled, setNotifications } = useAppStore();
  const [banner, setBanner] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof Notification !== "undefined") setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    // Show in-app banner if user hasn't studied today
    const today = new Date().toISOString().slice(0, 10);
    const studiedToday = stats.date === today && stats.messagesCount > 0;
    const hour = new Date().getHours();
    if (!studiedToday && hour >= 9 && hour <= 21) {
      const lessonsToday = stats.date === today ? (stats as any).lessonsCompleted ?? 0 : 0;
      const msgs = [
        streak >= 7
          ? `🔥 ${streak} ngày streak! Đừng để mất — học ${settings.targetLanguage.name} ngay!`
          : `📚 Hôm nay bạn chưa học. Chỉ cần 5 phút thôi!`,
        `🎯 Mục tiêu hôm nay: ${settings.dailyGoal ?? 5} từ. Bắt đầu nào!`,
        `💡 AI Teacher đang chờ bạn — học bài mới hôm nay nhé!`,
      ];
      setBanner(msgs[Math.floor(Math.random() * msgs.length)]);
    }
  }, []);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      setNotifications(true);
      scheduleReminder();
      new Notification("LinguaAI 🧠", {
        body: "Thông báo đã được bật! Chúng tôi sẽ nhắc bạn học mỗi ngày.",
        icon: "/favicon.ico",
      });
    }
  };

  const scheduleReminder = () => {
    // Schedule daily reminder at 8pm
    const now = new Date();
    const target = new Date();
    target.setHours(20, 0, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const delay = target.getTime() - now.getTime();
    setTimeout(() => {
      const today = new Date().toISOString().slice(0, 10);
      const store = useAppStore.getState();
      if (store.stats.date !== today || store.stats.messagesCount === 0) {
        new Notification("LinguaAI - Nhắc học 🔔", {
          body: `🔥 Streak ${store.streak} ngày! Học ${store.settings.targetLanguage.name} 5 phút thôi nhé!`,
          icon: "/favicon.ico",
        });
      }
    }, delay);
  };

  return (
    <>
      {/* In-app banner */}
      {banner && (
        <div className="fixed top-3 right-3 z-[100] max-w-[320px] w-[calc(100vw-24px)] md:max-w-sm"
          style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.5))" }}>
          <div className="rounded-2xl px-4 py-3 flex items-start gap-3"
            style={{ background: "rgba(26,16,53,0.97)", border: "1px solid rgba(139,92,246,0.4)" }}>
            <span className="text-xl shrink-0 mt-0.5">🔔</span>
            <p className="text-sm text-gray-200 flex-1 leading-relaxed">{banner}</p>
            <button onClick={() => setBanner(null)}
              className="text-gray-400 hover:text-white shrink-0 mt-0.5 p-1 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Notification toggle in settings - exported as component */}
    </>
  );
}

export function NotificationToggle() {
  const { notificationsEnabled, setNotifications } = useAppStore();
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof Notification !== "undefined") setPermission(Notification.permission);
  }, []);

  const toggle = async () => {
    if (permission !== "granted") {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") setNotifications(true);
    } else {
      setNotifications(!notificationsEnabled);
    }
  };

  return (
    <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2">
        {notificationsEnabled ? <Bell className="w-4 h-4 text-primary-400" /> : <BellOff className="w-4 h-4 text-gray-400" />}
        <div>
          <p className="text-sm text-gray-300">Nhắc nhở học hàng ngày</p>
          <p className="text-xs text-gray-500">{permission === "granted" ? "Thông báo lúc 8 giờ tối" : "Cần cấp quyền thông báo"}</p>
        </div>
      </div>
      <button onClick={toggle}
        className={`w-11 h-6 rounded-full transition-colors relative ${notificationsEnabled && permission === "granted" ? "bg-primary-600" : "bg-gray-700"}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notificationsEnabled && permission === "granted" ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}
