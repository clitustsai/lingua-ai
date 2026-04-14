"use client";
import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import ChatMessage from "@/components/ChatMessage";
import { Send, Trash2, Plus } from "lucide-react";
import type { Message } from "@ai-lang/shared";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { messages, addMessage, clearMessages, settings, isLoading, setLoading, addFlashcard } =
    useAppStore();
  const [input, setInput] = useState("");
  const [newWords, setNewWords] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    addMessage(userMsg);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level: settings.level,
        }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "Sorry, I couldn't respond.",
        correction: data.correction || undefined,
        timestamp: new Date(),
      };
      addMessage(aiMsg);
      if (data.newWords?.length) setNewWords(data.newWords);
    } catch {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Connection error. Please try again.",
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFlashcard = async (word: string) => {
    const res = await fetch("/api/flashcard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word,
        targetLanguage: settings.targetLanguage.name,
        nativeLanguage: settings.nativeLanguage.name,
      }),
    });
    const data = await res.json();
    addFlashcard({
      id: Date.now().toString(),
      word: data.word,
      translation: data.translation,
      example: data.example,
      language: settings.targetLanguage.code,
    });
    setNewWords((prev) => prev.filter((w) => w !== word));
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950">
        <div>
          <h1 className="font-semibold text-white">
            {settings.targetLanguage.flag} {settings.targetLanguage.name} Conversation
          </h1>
          <p className="text-xs text-gray-500">Level: {settings.level}</p>
        </div>
        <button
          onClick={clearMessages}
          className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="text-5xl">{settings.targetLanguage.flag}</div>
            <p className="text-gray-400 text-sm max-w-xs">
              Start a conversation in {settings.targetLanguage.name}. Your AI tutor will help you
              practice and correct mistakes.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {isLoading && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent-600 flex items-center justify-center text-sm font-bold">
              AI
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* New words suggestion */}
      {newWords.length > 0 && (
        <div className="px-6 py-2 flex gap-2 flex-wrap border-t border-gray-800">
          <span className="text-xs text-gray-500 self-center">Save words:</span>
          {newWords.map((w) => (
            <button
              key={w}
              onClick={() => saveFlashcard(w)}
              className="flex items-center gap-1 text-xs bg-accent-600/20 border border-accent-500/30 text-accent-300 px-2 py-1 rounded-full hover:bg-accent-600/40 transition-colors"
            >
              <Plus className="w-3 h-3" /> {w}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-800 bg-gray-950">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={`Type in ${settings.targetLanguage.name}...`}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className={cn(
              "p-3 rounded-xl transition-colors",
              isLoading || !input.trim()
                ? "bg-gray-800 text-gray-600"
                : "bg-primary-600 hover:bg-primary-700 text-white"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
