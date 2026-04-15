"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Heart, MessageCircle, CheckCircle2, Plus, Send, X, Volume2, Loader2 } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";

// Seed posts for demo
const SEED_POSTS = [
  {
    id: "seed1", authorName: "Minh Anh", authorFlag: "🇻🇳", language: "English", level: "B1",
    text: "Yesterday I go to the market and buyed many vegetables.",
    translation: "Hôm qua tôi đi chợ và mua nhiều rau.",
    question: "Câu này có đúng ngữ pháp không? Mình không chắc về thì quá khứ.",
    likes: 5, likedByMe: false,
    comments: [{ id: "c1", authorName: "Emma", text: "Great effort! Keep practicing 💪", createdAt: "2024-01-15T10:00:00Z" }],
    corrections: [{ id: "cr1", authorName: "Carlos", corrected: "Yesterday I went to the market and bought many vegetables.", explanation: "Dùng 'went' (quá khứ của go) và 'bought' (quá khứ của buy) — đây là động từ bất quy tắc.", createdAt: "2024-01-15T10:05:00Z" }],
    createdAt: "2024-01-15T09:00:00Z",
  },
  {
    id: "seed2", authorName: "Yuki", authorFlag: "🇯🇵", language: "English", level: "A2",
    text: "I am very exciting about my trip to Vietnam next month!",
    translation: "Tôi rất hào hứng về chuyến đi Việt Nam tháng tới!",
    question: "Mình dùng 'exciting' hay 'excited'? Confused!",
    likes: 8, likedByMe: false,
    comments: [],
    corrections: [{ id: "cr2", authorName: "Pierre", corrected: "I am very excited about my trip to Vietnam next month!", explanation: "'Excited' = cảm xúc của người (tôi cảm thấy hào hứng). 'Exciting' = tính chất của sự vật (chuyến đi thú vị). Quy tắc: -ed cho người, -ing cho sự vật.", createdAt: "2024-01-15T11:00:00Z" }],
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "seed3", authorName: "Thanh", authorFlag: "🇻🇳", language: "Korean", level: "A1",
    text: "저는 한국어를 공부해요. 매일 조금씩 배워요.",
    translation: "Tôi học tiếng Hàn. Mỗi ngày học một chút.",
    question: "Câu này có tự nhiên không? Mình mới học được 2 tuần.",
    likes: 12, likedByMe: false,
    comments: [{ id: "c2", authorName: "Hana", text: "정말 잘했어요! Very good for 2 weeks! 👏", createdAt: "2024-01-15T12:00:00Z" }],
    corrections: [],
    createdAt: "2024-01-15T11:00:00Z",
  },
];

export default function CommunityPage() {
  const { communityPosts, addCommunityPost, likePost, addComment, addCorrection, settings, username } = useAppStore();
  const [showNewPost, setShowNewPost] = useState(false);
  const [newText, setNewText] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [posting, setPosting] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [correctionText, setCorrectionText] = useState<Record<string, string>>({});
  const [correctionExp, setCorrectionExp] = useState<Record<string, string>>({});
  const [aiCorrecting, setAiCorrecting] = useState<string | null>(null);

  const allPosts = [...communityPosts, ...SEED_POSTS.filter(s => !communityPosts.find(p => p.id === s.id))];

  const submitPost = () => {
    if (!newText.trim()) return;
    setPosting(true);
    const post = {
      id: Date.now().toString(),
      authorName: username || "Bạn",
      authorFlag: settings.targetLanguage.flag,
      language: settings.targetLanguage.name,
      level: settings.level,
      text: newText.trim(),
      question: newQuestion.trim() || "Câu này có đúng không?",
      likes: 0, likedByMe: false,
      comments: [], corrections: [],
      createdAt: new Date().toISOString(),
    };
    addCommunityPost(post);
    setNewText(""); setNewQuestion(""); setShowNewPost(false); setPosting(false);
  };

  const submitComment = (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    addComment(postId, { id: Date.now().toString(), authorName: username || "Bạn", text, createdAt: new Date().toISOString() });
    setCommentText(p => ({ ...p, [postId]: "" }));
  };

  const submitCorrection = (postId: string) => {
    const corrected = correctionText[postId]?.trim();
    const explanation = correctionExp[postId]?.trim();
    if (!corrected) return;
    addCorrection(postId, { id: Date.now().toString(), authorName: username || "Bạn", corrected, explanation: explanation || "", createdAt: new Date().toISOString() });
    setCorrectionText(p => ({ ...p, [postId]: "" }));
    setCorrectionExp(p => ({ ...p, [postId]: "" }));
  };

  const aiCorrect = async (post: typeof allPosts[0]) => {
    setAiCorrecting(post.id);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: post.text,
          targetLanguage: post.language,
          nativeLanguage: settings.nativeLanguage.name,
          level: post.level,
        }),
      });
      const data = await res.json();
      if (data.rewrites?.corrected) {
        const explanation = data.issues?.map((i: any) => `${i.original} → ${i.fix}: ${i.explanation}`).join(". ") || data.overallFeedback || "AI correction";
        addCorrection(post.id, {
          id: Date.now().toString(),
          authorName: "🤖 AI",
          corrected: data.rewrites.corrected,
          explanation,
          createdAt: new Date().toISOString(),
        });
      }
    } finally { setAiCorrecting(null); }
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "vừa xong";
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
  };

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            🌐 Community
          </h1>
          <p className="text-sm text-gray-500 mt-1">Đăng câu hỏi · Nhận sửa bài · Like & comment</p>
        </div>
        <button onClick={() => setShowNewPost(!showNewPost)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Đăng bài
        </button>
      </div>

      {/* New post form */}
      {showNewPost && (
        <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(26,16,53,0.9)", border: "1px solid rgba(139,92,246,0.3)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Đăng câu hỏi mới</p>
            <button onClick={() => setShowNewPost(false)} className="text-gray-500 hover:text-gray-300"><X className="w-4 h-4" /></button>
          </div>
          <textarea value={newText} onChange={e => setNewText(e.target.value)}
            placeholder={`Viết câu bằng ${settings.targetLanguage.name} muốn được sửa...`}
            rows={3}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 border border-gray-700 resize-none mb-2"
            style={{ background: "rgba(15,10,30,0.8)" }}
          />
          <input value={newQuestion} onChange={e => setNewQuestion(e.target.value)}
            placeholder="Câu hỏi của bạn (vd: Câu này có tự nhiên không?)"
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 border border-gray-700 mb-3"
            style={{ background: "rgba(15,10,30,0.8)" }}
          />
          <div className="flex gap-2">
            <button onClick={submitPost} disabled={!newText.trim() || posting}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
              Đăng bài
            </button>
            <button onClick={() => setShowNewPost(false)} className="px-4 py-2.5 bg-gray-800 text-gray-400 rounded-xl text-sm transition-colors hover:bg-gray-700">
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="flex flex-col gap-4">
        {allPosts.map(post => {
          const isExpanded = expandedPost === post.id;
          return (
            <div key={post.id} className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.12)" }}>
              {/* Post header */}
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-600/30 flex items-center justify-center text-lg">{post.authorFlag}</div>
                  <div>
                    <p className="text-white font-medium text-sm">{post.authorName}</p>
                    <p className="text-xs text-gray-500">{post.language} · {post.level} · {timeAgo(post.createdAt)}</p>
                  </div>
                </div>

                {/* Text */}
                <div className="rounded-xl p-3 mb-2" style={{ background: "rgba(15,10,30,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-sm leading-relaxed">{post.text}</p>
                    <button onClick={() => speakText(post.text, settings.targetLanguage.code)} className="p-1 text-gray-600 hover:text-primary-400 shrink-0">
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {post.translation && <p className="text-gray-500 text-xs mt-1 italic">{post.translation}</p>}
                </div>

                {/* Question */}
                <p className="text-xs text-primary-400 mb-3">❓ {post.question}</p>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button onClick={() => likePost(post.id)}
                    className={cn("flex items-center gap-1.5 text-xs transition-colors", post.likedByMe ? "text-red-400" : "text-gray-500 hover:text-red-400")}>
                    <Heart className={cn("w-4 h-4", post.likedByMe && "fill-current")} />
                    {post.likes}
                  </button>
                  <button onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-400 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments.length} bình luận
                  </button>
                  <button onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors">
                    <CheckCircle2 className="w-4 h-4" />
                    {post.corrections.length} sửa bài
                  </button>
                  <button onClick={() => aiCorrect(post)} disabled={aiCorrecting === post.id}
                    className="ml-auto flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50">
                    {aiCorrecting === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "🤖"}
                    AI sửa
                  </button>
                </div>
              </div>

              {/* Expanded: corrections + comments */}
              {isExpanded && (
                <div className="border-t border-white/5 px-4 py-3 flex flex-col gap-4">
                  {/* Corrections */}
                  {post.corrections.length > 0 && (
                    <div>
                      <p className="text-xs text-green-400 font-semibold mb-2">✅ Sửa bài ({post.corrections.length})</p>
                      {post.corrections.map(c => (
                        <div key={c.id} className="rounded-xl p-3 mb-2" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-green-300">{c.authorName}</span>
                            <span className="text-xs text-gray-600">{timeAgo(c.createdAt)}</span>
                          </div>
                          <p className="text-sm text-white font-medium mb-1">"{c.corrected}"</p>
                          {c.explanation && <p className="text-xs text-gray-400">{c.explanation}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add correction */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Sửa bài cho {post.authorName}:</p>
                    <input value={correctionText[post.id] ?? ""} onChange={e => setCorrectionText(p => ({ ...p, [post.id]: e.target.value }))}
                      placeholder="Câu đúng..."
                      className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-green-500 mb-1.5"
                      style={{ background: "rgba(15,10,30,0.8)" }}
                    />
                    <input value={correctionExp[post.id] ?? ""} onChange={e => setCorrectionExp(p => ({ ...p, [post.id]: e.target.value }))}
                      placeholder="Giải thích (tùy chọn)..."
                      className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-green-500 mb-2"
                      style={{ background: "rgba(15,10,30,0.8)" }}
                    />
                    <button onClick={() => submitCorrection(post.id)} disabled={!correctionText[post.id]?.trim()}
                      className="px-4 py-2 bg-green-700/40 hover:bg-green-700/60 disabled:opacity-50 text-green-300 rounded-xl text-xs font-medium transition-colors">
                      Gửi sửa bài
                    </button>
                  </div>

                  {/* Comments */}
                  {post.comments.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-2">Bình luận</p>
                      {post.comments.map(c => (
                        <div key={c.id} className="flex gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs shrink-0 mt-0.5">
                            {c.authorName[0]}
                          </div>
                          <div className="flex-1 rounded-xl px-3 py-2" style={{ background: "rgba(15,10,30,0.6)" }}>
                            <span className="text-xs font-semibold text-gray-300">{c.authorName} </span>
                            <span className="text-xs text-gray-400">{c.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment */}
                  <div className="flex gap-2">
                    <input value={commentText[post.id] ?? ""} onChange={e => setCommentText(p => ({ ...p, [post.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && submitComment(post.id)}
                      placeholder="Bình luận..."
                      className="flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500"
                      style={{ background: "rgba(15,10,30,0.8)" }}
                    />
                    <button onClick={() => submitComment(post.id)} disabled={!commentText[post.id]?.trim()}
                      className="p-2 bg-primary-600/30 hover:bg-primary-600/50 disabled:opacity-50 text-primary-300 rounded-xl transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
