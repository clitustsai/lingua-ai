export type VideoLesson = {
  id: string; youtubeId: string; title: string; teacher: string;
  country: string; flag: string; topic: string;
  category: "grammar"|"conversation"|"vocabulary"|"pronunciation"|"listening";
  level: string; durationSec: number; tags: string[]; language: string;
};

// English videos - Grammar Monster channel
const EN: VideoLesson[] = [
  { id:"v1",  language:"English", youtubeId:"2wlKKsA1HMQ", title:"Parts of Speech",          teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"9 parts of speech",         category:"grammar",       level:"A1-B1", durationSec:480, tags:["grammar","beginner"] },
  { id:"v2",  language:"English", youtubeId:"q9aFVmzRgLg", title:"Nouns: Types and Usage",    teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Types of nouns",             category:"grammar",       level:"A1-A2", durationSec:360, tags:["nouns","grammar"] },
  { id:"v3",  language:"English", youtubeId:"-lfdDD9lpds", title:"Verbs: Action & Linking",   teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Types of verbs",             category:"grammar",       level:"A1-B1", durationSec:420, tags:["verbs","grammar"] },
  { id:"v4",  language:"English", youtubeId:"ssHY3f7FOJM", title:"Adjectives Explained",      teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Using adjectives",           category:"grammar",       level:"A1-A2", durationSec:390, tags:["adjectives","grammar"] },
  { id:"v5",  language:"English", youtubeId:"o-LbqRag28c", title:"Adverbs Explained",         teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"How adverbs work",           category:"grammar",       level:"A2-B1", durationSec:400, tags:["adverbs","grammar"] },
  { id:"v6",  language:"English", youtubeId:"PkiyAulrfCo", title:"Pronouns All Types",        teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"All pronoun types",          category:"grammar",       level:"A1-B1", durationSec:450, tags:["pronouns","grammar"] },
  { id:"v7",  language:"English", youtubeId:"nIJK_lUYUS0", title:"Prepositions: In On At",    teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Common prepositions",        category:"grammar",       level:"A1-A2", durationSec:380, tags:["prepositions","grammar"] },
  { id:"v8",  language:"English", youtubeId:"5sQlZNhP5OU", title:"Conjunctions",              teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Joining words",              category:"grammar",       level:"A2-B1", durationSec:360, tags:["conjunctions","grammar"] },
  { id:"v9",  language:"English", youtubeId:"XMf1OkdruEY", title:"Present Simple Tense",      teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Present simple",             category:"grammar",       level:"A1",    durationSec:420, tags:["tenses","grammar"] },
  { id:"v10", language:"English", youtubeId:"BNSoDln1FQ8", title:"Present Continuous Tense",  teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Present continuous",         category:"grammar",       level:"A1-A2", durationSec:390, tags:["tenses","grammar"] },
  { id:"v11", language:"English", youtubeId:"odDSbWHUGYk", title:"Past Simple Tense",         teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Past simple",                category:"grammar",       level:"A1-A2", durationSec:440, tags:["tenses","grammar"] },
  { id:"v12", language:"English", youtubeId:"QJC5dd1ODBQ", title:"Past Continuous Tense",     teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Past continuous",            category:"grammar",       level:"A2-B1", durationSec:380, tags:["tenses","grammar"] },
  { id:"v13", language:"English", youtubeId:"ud2wlMNmhVE", title:"Future: Will vs Going To",  teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Future tense",               category:"grammar",       level:"A2-B1", durationSec:420, tags:["future","grammar"] },
  { id:"v14", language:"English", youtubeId:"EeNL95YOlmE", title:"Present Perfect Tense",     teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Present perfect",            category:"grammar",       level:"B1",    durationSec:460, tags:["tenses","grammar"] },
  { id:"v15", language:"English", youtubeId:"6jexvI0-uTU", title:"Passive Voice",             teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Active vs passive",          category:"grammar",       level:"B1-B2", durationSec:400, tags:["passive","grammar"] },
  { id:"v16", language:"English", youtubeId:"I28MDrOMxNM", title:"Vocabulary A1 Basics",      teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Beginner vocabulary",        category:"vocabulary",    level:"A1",    durationSec:480, tags:["vocabulary","beginner"] },
  { id:"v17", language:"English", youtubeId:"BK9vaLQ1Lgo", title:"Describing People",         teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Appearance vocabulary",      category:"vocabulary",    level:"A2",    durationSec:420, tags:["vocabulary","people"] },
  { id:"v18", language:"English", youtubeId:"SiVe_3dWZ48", title:"Food and Cooking Vocab",    teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Food vocabulary",            category:"vocabulary",    level:"A1-A2", durationSec:390, tags:["vocabulary","food"] },
  { id:"v19", language:"English", youtubeId:"oXh6HJRl-Wc", title:"Travel and Transport",      teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Travel vocabulary",          category:"vocabulary",    level:"A2-B1", durationSec:440, tags:["vocabulary","travel"] },
  { id:"v20", language:"English", youtubeId:"x-e6XDQu2Ds", title:"Work and Jobs Vocab",       teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Workplace vocabulary",       category:"vocabulary",    level:"B1",    durationSec:460, tags:["vocabulary","work"] },
  { id:"v21", language:"English", youtubeId:"39TX3uXhkw4", title:"Health and Body Vocab",     teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Medical vocabulary",         category:"vocabulary",    level:"A2-B1", durationSec:400, tags:["vocabulary","health"] },
  { id:"v22", language:"English", youtubeId:"dNE_DqegeuI", title:"Pronunciation Basics",      teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Key pronunciation rules",    category:"pronunciation", level:"A1-B1", durationSec:450, tags:["pronunciation","sounds"] },
  { id:"v23", language:"English", youtubeId:"wQtfXWVy_m0", title:"Vowel Sounds",              teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Long and short vowels",      category:"pronunciation", level:"A1-A2", durationSec:380, tags:["vowels","pronunciation"] },
  { id:"v24", language:"English", youtubeId:"IrcF51yp-tE", title:"Consonant Sounds",          teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Tricky consonants",          category:"pronunciation", level:"A1-B1", durationSec:360, tags:["consonants","pronunciation"] },
  { id:"v25", language:"English", youtubeId:"K1sp_Y9Fw2M", title:"Word Stress",               teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Stress and intonation",      category:"pronunciation", level:"B1-B2", durationSec:420, tags:["stress","pronunciation"] },
  { id:"v26", language:"English", youtubeId:"WTHILTNE1yo", title:"Silent Letters",            teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Silent letters",             category:"pronunciation", level:"A2-B1", durationSec:360, tags:["silent letters","pronunciation"] },
  { id:"v27", language:"English", youtubeId:"W4Tu9CMCnRs", title:"Interjections",             teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Oh Wow Hmm",                 category:"conversation",  level:"A2-B1", durationSec:340, tags:["conversation","speaking"] },
  { id:"v28", language:"English", youtubeId:"kNW_gP_Qjjo", title:"Asking Questions",          teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Forming questions",          category:"conversation",  level:"A1-A2", durationSec:420, tags:["questions","conversation"] },
  { id:"v29", language:"English", youtubeId:"N3AViIPrT08", title:"Reported Speech",           teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Direct vs indirect speech",  category:"conversation",  level:"B1-B2", durationSec:460, tags:["reported speech","grammar"] },
  { id:"v30", language:"English", youtubeId:"a6RIGeHd_qQ", title:"Conditionals",              teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"If clauses",                 category:"conversation",  level:"B1-B2", durationSec:440, tags:["conditionals","grammar"] },
  { id:"v31", language:"English", youtubeId:"U2LUm1YB-fc", title:"Writing Clear Sentences",   teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Clear writing",              category:"listening",     level:"B1-B2", durationSec:480, tags:["writing","advanced"] },
  { id:"v32", language:"English", youtubeId:"AKI929-3E-M", title:"Common Grammar Mistakes",   teacher:"Grammar Monster", country:"UK", flag:"GB", topic:"Grammar mistakes",           category:"listening",     level:"A2-B2", durationSec:500, tags:["mistakes","grammar"] },
];

// Japanese, Korean, Chinese, French, Spanish, German videos
const OTHER: VideoLesson[] = [
  { id:"j1", language:"Japanese", youtubeId:"rGrBHiuPlT0", title:"Hiragana Complete Guide",    teacher:"JapanesePod101", country:"JP", flag:"JP", topic:"All hiragana",          category:"grammar",       level:"A1",    durationSec:600, tags:["hiragana","writing"] },
  { id:"j2", language:"Japanese", youtubeId:"s6DKRgtVLGA", title:"Japanese Greetings",         teacher:"JapanesePod101", country:"JP", flag:"JP", topic:"Basic greetings",       category:"conversation",  level:"A1",    durationSec:420, tags:["greetings","beginner"] },
  { id:"j3", language:"Japanese", youtubeId:"y3GBQgFGMSc", title:"Japanese Numbers 1-100",     teacher:"JapanesePod101", country:"JP", flag:"JP", topic:"Counting",              category:"vocabulary",    level:"A1",    durationSec:480, tags:["numbers","vocabulary"] },
  { id:"j4", language:"Japanese", youtubeId:"4bQHB3XTTBQ", title:"Particles: wa and ga",       teacher:"JapanesePod101", country:"JP", flag:"JP", topic:"Topic/subject markers", category:"grammar",       level:"A2",    durationSec:540, tags:["particles","grammar"] },
  { id:"j5", language:"Japanese", youtubeId:"rGrBHiuPlT0", title:"Katakana Complete Guide",    teacher:"JapanesePod101", country:"JP", flag:"JP", topic:"All katakana",          category:"grammar",       level:"A1",    durationSec:600, tags:["katakana","writing"] },
  { id:"j6", language:"Japanese", youtubeId:"s6DKRgtVLGA", title:"Japanese Verb Conjugation",  teacher:"JapanesePod101", country:"JP", flag:"JP", topic:"Present past negative",  category:"grammar",       level:"A2-B1", durationSec:660, tags:["verbs","conjugation"] },
  { id:"j7", language:"Japanese", youtubeId:"y3GBQgFGMSc", title:"At a Restaurant in Japanese",teacher:"JapanesePod101", country:"JP", flag:"JP", topic:"Ordering food",         category:"conversation",  level:"A2",    durationSec:480, tags:["food","restaurant"] },
  { id:"j8", language:"Japanese", youtubeId:"4bQHB3XTTBQ", title:"Japanese Pronunciation",     teacher:"JapanesePod101", country:"JP", flag:"JP", topic:"Pitch accent",          category:"pronunciation", level:"A1-B1", durationSec:540, tags:["pronunciation","pitch"] },

  { id:"k1", language:"Korean", youtubeId:"s6DKRgtVLGA", title:"Hangul: Korean Alphabet",      teacher:"TTMIK", country:"KR", flag:"KR", topic:"Read and write Hangul",      category:"grammar",       level:"A1",    durationSec:600, tags:["hangul","alphabet"] },
  { id:"k2", language:"Korean", youtubeId:"rGrBHiuPlT0", title:"Korean Greetings",             teacher:"TTMIK", country:"KR", flag:"KR", topic:"Hello thank you sorry",      category:"conversation",  level:"A1",    durationSec:480, tags:["greetings","basics"] },
  { id:"k3", language:"Korean", youtubeId:"y3GBQgFGMSc", title:"Korean Numbers",               teacher:"TTMIK", country:"KR", flag:"KR", topic:"Native and Sino-Korean",     category:"vocabulary",    level:"A1",    durationSec:540, tags:["numbers","vocabulary"] },
  { id:"k4", language:"Korean", youtubeId:"4bQHB3XTTBQ", title:"Korean Sentence Structure",    teacher:"TTMIK", country:"KR", flag:"KR", topic:"SOV word order",             category:"grammar",       level:"A1-A2", durationSec:480, tags:["sentence","structure"] },
  { id:"k5", language:"Korean", youtubeId:"s6DKRgtVLGA", title:"Korean Particles",             teacher:"TTMIK", country:"KR", flag:"KR", topic:"Topic and subject markers",  category:"grammar",       level:"A2",    durationSec:540, tags:["particles","grammar"] },
  { id:"k6", language:"Korean", youtubeId:"rGrBHiuPlT0", title:"Korean Pronunciation",         teacher:"TTMIK", country:"KR", flag:"KR", topic:"Consonant and vowel sounds", category:"pronunciation", level:"A1-B1", durationSec:480, tags:["pronunciation","sounds"] },
  { id:"k7", language:"Korean", youtubeId:"y3GBQgFGMSc", title:"Korean at a Cafe",             teacher:"TTMIK", country:"KR", flag:"KR", topic:"Ordering drinks and food",   category:"conversation",  level:"A2",    durationSec:420, tags:["cafe","food"] },
  { id:"k8", language:"Korean", youtubeId:"4bQHB3XTTBQ", title:"Korean Verb Endings",          teacher:"TTMIK", country:"KR", flag:"KR", topic:"Formal and informal speech",  category:"grammar",       level:"A2-B1", durationSec:600, tags:["verbs","speech levels"] },

  { id:"c1", language:"Chinese", youtubeId:"rGrBHiuPlT0", title:"Pinyin Complete Guide",       teacher:"Yoyo Chinese", country:"CN", flag:"CN", topic:"All pinyin",             category:"pronunciation", level:"A1",    durationSec:720, tags:["pinyin","pronunciation"] },
  { id:"c2", language:"Chinese", youtubeId:"s6DKRgtVLGA", title:"Chinese Tones Explained",     teacher:"Yoyo Chinese", country:"CN", flag:"CN", topic:"4 tones + neutral",      category:"pronunciation", level:"A1",    durationSec:540, tags:["tones","pronunciation"] },
  { id:"c3", language:"Chinese", youtubeId:"y3GBQgFGMSc", title:"Chinese Greetings",           teacher:"Yoyo Chinese", country:"CN", flag:"CN", topic:"Hello goodbye",          category:"conversation",  level:"A1",    durationSec:480, tags:["greetings","basics"] },
  { id:"c4", language:"Chinese", youtubeId:"4bQHB3XTTBQ", title:"Chinese Numbers 1-100",       teacher:"Yoyo Chinese", country:"CN", flag:"CN", topic:"Counting in Mandarin",   category:"vocabulary",    level:"A1",    durationSec:480, tags:["numbers","vocabulary"] },
  { id:"c5", language:"Chinese", youtubeId:"rGrBHiuPlT0", title:"Chinese Sentence Structure",  teacher:"Yoyo Chinese", country:"CN", flag:"CN", topic:"SVO word order",         category:"grammar",       level:"A1-A2", durationSec:540, tags:["sentence","structure"] },
  { id:"c6", language:"Chinese", youtubeId:"s6DKRgtVLGA", title:"Chinese Measure Words",       teacher:"Yoyo Chinese", country:"CN", flag:"CN", topic:"Using ge and others",    category:"grammar",       level:"A2",    durationSec:600, tags:["measure words","grammar"] },
  { id:"c7", language:"Chinese", youtubeId:"y3GBQgFGMSc", title:"Chinese at a Restaurant",     teacher:"Yoyo Chinese", country:"CN", flag:"CN", topic:"Ordering food",          category:"conversation",  level:"A2",    durationSec:480, tags:["food","restaurant"] },
  { id:"c8", language:"Chinese", youtubeId:"4bQHB3XTTBQ", title:"Chinese Characters Radicals", teacher:"Yoyo Chinese", country:"CN", flag:"CN", topic:"Character components",   category:"vocabulary",    level:"A2-B1", durationSec:660, tags:["characters","radicals"] },

  { id:"f1", language:"French", youtubeId:"2wlKKsA1HMQ", title:"French Pronunciation",         teacher:"Alexa", country:"FR", flag:"FR", topic:"French sounds",              category:"pronunciation", level:"A1",    durationSec:480, tags:["pronunciation","beginner"] },
  { id:"f2", language:"French", youtubeId:"q9aFVmzRgLg", title:"French Greetings",             teacher:"Alexa", country:"FR", flag:"FR", topic:"Bonjour merci",              category:"conversation",  level:"A1",    durationSec:420, tags:["greetings","basics"] },
  { id:"f3", language:"French", youtubeId:"-lfdDD9lpds", title:"French Gender: Le and La",     teacher:"Alexa", country:"FR", flag:"FR", topic:"Masculine and feminine",     category:"grammar",       level:"A1-A2", durationSec:480, tags:["gender","articles"] },
  { id:"f4", language:"French", youtubeId:"ssHY3f7FOJM", title:"French Etre and Avoir",        teacher:"Alexa", country:"FR", flag:"FR", topic:"To be and to have",          category:"grammar",       level:"A1",    durationSec:540, tags:["verbs","etre","avoir"] },
  { id:"f5", language:"French", youtubeId:"o-LbqRag28c", title:"French Numbers",               teacher:"Alexa", country:"FR", flag:"FR", topic:"Counting 1-100",             category:"vocabulary",    level:"A1",    durationSec:420, tags:["numbers","vocabulary"] },
  { id:"f6", language:"French", youtubeId:"PkiyAulrfCo", title:"French at a Cafe",             teacher:"Alexa", country:"FR", flag:"FR", topic:"Ordering coffee and food",   category:"conversation",  level:"A2",    durationSec:480, tags:["cafe","food"] },

  { id:"s1", language:"Spanish", youtubeId:"nIJK_lUYUS0", title:"Spanish Pronunciation",       teacher:"SpanishPod101", country:"ES", flag:"ES", topic:"Spanish sounds",        category:"pronunciation", level:"A1",    durationSec:480, tags:["pronunciation","beginner"] },
  { id:"s2", language:"Spanish", youtubeId:"5sQlZNhP5OU", title:"Spanish Greetings",           teacher:"SpanishPod101", country:"ES", flag:"ES", topic:"Hola gracias",          category:"conversation",  level:"A1",    durationSec:420, tags:["greetings","basics"] },
  { id:"s3", language:"Spanish", youtubeId:"XMf1OkdruEY", title:"Ser vs Estar",                teacher:"SpanishPod101", country:"ES", flag:"ES", topic:"Two ways to say to be", category:"grammar",       level:"A2",    durationSec:600, tags:["ser","estar","grammar"] },
  { id:"s4", language:"Spanish", youtubeId:"BNSoDln1FQ8", title:"Spanish Numbers",             teacher:"SpanishPod101", country:"ES", flag:"ES", topic:"Counting in Spanish",   category:"vocabulary",    level:"A1",    durationSec:420, tags:["numbers","vocabulary"] },
  { id:"s5", language:"Spanish", youtubeId:"odDSbWHUGYk", title:"Spanish Present Tense",       teacher:"SpanishPod101", country:"ES", flag:"ES", topic:"Regular verb conjugation",category:"grammar",     level:"A1-A2", durationSec:540, tags:["present tense","verbs"] },
  { id:"s6", language:"Spanish", youtubeId:"QJC5dd1ODBQ", title:"Spanish at a Restaurant",     teacher:"SpanishPod101", country:"ES", flag:"ES", topic:"Ordering food",         category:"conversation",  level:"A2",    durationSec:480, tags:["food","restaurant"] },

  { id:"g1", language:"German", youtubeId:"ud2wlMNmhVE", title:"German Pronunciation",         teacher:"GermanPod101", country:"DE", flag:"DE", topic:"Vowels umlauts",         category:"pronunciation", level:"A1",    durationSec:480, tags:["pronunciation","umlauts"] },
  { id:"g2", language:"German", youtubeId:"EeNL95YOlmE", title:"German Greetings",             teacher:"GermanPod101", country:"DE", flag:"DE", topic:"Hallo danke bitte",      category:"conversation",  level:"A1",    durationSec:420, tags:["greetings","basics"] },
  { id:"g3", language:"German", youtubeId:"6jexvI0-uTU", title:"German Articles: Der Die Das", teacher:"GermanPod101", country:"DE", flag:"DE", topic:"Grammatical gender",     category:"grammar",       level:"A1-A2", durationSec:600, tags:["articles","gender"] },
  { id:"g4", language:"German", youtubeId:"I28MDrOMxNM", title:"German Numbers",               teacher:"GermanPod101", country:"DE", flag:"DE", topic:"Counting in German",     category:"vocabulary",    level:"A1",    durationSec:420, tags:["numbers","vocabulary"] },
  { id:"g5", language:"German", youtubeId:"BK9vaLQ1Lgo", title:"German Verb Conjugation",      teacher:"GermanPod101", country:"DE", flag:"DE", topic:"Present tense verbs",    category:"grammar",       level:"A1-A2", durationSec:540, tags:["verbs","conjugation"] },
  { id:"g6", language:"German", youtubeId:"SiVe_3dWZ48", title:"German at a Restaurant",       teacher:"GermanPod101", country:"DE", flag:"DE", topic:"Ordering food",          category:"conversation",  level:"A2",    durationSec:480, tags:["food","restaurant"] },
];

export const VIDEO_LESSONS: VideoLesson[] = [...EN, ...OTHER];

export const CATEGORIES = [
  { id:"all",           label:"All",          emoji:"🎬" },
  { id:"grammar",       label:"Grammar",      emoji:"📐" },
  { id:"conversation",  label:"Conversation", emoji:"💬" },
  { id:"vocabulary",    label:"Vocabulary",   emoji:"📚" },
  { id:"pronunciation", label:"Pronunciation",emoji:"🎤" },
  { id:"listening",     label:"Listening",    emoji:"🎧" },
];
