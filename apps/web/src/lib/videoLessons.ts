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
  v("mc5","hA6hldpSTF8","Spider-Man: No Way Home - Official Trailer","Youtube","US","Movie short clip","B1",156,89000,["marvel","trailer"]),
  v("mc6","d9MyW72ELq0","The Lion King - Official Trailer","Youtube","US","Movie short clip","A2",120,55000,["disney","trailer"]),

  // Daily English Conversation
  v("dc1","56UR3e3LHKY","Love mom","Youtube","US","Daily English Conversation","A2",144,56074,["family","conversation"]),
  v("dc2","nfWlot6h_JM","Valentine's Day Story | Culture and History | Stories for Kids","Youtube","US","Daily English Conversation","A2",179,12672,["holiday","story"]),
  v("dc3","_OBlgSz8sSM","A Dolphin Show Debate","Youtube","US","Daily English Conversation","B1",72,15959,["debate","animals"],true),
  v("dc4","9bZkp7q19f0","A Sweet Welcome","Youtube","US","Daily English Conversation","A1",34,52992,["greeting","beginner"]),
  v("dc5","kJQP7kiw5Fk","English Conversation Practice - At the Airport","Youtube","US","Daily English Conversation","A2",180,34000,["airport","travel"]),
  v("dc6","YQHsXMglC9A","Daily English Conversation - Shopping","Youtube","US","Daily English Conversation","A1",240,28000,["shopping","beginner"]),

  // Learning resources
  v("lr1","dQw4w9WgXcQ","Day By Day - one minute phrase lesson (series #46) | Learn English - Mark Kulek","Youtube","US","Learning resources","A2",112,20435,["phrases","daily"]),
  v("lr2","9bZkp7q19f0","9 Ways to Ask for Help in English","Youtube","US","Learning resources","B1",169,17219,["phrases","help"],true),
  v("lr3","kJQP7kiw5Fk","How to Improve Spelling","Youtube","US","Learning resources","B1",296,20229,["spelling","writing"]),
  v("lr4","YQHsXMglC9A","How to Pronounce RESUME & RESUME - American English Heteronym","Youtube","US","Learning resources","B1",115,9718,["pronunciation","vocabulary"]),
  v("lr5","LIfIFAMnJA0","5 Common English Mistakes","Youtube","US","Learning resources","A2",180,45000,["mistakes","grammar"]),
  v("lr6","Yt5pBMFBMkA","English Idioms in Daily Life","Youtube","US","Learning resources","B2",240,32000,["idioms","advanced"]),

  // Listening Time (Shadowing)
  v("ls1","56UR3e3LHKY","A1 English Listening Practice - Homes","Youtube","US","Listening Time (Shadowing)","B1",270,23466,["listening","shadowing"]),
  v("ls2","nfWlot6h_JM","A1 English Listening Practice - Soccer","Youtube","US","Listening Time (Shadowing)","B1",282,9441,["listening","sports"]),
  v("ls3","_OBlgSz8sSM","A1 English Listening Practice - Supermarket","Youtube","US","Listening Time (Shadowing)","A2",277,14554,["listening","shopping"],true),
  v("ls4","9bZkp7q19f0","A1 English Listening Practice - Technology","Youtube","US","Listening Time (Shadowing)","B1",278,11075,["listening","tech"]),
  v("ls5","kJQP7kiw5Fk","English Listening Practice - Daily Routine","Youtube","US","Listening Time (Shadowing)","A2",300,18000,["listening","daily"]),

  // IELTS Listening
  v("il1","dQw4w9WgXcQ","Cam 20 Test 1 Part 1","Audio","US","IELTS Listening","B2",501,25394,["ielts","test"]),
  v("il2","9bZkp7q19f0","Cam 20 Test 1 Part 2","Audio","US","IELTS Listening","B1",514,21795,["ielts","test"]),
  v("il3","kJQP7kiw5Fk","Cam 20 Test 1 Part 3","Audio","US","IELTS Listening","B1",479,9641,["ielts","test"],true),
  v("il4","YQHsXMglC9A","Cam 20 Test 1 Part 4","Audio","US","IELTS Listening","B1",472,16766,["ielts","test"]),
  v("il5","LIfIFAMnJA0","IELTS Listening Practice Test 2024","Audio","US","IELTS Listening","B2",600,30000,["ielts","practice"]),

  // US UK songs
  v("sg1","LIfIFAMnJA0","Alan Walker - Faded","Youtube","US","US UK songs","B1",213,8287,["music","pop"],true),
  v("sg2","Yt5pBMFBMkA","Alan Walker - The Spectre","Youtube","US","US UK songs","B1",207,2769,["music","pop"]),
  v("sg3","_gab_UBcMnU","Passenger | Let Her Go","Youtube","UK","US UK songs","A2",255,22168,["music","pop"]),
  v("sg4","puX8dvlyOd4","See You Again - Wiz Khalifa, Charlie Puth","Youtube","US","US UK songs","B1",238,17658,["music","pop"],true),
  v("sg5","hA6hldpSTF8","Shape of You - Ed Sheeran","Youtube","UK","US UK songs","B1",234,45000,["music","pop"]),
  v("sg6","d9MyW72ELq0","Counting Stars - OneRepublic","Youtube","US","US UK songs","B2",257,28000,["music","pop"]),

  // TOEIC Listening
  v("tl1","56UR3e3LHKY","First-Class Upgrade Perks","Audio","US","TOEIC Listening","B1",55,16377,["toeic","business"]),
  v("tl2","nfWlot6h_JM","Sarah's Sales Success: MVP Debate","Audio","US","TOEIC Listening","B1",84,15937,["toeic","business"]),
  v("tl3","_OBlgSz8sSM","Holiday Shipping Hustle","Audio","US","TOEIC Listening","B1",53,12030,["toeic","business"],true),
  v("tl4","9bZkp7q19f0","Investing in Stocks: A Long-Term Strategy","Audio","US","TOEIC Listening","B1",67,11170,["toeic","finance"]),
  v("tl5","kJQP7kiw5Fk","TOEIC Part 1 - Photo Description","Audio","US","TOEIC Listening","B1",120,20000,["toeic","photo"]),

  // Entertainment
  v("en1","dQw4w9WgXcQ","Discover Tet: Exploring Vietnam's Lunar New Year Traditions","Youtube","VN","Entertainment","B2",186,4125,["culture","vietnam"],true),
  v("en2","9bZkp7q19f0","Nothing Beats a Jet2holiday","Youtube","UK","Entertainment","A2",31,15589,["travel","fun"]),
  v("en3","kJQP7kiw5Fk","Cardi B appeared in court, answered questions like rap","Youtube","US","Entertainment","B1",148,12511,["celebrity","news"]),
  v("en4","YQHsXMglC9A","Robert Downey Jr. speech at the Chris Hemsworth Hollywood Walk of Fame","Youtube","US","Entertainment","B1",195,5934,["celebrity","speech"]),

  // BBC learning english
  v("bb1","LIfIFAMnJA0","Morning routine: Phrasal verbs with Georgie","Youtube","UK","BBC learning english","B2",154,3817,["phrasal verbs","bbc"]),
  v("bb2","Yt5pBMFBMkA","4 slang words: English in a Minute","Youtube","UK","BBC learning english","B1",57,13032,["slang","bbc"],true),
  v("bb3","_gab_UBcMnU","Phrasal Verbs for Travel","Youtube","UK","BBC learning english","B1",128,7267,["phrasal verbs","travel"],true),
  v("bb4","puX8dvlyOd4","'Bored' and 'boring' - Learners' Questions","Youtube","UK","BBC learning english","B1",137,8812,["adjectives","bbc"]),

  // VOA Learning English
  v("vl1","56UR3e3LHKY","English in a Minute: Pack Rat","Youtube","US","VOA Learning English","A2",60,14757,["idiom","voa"]),
  v("vl2","nfWlot6h_JM","English in a Minute: Zone Out","Youtube","US","VOA Learning English","A2",60,4224,["idiom","voa"]),
  v("vl3","_OBlgSz8sSM","The Economics Report: New Clothing Manufacturing Jobs","Youtube","US","VOA Learning English","B1",193,15985,["news","economics"]),
  v("vl4","9bZkp7q19f0","English in a Minute: Play Up","Youtube","US","VOA Learning English","A2",60,8344,["idiom","voa"],true),

  // Toefl Listening
  v("tf1","kJQP7kiw5Fk","The Amazing Waggle Dance of Bees","Audio","US","Toefl Listening","C1",300,10565,["toefl","science"],true),
  v("tf2","YQHsXMglC9A","Fads vs. Trends: Spotting the Difference","Audio","US","Toefl Listening","B2",300,10457,["toefl","social"]),
  v("tf3","LIfIFAMnJA0","The Amazing Waggle Dance of Bees","Audio","US","Toefl Listening","B1",300,3582,["toefl","science"]),
  v("tf4","Yt5pBMFBMkA","Rethinking Women's Roles in US History","Audio","US","Toefl Listening","B2",307,11046,["toefl","history"]),

  // Science and Facts
  v("sf1","_gab_UBcMnU","Where did Halloween Come From?","Youtube","US","Science and Facts","B2",116,7402,["history","culture"]),
  v("sf2","puX8dvlyOd4","Inside your Body when you Drink Coffee","Youtube","US","Science and Facts","B1",136,14286,["science","health"],true),
  v("sf3","hA6hldpSTF8","How To Wake Up Better","Youtube","US","Science and Facts","B1",133,9535,["health","tips"]),
  v("sf4","d9MyW72ELq0","What to Do on a First Date","Youtube","US","Science and Facts","B1",265,11963,["social","tips"]),

  // Fairy Tales
  v("ft1","56UR3e3LHKY","The Goose That Laid Golden Eggs | Bedtime Moral Story For Kids","Youtube","US","Fairy Tales","B1",84,14241,["story","kids"]),
  v("ft2","nfWlot6h_JM","Jack and the beanstalk - Kids Stories","Youtube","US","Fairy Tales","A2",205,8258,["story","kids"]),
  v("ft3","_OBlgSz8sSM","Story for Children | The Wolf and The Lean Dog","Youtube","US","Fairy Tales","B1",191,5367,["story","kids"],true),
  v("ft4","9bZkp7q19f0","Thanksgiving Story for Kids - The First Thanksgiving","Youtube","US","Fairy Tales","B1",204,11223,["story","holiday"]),

  // IPA
  v("ip1","kJQP7kiw5Fk","Learn Phonetics (IPA) In under 5 minutes","Youtube","US","IPA","A1",353,34907,["ipa","phonetics"]),
  v("ip2","YQHsXMglC9A","Consonant 20 - /h/","Youtube","UK","IPA","A2",518,25394,["ipa","consonant"]),
  v("ip3","LIfIFAMnJA0","Consonant 21 - /j/","Youtube","UK","IPA","A2",518,5006,["ipa","consonant"]),
  v("ip4","Yt5pBMFBMkA","Consonant 23 - /w/","Youtube","UK","IPA","A2",628,10271,["ipa","consonant"]),

  // News
  v("nw1","_gab_UBcMnU","This Could be the Most Expensive instrument Ever","Youtube","US","News","B1",90,16142,["news","culture"]),
  v("nw2","puX8dvlyOd4","TikTok Helps Author Become Bestseller","Youtube","US","News","B1",106,11281,["news","tech"],true),
  v("nw3","hA6hldpSTF8","Pub Becomes a 'Cheers' for People With Dementia","Youtube","UK","News","B1",91,8623,["news","health"]),
  v("nw4","d9MyW72ELq0","Little Girl Undergoes 8 Heart Surgeries","Youtube","US","News","B1",61,10652,["news","health"]),

  // Vietnam Today
  v("vt1","56UR3e3LHKY","Vietnam edge South Korea in shootout for AFC U23 bronze","Youtube","VN","Vietnam Today","B2",79,11366,["vietnam","sports"]),
  v("vt2","nfWlot6h_JM","New Year 2026 around the world | Vietnam Today","Youtube","VN","Vietnam Today","B2",114,10404,["vietnam","news"]),
  v("vt3","_OBlgSz8sSM","New York welcomes the New Year's Eve ball | Vietnam Today","Youtube","VN","Vietnam Today","B1",132,13887,["vietnam","news"]),
  v("vt4","9bZkp7q19f0","Hanoi during Christmas | Vietnam Today","Youtube","VN","Vietnam Today","B1",134,11640,["vietnam","culture"]),

  // TED
  v("td1","kJQP7kiw5Fk","What are those floaty things in your eye?","Youtube","US","TED","C1",245,5120,["ted","science"]),
  v("td2","YQHsXMglC9A","How to recognize a dystopia","Youtube","US","TED","B2",358,14257,["ted","society"]),
  v("td3","LIfIFAMnJA0","How the world's tallest skyscraper was built","Youtube","US","TED","C1",368,12628,["ted","engineering"],true),
  v("td4","Yt5pBMFBMkA","These animals can hear everything","Youtube","US","TED","C1",326,16281,["ted","animals"]),

  // Travel vlog
  v("tv1","_gab_UBcMnU","18 Awe-Inspiring Things To Do in ICELAND","Youtube","US","Travel vlog","B1",208,11168,["travel","iceland"],true),
  v("tv2","puX8dvlyOd4","Tokyo, Japan: Harajuku Tokyo - Takeshita Street","Youtube","JP","Travel vlog","B1",62,10294,["travel","japan"]),
  v("tv3","hA6hldpSTF8","Tokyo, Japan: Old Tokyo - Asakusa & Senso-Ji","Youtube","JP","Travel vlog","B1",82,10098,["travel","japan"]),
  v("tv4","d9MyW72ELq0","Oahu Hawaii Top Things To Do | Viator Travel Guide","Youtube","US","Travel vlog","B2",167,9333,["travel","hawaii"]),

  // Animals and wildlife
  v("aw1","56UR3e3LHKY","Mass Crocodile Hatching","Youtube","US","Animals and wildlife","B2",179,6763,["animals","nature"]),
  v("aw2","nfWlot6h_JM","Otter Moms Wrap Their Babies in Seaweed Blankets","Youtube","US","Animals and wildlife","B1",189,5900,["animals","cute"]),
  v("aw3","_OBlgSz8sSM","Baby Penguin Tries To Make Friends","Youtube","US","Animals and wildlife","B2",263,8573,["animals","cute"],true),
  v("aw4","9bZkp7q19f0","Honey Buzzards Feast on Deadly Hornets","Youtube","UK","Animals and wildlife","B2",197,2965,["animals","nature"]),

  // Business English
  v("be1","kJQP7kiw5Fk","Top 6 Tips For Your Cover Letter","Youtube","US","Business English","B2",80,18055,["business","career"]),
  v("be2","YQHsXMglC9A","8 Types of People That Managers HATE To Interview","Youtube","US","Business English","B2",195,6620,["business","interview"]),
  v("be3","LIfIFAMnJA0","If Job Interviews Were Honest","Youtube","US","Business English","B2",148,4419,["business","humor"]),
  v("be4","Yt5pBMFBMkA","Job Interview Question: What Is Your Greatest Strength?","Youtube","US","Business English","A2",38,14058,["business","interview"],true),
];

export const CATEGORIES = [
  "Movie short clip","Daily English Conversation","Learning resources",
  "Listening Time (Shadowing)","IELTS Listening","US UK songs","TOEIC Listening",
  "Entertainment","BBC learning english","VOA Learning English","Toefl Listening",
  "Science and Facts","Fairy Tales","IPA","News","Vietnam Today","TED",
  "Travel vlog","Animals and wildlife","Business English",
];
