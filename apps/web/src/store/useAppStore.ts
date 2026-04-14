import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Message, Flashcard, UserSettings, DailyStats,
  ConversationSession, WordOfDay, WeeklyRecord, Achievement,
} from "@ai-lang/shared";
import { SUPPORTED_LANGUAGES, ACHIEVEMENTS } from "@ai-lang/shared";

type CourseProgress = {
  courseId: string;
  completedLessons: string[]; // lesson ids
  enrolledAt: string;
};

type LearningPath = {
  pathTitle: string;
  description: string;
  estimatedWeeks: number;
  dailyMinutes: number;
  goal: string;
  level: string;
  days: any[];
  milestones: any[];
  createdAt: string;
};

type SkillScore = {
  speaking: number;   // 0-100
  grammar: number;
  fluency: number;
  vocabulary: number;
  updatedAt: string;
};

type TutorMemory = {
  commonErrors: string[];
  weakAreas: string[];
  strongAreas: string[];
  totalSessions: number;
  lastFeedback: string;
};

type SavedPhrase = {
  id: string;
  text: string;
  translation: string;
  language: string;
  savedAt: string;
};

type StreakReward = {
  day: number;
  claimed: boolean;
  xp: number;
  emoji: string;
};

type PartnerProfile = {
  id: string;
  name: string;
  flag: string;
  level: string;
  targetLanguage: string;
  nativeLanguage: string;
  bio: string;
  online: boolean;
};

type AppStore = {
  settings: UserSettings;
  messages: Message[];
  flashcards: Flashcard[];
  isLoading: boolean;
  stats: DailyStats;
  streak: number;
  streakRewards: StreakReward[];
  sessions: ConversationSession[];
  wordOfDay: WordOfDay | null;
  weeklyHistory: WeeklyRecord[];
  achievements: Achievement[];
  totalMessages: number;
  grammarChecks: number;
  lessonsCompleted: number;
  sessionStart: number;
  courseProgress: CourseProgress[];
  totalXp: number;
  translationCount: number;
  languageUsage: Record<string, number>;
  learningPath: LearningPath | null;
  pathDaysDone: number[];
  skillScore: SkillScore;
  tutorMemory: TutorMemory;
  savedPhrases: SavedPhrase[];
  notificationsEnabled: boolean;
  username: string;
  lastStreakDate: string;

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
  incrementTranslations: () => void;
  setLearningPath: (path: LearningPath) => void;
  markPathDay: (day: number) => void;
  clearLearningPath: () => void;
  saveSession: (title: string) => void;
  deleteSession: (id: string) => void;
  loadSession: (id: string) => void;
  setWordOfDay: (w: WordOfDay) => void;
  checkAchievements: () => void;
  unlockAchievement: (id: string) => void;
  tickMinutes: () => void;
  enrollCourse: (courseId: string) => void;
  completeLesson: (courseId: string, lessonId: string, xp: number) => void;
  updateSkillScore: (updates: Partial<SkillScore>) => void;
  updateTutorMemory: (updates: Partial<TutorMemory>) => void;
  savePhrase: (phrase: SavedPhrase) => void;
  removePhrase: (id: string) => void;
  setNotifications: (enabled: boolean) => void;
  claimStreakReward: (day: number) => void;
  setUsername: (name: string) => void;
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
      courseProgress: [],
      totalXp: 0,
      translationCount: 0,
      languageUsage: {},
      learningPath: null,
      pathDaysDone: [],
      skillScore: { speaking: 0, grammar: 0, fluency: 0, vocabulary: 0, updatedAt: "" },
      tutorMemory: { commonErrors: [], weakAreas: [], strongAreas: [], totalSessions: 0, lastFeedback: "" },
      savedPhrases: [],
      notificationsEnabled: false,
      username: "",
      lastStreakDate: "",
      streakRewards: [
        { day: 1,  xp: 10,  emoji: "🌱", claimed: false },
        { day: 3,  xp: 25,  emoji: "🔥", claimed: false },
        { day: 7,  xp: 50,  emoji: "⚡", claimed: false },
        { day: 14, xp: 100, emoji: "💎", claimed: false },
        { day: 30, xp: 250, emoji: "🏆", claimed: false },
        { day: 60, xp: 500, emoji: "👑", claimed: false },
      ],

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
        const lang = state.settings.targetLanguage.code;
        return {
          totalMessages: total,
          languageUsage: { ...state.languageUsage, [lang]: (state.languageUsage[lang] ?? 0) + 1 },
          stats: { ...prev, date: today, messagesCount: (isNewDay ? 0 : prev.messagesCount) + 1 },
        };
      }),

      incrementGrammarChecks: () => set((state) => ({ grammarChecks: state.grammarChecks + 1 })),
      incrementLessons: () => set((state) => ({ lessonsCompleted: state.lessonsCompleted + 1 })),
      incrementTranslations: () => set((state) => ({ translationCount: state.translationCount + 1 })),

      setLearningPath: (path) => set({ learningPath: path, pathDaysDone: [] }),
      markPathDay: (day) => set((state) => ({
        pathDaysDone: state.pathDaysDone.includes(day) ? state.pathDaysDone : [...state.pathDaysDone, day],
      })),
      clearLearningPath: () => set({ learningPath: null, pathDaysDone: [] }),

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

      enrollCourse: (courseId) => set((state) => {
        if (state.courseProgress.find(p => p.courseId === courseId)) return state;
        return { courseProgress: [...state.courseProgress, { courseId, completedLessons: [], enrolledAt: new Date().toISOString() }] };
      }),

      completeLesson: (courseId, lessonId, xp) => set((state) => {
        const prog = state.courseProgress.find(p => p.courseId === courseId);
        if (!prog) return state;
        if (prog.completedLessons.includes(lessonId)) return state;
        return {
          totalXp: state.totalXp + xp,
          lessonsCompleted: state.lessonsCompleted + 1,
          courseProgress: state.courseProgress.map(p =>
            p.courseId === courseId
              ? { ...p, completedLessons: [...p.completedLessons, lessonId] }
              : p
          ),
        };
      }),

      updateSkillScore: (updates) => set((state) => ({
        skillScore: { ...state.skillScore, ...updates, updatedAt: new Date().toISOString() },
      })),

      updateTutorMemory: (updates) => set((state) => ({
        tutorMemory: { ...state.tutorMemory, ...updates },
      })),

      savePhrase: (phrase) => set((state) => {
        if (state.savedPhrases.find(p => p.text === phrase.text)) return state;
        return { savedPhrases: [phrase, ...state.savedPhrases].slice(0, 200) };
      }),

      removePhrase: (id) => set((state) => ({
        savedPhrases: state.savedPhrases.filter(p => p.id !== id),
      })),

      setNotifications: (enabled) => set({ notificationsEnabled: enabled }),

      claimStreakReward: (day) => set((state) => {
        const reward = state.streakRewards.find(r => r.day === day);
        if (!reward || reward.claimed || state.streak < day) return state;
        return {
          totalXp: state.totalXp + reward.xp,
          streakRewards: state.streakRewards.map(r => r.day === day ? { ...r, claimed: true } : r),
        };
      }),

      setUsername: (name) => set({ username: name }),
    }),
    { name: "ai-lang-store-v2" }
  )
);
