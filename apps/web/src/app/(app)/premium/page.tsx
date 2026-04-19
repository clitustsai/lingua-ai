"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { FREE_LIMITS } from "@/lib/usageLimit";

const PLANS = [
  { id: "monthly", label: "Hàng tháng", price: "99.000đ/tháng", note: "Hủy bất cứ lúc nào", badge: null },
  { id: "yearly",  label: "Hàng năm",   price: "1.000.000đ/năm", note: "= 83.000đ/tháng", badge: "Tiết kiệm 16%" },
];

const ROWS = [
  { feature: "Chat AI",           free: FREE_LIMITS.chat + " tin/ngày",           vip: "Không giới hạn", hi: true  },
  { feature: "Dịch thuật",        free: FREE_LIMITS.translate + " lần/ngày",      vip: "Không giới hạn", hi: true  },
  { feature: "AI Teacher",        free: FREE_LIMITS.homework + " bài/ngày",       vip: "Không giới hạn", hi: true  },
  { feature: "Tạo bài học AI",    free: FREE_LIMITS.generateLesson + " lần/ngày", vip: "Không giới hạn", hi: true  },
  { feature: "Giải bài tập",      free: FREE_LIMITS.solve + " lần/ngày",          vip: "Không giới hạn", hi: false },
  { feature: "Voice / Luyện nói", free: "Có giới hạn",                            vip: "Liên tục, không cắt", hi: false },
  { feature: "Tốc độ AI",         free: "Bình thường",                            vip: "Ưu tiên, ít lag", hi: false },
  { feature: "Khóa học",          free: "1 khóa miễn phí",                        vip: "Tất cả khóa học", hi: false },
];

export default function PremiumPage() {
  const { user } = useAuthStore();
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");
  if (user?.isPremium) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-5">
      <Crown className="w-16 h-16 text-yellow-400" />
      <h2 className="text-white font-black text-2xl">Bạn đang dùng VIP 👑</h2>
      <p className="text-gray-400 text-sm">Tận hưởng không giới hạn lượt dùng AI!</p>
    </div>
  );
  const sel = PLANS.find(p => p.id === plan)!;
  return (
    <div className="max-w-lg pb-10" style={{ background: "#0f0a1e", minHeight: "100vh" }}>
      <div className="relative overflow-hidden px-5 pt-10 pb-8 text-center" style={{ background: "linear-gradient(135deg,#1a0533,#0f0a1e)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#f59e0b,transparent)" }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4" style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" }}>
            <Crown className="w-3.5 h-3.5" /> LinguaAI VIP
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Bỏ giới hạn, dùng thoải mái</h1>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">VIP = mua thêm lượt dùng AI không giới hạn. Không phải khóa học riêng hay giáo trình đặc biệt.</p>
        </div>
      </div>
      <div className="px-5 space-y-5">
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "rgba(15,10,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {PLANS.map(p => (
            <button key={p.id} onClick={() => setPlan(p.id as any)} className={cn("flex-1 py-3 rounded-xl text-sm font-semibold transition-all relative", plan === p.id ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white")}>
              {p.badge && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap">{p.badge}</span>}
              <div className="font-black">{p.price}</div>
              <div className={cn("text-xs mt-0.5", plan === p.id ? "text-black/60" : "text-gray-600")}>{p.note}</div>
            </button>
          ))}
        </div>
        <button className="w-full py-4 rounded-2xl font-black text-black text-lg" style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 8px 30px rgba(245,158,11,0.4)" }}>
          <Crown className="w-5 h-5 inline mr-2" />Nâng cấp VIP — {sel.price}
        </button>
        <p className="text-center text-xs text-gray-600">🔒 Thanh toán an toàn · Hủy bất cứ lúc nào · Hoàn tiền 7 ngày</p>
        <div className="rounded-2xl p-4" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <p className="text-indigo-300 text-sm font-semibold mb-2">💡 VIP thực sự là gì?</p>
          <p className="text-gray-400 text-xs leading-relaxed">VIP giúp bạn <strong className="text-white">bỏ giới hạn số lần dùng AI mỗi ngày</strong> — chat, dịch, luyện nói, tạo bài học... thoải mái không bị cắt. Không phải khóa học riêng, không có giáo trình đặc biệt.</p>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="grid grid-cols-3 text-xs font-bold" style={{ background: "rgba(15,10,30,0.8)" }}>
            <div className="px-4 py-3 text-gray-500">Tính năng</div>
            <div className="px-3 py-3 text-center text-gray-500">Miễn phí</div>
            <div className="px-3 py-3 text-center text-yellow-400">VIP 👑</div>
          </div>
          {ROWS.map((row, i) => (
            <div key={i} className={cn("grid grid-cols-3 border-t border-white/5 items-center", row.hi && "bg-yellow-900/5")}>
              <div className="px-4 py-3 text-xs text-gray-300">{row.feature}</div>
              <div className="px-3 py-3 text-center text-xs text-gray-500">{row.free}</div>
              <div className="px-3 py-3 text-center"><span className={cn("text-xs font-semibold", row.hi ? "text-yellow-300" : "text-green-400")}>{row.vip}</span></div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[
            { q: "Có thể hủy không?", a: "Có, hủy bất cứ lúc nào. Không tính phí thêm." },
            { q: "Thanh toán qua đâu?", a: "Momo, VNPay, thẻ ngân hàng nội địa và quốc tế." },
            { q: "Hoàn tiền không?", a: "Hoàn tiền 100% trong 7 ngày đầu nếu không hài lòng." },
            { q: "VIP có khóa học riêng không?", a: "Không. VIP chỉ bỏ giới hạn lượt dùng AI. Khóa học là nội dung chung cho tất cả." },
          ].map((item, i) => (
            <div key={i} className="rounded-xl px-4 py-3" style={{ background: "rgba(26,16,53,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-white text-sm font-semibold mb-1">{item.q}</p>
              <p className="text-gray-500 text-xs">{item.a}</p>
            </div>
          ))}
        </div>
        <button className="w-full py-4 rounded-2xl font-black text-black text-lg" style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 8px 30px rgba(245,158,11,0.3)" }}>
          <Sparkles className="w-5 h-5 inline mr-2" />Bắt đầu VIP — {sel.price}
        </button>
      </div>
    </div>
  );
}