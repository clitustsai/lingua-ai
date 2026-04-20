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

type CommunityPost = {
  id: string;
  authorName: string;
  authorFlag: string;
  language: string;
  level: string;
  text: string;
  translation?: string;
  question: string;
  likes: number;
  likedByMe: boolean;
  comments: CommunityComment[];
  createdAt: string;
  corrections: CommunityCorrection[];
};

type CommunityComment = {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
};

type CommunityCorrection = {
  id: string;
  authorName: string;
  corrected: string;
  explanation: string;
  createdAt: string;
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
  communityPosts: CommunityPost[];

  setSettings: (s: Partial<UserSettings>) => void;
  addMessage: (m: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
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
  checkDailyStreak: () => void;
  completedVideos: string[];
  addCompletedVideo: (videoId: string) => void;
  translateHistory: { id: string; original: string; translation: string; fromLang: string; toLang: string; savedAt: string; starred: boolean }[];
  addTranslateHistory: (item: { original: string; translation: string; fromLang: string; toLang: string }) => void;
  toggleStarTranslation: (id: string) => void;
  clearTranslateHistory: () => void;
  addCommunityPost: (post: CommunityPost) => void;
  likePost: (id: string) => void;
  addComment: (postId: string, comment: CommunityComment) => void;
  addCorrection: (postId: string, correction: CommunityCorrection) => void;
  examResults: Record<string, { passed: boolean; score: number; date: string }>;
  saveExamResult: (level: string, result: { passed: boolean; score: number; date: string }) => void;
  getUnlockedLevel: () => string;
  canAccessLevel: (level: string) => boolean;
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
      communityPosts: [],
      examResults: {},
      streakRewards: [
        { day: 1,  xp: 10,  emoji: "🌱", claimed: false },
        { day: 3,  xp: 25,  emoji: "🔥", claimed: false },
        { day: 7,  xp: 50,  emoji: "⚡", claimed: false },
        { day: 14, xp: 100, emoji: "💎", claimed: false },
        { day: 30, xp: 250, emoji: "🏆", claimed: false },
        { day: 60, xp: 500, emoji: "👑", claimed: false },
      ],

      setSettings: (s) => set((state) => {
        // If trying to set a higher level, check if allowed
        if (s.level) {
          const ORDER = ["A1","A2","B1","B2","C1","C2"];
          const idx = ORDER.indexOf(s.level);
          if (idx > 0) {
            const prevLevel = ORDER[idx - 1];
            const results = state.examResults ?? {};
            if (!(results as any)[prevLevel]?.passed) {
              // Block — keep current level
              const { level, ...rest } = s;
              return { settings: { ...state.settings, ...rest } };
            }
          }
        }
        return { settings: { ...state.settings, ...s } };
      }),
      addMessage: (m) => set((state) => ({ messages: [...state.messages, m] })),
      updateMessage: (id, updates) => set((state) => ({
        messages: state.messages.map(m => m.id === id ? { ...m, ...updates } : m)
      })),
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

      checkDailyStreak: () => set((state) => {
        const today = todayStr();
        if (state.lastStreakDate === today) return state; // already checked today
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().slice(0, 10);
        const isConsecutive = state.lastStreakDate === yStr;
        const newStreak = isConsecutive ? state.streak + 1 : 1;
        return {
          streak: newStreak,
          lastStreakDate: today,
          totalXp: state.totalXp + 10, // +10 XP for daily login
          stats: { ...state.stats, streakDay: newStreak },
        };
      }),

      completedVideos: [],

      addCompletedVideo: (videoId) => set((state) => ({
        completedVideos: state.completedVideos.includes(videoId)
          ? state.completedVideos
          : [...state.completedVideos, videoId],
      })),

      translateHistory: [],

      addTranslateHistory: (item) => set((state) => ({
        translateHistory: [
          { ...item, id: Date.now().toString(), savedAt: new Date().toISOString(), starred: false },
          ...state.translateHistory,
        ].slice(0, 200),
      })),

      toggleStarTranslation: (id) => set((state) => ({
        translateHistory: state.translateHistory.map(t =>
          t.id === id ? { ...t, starred: !t.starred } : t
        ),
      })),

      clearTranslateHistory: () => set({ translateHistory: [] }),

      addCommunityPost: (post: CommunityPost) => set((state) => ({
        communityPosts: [post, ...state.communityPosts].slice(0, 100),
      })),
      likePost: (id) => set((state) => ({
        communityPosts: state.communityPosts.map(p =>
          p.id === id ? { ...p, likes: p.likedByMe ? p.likes - 1 : p.likes + 1, likedByMe: !p.likedByMe } : p
        ),
      })),
      addComment: (postId, comment) => set((state) => ({
        communityPosts: state.communityPosts.map(p =>
          p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
        ),
      })),
      addCorrection: (postId, correction) => set((state) => ({
        communityPosts: state.communityPosts.map(p =>
          p.id === postId ? { ...p, corrections: [...p.corrections, correction] } : p
        ),
      })),
      saveExamResult: (level, result) => set((state) => ({
        examResults: { ...state.examResults, [level]: result },
        totalXp: result.passed ? state.totalXp + 200 : state.totalXp,
      })),
      getUnlockedLevel: () => {
        const ORDER = ["A1","A2","B1","B2","C1","C2"];
        const s = get();
        const results = s.examResults ?? {};
        // Find highest passed level
        let highest = "A1";
        for (const lv of ORDER) {
          if ((results as any)[lv]?.passed) highest = lv;
          else break;
        }
        // Next unlocked = one above highest passed, or A1 if none passed
        const idx = ORDER.indexOf(highest);
        const passed = (results as any)[highest]?.passed;
        if (passed && idx < ORDER.length - 1) return ORDER[idx + 1];
        if (!passed) return "A1";
        return highest;
      },
      canAccessLevel: (level: string) => {
        const ORDER = ["A1","A2","B1","B2","C1","C2"];
        const s = get();
        const results = s.examResults ?? {};
        const idx = ORDER.indexOf(level);
        if (idx === 0) return true; // A1 always accessible
        // Can access if previous level is passed
        const prevLevel = ORDER[idx - 1];
        return !!(results as any)[prevLevel]?.passed;
      },
    }),
    { name: "ai-lang-store-v2" }
  )
);
