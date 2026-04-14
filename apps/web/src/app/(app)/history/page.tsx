"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { Trash2, MessageCircle, Clock, ChevronRight } from "lucide-react";
import { CONVERSATION_TOPICS } from "@ai-lang/shared";

export default function HistoryPage() {
  const { sessions, deleteSession, loadSession } = useAppStore();
  const router = useRouter();

  const load = (id: string) => {
    loadSession(id);
    router.push("/");
  };

  const topicLabel = (id: string) => {
    const t = CONVERSATION_TOPICS.find(x => x.id === id);
    return t ? `${t.emoji} ${t.label}` : id;
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Conversation History</h1>
        <p className="text-sm text-gray-500 mt-1">{sessions.length} saved sessions</p>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <MessageCircle className="w-12 h-12 text-gray-700" />
          <p className="text-gray-500 text-sm max-w-xs">No saved conversations yet. Save a chat from the Chat page.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium text-sm truncate">{s.title}</span>
                  <span className="text-xs text-gray-500 shrink-0">{s.language}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{s.messages.length} messages</span>
                  <span>{topicLabel(s.topic)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => deleteSession(s.id)}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => load(s.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary-600/20 hover:bg-primary-600/40 text-primary-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Load <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
