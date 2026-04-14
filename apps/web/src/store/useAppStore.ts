import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message, Flashcard, UserSettings, Language, Level } from "@ai-lang/shared";
import { SUPPORTED_LANGUAGES } from "@ai-lang/shared";

type AppStore = {
  settings: UserSettings;
  messages: Message[];
  flashcards: Flashcard[];
  isLoading: boolean;
  setSettings: (s: Partial<UserSettings>) => void;
  addMessage: (m: Message) => void;
  clearMessages: () => void;
  addFlashcard: (f: Flashcard) => void;
  removeFlashcard: (id: string) => void;
  setLoading: (v: boolean) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      settings: {
        targetLanguage: SUPPORTED_LANGUAGES[0], // English
        nativeLanguage: SUPPORTED_LANGUAGES[7], // Vietnamese
        level: "A1",
      },
      messages: [],
      flashcards: [],
      isLoading: false,
      setSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),
      addMessage: (m) =>
        set((state) => ({ messages: [...state.messages, m] })),
      clearMessages: () => set({ messages: [] }),
      addFlashcard: (f) =>
        set((state) => ({ flashcards: [...state.flashcards, f] })),
      removeFlashcard: (id) =>
        set((state) => ({
          flashcards: state.flashcards.filter((f) => f.id !== id),
        })),
      setLoading: (v) => set({ isLoading: v }),
    }),
    { name: "ai-lang-store" }
  )
);
