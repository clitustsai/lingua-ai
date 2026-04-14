"use client";
import { useState } from "react";
import { Flashcard } from "@ai-lang/shared";
import { Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FlashcardItem({
  card,
  onDelete,
}: {
  card: Flashcard;
  onDelete: (id: string) => void;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          minHeight: "160px",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-gray-800 border border-gray-700 rounded-2xl p-5 flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-2xl font-bold text-white">{card.word}</div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">tap to reveal</span>
            <RotateCcw className="w-4 h-4 text-gray-500" />
          </div>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 bg-accent-600/20 border border-accent-500/30 rounded-2xl p-5 flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div>
            <div className="text-xl font-semibold text-accent-300">{card.translation}</div>
            <div className="text-sm text-gray-400 mt-2 italic">{card.example}</div>
          </div>
          <div className="flex justify-end">
            <RotateCcw className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-900/30 hover:bg-red-700/50 text-red-400 transition-colors z-10"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
