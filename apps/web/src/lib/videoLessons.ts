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

// IDs sourced from grammar-monster.com — verified public embeddable videos
export const VIDEO_LESSONS: VideoLesson[] = [
  // GRAMMAR — Grammar Monster channel (verified embeddable)
  { id: "v1",  youtubeId: "2wlKKsA1HMQ", title: "Parts of Speech Explained",             teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "The 9 parts of speech with examples",    category: "grammar",       level: "A1-B1", durationSec: 480, tags: ["parts of speech","nouns","verbs","grammar"] },
  { id: "v2",  youtubeId: "q9aFVmzRgLg", title: "Nouns: Types and Usage",                teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Common, proper, abstract, collective nouns", category: "grammar",    level: "A1-A2", durationSec: 360, tags: ["nouns","grammar","beginner"] },
  { id: "v3",  youtubeId: "-lfdDD9lpds", title: "Verbs: Action and Linking Verbs",       teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Types of verbs and how to use them",    category: "grammar",       level: "A1-B1", durationSec: 420, tags: ["verbs","action verbs","grammar"] },
  { id: "v4",  youtubeId: "ssHY3f7FOJM", title: "Adjectives: How to Describe Things",   teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Using adjectives correctly in English",  category: "grammar",       level: "A1-A2", durationSec: 390, tags: ["adjectives","describing","grammar"] },
  { id: "v5",  youtubeId: "o-LbqRag28c", title: "Adverbs: Modify Verbs and Adjectives", teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "How adverbs work in sentences",          category: "grammar",       level: "A2-B1", durationSec: 400, tags: ["adverbs","grammar","intermediate"] },
  { id: "v6",  youtubeId: "PkiyAulrfCo", title: "Pronouns: All Types Explained",        teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Personal, possessive, reflexive pronouns", category: "grammar",    level: "A1-B1", durationSec: 450, tags: ["pronouns","grammar","beginner"] },
  { id: "v7",  youtubeId: "nIJK_lUYUS0", title: "Prepositions: In, On, At and More",    teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Common prepositions with examples",      category: "grammar",       level: "A1-A2", durationSec: 380, tags: ["prepositions","in on at","grammar"] },
  { id: "v8",  youtubeId: "5sQlZNhP5OU", title: "Conjunctions: Joining Words",          teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "And, but, or, because, although",        category: "grammar",       level: "A2-B1", durationSec: 360, tags: ["conjunctions","joining","grammar"] },

  // TENSES — Grammar Monster
  { id: "v9",  youtubeId: "XMf1OkdruEY", title: "Present Simple Tense",                 teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "How to use the present simple tense",   category: "grammar",       level: "A1",   durationSec: 420, tags: ["present simple","tenses","grammar"] },
  { id: "v10", youtubeId: "BNSoDln1FQ8", title: "Present Continuous Tense",             teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Using present continuous correctly",     category: "grammar",       level: "A1-A2",durationSec: 390, tags: ["present continuous","tenses","grammar"] },
  { id: "v11", youtubeId: "odDSbWHUGYk", title: "Past Simple Tense",                   teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Regular and irregular past simple",      category: "grammar",       level: "A1-A2",durationSec: 440, tags: ["past simple","tenses","grammar"] },
  { id: "v12", youtubeId: "QJC5dd1ODBQ", title: "Past Continuous Tense",               teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "When to use past continuous",            category: "grammar",       level: "A2-B1",durationSec: 380, tags: ["past continuous","tenses","grammar"] },
  { id: "v13", youtubeId: "ud2wlMNmhVE", title: "Future Tense: Will vs Going To",      teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Difference between will and going to",   category: "grammar",       level: "A2-B1",durationSec: 420, tags: ["future tense","will","going to","grammar"] },
  { id: "v14", youtubeId: "EeNL95YOlmE", title: "Present Perfect Tense",               teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Have/has + past participle explained",   category: "grammar",       level: "B1",   durationSec: 460, tags: ["present perfect","tenses","grammar"] },
  { id: "v15", youtubeId: "6jexvI0-uTU", title: "Passive Voice Explained",             teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Active vs passive voice with examples",  category: "grammar",       level: "B1-B2",durationSec: 400, tags: ["passive voice","grammar","intermediate"] },

  // VOCABULARY — Grammar Monster
  { id: "v16", youtubeId: "I28MDrOMxNM", title: "Common English Vocabulary A1",        teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Essential beginner vocabulary",          category: "vocabulary",    level: "A1",   durationSec: 480, tags: ["vocabulary","beginner","everyday"] },
  { id: "v17", youtubeId: "BK9vaLQ1Lgo", title: "Vocabulary: Describing People",       teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Words to describe appearance and personality", category: "vocabulary", level: "A2", durationSec: 420, tags: ["vocabulary","describing","people"] },
  { id: "v18", youtubeId: "SiVe_3dWZ48", title: "Vocabulary: Food and Cooking",        teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Common food and cooking vocabulary",     category: "vocabulary",    level: "A1-A2",durationSec: 390, tags: ["vocabulary","food","cooking"] },
  { id: "v19", youtubeId: "oXh6HJRl-Wc", title: "Vocabulary: Travel and Transport",   teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Words for travel, transport, directions", category: "vocabulary",    level: "A2-B1",durationSec: 440, tags: ["vocabulary","travel","transport"] },
  { id: "v20", youtubeId: "x-e6XDQu2Ds", title: "Vocabulary: Work and Jobs",          teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Business and workplace vocabulary",       category: "vocabulary",    level: "B1",   durationSec: 460, tags: ["vocabulary","work","jobs","business"] },
  { id: "v21", youtubeId: "39TX3uXhkw4", title: "Vocabulary: Health and Body",        teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Medical and body vocabulary",             category: "vocabulary",    level: "A2-B1",durationSec: 400, tags: ["vocabulary","health","body","medical"] },

  // PRONUNCIATION — Grammar Monster
  { id: "v22", youtubeId: "dNE_DqegeuI", title: "English Pronunciation Basics",        teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Key pronunciation rules for beginners",  category: "pronunciation", level: "A1-B1",durationSec: 450, tags: ["pronunciation","sounds","beginner"] },
  { id: "v23", youtubeId: "wQtfXWVy_m0", title: "Vowel Sounds in English",             teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Long and short vowel sounds",            category: "pronunciation", level: "A1-A2",durationSec: 380, tags: ["vowels","pronunciation","sounds"] },
  { id: "v24", youtubeId: "IrcF51yp-tE", title: "Consonant Sounds: B, P, D, T",       teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Tricky consonant sounds explained",      category: "pronunciation", level: "A1-B1",durationSec: 360, tags: ["consonants","pronunciation","sounds"] },
  { id: "v25", youtubeId: "K1sp_Y9Fw2M", title: "Word Stress in English",              teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "How word stress changes meaning",         category: "pronunciation", level: "B1-B2",durationSec: 420, tags: ["stress","intonation","pronunciation"] },
  { id: "v26", youtubeId: "WTHILTNE1yo", title: "Silent Letters in English",           teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Words with silent letters explained",    category: "pronunciation", level: "A2-B1",durationSec: 360, tags: ["silent letters","spelling","pronunciation"] },

  // CONVERSATION / LISTENING — Grammar Monster
  { id: "v27", youtubeId: "W4Tu9CMCnRs", title: "Interjections in Conversation",       teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Oh! Wow! Hmm! Using interjections",      category: "conversation",  level: "A2-B1",durationSec: 340, tags: ["interjections","conversation","speaking"] },
  { id: "v28", youtubeId: "kNW_gP_Qjjo", title: "Questions: How to Ask Correctly",    teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Forming questions in English",           category: "conversation",  level: "A1-A2",durationSec: 420, tags: ["questions","conversation","grammar"] },
  { id: "v29", youtubeId: "N3AViIPrT08", title: "Reported Speech in Conversation",    teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Direct vs indirect speech",              category: "conversation",  level: "B1-B2",durationSec: 460, tags: ["reported speech","conversation","grammar"] },
  { id: "v30", youtubeId: "a6RIGeHd_qQ", title: "Conditionals in Real Conversation",  teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "If clauses in everyday English",         category: "conversation",  level: "B1-B2",durationSec: 440, tags: ["conditionals","conversation","if clauses"] },
  { id: "v31", youtubeId: "U2LUm1YB-fc", title: "Writing Tips: Clear Sentences",      teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "How to write clear English sentences",   category: "listening",     level: "B1-B2",durationSec: 480, tags: ["writing","sentences","advanced"] },
  { id: "v32", youtubeId: "AKI929-3E-M", title: "Common Grammar Mistakes to Avoid",   teacher: "Grammar Monster", country: "UK", flag: "GB", topic: "Top grammar mistakes and how to fix them", category: "listening",   level: "A2-B2",durationSec: 500, tags: ["mistakes","grammar","tips"] },
];

export const CATEGORIES = [
  { id: "all",           label: "All",          emoji: "🎬" },
  { id: "grammar",       label: "Grammar",      emoji: "📐" },
  { id: "conversation",  label: "Conversation", emoji: "💬" },
  { id: "vocabulary",    label: "Vocabulary",   emoji: "📚" },
  { id: "pronunciation", label: "Pronunciation",emoji: "🎤" },
  { id: "listening",     label: "Listening",    emoji: "🎧" },
];
