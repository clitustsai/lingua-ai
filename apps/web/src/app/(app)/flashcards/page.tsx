"use client";
import { useAppStore } from "@/store/useAppStore";
import FlashcardItem from "@/components/FlashcardItem";
import { BookOpen } from "lucide-react";

export default function FlashcardsPage() {
  const { flashcards, removeFlashcard } = useAppStore();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Flashcards</h1>
        <p className="text-sm text-gray-500 mt-1">{flashcards.length} cards saved</p>
      </div>

      {flashcards.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <BookOpen className="w-12 h-12 text-gray-700" />
          <p className="text-gray-500 text-sm max-w-xs">
            No flashcards yet. Save words from your conversations to build your vocabulary.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {flashcards.map((card) => (
            <FlashcardItem key={card.id} card={card} onDelete={removeFlashcard} />
          ))}
        </div>
      )}
    </div>
  );
}
