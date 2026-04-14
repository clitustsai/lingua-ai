import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message, Flashcard, UserSettings, DailyStats, ConversationSession, WordOfDay } from "@ai-lang/shared";
import { SUPPORTED_LANGUAGES } from "@ai-lang/shared";

type AppStore = {
  settings: UserSettings;
  messages: Message[];
  flashcards: Flashcard[];
  isLoading: boolean;
  stats: DailyStats;
  streak: number;
  sessions: ConversationSession[];
  wordOfDay: WordOfDay | null;
  setSettings: (s: Partial<UserSettings>) => void;
  addMessage: (m: Message) => void;
  clearMessages: () => void;
  addFlashcard: (f: Flashcard) => void;
  removeFlashcard: (id: string) => void;
  setLoading: (v: boolean) => void;
  incrementWords: (count: number) => void;
  incrementMessages: () => void;
  saveSession: (title: string) => void;
  deleteSession: (id: string) => void;
  loadSession: (id: string) => void;
  setWordOfDay: (w: WordOfDay) => void;
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const defaultStats: DailyStats = { date: todayStr(), wordsLearned: 0, messagesCount: 0, streakDay: 1 };

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      settings: {
        targetLanguage: SUPPORTED_LANGUAGES[0],
        nativeLanguage: SUPPORTED_LANGUAGES[7],
        level: "A1",
        dailyGoal: 5,
        conversationTopic: "free",
      },
      messages: [],
      flashcards: [],
      isLoading: false,
      stats: defaultStats,
      streak: 1,
      sessions: [],
      wordOfDay: null,
      setSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),
      addMessage: (m) =>
        set((state) => ({ messages: [...state.messages, m] })),
      clearMessages: () => set({ messages: [] }),
      addFlashcard: (f) =>
        set((state) => {
          const exists = state.flashcards.some((x) => x.word === f.word && x.language === f.language);
          if (exists) return state;
          return { flashcards: [...state.flashcards, f] };
        }),
      removeFlashcard: (id) =>
        set((state) => ({ flashcards: state.flashcards.filter((f) => f.id !== id) })),
      setLoading: (v) => set({ isLoading: v }),
      incrementWords: (count) =>
        set((state) => {
          const today = todayStr();
          const prev = state.stats;
          const isNewDay = prev.date !== today;
          const newStreak = isNewDay ? state.streak + 1 : state.streak;
          return {
            streak: newStreak,
            stats: {
              date: today,
              wordsLearned: (isNewDay ? 0 : prev.wordsLearned) + count,
              messagesCount: isNewDay ? 0 : prev.messagesCount,
              streakDay: newStreak,
            },
          };
        }),
      incrementMessages: () =>
        set((state) => {
          const today = todayStr();
          const prev = state.stats;
          const isNewDay = prev.date !== today;
          return {
            stats: { ...prev, date: today, messagesCount: (isNewDay ? 0 : prev.messagesCount) + 1 },
          };
        }),
      saveSession: (title) =>
        set((state) => {
          if (state.messages.length === 0) return state;
          const session: ConversationSession = {
            id: Date.now().toString(),
            title,
            language: state.settings.targetLanguage.name,
            topic: state.settings.conversationTopic ?? "free",
            messages: [...state.messages],
            createdAt: new Date(),
          };
          return { sessions: [session, ...state.sessions].slice(0, 20) };
        }),
      deleteSession: (id) =>
        set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) })),
      loadSession: (id) =>
        set((state) => {
          const s = state.sessions.find((x) => x.id === id);
          if (!s) return state;
          return { messages: s.messages };
        }),
      setWordOfDay: (w) => set({ wordOfDay: w }),
    }),
    { name: "ai-lang-store" }
  )
);
