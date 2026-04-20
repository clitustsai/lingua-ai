"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Crown, Loader2, Copy, Check, QrCode, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { FREE_LIMITS } from "@/lib/usageLimit";

const PLANS = [
  { id: "monthly", label: "1 thang", price: "99.000d", amount: 99000, badge: null },
  { id: "yearly",  label: "1 nam",   price: "1.000.000d", amount: 1000000, badge: "Tiet kiem 16%" },
];

const ROWS = [
  { feature: "Chat AI",        free: FREE_LIMITS.chat + " tin/ngay",           vip: "Khong gioi han", hi: true  },
  { feature: "Dich thuat",     free: FREE_LIMITS.translate + " lan/ngay",      vip: "Khong gioi han", hi: true  },
  { feature: "AI Teacher",     free: FREE_LIMITS.homework + " bai/ngay",       vip: "Khong gioi han", hi: true  },
  { feature: "Tao bai hoc AI", free: FREE_LIMITS.generateLesson + " lan/ngay", vip: "Khong gioi han", hi: true  },
  { feature: "Giai bai tap",   free: FREE_LIMITS.solve + " lan/ngay",          vip: "Khong gioi han", hi: false },
  { feature: "Voice / Noi",    free: "Co gioi han",                            vip: "Lien tuc, khong cat", hi: false },
  { feature: "Khoa hoc",       free: "1 khoa mien phi",                        vip: "Tat ca khoa hoc", hi: false },
];

export default function PremiumPage() {
  const { user } = useAuthStore();
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [qrData, setQrData] = useState<Record<string,any>|null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [notified, setNotified] = useState(false);
  const [notifying, setNotifying] = useState(false);

  const sel = PLANS.find(p => p.id === plan);

  const getQR = async () => {
    if (!user) return;
    setLoading(true); setNotified(false);
    try {
      const res = await fetch("/api/payment/vietqr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, plan, email: user.email }),
      });
      const data = await res.json();
      setQrData(data);
    } catch { alert("Loi tao QR."); }
    finally { setLoading(false); }
  };

  const notifyPayment = async () => {
    if (!user || !qrData) return;
    setNotifying(true);
    try {
      await fetch("/api/payment/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, userEmail: user.email, plan, addInfo: qrData.addInfo, amount: qrData.amount }),
      });
      setNotified(true);
    } catch { alert("Loi gui thong bao."); }
    finally { setNotifying(false); }
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  if (user?.isPremium) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-5">
      <Crown className="w-16 h-16 text-yellow-400" />
      <h2 className="text-white font-black text-2xl">Ban dang dung VIP</h2>
      <p className="text-gray-400 text-sm">Tan huong khong gioi han luot dung AI!</p>
    </div>
  );

  return (
    <div className="max-w-lg pb-10" style={{ background: "#0f0a1e", minHeight: "100vh" }}>
      <div className="relative overflow-hidden px-5 pt-10 pb-8 text-center" style={{ background: "linear-gradient(135deg,#1a0533,#0f0a1e)" }}>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4" style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" }}>
            <Crown className="w-3.5 h-3.5" /> LinguaAI VIP
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Nang cap VIP</h1>
          <p className="text-gray-400 text-sm">Chuyen khoan ACB - Tu dong kich hoat sau xac nhan</p>
        </div>
      </div>
      <div className="px-5 space-y-5">
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "rgba(15,10,30,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {PLANS.map(p => (
            <button key={p.id} onClick={() => { setPlan(p.id); setQrData(null); setNotified(false); }}
              className={cn("flex-1 py-3 rounded-xl text-sm font-semibold transition-all relative", plan === p.id ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white")}>
              {p.badge && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap">{p.badge}</span>}
              <div className="font-black">{p.price}</div>
              <div className={cn("text-xs mt-0.5", plan === p.id ? "text-black/60" : "text-gray-600")}>{p.label}</div>
            </button>
          ))}
        </div>
        {!qrData ? (
          <button onClick={getQR} disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-black text-lg flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 8px 30px rgba(245,158,11,0.4)" }}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
            {loading ? "Dang tao QR..." : "Tao QR chuyen khoan - " + sel?.price}
          </button>
        ) : (
          <div className="rounded-2xl p-5 flex flex-col items-center gap-4" style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(245,158,11,0.3)" }}>
            <p className="text-yellow-300 font-bold text-sm">Quet QR de chuyen khoan</p>
            <div className="rounded-2xl overflow-hidden bg-white p-2">
              <img src={qrData.qrUrl} alt="VietQR ACB" className="w-56 h-56 object-contain" />
            </div>
            <div className="w-full rounded-xl p-3 space-y-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {[
                { label: "Ngan hang", value: "ACB", key: "bank" },
                { label: "So tai khoan", value: qrData.accountNo, key: "acc" },
                { label: "Chu tai khoan", value: qrData.accountName, key: "name" },
                { label: "So tien", value: qrData.amount?.toLocaleString() + "d", key: "amt" },
                { label: "Noi dung CK", value: qrData.addInfo, key: "info" },
              ].map(item => (
                <div key={item.key} className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">{item.label}</span>
                  <div className="flex items-center gap-1">
                    <span className={cn("font-semibold", item.key === "amt" ? "text-yellow-300" : "text-white")}>{item.value}</span>
                    {(item.key === "acc" || item.key === "info") && (
                      <button onClick={() => copy(item.value, item.key)} className="text-gray-500 hover:text-white ml-1">
                        {copied === item.key ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!notified ? (
              <button onClick={notifyPayment} disabled={notifying}
                className="w-full py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                {notifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                {notifying ? "Dang gui..." : "Da chuyen khoan - Thong bao admin"}
              </button>
            ) : (
              <div className="w-full rounded-2xl p-3 text-center" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <p className="text-green-400 font-semibold text-sm">Da gui thong bao!</p>
                <p className="text-gray-400 text-xs mt-1">Admin se xac nhan va kich hoat VIP trong 1-24 gio.</p>
              </div>
            )}
            <div className="rounded-xl p-3 w-full" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <p className="text-yellow-300 text-xs">Nhap dung noi dung: <span className="font-mono font-bold">{qrData.addInfo}</span></p>
            </div>
            <button onClick={() => { setQrData(null); setNotified(false); }} className="text-gray-500 text-xs hover:text-gray-300">Tao lai QR</button>
          </div>
        )}
        <p className="text-center text-xs text-gray-600">Chuyen khoan an toan - Hoan tien 7 ngay</p>
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
              <div className="px-3 py-3 text-center"><span className={cn("text-xs font-semibold", row.hi ? "text-yellow-300" : "text-green-400")}>{row.vip}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
