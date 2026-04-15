"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { Trash2, MessageCircle, Clock, ChevronRight, Download, FileText, X } from "lucide-react";
import { CONVERSATION_TOPICS } from "@ai-lang/shared";
import type { ConversationSession } from "@ai-lang/shared";

function exportTXT(session: ConversationSession) {
  const lines = [
    `=== ${session.title} ===`,
    `Language: ${session.language}`,
    `Date: ${new Date(session.createdAt).toLocaleString()}`,
    `Messages: ${session.messages.length}`,
    "",
    ...session.messages.map(m =>
      `[${m.role === "user" ? "You" : "AI"}] ${m.content}${m.translation ? `\n  → ${m.translation}` : ""}${m.correction ? `\n  ⚠ ${m.correction}` : ""}${m.betterWay ? `\n  ✨ ${m.betterWay}` : ""}`
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `${session.title.replace(/\s+/g, "_")}.txt`;
  a.click(); URL.revokeObjectURL(url);
}

function exportPDF(session: ConversationSession) {
  const html = `
    <html><head><meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; color: #1a1a2e; }
      h1 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 8px; }
      .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
      .msg { margin: 12px 0; padding: 12px 16px; border-radius: 12px; }
      .user { background: #ede9fe; text-align: right; }
      .ai   { background: #f3f4f6; }
      .role { font-size: 11px; font-weight: bold; color: #7c3aed; margin-bottom: 4px; }
      .content { font-size: 14px; line-height: 1.6; }
      .translation { font-size: 12px; color: #666; font-style: italic; margin-top: 6px; }
      .correction { font-size: 12px; color: #d97706; margin-top: 6px; }
      .better { font-size: 12px; color: #7c3aed; margin-top: 6px; }
    </style></head><body>
    <h1>${session.title}</h1>
    <div class="meta">
      🌐 ${session.language} &nbsp;|&nbsp; 📅 ${new Date(session.createdAt).toLocaleString()} &nbsp;|&nbsp; 💬 ${session.messages.length} messages
    </div>
    ${session.messages.map(m => `
      <div class="msg ${m.role}">
        <div class="role">${m.role === "user" ? "👤 You" : "🤖 AI"}</div>
        <div class="content">${m.content}</div>
        ${m.translation ? `<div class="translation">🌐 ${m.translation}</div>` : ""}
        ${m.correction ? `<div class="correction">⚠️ ${m.correction}</div>` : ""}
        ${m.betterWay ? `<div class="better">✨ ${m.betterWay}</div>` : ""}
      </div>
    `).join("")}
    </body></html>
  `;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (w) setTimeout(() => { w.print(); URL.revokeObjectURL(url); }, 800);
}

export default function HistoryPage() {
  const { sessions, deleteSession, loadSession } = useAppStore();
  const router = useRouter();
  const [preview, setPreview] = useState<ConversationSession | null>(null);

  const load = (id: string) => {
    loadSession(id);
    router.push("/");
  };

  const topicLabel = (id: string) => {
    const t = CONVERSATION_TOPICS.find(x => x.id === id);
    return t ? `${t.emoji} ${t.label}` : id;
  };

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white">Lịch sử hội thoại</h1>
        <p className="text-sm text-gray-500 mt-1">{sessions.length} cuộc hội thoại đã lưu</p>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <MessageCircle className="w-12 h-12 text-gray-700 animate-float" />
          <p className="text-gray-500 text-sm max-w-xs">Chưa có hội thoại nào. Lưu chat từ trang Chat nhé.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <div key={s.id} className="rounded-2xl p-4 transition-all hover:border-primary-500/40 animate-fade-in-up"
              style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white font-semibold text-sm truncate">{s.title}</span>
                    <span className="text-xs bg-primary-900/40 text-primary-300 px-2 py-0.5 rounded-full shrink-0">{s.language}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{s.messages.length} tin</span>
                    <span>{topicLabel(s.topic)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(s.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <button onClick={() => setPreview(s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors text-gray-400 hover:text-white hover:bg-white/5 border border-gray-700">
                  <FileText className="w-3.5 h-3.5" /> Xem
                </button>
                <button onClick={() => exportTXT(s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors text-gray-400 hover:text-green-300 hover:bg-green-900/20 border border-gray-700">
                  <Download className="w-3.5 h-3.5" /> TXT
                </button>
                <button onClick={() => exportPDF(s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors text-gray-400 hover:text-blue-300 hover:bg-blue-900/20 border border-gray-700">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <button onClick={() => load(s.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors bg-primary-600/20 hover:bg-primary-600/40 text-primary-300 border border-primary-700/40 ml-auto">
                  Tải lại <ChevronRight className="w-3 h-3" />
                </button>
                <button onClick={() => deleteSession(s.id)}
                  className="p-1.5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors border border-gray-700">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setPreview(null)}>
          <div className="w-full max-w-lg max-h-[80vh] rounded-3xl overflow-hidden animate-fade-in-scale"
            style={{ background: "#0f0a1e", border: "1px solid rgba(139,92,246,0.3)" }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <p className="text-white font-semibold text-sm">{preview.title}</p>
                <p className="text-gray-500 text-xs">{preview.messages.length} tin · {preview.language}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => exportTXT(preview)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-gray-800 text-gray-300 hover:text-white transition-colors">TXT</button>
                <button onClick={() => exportPDF(preview)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-primary-600/30 text-primary-300 hover:bg-primary-600/50 transition-colors">PDF</button>
                <button onClick={() => setPreview(null)}
                  className="p-1.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Messages */}
            <div className="overflow-y-auto p-4 flex flex-col gap-3" style={{ maxHeight: "60vh" }}>
              {preview.messages.map(m => (
                <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${m.role === "user" ? "bg-primary-600" : "bg-accent-600"}`}>
                    {m.role === "user" ? "🧑" : "🤖"}
                  </div>
                  <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs leading-relaxed ${m.role === "user" ? "bg-primary-700 text-white" : "text-gray-200"}`}
                    style={m.role !== "user" ? { background: "rgba(30,20,60,0.9)", border: "1px solid rgba(139,92,246,0.15)" } : {}}>
                    <p>{m.content}</p>
                    {m.translation && <p className="text-gray-400 italic mt-1">{m.translation}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
