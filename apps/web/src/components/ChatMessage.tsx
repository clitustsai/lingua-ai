"use client";
import { Message } from "@ai-lang/shared";
import { cn } from "@/lib/utils";
import { AlertCircle, Sparkles, Volume2, Bookmark, BookmarkCheck, Copy, Check } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

interface Props {
  message: Message;
  langCode?: string;
  onSuggestionClick?: (text: string) => void;
}

export default function ChatMessage({ message, langCode = "en", onSuggestionClick }: Props) {
  const isUser = message.role === "user";
  const { savePhrase, savedPhrases, settings } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(
    savedPhrases.some(p => p.text === message.content)
  );

  const handleBookmark = () => {
    if (bookmarked) return;
    savePhrase({
      id: Date.now().toString(),
      text: message.content,
      translation: message.translation ?? "",
      language: langCode,
      savedAt: new Date().toISOString(),
    });
    setBookmarked(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={cn("flex gap-2.5 mb-4", isUser ? "flex-row-reverse msg-user" : "flex-row msg-ai")}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-lg",
        isUser
          ? "bg-gradient-to-br from-primary-500 to-primary-700"
          : "bg-gradient-to-br from-accent-500 to-purple-700"
      )}>
        {isUser ? "🧑" : "🤖"}
      </div>

      <div className={cn("flex flex-col gap-1.5", isUser ? "items-end max-w-[80%]" : "items-start max-w-[80%]")}>
        {/* Main bubble */}
        <div className={cn(
          "relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md group",
          isUser
            ? "bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tr-sm"
            : "text-gray-100 rounded-tl-sm"
        )}
          style={!isUser ? { background: "rgba(30,20,60,0.9)", border: "1px solid rgba(139,92,246,0.2)" } : {}}>

          <p className="whitespace-pre-wrap">{message.content}</p>

          {/* Translation - hiện cho cả user và AI */}
          {message.translation && (
            <p className={cn("mt-2 text-xs leading-relaxed border-t pt-2 italic",
              isUser ? "border-white/20 text-white/60" : "border-white/10 text-gray-400")}>
              {message.translation}
            </p>
          )}

          {/* Action buttons — appear on hover */}
          <div className={cn(
            "flex gap-1 mt-2 pt-1.5 border-t",
            isUser ? "border-white/20 justify-end" : "border-white/10 justify-start"
          )}>
            {!isUser && (
              <button onClick={() => speakText(message.content, langCode, settings.speechRate)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 hover:bg-white/5 transition-all"
                title="Nghe phát âm">
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={handleCopy}
              className="p-1.5 rounded-lg text-gray-500 hover:text-green-400 hover:bg-white/5 transition-all"
              title="Copy">
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button onClick={handleBookmark}
              className={cn("p-1.5 rounded-lg transition-all",
                bookmarked
                  ? "text-yellow-400"
                  : "text-gray-500 hover:text-yellow-400 hover:bg-white/5"
              )}
              title={bookmarked ? "Đã lưu" : "Bookmark"}>
              {bookmarked
                ? <BookmarkCheck className="w-3.5 h-3.5" />
                : <Bookmark className="w-3.5 h-3.5" />
              }
            </button>
          </div>
        </div>

        {/* Grammar correction */}
        {message.correction && (
          <div className="flex gap-2 rounded-xl px-3 py-2.5 text-xs w-full animate-fade-in-up"
            style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)" }}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-yellow-400" />
            <div>
              <p className="font-semibold text-yellow-400 mb-0.5">Sửa lỗi ngữ pháp</p>
              <p className="text-yellow-200">{message.correction}</p>
            </div>
          </div>
        )}

        {/* Better way */}
        {isUser && message.betterWay && (
          <div className="flex gap-2 rounded-xl px-3 py-2.5 text-xs w-full animate-fade-in-up"
            style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
            <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-400" />
            <div>
              <p className="font-semibold text-purple-400 mb-0.5">Cách nói tự nhiên hơn ✨</p>
              <p className="text-purple-200">{message.betterWay}</p>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && onSuggestionClick && (
          <div className="flex flex-col gap-1.5 w-full animate-fade-in-up">
            <p className="text-xs text-gray-600 px-1">💬 Gợi ý câu trả lời:</p>
            {message.suggestions.map((s, i) => (
              <button key={i} onClick={() => onSuggestionClick(s)}
                className="text-left text-xs px-3 py-2.5 rounded-xl border border-gray-700/60 text-gray-300 hover:border-primary-500 hover:bg-primary-900/20 hover:text-white transition-all"
                style={{ background: "rgba(26,16,53,0.6)" }}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
