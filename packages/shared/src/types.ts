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
  correction?: string;
  timestamp: Date;
};

export type Flashcard = {
  id: string;
  word: string;
  translation: string;
  example: string;
  language: string;
};

export type UserSettings = {
  targetLanguage: Language;
  nativeLanguage: Language;
  level: Level;
};

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
