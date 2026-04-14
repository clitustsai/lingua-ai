"use client";
import { Message } from "@ai-lang/shared";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
          isUser ? "bg-primary-600" : "bg-accent-600"
        )}
      >
        {isUser ? "U" : "AI"}
      </div>
      <div className="max-w-[75%] flex flex-col gap-2">
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isUser
              ? "bg-primary-600 text-white rounded-tr-sm"
              : "bg-gray-800 text-gray-100 rounded-tl-sm"
          )}
        >
          {message.content}
        </div>
        {message.correction && (
          <div className="flex gap-2 bg-yellow-900/30 border border-yellow-700/50 rounded-xl px-3 py-2 text-xs text-yellow-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{message.correction}</span>
          </div>
        )}
      </div>
    </div>
  );
}
