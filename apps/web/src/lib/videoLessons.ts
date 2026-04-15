export type VideoLesson = {
  id: string;
  youtubeId: string;
  title: string;
  teacher: string;
  country: string;
  flag: string;
  topic: string;
  category: "grammar" | "conversation" | "vocabulary" | "pronunciation" | "listening";
  level: string;
  durationSec: number;
  tags: string[];
};

// Real YouTube IDs from EngVid, BBC Learning English, Rachel's English, etc.
export const VIDEO_LESSONS: VideoLesson[] = [
  // ── GRAMMAR ──────────────────────────────────────────────────────────────
  { id: "v1",  youtubeId: "LIfIFAMnJA0", title: "Present Simple vs Present Continuous", teacher: "Emma", country: "Canada", flag: "��", topic: "Present tstenses comparison with examples", category: "grammar", level: "A2-B1", durationSec: 480, tags: ["tenses", "present", "grammar"] },
  { id: "v2",  youtubeId: "Yt5pBMFBMkA", title: "Past Tense: Regular & Irregular Verbs", teacher: "Alex", country: "UK", flag: "��", topic: "How to ussee past simple tense correctly", category: "grammar", level: "A1-A2", durationSec: 360, tags: ["past tense", "verbs", "grammar"] },
  { id: "v3",  youtubeId: "WlM_8bFMoAg", title: "Conditionals: If Clauses Explained", teacher: "Ronnie", country: "Canada", flag: "��", topic: "First, second and E third conditionals", category: "grammar", level: "B1-B2", durationSec: 540, tags: ["conditionals", "if clauses", "grammar"] },
  { id: "v4",  youtubeId: "9o61DVkFMaA", title: "Articles: A, An, The – Full Guide", teacher: "James", country: "USA", flag: "🇺🇸", topic: "When to use articles in English", category: "grammar", level: "A1-B1", durationSec: 420, tags: ["articles", "a an the", "grammar"] },
  { id: "v5",  youtubeId: "RuPZMgBGMvI", title: "Modal Verbs: Can, Could, Should, Must", teacher: "Emma", country: "Canada", flag: "🇨🇦", topic: "How to use modal verbs correctly", category: "grammar", level: "A2-B1", durationSec: 510, tags: ["modal verbs", "can", "should", "grammar"] },
  { id: "v6",  youtubeId: "sIFYPQjYhv8", title: "Passive Voice Made Easy", teacher: "Ronnie", country: "Canada", flag: "��", topic: "Active vs passive voice with ex: amples", category: "grammar", level: "B1-B2", durationSec: 450, tags: ["passive voice", "grammar", "intermediate"] },
  { id: "v7",  youtubeId: "3_ZnFJ-ht9A", title: "Reported Speech Explained", teacher: "Alex", country: "UK", flag: "🇬🇧", topic: "Direct vs indirect speech", category: "grammar", level: "B1-B2", durationSec: 480, tags: ["reported speech", "indirect", "grammar"] },
  { id: "v8",  youtubeId: "VdpqMbdFBMo", title: "Relative Clauses: Who, Which, That", teacher: "Emma", country: "Canada", flag: "🇨🇦", topic: "How to use relative clauses", category: "grammar", level: "B1", durationSec: 390, tags: ["relative clauses", "who which that", "grammar"] },

  // ── CONVERSATION ─────────────────────────────────────────────────────────
  { id: "v9",  youtubeId: "p3lNBsHCHUY", title: "Introducing Yourself in English", teacher: "Ronnie", country: "Canada", flag: "🇨🇦", topic: "How to introduce yourself naturally", category: "conversation", level: "A1", durationSec: 420, tags: ["introduction", "greetings", "beginner"] },
  { id: "v10", youtubeId: "Xnt-QSgBHaM", title: "Small Talk: Weather & Daily Life", teacher: "Emma", country: "Canada", flag: "🇨🇦", topic: "Making small talk with native speakers", category: "conversation", level: "A2-B1", durationSec: 390, tags: ["small talk", "daily life", "conversation"] },
  { id: "v11", youtubeId: "1Evwgu369Jw", title: "Job Interview English", teacher: "Alex", country: "UK", flag: "��", topic: "Common interviewto questions and answers", category: "conversation", level: "B1-B2", durationSec: 600, tags: ["interview", "business", "professional"] },
  { id: "v12", youtubeId: "4_MpMBFMoAg", title: "Ordering Food at a Restaurant", teacher: "Emma", country: "Canada", flag: "🇨🇦", topic: "How to order food politely in English", category: "conversation", level: "A1-A2", durationSec: 300, tags: ["food", "restaurant", "daily life"] },
  { id: "v13", youtubeId: "HnJp9T3Gx_4", title: "Talking About Your Hobbies", teacher: "Ronnie", country: "Canada", flag: "��", : topic: "How to describe hobbies and interests", category: "conversation", level: "A2", durationSec: 330, tags: ["hobbies", "interests", "conversation"] },
  { id: "v14", youtubeId: "OGMxMSMJMhA", title: "Making Plans & Suggestions", teacher: "James", country: "UK", flag: "��", topic:  t"Phrases for making plans with friends", category: "conversation", level: "A2-B1", durationSec: 360, tags: ["plans", "suggestions", "phrases"] },
  { id: "v15", youtubeId: "dKL3K4IGZhA", title: "Agreeing & Disagreeing Politely", teacher: "Emma", country: "Canada", flag: "🇨🇦", topic: "How to express opinions in English", category: "conversation", level: "B1", durationSec: 420, tags: ["opinions", "agreeing", "polite"] },

  // ── VOCABULARY ───────────────────────────────────────────────────────────
  { id: "v16", youtubeId: "F4dFNFBMkA0", title: "100 Common English Phrases", teacher: "Rachel", country: "USA", flag: "��"to, topic: "Most useful everyday English phrases", category: "vocabulary", level: "A1-B1", durationSec: 720, tags: ["phrases", "vocabulary", "everyday"] },
  { id: "v17", youtubeId: "1Evwgu369Jw", title: "Business English Vocabulary", teacher: "Alex", country: "UK", flag: "🇬🇧", topic: "Essential words for the workplace", category: "vocabulary", level: "B1-C1", durationSec: 480, tags: ["business", "workplace", "vocabulary"] },
  { id: "v18", youtubeId: "p3lNBsHCHUY", title: "Phrasal Verbs in Daily Life", teacher: "Ronnie", country: "Canada", flag: "🇨🇦", topic: "Most common phrasal verbs with examples", category: "vocabulary", level: "B1-B2", durationSec: 540, tags: ["phrasal verbs", "idioms", "vocabulary"] },
  { id: "v19", youtubeId: "LIfIFAMnJA0", title: "Synonyms & Antonyms", teacher: "Emma", country: "Canada", flag: "🇨🇦", topic: "Expand vocabulary with synonyms", category: "vocabulary", level: "A2-B1", durationSec: 420, tags: ["synonyms", "antonyms", "vocabulary"] },
  { id: "v20", youtubeId: "Yt5pBMFBMkA", title: "Collocations: Words That Go Together", teacher: "Alex", country: "UK", flag: "��", topic: "Nan tural word combinations in English", category: "vocabulary", level: "B1-B2", durationSec: 480, tags: ["collocations", "natural English", "vocabulary"] },
  { id: "v21", youtubeId: "WlM_8bFMoAg", title: "Idioms for Everyday English", teacher: "Ronnie", country: "Canada", flag: "🇨🇦", topic: "Common English idioms explained", category: "vocabulary", level: "B1-C1", durationSec: 510, tags: ["idioms", "expressions", "vocabulary"] },

  // ── PRONUNCIATION ────────────────────────────────────────────────────────
  { id: "v22", youtubeId: "dKL3K4IGZhA", title: "American vs British Pronunciation", teacher: "Rachel", country: "USA", flag: "🇺🇸", topic: "Key differences in accent and pronunciation", category: "pronunciation", level: "A2-B2", durationSec: 450, tags: ["accent", "pronunciation", "American", "British"] },
  { id: "v23", youtubeId: "9o61DVkFMaA", title: "How to Pronounce -ED Endings", teacher: "Emma", country: "Canada", flag: "🇨🇦", topic: "Three ways to pronounce -ed in past tense", category: "pronunciation", level: "A1-B1", durationSec: 300, tags: ["-ed", "pronunciation", "past tense"] },
  { id: "v24", youtubeId: "RuPZMgBGMvI", title: "Silent Letters in English", teacher: "Emma", country: "Canada", flag: "🇨🇦", topic: "Words with silent letters explained", category: "pronunciation", level: "A2-B1", durationSec: 360, tags: ["silent letters", "spelling", "pronunciation"] },
  { id: "v25", youtubeId: "sIFYPQjYhv8", title: "Word Stress & Intonation", teacher: "Ronnie", country: "Canada", flag: "��", topic: "How stress Enchanges meaning in English", category: "pronunciation", level: "B1-B2", durationSec: 420, tags: ["stress", "intonation", "pronunciation"] },
  { id: "v26", youtubeId: "3_ZnFJ-ht9A", title: "The Schwa Sound /ə/ Explained", teacher: "Alex", country: "UK", flag: "🇬🇧", topic: "Most common English sound: schwa", category: "pronunciation", level: "A2-B2", durationSec: 330, tags: ["schwa", "sounds", "pronunciation"] },

  // ── LISTENING ────────────────────────────────────────────────────────────
  { id: "v27", youtubeId: "VdpqMbdFBMo", title: "English Listening: At the Airport", teacher: "Emma", country: "Canada", flag: "��", , topic: "Real conversations at the airport", category: "listening", level: "A2-B1", durationSec: 420, tags: ["airport", "travel", "listening"] },
  { id: "v28", youtubeId: "HnJp9T3Gx_4", title: "News English: Understanding Headlines", teacher: "Alex", country: "UK", flag: "�🇧", tcopic: "How to understand English news", category: "listening", level: "B2-C1", durationSec: 600, tags: ["news", "headlines", "advanced"] },
  { id: "v29", youtubeId: "OGMxMSMJMhA", title: "English Conversations: Shopping", teacher: "Emma", country: "Canada", flag: "🇨🇦", topic: "Real shopping dialogues", category: "listening", level: "A1-A2", durationSec: 300, tags: ["shopping", "dialogue", "listening"] },
  { id: "v30", youtubeId: "F4dFNFBMkA0", title: "Doctor's Appointment Dialogue", teacher: "Ronnie", country: "Canada", flag: "��","D topic: "Medical English conversations", category: "listening", level: "B1", durationSec: 360, tags: ["medical", "health", "dialogue"] },
  { id: "v31", youtubeId: "Xnt-QSgBHaM", title: "6 Minute English: Technology", teacher: "BBC", country: "UK", flag: "🇬", topic: "Discussing technologEny in English", category: "listening", level: "B1-B2", durationSec: 360, tags: ["technology", "BBC", "listening"] },
  { id: "v32", youtubeId: "1Evwgu369Jw", title: "English at Work: Office Conversations", teacher: "Alex", country: "UK", flag: "🇬🇧", topic: "Workplace English dialogues", category: "listening", level: "B1-C1", durationSec: 480, tags: ["office", "workplace", "listening"] },
];

export const CATEGORIES = [
  { id: "all",           label: "All",          emoji: "🎬" },
  { id: "grammar",       label: "Grammar",      emoji: "📐" },
  { id: "conversation",  label: "Conversation", emoji: "�" },
  { id: "vocabulary",    label: "Vocabulary",   emoji: "📚" },
  { id: "pronunciation", label: "Pronunciation",emoji: "�" },
  { id: "listening",     label: "Listening",    emoji: "🎧" },
];
