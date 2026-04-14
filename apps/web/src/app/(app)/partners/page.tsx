"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { SUPPORTED_LANGUAGES } from "@ai-lang/shared";
import { Users, MessageCircle, Phone, Star, Wifi, Globe, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

// Simulated partner profiles (in production: real-time DB)
const MOCK_PARTNERS = [
  { id: "1",  name: "Minh Anh",   flag: "🇻🇳", level: "B1", targetLanguage: "English",  nativeLanguage: "Vietnamese", bio: "Muốn luyện tiếng Anh giao tiếp hàng ngày", online: true,  topics: ["travel", "food"], xp: 450 },
  { id: "2",  name: "Yuki",       flag: "🇯🇵", level: "A2", targetLanguage: "English",  nativeLanguage: "Japanese",   bio: "Learning English for business travel", online: true,  topics: ["business", "travel"], xp: 280 },
  { id: "3",  name: "Carlos",     flag: "🇪🇸", level: "B2", targetLanguage: "English",  nativeLanguage: "Spanish",    bio: "Native Spanish speaker, learning English", online: false, topics: ["hobbies", "news"], xp: 720 },
  { id: "4",  name: "Linh",       flag: "🇻🇳", level: "A1", targetLanguage: "Japanese", nativeLanguage: "Vietnamese", bio: "Mới bắt đầu học tiếng Nhật, cần partner", online: true,  topics: ["food", "travel"], xp: 120 },
  { id: "5",  name: "Emma",       flag: "🇬🇧", level: "C1", targetLanguage: "Vietnamese", nativeLanguage: "English",  bio: "Native English speaker learning Vietnamese", online: true,  topics: ["culture", "food"], xp: 890 },
  { id: "6",  name: "Hana",       flag: "🇰🇷", level: "B1", targetLanguage: "English",  nativeLanguage: "Korean",     bio: "K-pop fan learning English", online: false, topics: ["hobbies", "music"], xp: 340 },
  { id: "7",  name: "Thanh",      flag: "🇻🇳", level: "B2", targetLanguage: "Korean",   nativeLanguage: "Vietnamese", bio: "Học tiếng Hàn để xem phim không cần sub", online: true,  topics: ["culture", "hobbies"], xp: 560 },
  { id: "8",  name: "Pierre",     flag: "🇫🇷", level: "A2", targetLanguage: "English",  nativeLanguage: "French",     bio: "French student improving English", online: false, topics: ["travel", "food"], xp: 190 },
];

type Partner = typeof MOCK_PARTNERS[0];

function PartnerCard({ p, onConnect }: { p: Partner; onConnect: (p: Partner) => void }) {
  return (
    <div className="rounded-2xl p-4 transition-all hover:opacity-90"
      style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-primary-600/30 flex items-center justify-center text-2xl">
            {p.flag}
          </div>
          {p.online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">{p.name}</span>
            <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">{p.level}</span>
            <span className="text-xs text-yellow-400 flex items-center gap-0.5">
              <Star className="w-3 h-3" />{p.xp}
            </span>
          </div>
          <p className="text-xs text-primary-400 mt-0.5">
            Học: {p.targetLanguage} · Mẹ đẻ: {p.nativeLanguage}
          </p>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.bio}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => onConnect(p)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors"
          style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}>
          <MessageCircle className="w-3.5 h-3.5" /> Nhắn tin
        </button>
        <button onClick={() => onConnect(p)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors bg-green-700/20 border border-green-600/30 text-green-300">
          <Phone className="w-3.5 h-3.5" /> Gọi luyện nói
        </button>
      </div>
    </div>
  );
}

export default function PartnersPage() {
  const { settings, username, setUsername } = useAppStore();
  const [search, setSearch] = useState("");
  const [filterOnline, setFilterOnline] = useState(false);
  const [filterLang, setFilterLang] = useState("all");
  const [connected, setConnected] = useState<Partner | null>(null);
  const [myName, setMyName] = useState(username);
  const [editingName, setEditingName] = useState(!username);

  const filtered = MOCK_PARTNERS.filter(p => {
    if (filterOnline && !p.online) return false;
    if (filterLang !== "all" && p.targetLanguage !== filterLang && p.nativeLanguage !== filterLang) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.bio.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleConnect = (p: Partner) => setConnected(p);

  if (connected) return (
    <div className="p-5 max-w-lg">
      <button onClick={() => setConnected(null)} className="text-gray-400 hover:text-white text-sm mb-4">← Quay lại</button>
      <div className="rounded-2xl p-5 mb-4 text-center"
        style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.3)" }}>
        <div className="text-5xl mb-2">{connected.flag}</div>
        <p className="text-white font-bold text-lg">{connected.name}</p>
        <p className="text-gray-400 text-sm">{connected.bio}</p>
        <div className={cn("inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-medium",
          connected.online ? "bg-green-900/30 text-green-300" : "bg-gray-800 text-gray-500")}>
          <Wifi className="w-3 h-3" />
          {connected.online ? "Đang online" : "Offline"}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.6)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <p className="text-xs text-gray-500 mb-2">💡 Gợi ý luyện tập</p>
          <p className="text-sm text-gray-300">
            {connected.name} học <strong className="text-white">{connected.targetLanguage}</strong> và nói <strong className="text-white">{connected.nativeLanguage}</strong>.
            Bạn có thể giúp họ học {connected.targetLanguage} và họ giúp bạn học {connected.nativeLanguage}!
          </p>
        </div>

        <button className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-colors"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}
          onClick={() => alert("Tính năng chat realtime đang phát triển! Hiện tại hãy dùng Voice Call với AI để luyện tập.")}>
          <MessageCircle className="w-5 h-5" /> Bắt đầu chat
        </button>
        <button className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-colors bg-green-700 hover:bg-green-600"
          onClick={() => alert("Tính năng video call đang phát triển! Hãy dùng Voice Call với AI để luyện tập.")}>
          <Phone className="w-5 h-5" /> Gọi video luyện nói
        </button>
        <p className="text-center text-xs text-gray-600">🚧 Chat & video call với người thật đang phát triển</p>
      </div>
    </div>
  );

  return (
    <div className="p-5 max-w-lg">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" /> Tìm partner học
        </h1>
        <p className="text-sm text-gray-500 mt-1">Ghép cặp với người học cùng ngôn ngữ</p>
      </div>

      {/* My profile */}
      {editingName ? (
        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <p className="text-xs text-gray-500 mb-2">Tên hiển thị của bạn</p>
          <div className="flex gap-2">
            <input value={myName} onChange={e => setMyName(e.target.value)}
              placeholder="Nhập tên..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
            />
            <button onClick={() => { setUsername(myName); setEditingName(false); }}
              disabled={!myName.trim()}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
              Lưu
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-3 mb-4 flex items-center gap-3"
          style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <div className="w-10 h-10 rounded-xl bg-primary-600/30 flex items-center justify-center text-xl">
            {settings.targetLanguage.flag}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">{username || "Bạn"}</p>
            <p className="text-xs text-gray-400">Học {settings.targetLanguage.name} · {settings.level}</p>
          </div>
          <button onClick={() => setEditingName(true)} className="text-xs text-gray-500 hover:text-gray-300">Sửa</button>
        </div>
      )}

      {/* Search & filter */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm partner..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>
        <button onClick={() => setFilterOnline(!filterOnline)}
          className={cn("px-3 py-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1",
            filterOnline ? "border-green-500 bg-green-900/20 text-green-300" : "border-gray-700 bg-gray-800 text-gray-400")}>
          <Wifi className="w-3.5 h-3.5" /> Online
        </button>
      </div>

      {/* Language filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        <button onClick={() => setFilterLang("all")}
          className={cn("px-3 py-1.5 rounded-xl border text-xs font-medium shrink-0 transition-colors",
            filterLang === "all" ? "border-primary-500 bg-primary-900/20 text-primary-300" : "border-gray-700 bg-gray-800 text-gray-400")}>
          Tất cả
        </button>
        {SUPPORTED_LANGUAGES.map(l => (
          <button key={l.code} onClick={() => setFilterLang(l.name)}
            className={cn("px-3 py-1.5 rounded-xl border text-xs font-medium shrink-0 transition-colors",
              filterLang === l.name ? "border-primary-500 bg-primary-900/20 text-primary-300" : "border-gray-700 bg-gray-800 text-gray-400")}>
            {l.flag} {l.name}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
        <Globe className="w-3.5 h-3.5" />
        <span>{filtered.length} partner · {filtered.filter(p => p.online).length} online</span>
      </div>

      {/* Partner list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Không tìm thấy partner phù hợp</p>
        ) : (
          filtered.map(p => <PartnerCard key={p.id} p={p} onConnect={handleConnect} />)
        )}
      </div>
    </div>
  );
}
