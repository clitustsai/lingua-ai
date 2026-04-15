"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { DollarSign, Copy, Check, ExternalLink, TrendingUp, Users, Gift, Star } from "lucide-react";

const AFFILIATE_PRODUCTS = [
  {
    id: "1",
    name: "Cambly",
    category: "Học tiếng Anh",
    logo: "🎓",
    description: "Nền tảng học tiếng Anh 1-1 với gia sư người bản ngữ 24/7",
    commission: "30%",
    cookie: "30 ngày",
    url: "https://www.cambly.com",
    affiliateUrl: "https://www.cambly.com/?ref=linguaai",
    rating: 4.8,
    tags: ["Tiếng Anh", "1-1", "Gia sư"],
    color: "#f59e0b",
  },
  {
    id: "2",
    name: "Rosetta Stone",
    category: "Phần mềm học ngôn ngữ",
    logo: "🌍",
    description: "Phần mềm học ngôn ngữ hàng đầu thế giới với 25+ ngôn ngữ",
    commission: "15%",
    cookie: "45 ngày",
    url: "https://www.rosettastone.com",
    affiliateUrl: "https://www.rosettastone.com/?ref=linguaai",
    rating: 4.5,
    tags: ["Đa ngôn ngữ", "App", "Offline"],
    color: "#3b82f6",
  },
  {
    id: "3",
    name: "iTalki",
    category: "Gia sư ngôn ngữ",
    logo: "💬",
    description: "Kết nối với gia sư ngôn ngữ chuyên nghiệp từ khắp thế giới",
    commission: "$10/học viên",
    cookie: "30 ngày",
    url: "https://www.italki.com",
    affiliateUrl: "https://www.italki.com/?ref=linguaai",
    rating: 4.7,
    tags: ["Gia sư", "1-1", "Đa ngôn ngữ"],
    color: "#10b981",
  },
  {
    id: "4",
    name: "Pimsleur",
    category: "Học qua audio",
    logo: "🎧",
    description: "Phương pháp học ngôn ngữ qua audio nổi tiếng toàn cầu",
    commission: "20%",
    cookie: "60 ngày",
    url: "https://www.pimsleur.com",
    affiliateUrl: "https://www.pimsleur.com/?ref=linguaai",
    rating: 4.4,
    tags: ["Audio", "Phát âm", "Offline"],
    color: "#8b5cf6",
  },
  {
    id: "5",
    name: "Babbel",
    category: "App học ngôn ngữ",
    logo: "📱",
    description: "App học ngôn ngữ với bài học ngắn 15 phút mỗi ngày",
    commission: "25%",
    cookie: "30 ngày",
    url: "https://www.babbel.com",
    affiliateUrl: "https://www.babbel.com/?ref=linguaai",
    rating: 4.3,
    tags: ["App", "Ngắn gọn", "Đa ngôn ngữ"],
    color: "#ef4444",
  },
  {
    id: "6",
    name: "Preply",
    category: "Gia sư trực tuyến",
    logo: "👨‍🏫",
    description: "Tìm gia sư ngôn ngữ phù hợp với ngân sách và lịch học của bạn",
    commission: "$20/học viên",
    cookie: "30 ngày",
    url: "https://preply.com",
    affiliateUrl: "https://preply.com/?ref=linguaai",
    rating: 4.6,
    tags: ["Gia sư", "Linh hoạt", "1-1"],
    color: "#06b6d4",
  },
];

const STATS = [
  { label: "Hoa hồng trung bình", value: "20-30%", icon: DollarSign, color: "#10b981" },
  { label: "Đối tác hiện có", value: "6+", icon: Users, color: "#8b5cf6" },
  { label: "Cookie duration", value: "30-60 ngày", icon: Gift, color: "#f59e0b" },
  { label: "Tỷ lệ chuyển đổi", value: "~5%", icon: TrendingUp, color: "#3b82f6" },
];

export default function AffiliatePage() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState<string | null>(null);

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const refCode = user ? `ref=${user.id.slice(-6)}` : "ref=linguaai";

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" /> Tiếp thị liên kết
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Giới thiệu sản phẩm học ngôn ngữ và nhận hoa hồng hấp dẫn
        </p>
      </div>

      {/* Ref code */}
      <div className="rounded-2xl p-4 mb-6"
        style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.1))", border: "1px solid rgba(139,92,246,0.3)" }}>
        <p className="text-xs text-gray-400 mb-1">Mã giới thiệu của bạn</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-primary-300 font-mono text-sm bg-black/30 px-3 py-2 rounded-xl">
            linguaai.app/?{refCode}
          </code>
          <button onClick={() => copyLink(`https://linguaai.app/?${refCode}`, "myref")}
            className="p-2 rounded-xl bg-primary-600/30 hover:bg-primary-600/50 text-primary-300 transition-colors">
            {copied === "myref" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Chia sẻ link này để nhận hoa hồng khi bạn bè đăng ký qua bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {STATS.map(s => (
          <div key={s.label} className="rounded-2xl p-3 flex items-center gap-3"
            style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.1)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${s.color}20` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-white font-bold text-sm">{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Products */}
      <h2 className="text-sm font-semibold text-gray-300 mb-3">Sản phẩm đề xuất</h2>
      <div className="flex flex-col gap-3">
        {AFFILIATE_PRODUCTS.map(p => (
          <div key={p.id} className="rounded-2xl p-4"
            style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.12)" }}>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: `${p.color}20`, border: `1px solid ${p.color}40` }}>
                {p.logo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold text-sm">{p.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${p.color}20`, color: p.color }}>
                    {p.category}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{p.description}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Hoa hồng: {p.commission}
                  </span>
                  <span className="text-xs text-gray-500">Cookie: {p.cookie}</span>
                  <span className="text-xs text-yellow-400 flex items-center gap-0.5">
                    <Star className="w-3 h-3" /> {p.rating}
                  </span>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {p.tags.map(t => (
                    <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => copyLink(p.affiliateUrl, p.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors"
                style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}>
                {copied === p.id ? <><Check className="w-3.5 h-3.5 text-green-400" /> Đã copy!</> : <><Copy className="w-3.5 h-3.5" /> Copy link</>}
              </button>
              <a href={p.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-gray-800 border border-gray-700 text-gray-300 hover:text-white transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Xem
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl p-4 text-center"
        style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)" }}>
        <p className="text-xs text-gray-500">
          💡 Lưu ý: Đây là các link affiliate mẫu. Để nhận hoa hồng thực tế, bạn cần đăng ký chương trình affiliate trực tiếp với từng nền tảng.
        </p>
      </div>
    </div>
  );
}
