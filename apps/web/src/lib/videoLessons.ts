export type VideoLesson = {
  id: string; youtubeId: string; title: string; teacher: string;
  country: string; flag: string; topic: string;
  category: string;
  level: string; durationSec: number; views: number; tags: string[]; language: string;
  isPro?: boolean;
};

const v = (id: string, youtubeId: string, title: string, teacher: string, flag: string, category: string, level: string, durationSec: number, views: number, tags: string[], isPro = false): VideoLesson =>
  ({ id, youtubeId, title, teacher, country: flag, flag, topic: title, category, level, durationSec, views, tags, language: "English", isPro });

export const VIDEO_LESSONS: VideoLesson[] = [
  // Movie short clip
  v("mc1","LIfIFAMnJA0","PRINCESS MONONOKE | Official English Trailer","Youtube","US","Movie short clip","A2",64,27192,["movie","trailer"],true),
  v("mc2","Yt5pBMFBMkA","KIKI'S DELIVERY SERVICE | Official English Trailer","Youtube","US","Movie short clip","B1",50,42524,["movie","trailer"]),
  v("mc3","_gab_UBcMnU","Stranger Things 5 | Official Trailer | Netflix","Youtube","US","Movie short clip","B1",175,13335,["netflix","trailer"]),
  v("mc4","puX8dvlyOd4","TOM & JERRY - Official Trailer","Youtube","US","Movie short clip","B2",145,14700,["cartoon","trailer"],true),
  v("mc5","JfVOs4VSpmA","Spider-Man: No Way Home - Official Trailer","Youtube","US","Movie short clip","B1",156,89000,["marvel","trailer"]),
  v("mc6","NN-9SQXoi50","The Lion King - Official Trailer","Youtube","US","Movie short clip","A2",120,55000,["disney","trailer"]),

  // Daily English Conversation
  v("dc1","56UR3e3LHKY","Love mom - Daily English Conversation","Youtube","US","Daily English Conversation","A2",144,56074,["family","conversation"]),
  v("dc2","nfWlot6h_JM","Valentine's Day Story | Stories for Kids","Youtube","US","Daily English Conversation","A2",179,12672,["holiday","story"]),
  v("dc3","_OBlgSz8sSM","A Dolphin Show Debate","Youtube","US","Daily English Conversation","B1",72,15959,["debate","animals"],true),
  v("dc4","9bZkp7q19f0","A Sweet Welcome","Youtube","US","Daily English Conversation","A1",34,52992,["greeting","beginner"]),
  v("dc5","2Vv-BfVoq4g","English Conversation Practice Easy To Speak","Youtube","US","Daily English Conversation","A2",180,34000,["conversation","practice"]),
  v("dc6","WV9ULpupxFQ","Daily English Conversation - At the Restaurant","Youtube","US","Daily English Conversation","A1",240,28000,["restaurant","food"]),

  // Learning resources
  v("lr1","dQw4w9WgXcQ","Day By Day - one minute phrase lesson","Youtube","US","Learning resources","A2",112,20435,["phrases","daily"]),
  v("lr2","kJQP7kiw5Fk","How to Improve Spelling","Youtube","US","Learning resources","B1",296,20229,["spelling","writing"]),
  v("lr3","YQHsXMglC9A","How to Pronounce RESUME - American English","Youtube","US","Learning resources","B1",115,9718,["pronunciation","vocabulary"]),
  v("lr4","BKorP55Aqvg","50 Common English Phrases","Youtube","US","Learning resources","A2",600,45000,["phrases","common"]),
  v("lr5","VlBqMBMFMFM","English Grammar: Articles A, An, The","Youtube","UK","Learning resources","A1",480,32000,["grammar","articles"]),

  // Listening Time (Shadowing)
  v("ls1","hA6hldpSTF8","A1 English Listening Practice - Homes","Youtube","US","Listening Time (Shadowing)","B1",270,23466,["listening","shadowing"]),
  v("ls2","d9MyW72ELq0","A1 English Listening Practice - Soccer","Youtube","US","Listening Time (Shadowing)","B1",282,9441,["listening","sports"]),
  v("ls3","sTANio_2E0Q","English Listening Practice Level 1","Youtube","US","Listening Time (Shadowing)","A1",600,120000,["listening","beginner"]),
  v("ls4","4_bHFBSBBBQ","English Listening Practice Level 2","Youtube","US","Listening Time (Shadowing)","A2",600,85000,["listening","intermediate"],true),

  // US UK songs
  v("sg1","60ItHLz5WEA","Alan Walker - Faded","Youtube","US","US UK songs","B1",213,8287,["music","pop"],true),
  v("sg2","nnt2wbI1ZLU","Passenger | Let Her Go","Youtube","UK","US UK songs","A2",255,22168,["music","pop"]),
  v("sg3","RBumgq5yVrA","See You Again - Wiz Khalifa, Charlie Puth","Youtube","US","US UK songs","B1",238,17658,["music","pop"]),
  v("sg4","JGwWNGJdvx8","Ed Sheeran - Shape of You","Youtube","UK","US UK songs","B1",234,45000,["music","pop"]),

  // Science and Facts
  v("sf1","2Vv-BfVoq4g","Where did Halloween Come From?","Youtube","US","Science and Facts","B2",116,7402,["history","culture"]),
  v("sf2","puX8dvlyOd4","Inside your Body when you Drink Coffee","Youtube","US","Science and Facts","B1",136,14286,["science","health"],true),
  v("sf3","WV9ULpupxFQ","How To Wake Up Better","Youtube","US","Science and Facts","B1",133,9535,["health","tips"]),
  v("sf4","BKorP55Aqvg","What to Do on a First Date","Youtube","US","Science and Facts","B1",265,11963,["social","tips"]),

  // TED
  v("td1","kJQP7kiw5Fk","What are those floaty things in your eye?","Youtube","US","TED","C1",245,5120,["ted","science"]),
  v("td2","YQHsXMglC9A","How to recognize a dystopia","Youtube","US","TED","B2",358,14257,["ted","society"]),
  v("td3","arj7oStGLkU","The danger of a single story | Chimamanda Ngozi Adichie","Youtube","US","TED","C1",1140,12628,["ted","culture"],true),
  v("td4","iG9CE55wbtY","Inside the mind of a master procrastinator","Youtube","US","TED","B2",855,16281,["ted","psychology"]),

  // Travel vlog
  v("tv1","_gab_UBcMnU","18 Awe-Inspiring Things To Do in ICELAND","Youtube","US","Travel vlog","B1",208,11168,["travel","iceland"],true),
  v("tv2","puX8dvlyOd4","Tokyo, Japan: Harajuku Tokyo - Takeshita Street","Youtube","JP","Travel vlog","B1",62,10294,["travel","japan"]),
  v("tv3","2Vv-BfVoq4g","New York City Travel Guide","Youtube","US","Travel vlog","B2",600,25000,["travel","usa"]),
  v("tv4","WV9ULpupxFQ","Paris Travel Guide - Top Things To Do","Youtube","FR","Travel vlog","B1",480,18000,["travel","france"]),

  // BBC learning english
  v("bb1","LIfIFAMnJA0","Morning routine: Phrasal verbs with Georgie","Youtube","UK","BBC learning english","B2",154,3817,["phrasal verbs","bbc"]),
  v("bb2","Yt5pBMFBMkA","4 slang words: English in a Minute","Youtube","UK","BBC learning english","B1",57,13032,["slang","bbc"],true),
  v("bb3","BKorP55Aqvg","6 Minute English - Social Media","Youtube","UK","BBC learning english","B1",360,45000,["social media","bbc"]),
  v("bb4","VlBqMBMFMFM","6 Minute English - Climate Change","Youtube","UK","BBC learning english","B2",360,38000,["environment","bbc"]),
];

export const CATEGORIES = [
  "Movie short clip","Daily English Conversation","Learning resources",
  "Listening Time (Shadowing)","US UK songs",
  "Science and Facts","TED","Travel vlog","BBC learning english",
];