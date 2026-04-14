import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Message, Flashcard, UserSettings } from "@ai-lang/shared";
import { SUPPORTED_LANGUAGES } from "@ai-lang/shared";

type AppStore = {
  settings: UserSettings;
  messages: Message[];
  flashcards: Flashcard[];
  isLoading: boolean;
  apiUrl: string;
  setSettings: (s: Partial<UserSettings>) => void;
  addMessage: (m: Message) => void;
  clearMessages: () => void;
  addFlashcard: (f: Flashcard) => void;
  removeFlashcard: (id: string) => void;
  setLoading: (v: boolean) => void;
  setApiUrl: (url: string) => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      settings: {
        targetLanguage: SUPPORTED_LANGUAGES[0],
        nativeLanguage: SUPPORTED_LANGUAGES[7],
        level: "A1",
      },
      messages: [],
      flashcards: [],
      isLoading: false,
      apiUrl: "http://localhost:3000",
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
      setApiUrl: (url) => set({ apiUrl: url }),
    }),
    {
      name: "ai-lang-mobile",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
