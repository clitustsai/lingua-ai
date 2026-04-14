export type Language = {
  code: string;
  name: string;
  flag: string;
};

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  translation?: string;
  correction?: string;
  timestamp: Date;
};

export type Flashcard = {
  id: string;
  word: string;
  translation: string;
  example: string;
  language: string;
  reviewCount?: number;
  lastReviewed?: string;
  // SM-2 spaced repetition fields
  easeFactor?: number;   // default 2.5
  interval?: number;     // days until next review
  nextReview?: string;   // YYYY-MM-DD
  repetitions?: number;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlockedAt?: string;
};

export type WeeklyRecord = {
  date: string; // YYYY-MM-DD (Monday of week)
  wordsLearned: number;
  messagesCount: number;
  minutesPracticed: number;
};

export type UserSettings = {
  targetLanguage: Language;
  nativeLanguage: Language;
  level: Level;
  dailyGoal?: number;
  conversationTopic?: string;
  theme?: "dark" | "light";
  autoSpeak?: boolean;
  speechRate?: number;
};

export type DailyStats = {
  date: string;
  wordsLearned: number;
  messagesCount: number;
  streakDay: number;
  minutesPracticed?: number;
};

export type ConversationSession = {
  id: string;
  title: string;
  language: string;
  topic: string;
  messages: Message[];
  createdAt: Date;
};

export type WordOfDay = {
  word: string;
  pronunciation?: string;
  partOfSpeech?: string;
  translation: string;
  example: string;
  exampleTranslation?: string;
  mnemonic?: string;
  language: string;
  date: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_message", title: "First Words", description: "Send your first message", emoji: "💬" },
  { id: "streak_3", title: "On a Roll", description: "3-day streak", emoji: "🔥" },
  { id: "streak_7", title: "Week Warrior", description: "7-day streak", emoji: "⚡" },
  { id: "streak_30", title: "Monthly Master", description: "30-day streak", emoji: "🏆" },
  { id: "flashcard_10", title: "Word Collector", description: "Save 10 flashcards", emoji: "📚" },
  { id: "flashcard_50", title: "Vocabulary Builder", description: "Save 50 flashcards", emoji: "🧠" },
  { id: "quiz_perfect", title: "Perfect Score", description: "Get 100% on a quiz", emoji: "⭐" },
  { id: "messages_50", title: "Chatterbox", description: "Send 50 messages total", emoji: "🗣️" },
  { id: "grammar_check", title: "Grammar Guru", description: "Use grammar checker 5 times", emoji: "✅" },
  { id: "lesson_complete", title: "Student", description: "Complete your first lesson", emoji: "🎓" },
];

export const CONVERSATION_TOPICS = [
  { id: "free", label: "Free Talk", emoji: "💬" },
  { id: "travel", label: "Travel", emoji: "✈️" },
  { id: "food", label: "Food & Dining", emoji: "🍜" },
  { id: "business", label: "Business", emoji: "💼" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "health", label: "Health", emoji: "🏥" },
  { id: "hobbies", label: "Hobbies", emoji: "🎨" },
  { id: "news", label: "Current Events", emoji: "📰" },
];

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
];

export const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
