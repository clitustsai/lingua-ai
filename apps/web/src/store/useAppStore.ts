import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Message, Flashcard, UserSettings, DailyStats,
  ConversationSession, WordOfDay, WeeklyRecord, Achievement,
} from "@ai-lang/shared";
import { SUPPORTED_LANGUAGES, ACHIEVEMENTS } from "@ai-lang/shared";

type AppStore = {
  settings: UserSettings;
  messages: Message[];
  flashcards: Flashcard[];
  isLoading: boolean;
  stats: DailyStats;
  streak: number;
  sessions: ConversationSession[];
  wordOfDay: WordOfDay | null;
  weeklyHistory: WeeklyRecord[];
  achievements: Achievement[];
  totalMessages: number;
  grammarChecks: number;
  lessonsCompleted: number;
  sessionStart: number; // timestamp

  setSettings: (s: Partial<UserSettings>) => void;
  addMessage: (m: Message) => void;
  clearMessages: () => void;
  addFlashcard: (f: Flashcard) => void;
  removeFlashcard: (id: string) => void;
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  setLoading: (v: boolean) => void;
  incrementWords: (count: number) => void;
  incrementMessages: () => void;
  incrementGrammarChecks: () => void;
  incrementLessons: () => void;
  saveSession: (title: string) => void;
  deleteSession: (id: string) => void;
  loadSession: (id: string) => void;
  setWordOfDay: (w: WordOfDay) => void;
  checkAchievements: () => void;
  unlockAchievement: (id: string) => void;
  tickMinutes: () => void;
};

function todayStr() { return new Date().toISOString().slice(0, 10); }
function mondayStr() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().slice(0, 10);
}

const defaultStats: DailyStats = { date: todayStr(), wordsLearned: 0, messagesCount: 0, streakDay: 1, minutesPracticed: 0 };

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      settings: {
        targetLanguage: SUPPORTED_LANGUAGES[0],
        nativeLanguage: SUPPORTED_LANGUAGES[7],
        level: "A1",
        dailyGoal: 5,
        conversationTopic: "free",
        autoSpeak: true,
        speechRate: 0.9,
      },
      messages: [],
      flashcards: [],
      isLoading: false,
      stats: defaultStats,
      streak: 1,
      sessions: [],
      wordOfDay: null,
      weeklyHistory: [],
      achievements: [],
      totalMessages: 0,
      grammarChecks: 0,
      lessonsCompleted: 0,
      sessionStart: Date.now(),

      setSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
      addMessage: (m) => set((state) => ({ messages: [...state.messages, m] })),
      clearMessages: () => set({ messages: [] }),

      addFlashcard: (f) => set((state) => {
        const exists = state.flashcards.some((x) => x.word === f.word && x.language === f.language);
        if (exists) return state;
        const card: Flashcard = { ...f, easeFactor: 2.5, interval: 1, repetitions: 0, nextReview: todayStr() };
        const next = { flashcards: [...state.flashcards, card] };
        return next;
      }),

      removeFlashcard: (id) => set((state) => ({ flashcards: state.flashcards.filter((f) => f.id !== id) })),

      updateFlashcard: (id, updates) => set((state) => ({
        flashcards: state.flashcards.map((f) => f.id === id ? { ...f, ...updates } : f),
      })),

      setLoading: (v) => set({ isLoading: v }),

      incrementWords: (count) => set((state) => {
        const today = todayStr();
        const prev = state.stats;
        const isNewDay = prev.date !== today;
        const newStreak = isNewDay ? state.streak + 1 : state.streak;
        const wordsLearned = (isNewDay ? 0 : prev.wordsLearned) + count;
        // update weekly
        const week = mondayStr();
        const wh = [...state.weeklyHistory];
        const wi = wh.findIndex((w) => w.date === week);
        if (wi >= 0) wh[wi] = { ...wh[wi], wordsLearned: wh[wi].wordsLearned + count };
        else wh.unshift({ date: week, wordsLearned: count, messagesCount: 0, minutesPracticed: 0 });
        return {
          streak: newStreak,
          weeklyHistory: wh.slice(0, 12),
          stats: { date: today, wordsLearned, messagesCount: isNewDay ? 0 : prev.messagesCount, streakDay: newStreak, minutesPracticed: isNewDay ? 0 : (prev.minutesPracticed ?? 0) },
        };
      }),

      incrementMessages: () => set((state) => {
        const today = todayStr();
        const prev = state.stats;
        const isNewDay = prev.date !== today;
        const total = state.totalMessages + 1;
        return {
          totalMessages: total,
          stats: { ...prev, date: today, messagesCount: (isNewDay ? 0 : prev.messagesCount) + 1 },
        };
      }),

      incrementGrammarChecks: () => set((state) => ({ grammarChecks: state.grammarChecks + 1 })),
      incrementLessons: () => set((state) => ({ lessonsCompleted: state.lessonsCompleted + 1 })),

      tickMinutes: () => set((state) => {
        const today = todayStr();
        const prev = state.stats;
        const isNewDay = prev.date !== today;
        const mins = (isNewDay ? 0 : (prev.minutesPracticed ?? 0)) + 1;
        const week = mondayStr();
        const wh = [...state.weeklyHistory];
        const wi = wh.findIndex((w) => w.date === week);
        if (wi >= 0) wh[wi] = { ...wh[wi], minutesPracticed: wh[wi].minutesPracticed + 1 };
        return { weeklyHistory: wh, stats: { ...prev, date: today, minutesPracticed: mins } };
      }),

      saveSession: (title) => set((state) => {
        if (state.messages.length === 0) return state;
        const session: ConversationSession = {
          id: Date.now().toString(), title,
          language: state.settings.targetLanguage.name,
          topic: state.settings.conversationTopic ?? "free",
          messages: [...state.messages],
          createdAt: new Date(),
        };
        return { sessions: [session, ...state.sessions].slice(0, 30) };
      }),

      deleteSession: (id) => set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) })),

      loadSession: (id) => set((state) => {
        const s = state.sessions.find((x) => x.id === id);
        if (!s) return state;
        return { messages: s.messages };
      }),

      setWordOfDay: (w) => set({ wordOfDay: w }),

      unlockAchievement: (id) => set((state) => {
        if (state.achievements.find((a) => a.id === id)) return state;
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (!def) return state;
        return { achievements: [...state.achievements, { ...def, unlockedAt: new Date().toISOString() }] };
      }),

      checkAchievements: () => {
        const s = get();
        const unlock = (id: string) => {
          if (!s.achievements.find((a) => a.id === id)) s.unlockAchievement(id);
        };
        if (s.totalMessages >= 1) unlock("first_message");
        if (s.streak >= 3) unlock("streak_3");
        if (s.streak >= 7) unlock("streak_7");
        if (s.streak >= 30) unlock("streak_30");
        if (s.flashcards.length >= 10) unlock("flashcard_10");
        if (s.flashcards.length >= 50) unlock("flashcard_50");
        if (s.totalMessages >= 50) unlock("messages_50");
        if (s.grammarChecks >= 5) unlock("grammar_check");
        if (s.lessonsCompleted >= 1) unlock("lesson_complete");
      },
    }),
    { name: "ai-lang-store-v2" }
  )
);
