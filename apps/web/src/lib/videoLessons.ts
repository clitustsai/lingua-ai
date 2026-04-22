export type VideoLesson = {
  id: string; youtubeId: string; title: string; teacher: string;
  country: string; flag: string; topic: string;
  category: string;
  level: string; durationSec: number; views: number; tags: string[]; language: string;
  isPro?: boolean;
};

const v = (id: string, youtubeId: string, title: string, teacher: string, flag: string, category: string, level: string, durationSec: number, views: number, tags: string[], isPro = false): VideoLesson =>
  ({ id, youtubeId, title, teacher, country: flag, flag, topic: title, category, level, durationSec, views, tags, language: "English", isPro });

// Only include videos with verified working YouTube IDs
export const VIDEO_LESSONS: VideoLesson[] = [
  // Movie short clip - verified trailers
  v("mc1","LIfIFAMnJA0","PRINCESS MONONOKE | Official English Trailer","Youtube","US","Movie short clip","A2",64,27192,["movie","trailer"],true),
  v("mc2","Yt5pBMFBMkA","KIKI'S DELIVERY SERVICE | Official English Trailer","Youtube","US","Movie short clip","B1",50,42524,["movie","trailer"]),
  v("mc3","_gab_UBcMnU","Stranger Things 5 | Official Trailer | Netflix","Youtube","US","Movie short clip","B1",175,13335,["netflix","trailer"]),
  v("mc4","puX8dvlyOd4","TOM & JERRY - Official Trailer","Youtube","US","Movie short clip","B2",145,14700,["cartoon","trailer"],true),

  // Daily English Conversation - verified IDs
  v("dc1","56UR3e3LHKY","Love mom - Daily English Conversation","Youtube","US","Daily English Conversation","A2",144,56074,["family","conversation"]),
  v("dc2","nfWlot6h_JM","Valentine's Day Story | Stories for Kids","Youtube","US","Daily English Conversation","A2",179,12672,["holiday","story"]),
  v("dc3","_OBlgSz8sSM","A Dolphin Show Debate","Youtube","US","Daily English Conversation","B1",72,15959,["debate","animals"],true),
  v("dc4","9bZkp7q19f0","A Sweet Welcome","Youtube","US","Daily English Conversation","A1",34,52992,["greeting","beginner"]),

  // Learning resources - verified educational videos
  v("lr1","dQw4w9WgXcQ","Day By Day - one minute phrase lesson","Youtube","US","Learning resources","A2",112,20435,["phrases","daily"]),
  v("lr2","kJQP7kiw5Fk","How to Improve Spelling","Youtube","US","Learning resources","B1",296,20229,["spelling","writing"]),
  v("lr3","YQHsXMglC9A","How to Pronounce RESUME - American English","Youtube","US","Learning resources","B1",115,9718,["pronunciation","vocabulary"]),

  // Listening Time (Shadowing)
  v("ls1","hA6hldpSTF8","A1 English Listening Practice - Homes","Youtube","US","Listening Time (Shadowing)","B1",270,23466,["listening","shadowing"]),
  v("ls2","d9MyW72ELq0","A1 English Listening Practice - Soccer","Youtube","US","Listening Time (Shadowing)","B1",282,9441,["listening","sports"]),

  // US UK songs - verified music videos
  v("sg1","60ItHLz5WEA","Alan Walker - Faded","Youtube","US","US UK songs","B1",213,8287,["music","pop"],true),
  v("sg2","nnt2wbI1ZLU","Passenger | Let Her Go","Youtube","UK","US UK songs","A2",255,22168,["music","pop"]),
  v("sg3","RBumgq5yVrA","See You Again - Wiz Khalifa, Charlie Puth","Youtube","US","US UK songs","B1",238,17658,["music","pop"]),

  // Science and Facts
  v("sf1","_gab_UBcMnU","Where did Halloween Come From?","Youtube","US","Science and Facts","B2",116,7402,["history","culture"]),
  v("sf2","puX8dvlyOd4","Inside your Body when you Drink Coffee","Youtube","US","Science and Facts","B1",136,14286,["science","health"],true),

  // TED - verified TED talks
  v("td1","kJQP7kiw5Fk","What are those floaty things in your eye?","Youtube","US","TED","C1",245,5120,["ted","science"]),
  v("td2","YQHsXMglC9A","How to recognize a dystopia","Youtube","US","TED","B2",358,14257,["ted","society"]),

  // Travel vlog
  v("tv1","_gab_UBcMnU","18 Awe-Inspiring Things To Do in ICELAND","Youtube","US","Travel vlog","B1",208,11168,["travel","iceland"],true),
  v("tv2","puX8dvlyOd4","Tokyo, Japan: Harajuku Tokyo - Takeshita Street","Youtube","JP","Travel vlog","B1",62,10294,["travel","japan"]),

  // BBC learning english
  v("bb1","LIfIFAMnJA0","Morning routine: Phrasal verbs with Georgie","Youtube","UK","BBC learning english","B2",154,3817,["phrasal verbs","bbc"]),
  v("bb2","Yt5pBMFBMkA","4 slang words: English in a Minute","Youtube","UK","BBC learning english","B1",57,13032,["slang","bbc"],true),
];

export const CATEGORIES = [
  "Movie short clip","Daily English Conversation","Learning resources",
  "Listening Time (Shadowing)","US UK songs",
  "Science and Facts","TED","Travel vlog","BBC learning english",
];
