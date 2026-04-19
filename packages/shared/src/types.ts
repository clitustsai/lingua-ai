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
  { id: "hotel",       label: "Đặt phòng khách sạn", emoji: "🏨", persona: "hotel",       desc: "Check-in, yêu cầu dịch vụ" },
  { id: "airport",     label: "Sân bay & Du lịch",   emoji: "✈️", persona: "airport",     desc: "Hỏi đường, làm thủ tục" },
  { id: "restaurant",  label: "Nhà hàng",            emoji: "🍽️", persona: "restaurant",  desc: "Gọi món, hỏi thực đơn" },
  { id: "bank",        label: "Ngân hàng",           emoji: "🏦", persona: "bank",        desc: "Giao dịch, hỏi thông tin" },
  { id: "debate",      label: "Tranh luận",          emoji: "🗣️", persona: "debate",      desc: "Luyện lập luận, thuyết phục" },
  { id: "smalltalk",   label: "Nói chuyện phiếm",    emoji: "💬", persona: "smalltalk",   desc: "Giao tiếp hàng ngày tự nhiên" },
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
    totalUnits: 6,
    totalLessons: 24,
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
      { id: "u4", title: "Writing Task 1", description: "Graphs, charts & diagrams", lessons: [
        { id: "l13", title: "Describing Trends", type: "grammar", durationMin: 15, xp: 30 },
        { id: "l14", title: "Comparing Data", type: "vocabulary", durationMin: 12, xp: 25 },
        { id: "l15", title: "Process Diagrams", type: "reading", durationMin: 15, xp: 30 },
        { id: "l16", title: "Unit Quiz", type: "quiz", durationMin: 10, xp: 35 },
      ]},
      { id: "u5", title: "Writing Task 2", description: "Essays & arguments", lessons: [
        { id: "l17", title: "Essay Structure", type: "grammar", durationMin: 15, xp: 30 },
        { id: "l18", title: "Opinion Essays", type: "speaking", durationMin: 15, xp: 30 },
        { id: "l19", title: "Discussion Essays", type: "reading", durationMin: 15, xp: 30 },
        { id: "l20", title: "Unit Quiz", type: "quiz", durationMin: 10, xp: 40 },
      ]},
      { id: "u6", title: "Speaking Skills", description: "All 3 parts of IELTS Speaking", lessons: [
        { id: "l21", title: "Part 1: Personal Questions", type: "speaking", durationMin: 12, xp: 25 },
        { id: "l22", title: "Part 2: Long Turn", type: "speaking", durationMin: 15, xp: 30 },
        { id: "l23", title: "Part 3: Discussion", type: "speaking", durationMin: 15, xp: 30 },
        { id: "l24", title: "Mock Speaking Test", type: "quiz", durationMin: 20, xp: 50 },
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
    totalUnits: 4,
    totalLessons: 16,
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
      { id: "u3", title: "Emails & Reports", description: "Professional writing", lessons: [
        { id: "l9", title: "Formal Email Structure", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l10", title: "Report Writing", type: "reading", durationMin: 15, xp: 30 },
        { id: "l11", title: "Meeting Minutes", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l12", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
      { id: "u4", title: "Telephoning & Video Calls", description: "Remote communication", lessons: [
        { id: "l13", title: "Opening & Closing Calls", type: "speaking", durationMin: 12, xp: 25 },
        { id: "l14", title: "Taking Messages", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l15", title: "Technical Problems", type: "grammar", durationMin: 10, xp: 20 },
        { id: "l16", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
    ],
  },
  {
    id: "daily-english",
    title: "Daily English",
    subtitle: "Everyday Conversations",
    category: "Giao tiếp",
    level: "A1-B1",
    totalUnits: 6,
    totalLessons: 24,
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
      { id: "u4", title: "Health & Body", description: "Medical vocabulary & situations", lessons: [
        { id: "l13", title: "Body Parts Vocabulary", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l14", title: "At the Doctor", type: "speaking", durationMin: 12, xp: 25 },
        { id: "l15", title: "Describing Symptoms", type: "grammar", durationMin: 10, xp: 20 },
        { id: "l16", title: "Unit Quiz", type: "quiz", durationMin: 6, xp: 25 },
      ]},
      { id: "u5", title: "Work & Career", description: "Job-related English", lessons: [
        { id: "l17", title: "Job Titles & Roles", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l18", title: "Workplace Conversations", type: "speaking", durationMin: 12, xp: 25 },
        { id: "l19", title: "Writing a CV", type: "grammar", durationMin: 15, xp: 30 },
        { id: "l20", title: "Unit Quiz", type: "quiz", durationMin: 6, xp: 25 },
      ]},
      { id: "u6", title: "Technology & Internet", description: "Digital world vocabulary", lessons: [
        { id: "l21", title: "Tech Vocabulary", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l22", title: "Social Media English", type: "speaking", durationMin: 10, xp: 20 },
        { id: "l23", title: "Online Shopping", type: "grammar", durationMin: 10, xp: 20 },
        { id: "l24", title: "Unit Quiz", type: "quiz", durationMin: 6, xp: 25 },
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
  {
    id: "thpt-grade10",
    title: "Tiếng Anh Lớp 10",
    subtitle: "Chương trình THPT mới",
    category: "Chứng chỉ",
    level: "A2-B1",
    totalUnits: 5,
    totalLessons: 20,
    color: "linear-gradient(135deg,#1a3a1a,#0d220d)",
    emoji: "📗",
    tags: ["THPT", "Lớp 10"],
    units: [
      { id: "u1", title: "Unit 1: Family Life", description: "Gia đình và cuộc sống", lessons: [
        { id: "l1", title: "Vocabulary: Family & Relationships", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l2", title: "Grammar: Present Simple & Continuous", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l3", title: "Reading: Family Roles", type: "reading", durationMin: 12, xp: 20 },
        { id: "l4", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
      { id: "u2", title: "Unit 2: Your Body & You", description: "Cơ thể và sức khỏe", lessons: [
        { id: "l5", title: "Vocabulary: Health & Body", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l6", title: "Grammar: Past Simple & Past Continuous", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l7", title: "Speaking: Describing Symptoms", type: "speaking", durationMin: 12, xp: 25 },
        { id: "l8", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
      { id: "u3", title: "Unit 3: Music", description: "Âm nhạc và nghệ thuật", lessons: [
        { id: "l9", title: "Vocabulary: Music Genres", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l10", title: "Grammar: Present Perfect", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l11", title: "Listening: Music Interviews", type: "listening", durationMin: 12, xp: 20 },
        { id: "l12", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
      { id: "u4", title: "Unit 4: For a Better Community", description: "Cộng đồng tốt đẹp hơn", lessons: [
        { id: "l13", title: "Vocabulary: Community & Society", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l14", title: "Grammar: Modal Verbs", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l15", title: "Writing: Opinion Paragraphs", type: "reading", durationMin: 15, xp: 30 },
        { id: "l16", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
      { id: "u5", title: "Unit 5: Inventions", description: "Phát minh và công nghệ", lessons: [
        { id: "l17", title: "Vocabulary: Technology & Inventions", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l18", title: "Grammar: Passive Voice", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l19", title: "Reading: Famous Inventions", type: "reading", durationMin: 12, xp: 20 },
        { id: "l20", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
    ],
  },
  {
    id: "thpt-grade11",
    title: "Tiếng Anh Lớp 11",
    subtitle: "Chương trình THPT mới",
    category: "Chứng chỉ",
    level: "B1",
    totalUnits: 5,
    totalLessons: 20,
    color: "linear-gradient(135deg,#1a2a3a,#0d1a2b)",
    emoji: "📘",
    tags: ["THPT", "Lớp 11"],
    units: [
      { id: "u1", title: "Unit 1: The Generation Gap", description: "Khoảng cách thế hệ", lessons: [
        { id: "l1", title: "Vocabulary: Generations & Conflicts", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l2", title: "Grammar: Conditional Sentences Type 1 & 2", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l3", title: "Reading: Family Conflicts", type: "reading", durationMin: 12, xp: 20 },
        { id: "l4", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
      { id: "u2", title: "Unit 2: Relationships", description: "Các mối quan hệ", lessons: [
        { id: "l5", title: "Vocabulary: Friendship & Love", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l6", title: "Grammar: Reported Speech", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l7", title: "Speaking: Discussing Relationships", type: "speaking", durationMin: 12, xp: 25 },
        { id: "l8", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
      { id: "u3", title: "Unit 3: Becoming Independent", description: "Tự lập và trưởng thành", lessons: [
        { id: "l9", title: "Vocabulary: Independence & Responsibility", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l10", title: "Grammar: Gerunds & Infinitives", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l11", title: "Listening: Life Skills", type: "listening", durationMin: 12, xp: 20 },
        { id: "l12", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
      { id: "u4", title: "Unit 4: ASEAN & Vietnam", description: "ASEAN và Việt Nam", lessons: [
        { id: "l13", title: "Vocabulary: ASEAN Countries & Culture", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l14", title: "Grammar: Relative Clauses", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l15", title: "Reading: ASEAN Integration", type: "reading", durationMin: 15, xp: 30 },
        { id: "l16", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
      { id: "u5", title: "Unit 5: Being Part of ASEAN", description: "Hội nhập ASEAN", lessons: [
        { id: "l17", title: "Vocabulary: Global Issues", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l18", title: "Grammar: Conditional Type 3", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l19", title: "Writing: Argumentative Essays", type: "reading", durationMin: 15, xp: 30 },
        { id: "l20", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
    ],
  },
  {
    id: "thpt-grade12",
    title: "Tiếng Anh Lớp 12",
    subtitle: "Ôn thi THPT Quốc Gia",
    category: "Chứng chỉ",
    level: "B1-B2",
    totalUnits: 5,
    totalLessons: 20,
    color: "linear-gradient(135deg,#3a1a1a,#2b0d0d)",
    emoji: "📕",
    tags: ["THPT", "Lớp 12", "Thi THPT"],
    units: [
      { id: "u1", title: "Unit 1: Home Life", description: "Cuộc sống gia đình", lessons: [
        { id: "l1", title: "Vocabulary: Home & Chores", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l2", title: "Grammar: Tense Review", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l3", title: "Reading: Modern Family", type: "reading", durationMin: 12, xp: 20 },
        { id: "l4", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
      { id: "u2", title: "Unit 2: Cultural Diversity", description: "Đa dạng văn hóa", lessons: [
        { id: "l5", title: "Vocabulary: Culture & Traditions", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l6", title: "Grammar: Passive Voice Advanced", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l7", title: "Speaking: Cultural Differences", type: "speaking", durationMin: 12, xp: 25 },
        { id: "l8", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
      { id: "u3", title: "Unit 3: Ways of Socialising", description: "Giao tiếp xã hội", lessons: [
        { id: "l9", title: "Vocabulary: Social Interactions", type: "vocabulary", durationMin: 10, xp: 20 },
        { id: "l10", title: "Grammar: Reported Speech Advanced", type: "grammar", durationMin: 12, xp: 25 },
        { id: "l11", title: "Listening: Social Situations", type: "listening", durationMin: 12, xp: 20 },
        { id: "l12", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 30 },
      ]},
      { id: "u4", title: "Ôn thi THPT: Grammar", description: "Ngữ pháp trọng tâm thi THPT", lessons: [
        { id: "l13", title: "Tenses & Aspects", type: "grammar", durationMin: 15, xp: 30 },
        { id: "l14", title: "Conditionals All Types", type: "grammar", durationMin: 15, xp: 30 },
        { id: "l15", title: "Relative Clauses & Passive", type: "grammar", durationMin: 15, xp: 30 },
        { id: "l16", title: "Mock Grammar Test", type: "quiz", durationMin: 20, xp: 50 },
      ]},
      { id: "u5", title: "Ôn thi THPT: Reading", description: "Đọc hiểu thi THPT", lessons: [
        { id: "l17", title: "Reading Strategy: Skimming", type: "reading", durationMin: 15, xp: 25 },
        { id: "l18", title: "Reading Strategy: Scanning", type: "reading", durationMin: 15, xp: 25 },
        { id: "l19", title: "Vocabulary in Context", type: "vocabulary", durationMin: 12, xp: 20 },
        { id: "l20", title: "Mock Reading Test", type: "quiz", durationMin: 20, xp: 50 },
      ]},
    ],
  },
  // ── Tiểu học (Lớp 1–5) ────────────────────────────────────────────────────
  {
    id: "tieuhoc-grade1",
    title: "Tiếng Anh Lớp 1",
    subtitle: "Chương trình Tiểu học mới",
    category: "Chứng chỉ",
    level: "Starter",
    totalUnits: 4,
    totalLessons: 16,
    color: "linear-gradient(135deg,#2a1a4a,#1a0d33)",
    emoji: "🌈",
    tags: ["Tiểu học", "Lớp 1"],
    units: [
      { id: "u1", title: "Unit 1: Hello!", description: "Chào hỏi cơ bản", lessons: [
        { id: "l1", title: "Hello & Goodbye", type: "vocabulary", durationMin: 8, xp: 10 },
        { id: "l2", title: "My name is...", type: "speaking", durationMin: 8, xp: 10 },
        { id: "l3", title: "Numbers 1–10", type: "vocabulary", durationMin: 8, xp: 10 },
        { id: "l4", title: "Unit Quiz", type: "quiz", durationMin: 5, xp: 15 },
      ]},
      { id: "u2", title: "Unit 2: My Family", description: "Gia đình tôi", lessons: [
        { id: "l5", title: "Family Members", type: "vocabulary", durationMin: 8, xp: 10 },
        { id: "l6", title: "This is my mum/dad", type: "speaking", durationMin: 8, xp: 10 },
        { id: "l7", title: "Colours", type: "vocabulary", durationMin: 8, xp: 10 },
        { id: "l8", title: "Unit Quiz", type: "quiz", durationMin: 5, xp: 15 },
      ]},
      { id: "u3", title: "Unit 3: My Body", description: "Cơ thể tôi", lessons: [
        { id: "l9", title: "Body Parts", type: "vocabulary", durationMin: 8, xp: 10 },
        { id: "l10", title: "Head, Shoulders, Knees & Toes", type: "listening", durationMin: 8, xp: 10 },
        { id: "l11", title: "Shapes", type: "vocabulary", durationMin: 8, xp: 10 },
        { id: "l12", title: "Unit Quiz", type: "quiz", durationMin: 5, xp: 15 },
      ]},
      { id: "u4", title: "Unit 4: My School", description: "Trường học của tôi", lessons: [
        { id: "l13", title: "School Objects", type: "vocabulary", durationMin: 8, xp: 10 },
        { id: "l14", title: "Classroom Commands", type: "listening", durationMin: 8, xp: 10 },
        { id: "l15", title: "Animals", type: "vocabulary", durationMin: 8, xp: 10 },
        { id: "l16", title: "Unit Quiz", type: "quiz", durationMin: 5, xp: 15 },
      ]},
    ],
  },
  {
    id: "tieuhoc-grade3",
    title: "Tiếng Anh Lớp 3",
    subtitle: "Chương trình Tiểu học mới",
    category: "Chứng chỉ",
    level: "A1",
    totalUnits: 5,
    totalLessons: 20,
    color: "linear-gradient(135deg,#1a3a2a,#0d2218)",
    emoji: "🌿",
    tags: ["Tiểu học", "Lớp 3"],
    units: [
      { id: "u1", title: "Unit 1: Hello, I'm Tony", description: "Giới thiệu bản thân", lessons: [
        { id: "l1", title: "Greetings & Introductions", type: "vocabulary", durationMin: 8, xp: 12 },
        { id: "l2", title: "How are you?", type: "speaking", durationMin: 8, xp: 12 },
        { id: "l3", title: "Numbers 1–20", type: "vocabulary", durationMin: 8, xp: 12 },
        { id: "l4", title: "Unit Quiz", type: "quiz", durationMin: 6, xp: 18 },
      ]},
      { id: "u2", title: "Unit 2: What's your name?", description: "Hỏi tên và tuổi", lessons: [
        { id: "l5", title: "Asking Names & Ages", type: "speaking", durationMin: 8, xp: 12 },
        { id: "l6", title: "Alphabet A–Z", type: "vocabulary", durationMin: 10, xp: 15 },
        { id: "l7", title: "Spelling Names", type: "listening", durationMin: 8, xp: 12 },
        { id: "l8", title: "Unit Quiz", type: "quiz", durationMin: 6, xp: 18 },
      ]},
      { id: "u3", title: "Unit 3: This is Tony", description: "Giới thiệu người khác", lessons: [
        { id: "l9", title: "He/She is...", type: "grammar", durationMin: 8, xp: 12 },
        { id: "l10", title: "Jobs & Occupations", type: "vocabulary", durationMin: 8, xp: 12 },
        { id: "l11", title: "Dialogue Practice", type: "speaking", durationMin: 8, xp: 12 },
        { id: "l12", title: "Unit Quiz", type: "quiz", durationMin: 6, xp: 18 },
      ]},
      { id: "u4", title: "Unit 4: My Friends", description: "Bạn bè của tôi", lessons: [
        { id: "l13", title: "Describing People", type: "vocabulary", durationMin: 8, xp: 12 },
        { id: "l14", title: "Adjectives: tall/short/fat/thin", type: "grammar", durationMin: 8, xp: 12 },
        { id: "l15", title: "My Best Friend", type: "speaking", durationMin: 8, xp: 12 },
        { id: "l16", title: "Unit Quiz", type: "quiz", durationMin: 6, xp: 18 },
      ]},
      { id: "u5", title: "Unit 5: Are you a pupil?", description: "Nghề nghiệp và trường học", lessons: [
        { id: "l17", title: "School Subjects", type: "vocabulary", durationMin: 8, xp: 12 },
        { id: "l18", title: "Yes/No Questions", type: "grammar", durationMin: 8, xp: 12 },
        { id: "l19", title: "My School Day", type: "reading", durationMin: 10, xp: 15 },
        { id: "l20", title: "Unit Quiz", type: "quiz", durationMin: 6, xp: 18 },
      ]},
    ],
  },
  {
    id: "tieuhoc-grade5",
    title: "Tiếng Anh Lớp 5",
    subtitle: "Chương trình Tiểu học mới",
    category: "Chứng chỉ",
    level: "A1",
    totalUnits: 5,
    totalLessons: 20,
    color: "linear-gradient(135deg,#2a2a1a,#1a1a0d)",
    emoji: "⭐",
    tags: ["Tiểu học", "Lớp 5"],
    units: [
      { id: "u1", title: "Unit 1: What's your address?", description: "Địa chỉ và nơi ở", lessons: [
        { id: "l1", title: "Addresses & Locations", type: "vocabulary", durationMin: 10, xp: 15 },
        { id: "l2", title: "Where do you live?", type: "speaking", durationMin: 10, xp: 15 },
        { id: "l3", title: "Prepositions of Place", type: "grammar", durationMin: 10, xp: 15 },
        { id: "l4", title: "Unit Quiz", type: "quiz", durationMin: 6, xp: 20 },
      ]},
      { id: "u2", title: "Unit 2: I always get up early", description: "Thói quen hàng ngày", lessons: [
        { id: "l5", title: "Daily Routines", type: "vocabulary", durationMin: 10, xp: 15 },
        { id: "l6", title: "Adverbs of Frequency", type: "grammar", durationMin: 10, xp: 15 },
        { id: "l7", title: "What time do you...?", type: "speaking", durationMin: 10, xp: 15 },
        { id: "l8", title: "Unit Quiz", type: "quiz", durationMin: 6, xp: 20 },
      ]},
      { id: "u3", title: "Unit 3: My favourite food", description: "Thức ăn yêu thích", lessons: [
        { id: "l9", title: "Food & Drinks Vocabulary", type: "vocabulary", durationMin: 10, xp: 15 },
        { id: "l10", title: "Do you like...?", type: "grammar", durationMin: 10, xp: 15 },
        { id: "l11", title: "Ordering Food", type: "speaking", durationMin: 10, xp: 15 },
        { id: "l12", title: "Unit Quiz", type: "quiz", durationMin: 6, xp: 20 },
      ]},
      { id: "u4", title: "Unit 4: Did you go on holiday?", description: "Kỳ nghỉ và du lịch", lessons: [
        { id: "l13", title: "Holiday Vocabulary", type: "vocabulary", durationMin: 10, xp: 15 },
        { id: "l14", title: "Past Simple: Regular Verbs", type: "grammar", durationMin: 10, xp: 15 },
        { id: "l15", title: "Talking About the Past", type: "speaking", durationMin: 10, xp: 15 },
        { id: "l16", title: "Unit Quiz", type: "quiz", durationMin: 6, xp: 20 },
      ]},
      { id: "u5", title: "Unit 5: What will the weather be like?", description: "Thời tiết và dự báo", lessons: [
        { id: "l17", title: "Weather Vocabulary", type: "vocabulary", durationMin: 10, xp: 15 },
        { id: "l18", title: "Will + Future", type: "grammar", durationMin: 10, xp: 15 },
        { id: "l19", title: "Weather Forecast Reading", type: "reading", durationMin: 10, xp: 15 },
        { id: "l20", title: "Unit Quiz", type: "quiz", durationMin: 6, xp: 20 },
      ]},
    ],
  },
  // ── THCS (Lớp 6–9) ────────────────────────────────────────────────────────
  {
    id: "thcs-grade6",
    title: "Tiếng Anh Lớp 6",
    subtitle: "Chương trình THCS mới",
    category: "Chứng chỉ",
    level: "A1",
    totalUnits: 5,
    totalLessons: 20,
    color: "linear-gradient(135deg,#1a2a3a,#0d1a26)",
    emoji: "📒",
    tags: ["THCS", "Lớp 6"],
    units: [
      { id: "u1", title: "Unit 1: My New School", description: "Trường học mới", lessons: [
        { id: "l1", title: "School Vocabulary", type: "vocabulary", durationMin: 10, xp: 15 },
        { id: "l2", title: "To be: am/is/are", type: "grammar", durationMin: 10, xp: 18 },
        { id: "l3", title: "Reading: My School", type: "reading", durationMin: 10, xp: 15 },
        { id: "l4", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 22 },
      ]},
      { id: "u2", title: "Unit 2: My Home", description: "Ngôi nhà của tôi", lessons: [
        { id: "l5", title: "Rooms & Furniture", type: "vocabulary", durationMin: 10, xp: 15 },
        { id: "l6", title: "There is / There are", type: "grammar", durationMin: 10, xp: 18 },
        { id: "l7", title: "Describing Your Home", type: "speaking", durationMin: 10, xp: 15 },
        { id: "l8", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 22 },
      ]},
      { id: "u3", title: "Unit 3: My Friends", description: "Bạn bè của tôi", lessons: [
        { id: "l9", title: "Personality Adjectives", type: "vocabulary", durationMin: 10, xp: 15 },
        { id: "l10", title: "Present Simple", type: "grammar", durationMin: 10, xp: 18 },
        { id: "l11", title: "Talking About Friends", type: "speaking", durationMin: 10, xp: 15 },
        { id: "l12", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 22 },
      ]},
      { id: "u4", title: "Unit 4: My Neighbourhood", description: "Khu phố của tôi", lessons: [
        { id: "l13", title: "Places in Town", type: "vocabulary", durationMin: 10, xp: 15 },
        { id: "l14", title: "Giving Directions", type: "speaking", durationMin: 10, xp: 18 },
        { id: "l15", title: "Reading: My Street", type: "reading", durationMin: 10, xp: 15 },
        { id: "l16", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 22 },
      ]},
      { id: "u5", title: "Unit 5: Natural Wonders", description: "Kỳ quan thiên nhiên", lessons: [
        { id: "l17", title: "Nature Vocabulary", type: "vocabulary", durationMin: 10, xp: 15 },
        { id: "l18", title: "Comparatives & Superlatives", type: "grammar", durationMin: 10, xp: 18 },
        { id: "l19", title: "Reading: Vietnam's Wonders", type: "reading", durationMin: 10, xp: 15 },
        { id: "l20", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 22 },
      ]},
    ],
  },
  {
    id: "thcs-grade7",
    title: "Tiếng Anh Lớp 7",
    subtitle: "Chương trình THCS mới",
    category: "Chứng chỉ",
    level: "A1-A2",
    totalUnits: 5,
    totalLessons: 20,
    color: "linear-gradient(135deg,#2a1a3a,#1a0d26)",
    emoji: "📓",
    tags: ["THCS", "Lớp 7"],
    units: [
      { id: "u1", title: "Unit 1: My Hobbies", description: "Sở thích của tôi", lessons: [
        { id: "l1", title: "Hobbies Vocabulary", type: "vocabulary", durationMin: 10, xp: 15 },
        { id: "l2", title: "Present Continuous", type: "grammar", durationMin: 10, xp: 18 },
        { id: "l3", title: "Talking About Hobbies", type: "speaking", durationMin: 10, xp: 15 },
        { id: "l4", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 22 },
      ]},
      { id: "u2", title: "Unit 2: Health", description: "Sức khỏe", lessons: [
        { id: "l5", title: "Health & Illness Vocabulary", type: "vocabulary", durationMin: 10, xp: 15 },
        { id: "l6", title: "Should / Shouldn't", type: "grammar", durationMin: 10, xp: 18 },
        { id: "l7", title: "At the Doctor", type: "speaking", durationMin: 10, xp: 15 },
        { id: "l8", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 22 },
      ]},
      { id: "u3", title: "Unit 3: Community Service", description: "Hoạt động cộng đồng", lessons: [
        { id: "l9", title: "Volunteer Vocabulary", type: "vocabulary", durationMin: 10, xp: 15 },
        { id: "l10", title: "Past Simple: Irregular Verbs", type: "grammar", durationMin: 10, xp: 18 },
        { id: "l11", title: "Reading: Helping Others", type: "reading", durationMin: 10, xp: 15 },
        { id: "l12", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 22 },
      ]},
      { id: "u4", title: "Unit 4: Music & Arts", description: "Âm nhạc và nghệ thuật", lessons: [
        { id: "l13", title: "Music Genres", type: "vocabulary", durationMin: 10, xp: 15 },
        { id: "l14", title: "Like + V-ing", type: "grammar", durationMin: 10, xp: 18 },
        { id: "l15", title: "Talking About Music", type: "speaking", durationMin: 10, xp: 15 },
        { id: "l16", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 22 },
      ]},
      { id: "u5", title: "Unit 5: Vietnamese Festivals", description: "Lễ hội Việt Nam", lessons: [
        { id: "l17", title: "Festival Vocabulary", type: "vocabulary", durationMin: 10, xp: 15 },
        { id: "l18", title: "Present Perfect: Introduction", type: "grammar", durationMin: 10, xp: 18 },
        { id: "l19", title: "Reading: Tết Festival", type: "reading", durationMin: 10, xp: 15 },
        { id: "l20", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 22 },
      ]},
    ],
  },
  {
    id: "thcs-grade8",
    title: "Tiếng Anh Lớp 8",
    subtitle: "Chương trình THCS mới",
    category: "Chứng chỉ",
    level: "A2",
    totalUnits: 5,
    totalLessons: 20,
    color: "linear-gradient(135deg,#1a3a2a,#0d261a)",
    emoji: "📔",
    tags: ["THCS", "Lớp 8"],
    units: [
      { id: "u1", title: "Unit 1: Leisure Activities", description: "Hoạt động giải trí", lessons: [
        { id: "l1", title: "Leisure Vocabulary", type: "vocabulary", durationMin: 10, xp: 18 },
        { id: "l2", title: "Present Perfect vs Past Simple", type: "grammar", durationMin: 12, xp: 22 },
        { id: "l3", title: "Talking About Experiences", type: "speaking", durationMin: 10, xp: 18 },
        { id: "l4", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 25 },
      ]},
      { id: "u2", title: "Unit 2: Life in the Countryside", description: "Cuộc sống nông thôn", lessons: [
        { id: "l5", title: "Rural vs Urban Vocabulary", type: "vocabulary", durationMin: 10, xp: 18 },
        { id: "l6", title: "Comparatives: as...as", type: "grammar", durationMin: 10, xp: 22 },
        { id: "l7", title: "Reading: Village Life", type: "reading", durationMin: 12, xp: 18 },
        { id: "l8", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 25 },
      ]},
      { id: "u3", title: "Unit 3: Peoples of Viet Nam", description: "Các dân tộc Việt Nam", lessons: [
        { id: "l9", title: "Ethnic Groups Vocabulary", type: "vocabulary", durationMin: 10, xp: 18 },
        { id: "l10", title: "Relative Clauses: who/which/that", type: "grammar", durationMin: 12, xp: 22 },
        { id: "l11", title: "Reading: Ethnic Minorities", type: "reading", durationMin: 12, xp: 18 },
        { id: "l12", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 25 },
      ]},
      { id: "u4", title: "Unit 4: Our Customs & Traditions", description: "Phong tục tập quán", lessons: [
        { id: "l13", title: "Customs Vocabulary", type: "vocabulary", durationMin: 10, xp: 18 },
        { id: "l14", title: "Modal Verbs: must/have to", type: "grammar", durationMin: 10, xp: 22 },
        { id: "l15", title: "Vietnamese Traditions", type: "reading", durationMin: 12, xp: 18 },
        { id: "l16", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 25 },
      ]},
      { id: "u5", title: "Unit 5: Natural Disasters", description: "Thiên tai", lessons: [
        { id: "l17", title: "Disaster Vocabulary", type: "vocabulary", durationMin: 10, xp: 18 },
        { id: "l18", title: "Passive Voice: Present & Past", type: "grammar", durationMin: 12, xp: 22 },
        { id: "l19", title: "Reading: Flood in Vietnam", type: "reading", durationMin: 12, xp: 18 },
        { id: "l20", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 25 },
      ]},
    ],
  },
  {
    id: "thcs-grade9",
    title: "Tiếng Anh Lớp 9",
    subtitle: "Ôn thi vào lớp 10",
    category: "Chứng chỉ",
    level: "A2-B1",
    totalUnits: 5,
    totalLessons: 20,
    color: "linear-gradient(135deg,#3a2a1a,#261a0d)",
    emoji: "📙",
    tags: ["THCS", "Lớp 9", "Thi lớp 10"],
    units: [
      { id: "u1", title: "Unit 1: Local Environment", description: "Môi trường địa phương", lessons: [
        { id: "l1", title: "Environment Vocabulary", type: "vocabulary", durationMin: 10, xp: 18 },
        { id: "l2", title: "Conditional Type 1", type: "grammar", durationMin: 12, xp: 22 },
        { id: "l3", title: "Reading: Pollution in Vietnam", type: "reading", durationMin: 12, xp: 18 },
        { id: "l4", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 25 },
      ]},
      { id: "u2", title: "Unit 2: City Life", description: "Cuộc sống thành phố", lessons: [
        { id: "l5", title: "Urban Life Vocabulary", type: "vocabulary", durationMin: 10, xp: 18 },
        { id: "l6", title: "Reported Speech: Statements", type: "grammar", durationMin: 12, xp: 22 },
        { id: "l7", title: "Comparing Cities", type: "speaking", durationMin: 10, xp: 18 },
        { id: "l8", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 25 },
      ]},
      { id: "u3", title: "Unit 3: English in the World", description: "Tiếng Anh trên thế giới", lessons: [
        { id: "l9", title: "World Englishes", type: "vocabulary", durationMin: 10, xp: 18 },
        { id: "l10", title: "Conditional Type 2", type: "grammar", durationMin: 12, xp: 22 },
        { id: "l11", title: "Reading: English as Global Language", type: "reading", durationMin: 12, xp: 18 },
        { id: "l12", title: "Unit Quiz", type: "quiz", durationMin: 8, xp: 25 },
      ]},
      { id: "u4", title: "Ôn thi vào 10: Grammar", description: "Ngữ pháp trọng tâm thi vào 10", lessons: [
        { id: "l13", title: "Tenses Review", type: "grammar", durationMin: 15, xp: 28 },
        { id: "l14", title: "Passive Voice Review", type: "grammar", durationMin: 15, xp: 28 },
        { id: "l15", title: "Reported Speech Review", type: "grammar", durationMin: 15, xp: 28 },
        { id: "l16", title: "Mock Grammar Test", type: "quiz", durationMin: 20, xp: 45 },
      ]},
      { id: "u5", title: "Ôn thi vào 10: Reading & Writing", description: "Đọc hiểu và viết", lessons: [
        { id: "l17", title: "Reading Comprehension Skills", type: "reading", durationMin: 15, xp: 25 },
        { id: "l18", title: "Vocabulary in Context", type: "vocabulary", durationMin: 12, xp: 20 },
        { id: "l19", title: "Writing: Paragraph Structure", type: "reading", durationMin: 15, xp: 25 },
        { id: "l20", title: "Mock Reading Test", type: "quiz", durationMin: 20, xp: 45 },
      ]},
    ],
  },
];
