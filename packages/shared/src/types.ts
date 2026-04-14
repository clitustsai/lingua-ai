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
  betterWay?: string;
  suggestions?: string[];
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

export const CHAT_SCENARIOS = [
  { id: "tutor",       label: "AI Gia sư",          emoji: "🎓", persona: "tutor",       desc: "Học có hướng dẫn, sửa lỗi" },
  { id: "native",      label: "Người bản xứ",        emoji: "🌍", persona: "native",      desc: "Chat tự nhiên như bạn bè" },
  { id: "interviewer", label: "Phỏng vấn xin việc",  emoji: "💼", persona: "interviewer", desc: "Luyện phỏng vấn chuyên nghiệp" },
  { id: "barista",     label: "Gọi đồ tại quán",     emoji: "☕", persona: "barista",     desc: "Thực hành tình huống thực tế" },
  { id: "doctor",      label: "Khám bệnh",           emoji: "🏥", persona: "doctor",      desc: "Từ vựng y tế, sức khỏe" },
  { id: "shopkeeper",  label: "Mua sắm",             emoji: "🛍️", persona: "shopkeeper",  desc: "Hỏi giá, mặc cả, mua hàng" },
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

// ─── Course System ────────────────────────────────────────────────────────────

export type CourseLesson = {
  id: string;
  title: string;
  type: "vocabulary" | "grammar" | "listening" | "reading" | "speaking" | "quiz";
  durationMin: number;
  xp: number;
};

export type CourseUnit = {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
};

export type Course = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  level: string;
  totalUnits: number;
  totalLessons: number;
  color: string;       // gradient CSS
  emoji: string;
  tags: string[];
  units: CourseUnit[];
};

export const COURSES: Course[] = [
  {
    id: "ielts-band7",
    title: "IELTS Band 7",
    subtitle: "Academic & General Training",
    category: "Chứng chỉ",
    level: "B2-C1",
    totalUnits: 17,
    totalLessons: 68,
    color: "linear-gradient(135deg,#1e3a5f,#0f2744)",
    emoji: "🎓",
    tags: ["IELTS", "Academic"],
    units: [
      { id: "u1", title: "Academic Vocabulary", description: "High-frequency words for IELTS", lessons: [
        { id: "l1", title: "Topic Vocabulary: Environment", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l2", title: "Topic Vocabulary: Technology", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l3", title: "Collocations & Phrases", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l4", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
      { id: "u2", title: "Reading Skills", description: "Skimming, scanning & inference", lessons: [
        { id: "l5", title: "Skimming for Main Ideas", type: "reading", durationMin: 15, xp: 25 },
        { id: "l6", title: "True/False/Not Given", type: "reading", durationMin: 15, xp: 25 },
        { id: "l7", title: "Matching Headings", type: "reading", durationMin: 15, xp: 25 },
        { id: "l8", title: "Unit Quiz", type: "quiz", durationMin: 10, xp: 35 },
      ]},
      { id: "u3", title: "Listening Strategies", description: "Note-taking & prediction", lessons: [
        { id: "l9", title: "Predicting Answers", type: "listening", durationMin: 12, xp: 20 },
        { id: "l10", title: "Multiple Choice", type: "listening", durationMin: 12, xp: 20 },
        { id: "l11", title: "Map & Diagram Labelling", type: "listening", durationMin: 12, xp: 20 },
        { id: "l12", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
    ],
  },
  {
    id: "toeic-700",
    title: "TOEIC 700+",
    subtitle: "Listening & Reading",
    category: "Chứng chỉ",
    level: "B1-B2",
    totalUnits: 12,
    totalLessons: 48,
    color: "linear-gradient(135deg,#3b1f6e,#1a0d3d)",
    emoji: "💼",
    tags: ["TOEIC", "Business"],
    units: [
      { id: "u1", title: "Business Vocabulary", description: "Office, meetings & emails", lessons: [
        { id: "l1", title: "Office & Workplace", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l2", title: "Meetings & Presentations", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l3", title: "Email & Correspondence", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l4", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
      { id: "u2", title: "Part 5 & 6: Grammar", description: "Sentence completion", lessons: [
        { id: "l5", title: "Verb Tenses Review", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l6", title: "Prepositions & Articles", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l7", title: "Connectors & Transitions", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l8", title: "Unit Quiz", type: "quiz", durationMin: 10, xp: 35 },
      ]},
    ],
  },
  {
    id: "business-english",
    title: "Business English",
    subtitle: "Professional Communication",
    category: "Kỹ năng",
    level: "B1-C1",
    totalUnits: 10,
    totalLessons: 40,
    color: "linear-gradient(135deg,#1a4a3a,#0d2b22)",
    emoji: "🏢",
    tags: ["Business", "Professional"],
    units: [
      { id: "u1", title: "Negotiations", description: "Language for deals & agreements", lessons: [
        { id: "l1", title: "Opening a Negotiation", type: "speaking", durationMin: 15, xp: 30 },
        { id: "l2", title: "Making Proposals", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l3", title: "Reaching Agreement", type: "speaking", durationMin: 15, xp: 30 },
        { id: "l4", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 35 },
      ]},
      { id: "u2", title: "Presentations", description: "Structure & delivery", lessons: [
        { id: "l5", title: "Opening Strong", type: "speaking", durationMin: 12, xp: 25 },
        { id: "l6", title: "Data & Charts Language", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l7", title: "Handling Questions", type: "speaking", durationMin: 12, xp: 25 },
        { id: "l8", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
    ],
  },
  {
    id: "daily-english",
    title: "Daily English",
    subtitle: "Everyday Conversations",
    category: "Giao tiếp",
    level: "A1-B1",
    totalUnits: 20,
    totalLessons: 80,
    color: "linear-gradient(135deg,#4a1a1a,#2b0d0d)",
    emoji: "💬",
    tags: ["Daily", "Beginner"],
    units: [
      { id: "u1", title: "Greetings & Introductions", description: "First conversations", lessons: [
        { id: "l1", title: "Hello & Goodbye", type: "vocabulary", durationMin: 8, xp: 15 },
        { id: "l2", title: "Introducing Yourself", type: "speaking", durationMin: 10, xp: 20 },
        { id: "l3", title: "Asking About Others", type: "grammar", durationMin: 10, xp: 20 },
        { id: "l4", title: "Unit Quiz", type: "quiz", durationMin: 6, xp: 25 },
      ]},
      { id: "u2", title: "Shopping & Dining", description: "Real-world situations", lessons: [
        { id: "l5", title: "At the Restaurant", type: "speaking", durationMin: 12, xp: 25 },
        { id: "l6", title: "Shopping Vocabulary", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l7", title: "Prices & Numbers", type: "grammar", durationMin: 8, xp: 15 },
        { id: "l8", title: "Unit Quiz", type: "quiz", durationMin: 6, xp: 25 },
      ]},
      { id: "u3", title: "Travel & Directions", description: "Getting around", lessons: [
        { id: "l9", title: "At the Airport", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l10", title: "Asking for Directions", type: "speaking", durationMin: 12, xp: 25 },
        { id: "l11", title: "Transport Vocabulary", type: "vocabulary", durationMin: 8, xp: 15 },
        { id: "l12", title: "Unit Quiz", type: "quiz", durationMin: 6, xp: 25 },
      ]},
    ],
  },
  {
    id: "japanese-n5",
    title: "Japanese N5",
    subtitle: "JLPT Beginner Level",
    category: "Ngôn ngữ",
    level: "A1-A2",
    totalUnits: 8,
    totalLessons: 32,
    color: "linear-gradient(135deg,#4a1a3a,#2b0d22)",
    emoji: "🇯🇵",
    tags: ["Japanese", "JLPT"],
    units: [
      { id: "u1", title: "Hiragana & Katakana", description: "Japanese writing systems", lessons: [
        { id: "l1", title: "Hiragana あ-な", type: "vocabulary", durationMin: 15, xp: 25 },
        { id: "l2", title: "Hiragana は-ん", type: "vocabulary", durationMin: 15, xp: 25 },
        { id: "l3", title: "Katakana Basics", type: "vocabulary", durationMin: 15, xp: 25 },
        { id: "l4", title: "Writing Practice Quiz", type: "quiz", durationMin: 10, xp: 35 },
      ]},
      { id: "u2", title: "Basic Grammar", description: "Sentence structure", lessons: [
        { id: "l5", title: "は & が particles", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l6", title: "Verb conjugation", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l7", title: "Numbers & Time", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l8", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
    ],
  },
  {
    id: "korean-topik1",
    title: "Korean TOPIK I",
    subtitle: "Beginner Korean",
    category: "Ngôn ngữ",
    level: "A1-A2",
    totalUnits: 8,
    totalLessons: 32,
    color: "linear-gradient(135deg,#1a3a4a,#0d222b)",
    emoji: "🇰🇷",
    tags: ["Korean", "TOPIK"],
    units: [
      { id: "u1", title: "Hangul Basics", description: "Korean alphabet", lessons: [
        { id: "l1", title: "Vowels & Consonants", type: "vocabulary", durationMin: 15, xp: 25 },
        { id: "l2", title: "Syllable Blocks", type: "vocabulary", durationMin: 15, xp: 25 },
        { id: "l3", title: "Reading Practice", type: "reading", durationMin: 12, xp: 20 },
        { id: "l4", title: "Hangul Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
    ],
  },
];
