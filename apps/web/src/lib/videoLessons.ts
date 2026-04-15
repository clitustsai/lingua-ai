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
  thumbnail?: string;
  tags: string[];
};

export const VIDEO_LESSONS: VideoLesson[] = [
  // Grammar
  {
    id: "v1", youtubeId: "LIfIFAMnJA0",
    title: "Present Simple vs Present Continuous",
    teacher: "Emma", country: "Canada", flag: "🇨🇦",
    topic: "Present tenses comparison with examples",
    category: "grammar", level: "A2-B1", durationSec: 480,
    tags: ["tenses", "present", "grammar"],
  },
  {
    id: "v2", youtubeId: "Yt5pBMFBMkA",
    title: "Past Tense: Regular & Irregular Verbs",
    teacher: "Alex", country: "UK", flag: "🇬🇧",
    topic: "How to use past simple tense correctly",
    category: "grammar", level: "A1-A2", durationSec: 360,
    tags: ["past tense", "verbs", "grammar"],
  },
  {
    id: "v3", youtubeId: "WlM_8bFMoAg",
    title: "Conditionals: If Clauses Explained",
    teacher: "Ronnie", country: "Canada", flag: "🇨🇦",
    topic: "First, second and third conditionals",
    category: "grammar", level: "B1-B2", durationSec: 540,
    tags: ["conditionals", "if clauses", "grammar"],
  },
  {
    id: "v4", youtubeId: "Yt5pBMFBMkA",
    title: "Articles: A, An, The",
    teacher: "James", country: "USA", flag: "🇺🇸",
    topic: "When to use articles in English",
    category: "grammar", level: "A1-B1", durationSec: 420,
    tags: ["articles", "a an the", "grammar"],
  },
  // Conversation
  {
    id: "v5", youtubeId: "VdpqMbdFBMo",
    title: "Introducing Yourself in English",
    teacher: "Syuzan", country: "Armenia", flag: "🇦🇲",
    topic: "How to introduce yourself naturally",
    category: "conversation", level: "A1", durationSec: 69,
    tags: ["introduction", "greetings", "beginner"],
  },
  {
    id: "v6", youtubeId: "Yt5pBMFBMkA",
    title: "Small Talk: Weather & Daily Life",
    teacher: "Lucy", country: "Australia", flag: "🇦🇺",
    topic: "Making small talk with native speakers",
    category: "conversation", level: "A2-B1", durationSec: 390,
    tags: ["small talk", "daily life", "conversation"],
  },
  {
    id: "v7", youtubeId: "LIfIFAMnJA0",
    title: "Job Interview English",
    teacher: "Mike", country: "USA", flag: "🇺🇸",
    topic: "Common interview questions and answers",
    category: "conversation", level: "B1-B2", durationSec: 600,
    tags: ["interview", "business", "professional"],
  },
  {
    id: "v8", youtubeId: "WlM_8bFMoAg",
    title: "Ordering Food at a Restaurant",
    teacher: "Sophie", country: "UK", flag: "🇬🇧",
    topic: "How to order food politely in English",
    category: "conversation", level: "A1-A2", durationSec: 300,
    tags: ["food", "restaurant", "daily life"],
  },
  // Vocabulary
  {
    id: "v9", youtubeId: "Yt5pBMFBMkA",
    title: "100 Common English Phrases",
    teacher: "Rachel", country: "USA", flag: "🇺🇸",
    topic: "Most useful everyday English phrases",
    category: "vocabulary", level: "A1-B1", durationSec: 720,
    tags: ["phrases", "vocabulary", "everyday"],
  },
  {
    id: "v10", youtubeId: "LIfIFAMnJA0",
    title: "Business English Vocabulary",
    teacher: "David", country: "UK", flag: "🇬🇧",
    topic: "Essential words for the workplace",
    category: "vocabulary", level: "B1-C1", durationSec: 480,
    tags: ["business", "workplace", "vocabulary"],
  },
  {
    id: "v11", youtubeId: "VdpqMbdFBMo",
    title: "Phrasal Verbs in Daily Life",
    teacher: "Anna", country: "Canada", flag: "🇨🇦",
    topic: "Most common phrasal verbs with examples",
    category: "vocabulary", level: "B1-B2", durationSec: 540,
    tags: ["phrasal verbs", "idioms", "vocabulary"],
  },
  // Pronunciation
  {
    id: "v12", youtubeId: "WlM_8bFMoAg",
    title: "American vs British Pronunciation",
    teacher: "Tom", country: "USA", flag: "🇺🇸",
    topic: "Key differences in accent and pronunciation",
    category: "pronunciation", level: "A2-B2", durationSec: 450,
    tags: ["accent", "pronunciation", "American", "British"],
  },
  {
    id: "v13", youtubeId: "Yt5pBMFBMkA",
    title: "How to Pronounce -ED Endings",
    teacher: "Kate", country: "UK", flag: "🇬🇧",
    topic: "Three ways to pronounce -ed in past tense",
    category: "pronunciation", level: "A1-B1", durationSec: 300,
    tags: ["-ed", "pronunciation", "past tense"],
  },
  // Listening
  {
    id: "v14", youtubeId: "LIfIFAMnJA0",
    title: "English Listening: At the Airport",
    teacher: "Chris", country: "Australia", flag: "🇦🇺",
    topic: "Real conversations at the airport",
    category: "listening", level: "A2-B1", durationSec: 420,
    tags: ["airport", "travel", "listening"],
  },
  {
    id: "v15", youtubeId: "VdpqMbdFBMo",
    title: "News English: Understanding Headlines",
    teacher: "Sarah", country: "USA", flag: "🇺🇸",
    topic: "How to understand English news",
    category: "listening", level: "B2-C1", durationSec: 600,
    tags: ["news", "headlines", "advanced"],
  },
];

export const CATEGORIES = [
  { id: "all",          label: "Tất cả",      emoji: "🎬" },
  { id: "grammar",      label: "Ngữ pháp",    emoji: "📐" },
  { id: "conversation", label: "Hội thoại",   emoji: "💬" },
  { id: "vocabulary",   label: "Từ vựng",     emoji: "📚" },
  { id: "pronunciation",label: "Phát âm",     emoji: "🎤" },
  { id: "listening",    label: "Nghe hiểu",   emoji: "🎧" },
];
