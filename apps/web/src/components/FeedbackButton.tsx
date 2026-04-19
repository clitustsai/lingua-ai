"use client";
import { useState } from "react";
import { MessageSquareWarning, X, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

type Status = "idle" | "open" | "sending" | "sent";

export default function FeedbackButton() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<Status>("idle");
  const [type, setType] = useState<"bug" | "feedback" | "suggestion">("bug");
  const [message, setMessage] = useState("");

  const submit = async () => {
    if (!message.trim()) return;
    setStatus("sending");
    try {
      await fetch("/api/report-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `[${type.toUpperCase()}] ${message}`,
          stack: `User: ${user?.name || "anonymous"} (${user?.email || ""})\nURL: ${window.location.href}`,
          url: window.location.href,
          userAgent: navigator.userAgent,
          userId: user?.id,
          timestamp: new Date().toISOString(),
        }),
      });
      setStatus("sent");
      setMessage("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("idle");
    }
  };

  if (status === "idle") {
    return (
      <button
        onClick={() => setStatus("open")}
        className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 4px 20px rgba(124,58,237,0.5)" }}
        title="Báo lỗi / Feedback">
        <MessageSquareWarning className="w-5 h-5 text-white" />
      </button>
    );
  }

  if (status === "sent") {
    return (
      <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium text-white animate-fade-in-scale"
        style={{ background: "rgba(16,185,129,0.9)", backdropFilter: "blur(12px)" }}>
        <CheckCircle2 className="w-4 h-4" /> Đã gửi! Cảm ơn bạn.
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6 w-80 rounded-3xl shadow-2xl animate-fade-in-scale"
      style={{ background: "rgba(15,10,30,0.97)", border: "1px solid rgba(139,92,246,0.35)", backdropFilter: "blur(20px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <p className="text-white font-semibold text-sm">Báo lỗi / Feedback</p>
        <button onClick={() => setStatus("idle")} className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Type selector */}
        <div className="flex gap-2">
          {(["bug", "feedback", "suggestion"] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                type === t
                  ? "border-primary-500 bg-primary-900/40 text-primary-300"
                  : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
              }`}>
              {t === "bug" ? "🐛 Lỗi" : t === "feedback" ? "💬 Góp ý" : "💡 Đề xuất"}
            </button>
          ))}
        </div>

        {/* Message */}
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={
            type === "bug" ? "Mô tả lỗi bạn gặp phải..."
            : type === "feedback" ? "Chia sẻ trải nghiệm của bạn..."
            : "Bạn muốn thêm tính năng gì?"
          }
          rows={4}
          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 resize-none"
          style={{ background: "rgba(26,16,53,0.8)" }}
        />

        {/* User info */}
        {user && (
          <p className="text-xs text-gray-600">Gửi từ: {user.name} · {user.email}</p>
        )}

        <button onClick={submit} disabled={!message.trim() || status === "sending"}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
          {status === "sending"
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</>
            : <><Send className="w-4 h-4" /> Gửi</>
          }
        </button>
      </div>
    </div>
  );
}
