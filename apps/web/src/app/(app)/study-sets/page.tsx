"use client";
import { useState, useRef, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";
import { Plus, Heart, Bookmark, Volume2, Mic, MicOff, X, ChevronLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";

type StudyWord = { word: string; ipa: string; translation: string; example?: string };
type StudySet = {
  id: string; title: string; emoji: string; tag: string;
  author: string; likes: number; words: StudyWord[];
  likedByMe?: boolean; savedByMe?: boolean;
};

const DEFAULT_SETS: StudySet[] = [
  {
    id: "pronunciation", title: "Phát âm cơ bản", emoji: "🔊", tag: "IELTS",
    author: "LinguaAI", likes: 38600,
    words: [
      { word: "table", ipa: "/ˈteɪ.bəl/", translation: "cái bàn", example: "Put it on the table." },
      { word: "suppose", ipa: "/səˈpoʊz/", translation: "giả sử", example: "I suppose you're right." },
      { word: "search", ipa: "/sɜːrtʃ/", translation: "tìm kiếm", example: "Search for the answer." },
      { word: "pool", ipa: "/puːl/", translation: "hồ bơi", example: "Let's swim in the pool." },
      { word: "she", ipa: "/ʃiː/", translation: "cô ấy", example: "She is my friend." },
      { word: "thought", ipa: "/θɔːt/", translation: "suy nghĩ", example: "I thought about it." },
      { word: "through", ipa: "/θruː/", translation: "xuyên qua", example: "Walk through the door." },
      { word: "world", ipa: "/wɜːrld/", translation: "thế giới", example: "Travel the world." },
    ],
  },
  {
    id: "food", title: "Thức ăn & Đồ uống", emoji: "🍔", tag: "Daily",
    author: "LinguaAI", likes: 20400,
    words: [
      { word: "breakfast", ipa: "/ˈbrek.fəst/", translation: "bữa sáng", example: "I eat breakfast at 7." },
      { word: "delicious", ipa: "/dɪˈlɪʃ.əs/", translation: "ngon", example: "This food is delicious." },
      { word: "hungry", ipa: "/ˈhʌŋ.ɡri/", translation: "đói", example: "I'm very hungry." },
      { word: "restaurant", ipa: "/ˈres.tər.ɑːnt/", translation: "nhà hàng", example: "Let's go to a restaurant." },
      { word: "vegetable", ipa: "/ˈvedʒ.tə.bəl/", translation: "rau củ", example: "Eat more vegetables." },
      { word: "beverage", ipa: "/ˈbev.ər.ɪdʒ/", translation: "đồ uống", example: "What beverage do you want?" },
    ],
  },
  {
    id: "travel", title: "Du lịch & Giao tiếp", emoji: "✈️", tag: "Travel",
    author: "LinguaAI", likes: 15100,
    words: [
      { word: "passport", ipa: "/ˈpæs.pɔːrt/", translation: "hộ chiếu", example: "Show your passport." },
      { word: "departure", ipa: "/dɪˈpɑːr.tʃər/", translation: "khởi hành", example: "Departure is at 9 AM." },
      { word: "luggage", ipa: "/ˈlʌɡ.ɪdʒ/", translation: "hành lý", example: "Check your luggage." },
      { word: "reservation", ipa: "/ˌrez.ərˈveɪ.ʃən/", translation: "đặt chỗ", example: "I have a reservation." },
      { word: "destination", ipa: "/ˌdes.tɪˈneɪ.ʃən/", translation: "điểm đến", example: "What's your destination?" },
    ],
  },
  {
    id: "business", title: "Tiếng Anh Văn Phòng", emoji: "💼", tag: "Business",
    author: "LinguaAI", likes: 14000,
    words: [
      { word: "deadline", ipa: "/ˈded.laɪn/", translation: "hạn chót", example: "The deadline is Friday." },
      { word: "colleague", ipa: "/ˈkɒl.iːɡ/", translation: "đồng nghiệp", example: "My colleague helped me." },
      { word: "negotiate", ipa: "/nɪˈɡoʊ.ʃi.eɪt/", translation: "đàm phán", example: "We need to negotiate." },
      { word: "proposal", ipa: "/prəˈpoʊ.zəl/", translation: "đề xuất", example: "Submit the proposal." },
      { word: "efficient", ipa: "/ɪˈfɪʃ.ənt/", translation: "hiệu quả", example: "Be more efficient." },
      { word: "presentation", ipa: "/ˌprez.ənˈteɪ.ʃən/", translation: "thuyết trình", example: "Give a presentation." },
    ],
  },
  {
    id: "daily", title: "Giao tiếp Hàng Ngày", emoji: "💬", tag: "Daily",
    author: "LinguaAI", likes: 9500,
    words: [
      { word: "apologize", ipa: "/əˈpɒl.ə.dʒaɪz/", translation: "xin lỗi", example: "I apologize for being late." },
      { word: "appreciate", ipa: "/əˈpriː.ʃi.eɪt/", translation: "trân trọng", example: "I appreciate your help." },
      { word: "suggest", ipa: "/səˈdʒest/", translation: "gợi ý", example: "Can you suggest something?" },
      { word: "comfortable", ipa: "/ˈkʌm.fər.tə.bəl/", translation: "thoải mái", example: "Make yourself comfortable." },
      { word: "opportunity", ipa: "/ˌɒp.əˈtjuː.nɪ.ti/", translation: "cơ hội", example: "This is a great opportunity." },
    ],
  },
];

// ── Practice Screen ──────────────────────────────────────────────────────────
function PracticeScreen({ set, onClose }: { set: StudySet; onClose: () => void }) {
  const { settings } = useAppStore();
  const [idx, setIdx] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "try-again" | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const recRef = useRef<any>(null);
  const word = set.words[idx];

  const speakWord = useCallback(() => {
    speakText(word.word, settings.targetLanguage.code);
  }, [word, settings]);

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Trình duyệt không hỗ trợ nhận giọng nói"); return; }
    const rec = new SR();
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      const said = e.results[0][0].transcript.toLowerCase().trim();
      const target = word.word.toLowerCase();
      const correct = said.includes(target) || target.includes(said) || e.results[0][0].confidence > 0.7;
      setFeedback(correct ? "correct" : "try-again");
      if (correct) setScore(s => s + 1);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recRef.current = rec;
    rec.start();
    setIsListening(true);
    setFeedback(null);
  };

  const next = () => {
    setFeedback(null);
    if (idx + 1 >= set.words.length) setDone(true);
    else setIdx(i => i + 1);
  };

  if (done) return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6"
      style={{ background: "linear-gradient(135deg,#0f0a1e,#1a1035)" }}>
      <button onClick={onClose} className="absolute top-6 left-6 p-2 rounded-full bg-white/10 text-white">
        <X className="w-5 h-5" />
      </button>
      <div className="text-6xl">🎉</div>
      <p className="text-2xl font-bold text-white">Hoàn thành!</p>
      <p className="text-gray-400">{score}/{set.words.length} từ đúng</p>
      <div className="w-full max-w-xs bg-white/10 rounded-full h-3">
        <div className="h-3 rounded-full bg-primary-500 transition-all"
          style={{ width: `${(score / set.words.length) * 100}%` }} />
      </div>
      <button onClick={onClose}
        className="px-8 py-3 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold transition-colors">
        Xong
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "linear-gradient(135deg,#0f0a1e,#1a1035)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <button onClick={onClose} className="p-2 rounded-full bg-white/10 text-white">
          <X className="w-5 h-5" />
        </button>
        <p className="text-white font-semibold">Nhắc Lại Theo Tôi</p>
        <span className="text-sm text-gray-400">{idx + 1}/{set.words.length}</span>
      </div>

      {/* Progress */}
      <div className="px-5 mb-4">
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <div className="h-1.5 rounded-full bg-primary-500 transition-all"
            style={{ width: `${((idx) / set.words.length) * 100}%` }} />
        </div>
      </div>

      {/* AI Avatar */}
      <div className="mx-5 mb-4 rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)", height: 200 }}>
        <div className="flex flex-col items-center gap-3">
          <div className={cn("w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all",
            isListening ? "bg-primary-600/40 scale-110 animate-pulse" : "bg-primary-600/20")}>
            🤖
          </div>
          <p className="text-gray-400 text-sm">
            {isListening ? "Đang nghe..." : "AI đang chờ bạn nói"}
          </p>
        </div>
      </div>

      {/* Word card */}
      <div className="mx-5 rounded-2xl p-5 flex-1"
        style={{ background: "rgba(26,16,53,0.9)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <p className="text-xs text-gray-500 mb-1">Hãy nói cụm từ này:</p>
        <p className="text-3xl font-bold text-white mb-1">{word.word}</p>
        <p className="text-primary-400 text-sm font-mono mb-2">{word.ipa}</p>
        <p className="text-gray-400 text-sm">{word.translation}</p>
        {word.example && <p className="text-gray-600 text-xs mt-2 italic">"{word.example}"</p>}

        <div className="flex gap-3 mt-4">
          <button onClick={speakWord}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-xs transition-colors">
            <Volume2 className="w-4 h-4" /> Nghe
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={cn("mt-4 px-4 py-3 rounded-xl text-sm font-semibold text-center",
            feedback === "correct"
              ? "bg-green-900/40 text-green-300 border border-green-600/30"
              : "bg-yellow-900/40 text-yellow-300 border border-yellow-600/30")}>
            {feedback === "correct" ? "✅ Chính xác! Phát âm tốt lắm!" : "🔄 Thử lại nhé!"}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="px-5 py-6 flex flex-col items-center gap-4">
        {feedback ? (
          <button onClick={next}
            className="w-full py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold flex items-center justify-center gap-2 transition-colors">
            {idx + 1 >= set.words.length ? "Hoàn thành" : "Từ tiếp theo"} <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={isListening ? () => { recRef.current?.stop(); setIsListening(false); } : startListening}
            className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg",
              isListening
                ? "bg-red-600 scale-110 shadow-red-500/40"
                : "bg-primary-600 hover:bg-primary-500 shadow-primary-500/40")}>
            {isListening ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-white" />}
          </button>
        )}
        {!feedback && <p className="text-gray-500 text-xs">Chạm để nói</p>}
      </div>
    </div>
  );
}

// ── Set Detail Screen ────────────────────────────────────────────────────────
function SetDetail({ set, onBack, onPractice }: { set: StudySet; onBack: () => void; onPractice: () => void }) {
  const { settings } = useAppStore();
  const [liked, setLiked] = useState(set.likedByMe ?? false);
  const [saved, setSaved] = useState(set.savedByMe ?? false);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#0f0a1e" }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-center justify-between"
        style={{ background: "rgba(26,16,53,0.8)", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
        <button onClick={onBack} className="p-2 rounded-full bg-white/10 text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => setSaved(!saved)} className={cn("p-2 rounded-full transition-colors", saved ? "text-yellow-400" : "text-gray-500 hover:text-gray-300")}>
          <Bookmark className="w-5 h-5" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="px-5 py-5 flex flex-col gap-5 flex-1">
        {/* Set info */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}>
            {set.emoji}
          </div>
          <div className="text-center">
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded font-bold">{set.tag}</span>
            <h1 className="text-xl font-bold text-white mt-2">{set.title}</h1>
            <p className="text-gray-500 text-sm mt-0.5">👤 {set.author}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setLiked(!liked)}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl border transition-colors",
                liked ? "border-red-500/50 bg-red-900/20 text-red-400" : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
              <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
              <span className="text-sm font-medium">{(set.likes + (liked ? 1 : 0)).toLocaleString()}</span>
            </button>
          </div>
        </div>

        {/* Word list */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{set.words.length} từ</p>
          {set.words.map((w, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.1)" }}>
              <button onClick={() => speakText(w.word, "en")}
                className="p-1.5 rounded-lg bg-white/10 text-gray-400 hover:text-primary-400 transition-colors shrink-0">
                <Volume2 className="w-4 h-4" />
              </button>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{w.word}</p>
                <p className="text-gray-500 text-xs font-mono">{w.ipa}</p>
              </div>
              <p className="text-gray-400 text-sm">{w.translation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Practice button */}
      <div className="px-5 pb-8 pt-3" style={{ background: "rgba(15,10,30,0.95)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button onClick={onPractice}
          className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all"
          style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)", boxShadow: "0 4px 20px rgba(6,182,212,0.3)" }}>
          <Mic className="w-5 h-5" /> Luyện tập
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function StudySetsPage() {
  const { settings, flashcards } = useAppStore();
  const [view, setView] = useState<"list" | "detail" | "practice">("list");
  const [activeSet, setActiveSet] = useState<StudySet | null>(null);
  const [tab, setTab] = useState<"popular" | "mine">("popular");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [mysets, setMysets] = useState<StudySet[]>([]);

  // Build "my set" from flashcards
  const myFlashcardSet: StudySet | null = flashcards.length > 0 ? {
    id: "my-flashcards",
    title: "Flashcard của tôi",
    emoji: "⭐",
    tag: "Của tôi",
    author: "Bạn",
    likes: 0,
    words: flashcards.slice(0, 20).map(f => ({
      word: f.word,
      ipa: "",
      translation: f.translation,
      example: f.example,
    })),
  } : null;

  const createSet = () => {
    if (!newTitle.trim()) return;
    const newSet: StudySet = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      emoji: "📚",
      tag: "Của tôi",
      author: "Bạn",
      likes: 0,
      words: [],
    };
    setMysets(prev => [newSet, ...prev]);
    setNewTitle("");
    setShowCreate(false);
  };

  if (view === "practice" && activeSet) {
    return <PracticeScreen set={activeSet} onClose={() => setView("detail")} />;
  }

  if (view === "detail" && activeSet) {
    return <SetDetail set={activeSet} onBack={() => setView("list")} onPractice={() => setView("practice")} />;
  }

  const mineSets = [
    ...(myFlashcardSet ? [myFlashcardSet] : []),
    ...mysets,
  ];

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" /> Bộ học tập
        </h1>
        <p className="text-sm text-gray-500 mt-1">Học từ vựng · Luyện phát âm với AI</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{ background: "rgba(15,10,30,0.6)" }}>
        <button onClick={() => setTab("popular")}
          className={cn("flex-1 py-2 rounded-xl text-sm font-semibold transition-all",
            tab === "popular" ? "bg-primary-600 text-white" : "text-gray-400 hover:text-gray-200")}>
          Được yêu thích nhất
          <span className="ml-1.5 text-xs opacity-70">{DEFAULT_SETS.reduce((s, x) => s + x.likes, 0).toLocaleString()}</span>
        </button>
        <button onClick={() => setTab("mine")}
          className={cn("flex-1 py-2 rounded-xl text-sm font-semibold transition-all",
            tab === "mine" ? "bg-primary-600 text-white" : "text-gray-400 hover:text-gray-200")}>
          Bộ của tôi
          <span className="ml-1.5 text-xs opacity-70">{mineSets.length}</span>
        </button>
      </div>

      {tab === "popular" && (
        <div className="grid grid-cols-2 gap-3">
          {DEFAULT_SETS.map(set => (
            <button key={set.id} onClick={() => { setActiveSet(set); setView("detail"); }}
              className="flex flex-col gap-3 p-4 rounded-2xl text-left transition-all hover:scale-[1.02]"
              style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: "rgba(139,92,246,0.2)" }}>
                  {set.emoji}
                </div>
                <Bookmark className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">{set.tag}</span>
                <p className="text-white font-semibold text-sm mt-1 leading-tight">{set.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{set.author}</p>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Heart className="w-3.5 h-3.5" />
                <span>{(set.likes / 1000).toFixed(1)}K</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {tab === "mine" && (
        <div className="flex flex-col gap-3">
          {mineSets.length === 0 && !showCreate && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-sm">Chưa có bộ học tập nào</p>
              <p className="text-xs mt-1 text-gray-600">Tạo bộ mới hoặc thêm flashcard để bắt đầu</p>
            </div>
          )}
          {mineSets.map(set => (
            <button key={set.id} onClick={() => { setActiveSet(set); setView("detail"); }}
              className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all hover:bg-white/5"
              style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: "rgba(139,92,246,0.2)" }}>
                {set.emoji}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{set.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{set.words.length} từ · {set.author}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600" />
            </button>
          ))}

          {showCreate && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <p className="text-white font-semibold text-sm mb-3">Tạo bộ học tập mới</p>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                placeholder="Tên bộ học tập..."
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 mb-3"
                style={{ background: "rgba(15,10,30,0.8)" }}
              />
              <div className="flex gap-2">
                <button onClick={createSet}
                  className="flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors">
                  Tạo
                </button>
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 rounded-xl border border-gray-700 text-gray-400 text-sm transition-colors">
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create button */}
      {tab === "mine" && !showCreate && (
        <button onClick={() => setShowCreate(true)}
          className="fixed bottom-24 right-5 flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white shadow-lg transition-all"
          style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)", boxShadow: "0 4px 20px rgba(6,182,212,0.4)" }}>
          <Plus className="w-5 h-5" /> Tạo mới
        </button>
      )}
    </div>
  );
}
