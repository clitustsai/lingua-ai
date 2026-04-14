"use client";
import { Message } from "@ai-lang/shared";
import { cn } from "@/lib/utils";
import { AlertCircle, Sparkles, Volume2 } from "lucide-react";
import { speakText } from "@/components/VoiceButton";

interface Props {
  message: Message;
  langCode?: string;
  onSuggestionClick?: (text: string) => void;
}

export default function ChatMessage({ message, langCode = "en", onSuggestionClick }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 mb-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
        isUser ? "bg-primary-600" : "bg-accent-600"
      )}>
        {isUser ? "U" : "AI"}
      </div>

      <div className={cn("flex flex-col gap-1.5", isUser ? "items-end max-w-[78%]" : "items-start max-w-[78%]")}>
        {/* Main bubble */}
        <div className={cn(
          "px-4 py-3 rounded-2xl text-sm leading-relaxed",
          isUser
            ? "bg-primary-600 text-white rounded-tr-sm"
            : "bg-gray-800 text-gray-100 rounded-tl-sm"
        )}>
          <div className="flex items-start justify-between gap-2">
            <span>{message.content}</span>
            {!isUser && (
              <button onClick={() => speakText(message.content, langCode)}
                className="shrink-0 p-1 rounded text-gray-500 hover:text-primary-400 transition-colors -mr-1 -mt-0.5">
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Translation */}
          {!isUser && message.translation && (
            <p className="mt-2 text-xs text-gray-400 leading-relaxed border-t border-gray-700 pt-2">
              {message.translation}
            </p>
          )}
        </div>

        {/* Grammar correction */}
        {message.correction && (
          <div className="flex gap-2 bg-yellow-900/30 border border-yellow-700/40 rounded-xl px-3 py-2 text-xs text-yellow-200 w-full">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-yellow-400" />
            <div>
              <p className="font-semibold text-yellow-400 mb-0.5">Sửa lỗi ngữ pháp</p>
              <p>{message.correction}</p>
            </div>
          </div>
        )}

        {/* Better way to say it */}
        {isUser && message.betterWay && (
          <div className="flex gap-2 bg-purple-900/30 border border-purple-700/40 rounded-xl px-3 py-2 text-xs text-purple-200 w-full">
            <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-400" />
            <div>
              <p className="font-semibold text-purple-400 mb-0.5">Cách nói tự nhiên hơn</p>
              <p>{message.betterWay}</p>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && onSuggestionClick && (
          <div className="flex flex-col gap-1.5 w-full">
            <p className="text-xs text-gray-600 px-1">Gợi ý câu trả lời:</p>
            {message.suggestions.map((s, i) => (
              <button key={i} onClick={() => onSuggestionClick(s)}
                className="text-left text-xs px-3 py-2 rounded-xl border border-gray-700 bg-gray-800/60 text-gray-300 hover:border-primary-500 hover:bg-primary-900/20 hover:text-white transition-all">
                💬 {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
