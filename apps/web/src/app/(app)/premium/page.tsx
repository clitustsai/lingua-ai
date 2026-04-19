"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { FREE_LIMITS } from "@/lib/usageLimit";

const PLANS = [
  { id: "monthly", label: "Hang thang", price: "79.000d", note: "Huy bat cu luc nao", badge: null },
  { id: "yearly",  label: "Hang nam",   price: "599.000d", note: "49.900d/thang", badge: "Tiet kiem 37%" },
];

const ROWS = [
  { feature: "Chat AI",        free: FREE_LIMITS.chat + " tin/ngay",           vip: "Khong gioi han", hi: true  },
  { feature: "Dich thuat",     free: FREE_LIMITS.translate + " lan/ngay",      vip: "Khong gioi han", hi: true  },
  { feature: "AI Teacher",     free: FREE_LIMITS.homework + " bai/ngay",       vip: "Khong gioi han", hi: true  },
  { feature: "Tao bai hoc AI", free: FREE_LIMITS.generateLesson + " lan/ngay", vip: "Khong gioi han", hi: true  },
  { feature: "Giai bai tap",   free: FREE_LIMITS.solve + " lan/ngay",          vip: "Khong gioi han", hi: false },
  { feature: "Voice / Noi",    free: "Co gioi han",                            vip: "Lien tuc, khong cat", hi: false },
  { feature: "Toc do AI",      free: "Binh thuong",                            vip: "Uu tien, it lag", hi: false },
  { feature: "Khoa hoc",       free: "1 khoa mien phi",                        vip: "Tat ca khoa hoc", hi: false },
];

export default function PremiumPage() {
  const { user } = useAuthStore();
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");

  if (user?.isPremium) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-5">
      <Crown className="w-16 h-16 text-yellow-400" />
      <h2 className="text-white font-black text-2xl">Ban dang dung VIP</h2>
      <p className="text-gray-400 text-sm">Tan huong khong gioi han luot dung AI!</p>
    </div>
  );

  return (
    <div className="max-w-lg pb-10" style={{ background: "#0f0a1e", minHeight: "100vh" }}>
      <div className="relative overflow-hidden px-5 pt-10 pb-8 text-center"
        style={{ background: "linear-gradient(135deg,#1a0533,#0f0a1e)" }}>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" }}>
            <Crown className="w-3.5 h-3.5" /> LinguaAI VIP
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Bo gioi han, dung thoai mai</h1>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            VIP = mua them luot dung AI khong gioi han. Khong phai khoa hoc rieng hay giao trinh dac biet.
          </p>
        </div>
      </div>
      <div className="px-5 space-y-5">
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "rgba(15,10,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {PLANS.map(p => (
            <button key={p.id} onClick={() => setPlan(p.id as any)}
              className={cn("flex-1 py-3 rounded-xl text-sm font-semibold transition-all relative",
                plan === p.id ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white")}>
              {p.badge && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                  {p.badge}
                </span>
              )}
              <div className="font-black">{p.price}</div>
              <div className={cn("text-xs mt-0.5", plan === p.id ? "text-black/60" : "text-gray-600")}>{p.note}</div>
            </button>
          ))}
        </div>
        <button className="w-full py-4 rounded-2xl font-black text-black text-lg"
          style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
          <Crown className="w-5 h-5 inline mr-2" />
          {plan === "yearly" ? "VIP 599.000d/nam" : "VIP 79.000d/thang"}
        </button>
        <div className="rounded-2xl p-4" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <p className="text-indigo-300 text-sm font-semibold mb-2">VIP thuc su la gi?</p>
          <p className="text-gray-400 text-xs leading-relaxed">
            VIP giup ban bo gioi han so lan dung AI moi ngay. Khong phai khoa hoc rieng, khong co giao trinh dac biet.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="grid grid-cols-3 text-xs font-bold" style={{ background: "rgba(15,10,30,0.8)" }}>
            <div className="px-4 py-3 text-gray-500">Tinh nang</div>
            <div className="px-3 py-3 text-center text-gray-500">Mien phi</div>
            <div className="px-3 py-3 text-center text-yellow-400">VIP</div>
          </div>
          {ROWS.map((row, i) => (
            <div key={i} className={cn("grid grid-cols-3 border-t border-white/5 items-center", row.hi && "bg-yellow-900/5")}>
              <div className="px-4 py-3 text-xs text-gray-300">{row.feature}</div>
              <div className="px-3 py-3 text-center text-xs text-gray-500">{row.free}</div>
              <div className="px-3 py-3 text-center">
                <span className={cn("text-xs font-semibold", row.hi ? "text-yellow-300" : "text-green-400")}>{row.vip}</span>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full py-4 rounded-2xl font-black text-black text-lg"
          style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
          <Sparkles className="w-5 h-5 inline mr-2" />
          {plan === "yearly" ? "Bat dau VIP 599.000d/nam" : "Bat dau VIP 79.000d/thang"}
        </button>
      </div>
    </div>
  );
}
