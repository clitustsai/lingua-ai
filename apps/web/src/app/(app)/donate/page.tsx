"use client";
import { useState } from "react";
import { Heart, Copy, Check, ExternalLink, Coffee, Zap, Star, Crown, Rocket, Gift } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

// Thông tin thanh toán thật
const BANK_INFO = {
  bankName: "ACB / MoMo / ZaloPay",
  accountNumber: "0906857331",
  accountName: "THAI TUAN KIET",
  acbNumber: "26996867",
  qrMomo: "/qr-momo.png",
  qrZalopay: "/qr-zalopay.png",
  qrAcb: "/qr-acb.png",
  qrUrl: (amount: number, note: string) =>
    `https://img.vietqr.io/image/ACB-26996867-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(note)}&accountName=THAI%20TUAN%20KIET`,
};

const TIERS = [
  { amount: 10000,   label: "Ly cà phê",    emoji: "☕", icon: Coffee,  color: "#f59e0b", desc: "Cảm ơn bạn đã ủng hộ!" },
  { amount: 20000,   label: "Bữa sáng",     emoji: "🍜", icon: Gift,    color: "#10b981", desc: "Bạn thật tốt bụng!" },
  { amount: 50000,   label: "Supporter",    emoji: "⚡", icon: Zap,     color: "#3b82f6", desc: "Giúp duy trì server 1 ngày" },
  { amount: 100000,  label: "Fan",          emoji: "🌟", icon: Star,    color: "#8b5cf6", desc: "Giúp duy trì server 3 ngày" },
  { amount: 200000,  label: "Super Fan",    emoji: "👑", icon: Crown,   color: "#ec4899", desc: "Giúp duy trì server 1 tuần" },
  { amount: 500000,  label: "VIP",          emoji: "🚀", icon: Rocket,  color: "#f97316", desc: "Giúp duy trì server 1 tháng" },
  { amount: 1000000, label: "Mega Donor",   emoji: "💎", icon: Crown,   color: "#06b6d4", desc: "Giúp duy trì server 2 tháng" },
  { amount: 5000000, label: "Legend",       emoji: "🏆", icon: Crown,   color: "#eab308", desc: "Bạn là huyền thoại!" },
];

function formatVND(amount: number) {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}tr`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k`;
  return amount.toString();
}

export default function DonatePage() {
  const { user } = useAuthStore();
  const [selected, setSelected] = useState(TIERS[2]);
  const [custom, setCustom] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const finalAmount = custom ? parseInt(custom.replace(/\D/g, "")) || 0 : selected.amount;
  const note = `LinguaAI ${user?.name || "user"} ${formatVND(finalAmount)}`;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button onClick={() => copy(text, id)}
      className="p-1.5 rounded-lg text-gray-500 hover:text-green-400 transition-colors">
      {copied === id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );

  return (
    <div className="p-5 max-w-lg">
      <div className="pt-2 mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-400" /> Ủng hộ LinguaAI
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Giúp duy trì server & phát triển thêm tính năng mới
        </p>
      </div>

      {/* Why donate */}
      <div className="rounded-2xl p-4 mb-5"
        style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.15),rgba(99,102,241,0.08))", border: "1px solid rgba(139,92,246,0.25)" }}>
        <p className="text-white font-semibold text-sm mb-2">Chi phí duy trì mỗi tháng</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "AI API", cost: "~500k" },
            { label: "Server", cost: "~200k" },
            { label: "Domain", cost: "~50k" },
          ].map(c => (
            <div key={c.label} className="rounded-xl p-2.5 text-center" style={{ background: "rgba(15,10,30,0.5)" }}>
              <p className="text-primary-300 font-bold text-sm">{c.cost}</p>
              <p className="text-gray-500 text-xs">{c.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Mỗi đóng góp dù nhỏ đều giúp app tiếp tục hoạt động miễn phí 💜
        </p>
      </div>

      {/* Tier selector */}
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Chọn mức ủng hộ</p>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {TIERS.map(t => (
          <button key={t.amount}
            onClick={() => { setSelected(t); setCustom(""); setShowQR(false); }}
            className={cn("flex flex-col items-center gap-1 p-2.5 rounded-2xl border transition-all",
              selected.amount === t.amount && !custom
                ? "border-primary-500 bg-primary-900/30 scale-105"
                : "border-gray-700 bg-gray-800/60 hover:border-gray-600")}>
            <span className="text-xl">{t.emoji}</span>
            <span className={cn("text-xs font-bold", selected.amount === t.amount && !custom ? "text-white" : "text-gray-400")}>
              {formatVND(t.amount)}
            </span>
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="mb-5">
        <label className="text-xs text-gray-500 mb-1.5 block">Hoặc nhập số tiền tùy ý (VND)</label>
        <input
          value={custom}
          onChange={e => { setCustom(e.target.value); setShowQR(false); }}
          placeholder="Ví dụ: 150000"
          type="number"
          min="10000"
          className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500"
          style={{ background: "rgba(26,16,53,0.8)" }}
        />
      </div>

      {/* Selected tier info */}
      {!custom && (
        <div className="rounded-2xl p-3 mb-5 flex items-center gap-3"
          style={{ background: "rgba(26,16,53,0.8)", border: `1px solid ${selected.color}30` }}>
          <span className="text-3xl">{selected.emoji}</span>
          <div>
            <p className="text-white font-semibold text-sm">{selected.label}</p>
            <p className="text-gray-400 text-xs">{selected.desc}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-white font-bold">{finalAmount.toLocaleString("vi-VN")}đ</p>
          </div>
        </div>
      )}

      {/* Payment methods */}
      <div className="flex flex-col gap-3 mb-5">
        {/* Bank transfer */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Chuyển khoản ngân hàng</p>
          <div className="flex flex-col gap-2">
            {[
              { label: "Ví / Ngân hàng", value: "MoMo · ZaloPay · ACB" },
              { label: "Số điện thoại", value: BANK_INFO.accountNumber, copyId: "acc" },
              { label: "STK ACB", value: BANK_INFO.acbNumber, copyId: "acb" },
              { label: "Chủ tài khoản", value: BANK_INFO.accountName },
              { label: "Số tiền", value: `${finalAmount.toLocaleString("vi-VN")} VND`, copyId: "amount" },
              { label: "Nội dung CK", value: note, copyId: "note" },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500 w-28 shrink-0">{row.label}</span>
                <div className="flex items-center gap-1 flex-1 justify-end">
                  <span className="text-sm text-white font-medium text-right">{row.value}</span>
                  {row.copyId && <CopyBtn text={row.value} id={row.copyId} />}
                </div>
              </div>
            ))}
          </div>

          {/* QR Code — 2 ảnh thật */}
          <button onClick={() => setShowQR(!showQR)}
            className="w-full mt-4 py-2.5 rounded-xl text-sm font-medium transition-colors border border-primary-500/40 text-primary-300 hover:bg-primary-900/20">
            {showQR ? "Ẩn QR" : "Hiện QR Code"}
          </button>

          {showQR && (
            <div className="mt-4 animate-fade-in-scale">
              <div className="grid grid-cols-3 gap-2">
                {/* MoMo QR */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="bg-white p-1.5 rounded-xl shadow-lg w-full">
                    <img src="/qr-momo.png" alt="QR MoMo" className="w-full rounded-lg"
                      onError={(e) => { (e.target as HTMLImageElement).src = BANK_INFO.qrUrl(finalAmount, note); }}
                    />
                  </div>
                  <p className="text-xs font-bold" style={{ color: "#ae00ff" }}>💜 MoMo</p>
                  <p className="text-xs text-gray-500">0906 857 331</p>
                </div>
                {/* ZaloPay QR */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="bg-white p-1.5 rounded-xl shadow-lg w-full">
                    <img src="/qr-zalopay.png" alt="QR ZaloPay" className="w-full rounded-lg"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                  <p className="text-xs font-bold" style={{ color: "#0068ff" }}>💙 ZaloPay</p>
                  <p className="text-xs text-gray-500">0906 857 331</p>
                </div>
                {/* ACB QR */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="bg-white p-1.5 rounded-xl shadow-lg w-full">
                    <img src="/qr-acb.png" alt="QR ACB" className="w-full rounded-lg"
                      onError={(e) => { (e.target as HTMLImageElement).src = BANK_INFO.qrUrl(finalAmount, note); }}
                    />
                  </div>
                  <p className="text-xs font-bold" style={{ color: "#0066cc" }}>🏦 ACB</p>
                  <p className="text-xs text-gray-500">26996867</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">Quét bằng MoMo, ZaloPay, ACB hoặc app ngân hàng bất kỳ</p>
            </div>
          )}
        </div>

        {/* MoMo */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: "rgba(174,0,255,0.15)" }}>
                💜
              </div>
              <div>
                <p className="text-white font-medium text-sm">MoMo</p>
                <p className="text-gray-500 text-xs">0906 857 331 · THAI TUAN KIET</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CopyBtn text="0906857331" id="momo" />
              <a href="https://me.momo.vn/linguaai" target="_blank" rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Thank you message */}
      <div className="rounded-2xl p-4 text-center"
        style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)" }}>
        <p className="text-2xl mb-2">💜</p>
        <p className="text-white font-semibold text-sm">Cảm ơn bạn rất nhiều!</p>
        <p className="text-gray-500 text-xs mt-1">
          Mỗi đóng góp giúp LinguaAI tiếp tục miễn phí cho tất cả mọi người.
          Bạn thật tuyệt vời!
        </p>
      </div>
    </div>
  );
}
