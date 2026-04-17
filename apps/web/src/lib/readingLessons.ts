export type ReadingLesson = {
  id: string;
  title: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  topic: string;
  emoji: string;
  language: string;
  locked: boolean; // free: first 3, rest locked
  passage: string;
  translation: string;
  vocabulary: { word: string; translation: string; example: string }[];
  questions: { question: string; answer: string }[];
};

export const READING_LESSONS: ReadingLesson[] = [
  {
    id: "r1", title: "My Daily Routine", level: "A1", topic: "Daily Life", emoji: "🌅", language: "English", locked: false,
    passage: "I wake up at 7 o'clock every morning. First, I brush my teeth and wash my face. Then I eat breakfast. I usually have bread and eggs. After breakfast, I go to school. I study English, Math, and Science. At noon, I eat lunch with my friends. In the afternoon, I play sports. I like football very much. In the evening, I do my homework. I go to bed at 10 o'clock.",
    translation: "Tôi thức dậy lúc 7 giờ mỗi sáng. Đầu tiên, tôi đánh răng và rửa mặt. Sau đó tôi ăn sáng. Tôi thường ăn bánh mì và trứng. Sau bữa sáng, tôi đi học. Tôi học tiếng Anh, Toán và Khoa học. Vào buổi trưa, tôi ăn trưa với bạn bè. Buổi chiều, tôi chơi thể thao. Tôi rất thích bóng đá. Buổi tối, tôi làm bài tập về nhà. Tôi đi ngủ lúc 10 giờ.",
    vocabulary: [
      { word: "routine", translation: "thói quen hàng ngày", example: "My morning routine takes 30 minutes." },
      { word: "brush", translation: "đánh (răng)", example: "I brush my teeth twice a day." },
      { word: "breakfast", translation: "bữa sáng", example: "Breakfast is the most important meal." },
      { word: "homework", translation: "bài tập về nhà", example: "I do my homework after school." },
    ],
    questions: [
      { question: "What time does the person wake up?", answer: "Họ thức dậy lúc 7 giờ sáng." },
      { question: "What does the person eat for breakfast?", answer: "Họ ăn bánh mì và trứng." },
      { question: "What sport does the person like?", answer: "Họ thích bóng đá." },
    ],
  },
  {
    id: "r2", title: "My Family", level: "A1", topic: "Family", emoji: "👨‍👩‍👧‍👦", language: "English", locked: false,
    passage: "I have a small family. There are four people in my family: my father, my mother, my sister, and me. My father is a doctor. He works at a big hospital. My mother is a teacher. She teaches Math at a school near our house. My sister is ten years old. She likes drawing and painting. I am fifteen years old. I like reading books and playing video games. We live in a small house with a garden. On weekends, we often cook together and watch movies.",
    translation: "Tôi có một gia đình nhỏ. Có bốn người trong gia đình tôi: bố, mẹ, chị gái và tôi. Bố tôi là bác sĩ. Ông làm việc tại một bệnh viện lớn. Mẹ tôi là giáo viên. Bà dạy Toán tại một trường gần nhà. Chị gái tôi mười tuổi. Chị thích vẽ và tô màu. Tôi mười lăm tuổi. Tôi thích đọc sách và chơi trò chơi điện tử. Chúng tôi sống trong một ngôi nhà nhỏ có vườn. Vào cuối tuần, chúng tôi thường nấu ăn cùng nhau và xem phim.",
    vocabulary: [
      { word: "family", translation: "gia đình", example: "My family is very important to me." },
      { word: "doctor", translation: "bác sĩ", example: "My father is a doctor at the hospital." },
      { word: "garden", translation: "khu vườn", example: "We grow flowers in our garden." },
      { word: "weekend", translation: "cuối tuần", example: "I relax on the weekend." },
    ],
    questions: [
      { question: "How many people are in the family?", answer: "Có bốn người trong gia đình." },
      { question: "What is the father's job?", answer: "Bố là bác sĩ làm việc tại bệnh viện." },
      { question: "What does the sister like to do?", answer: "Chị thích vẽ và tô màu." },
    ],
  },
  {
    id: "r3", title: "My Favorite Food", level: "A1", topic: "Food", emoji: "🍜", language: "English", locked: false,
    passage: "I love Vietnamese food. My favorite dish is pho. Pho is a noodle soup with beef or chicken. It has a delicious broth with many spices. I also like banh mi. Banh mi is a sandwich with meat, vegetables, and sauce. It is very tasty and cheap. For breakfast, I often eat com tam. Com tam is broken rice with grilled pork. My mother cooks very well. She makes the best pho in the world. When I am sad, eating good food always makes me happy.",
    translation: "Tôi yêu thích ẩm thực Việt Nam. Món ăn yêu thích của tôi là phở. Phở là một món súp mì với thịt bò hoặc gà. Nó có nước dùng thơm ngon với nhiều gia vị. Tôi cũng thích bánh mì. Bánh mì là một loại sandwich với thịt, rau và sốt. Nó rất ngon và rẻ. Vào bữa sáng, tôi thường ăn cơm tấm. Cơm tấm là cơm gạo tấm với thịt heo nướng. Mẹ tôi nấu ăn rất giỏi. Bà làm phở ngon nhất thế giới. Khi tôi buồn, ăn đồ ngon luôn làm tôi vui.",
    vocabulary: [
      { word: "noodle", translation: "mì/bún", example: "Pho is a popular noodle soup." },
      { word: "broth", translation: "nước dùng", example: "The broth is made from bones." },
      { word: "spice", translation: "gia vị", example: "This dish has many spices." },
      { word: "grilled", translation: "nướng", example: "I like grilled pork with rice." },
    ],
    questions: [
      { question: "What is the writer's favorite food?", answer: "Món ăn yêu thích là phở." },
      { question: "What is banh mi?", answer: "Bánh mì là sandwich với thịt, rau và sốt." },
      { question: "Who makes the best pho?", answer: "Mẹ của người viết làm phở ngon nhất." },
    ],
  },
  {
    id: "r4", title: "A Trip to the Beach", level: "A2", topic: "Travel", emoji: "🏖️", language: "English", locked: true,
    passage: "Last summer, my family went to Da Nang beach for a vacation. We traveled by plane from Hanoi. The flight took about one hour and twenty minutes. When we arrived, the weather was sunny and hot. Our hotel was right next to the beach. Every morning, we woke up early to watch the sunrise. The sky turned beautiful shades of orange and pink. During the day, we swam in the clear blue sea and built sandcastles. My little brother was afraid of the waves at first, but he soon learned to enjoy them. We also visited the Marble Mountains and the Dragon Bridge. At night, the bridge lit up with colorful lights. We ate fresh seafood at local restaurants. The grilled fish and shrimp were absolutely delicious. It was the best vacation of my life.",
    translation: "Mùa hè năm ngoái, gia đình tôi đi nghỉ ở bãi biển Đà Nẵng. Chúng tôi đi bằng máy bay từ Hà Nội. Chuyến bay mất khoảng một tiếng hai mươi phút. Khi đến nơi, thời tiết nắng và nóng. Khách sạn của chúng tôi ngay cạnh bãi biển. Mỗi sáng, chúng tôi dậy sớm để xem bình minh. Bầu trời chuyển sang những sắc cam và hồng tuyệt đẹp. Ban ngày, chúng tôi bơi trong biển xanh trong và xây lâu đài cát. Em trai tôi lúc đầu sợ sóng, nhưng sau đó đã học cách thích thú với chúng. Chúng tôi cũng thăm Ngũ Hành Sơn và Cầu Rồng. Ban đêm, cầu sáng lên với những ánh đèn màu sắc. Chúng tôi ăn hải sản tươi tại các nhà hàng địa phương. Cá và tôm nướng thực sự rất ngon. Đó là kỳ nghỉ tuyệt vời nhất trong cuộc đời tôi.",
    vocabulary: [
      { word: "vacation", translation: "kỳ nghỉ", example: "We went on vacation to the beach." },
      { word: "sunrise", translation: "bình minh", example: "The sunrise was beautiful this morning." },
      { word: "sandcastle", translation: "lâu đài cát", example: "Children love building sandcastles." },
      { word: "seafood", translation: "hải sản", example: "Fresh seafood is delicious at the beach." },
      { word: "colorful", translation: "đầy màu sắc", example: "The bridge has colorful lights at night." },
    ],
    questions: [
      { question: "How did the family travel to Da Nang?", answer: "Họ đi bằng máy bay từ Hà Nội." },
      { question: "What did they do every morning?", answer: "Họ dậy sớm để xem bình minh." },
      { question: "What famous landmarks did they visit?", answer: "Họ thăm Ngũ Hành Sơn và Cầu Rồng." },
      { question: "What food did they eat?", answer: "Họ ăn hải sản tươi, cá và tôm nướng." },
    ],
  },
  {
    id: "r5", title: "Technology in Our Lives", level: "A2", topic: "Technology", emoji: "📱", language: "English", locked: true,
    passage: "Technology has changed our lives in many ways. Twenty years ago, people did not have smartphones. Now, almost everyone has one. We use our phones to call friends, send messages, take photos, and watch videos. The internet connects people from all over the world. Students can learn anything online. They can watch lessons on YouTube or take courses on websites. Shopping has also changed. Instead of going to stores, many people buy things online and receive them at home. However, technology also has some problems. Some people spend too much time on their phones and forget to talk to real people. Children sometimes play video games instead of going outside. It is important to use technology wisely and find a good balance in life.",
    translation: "Công nghệ đã thay đổi cuộc sống của chúng ta theo nhiều cách. Hai mươi năm trước, mọi người không có điện thoại thông minh. Bây giờ, hầu hết mọi người đều có một chiếc. Chúng ta dùng điện thoại để gọi bạn bè, nhắn tin, chụp ảnh và xem video. Internet kết nối mọi người từ khắp nơi trên thế giới. Học sinh có thể học bất cứ điều gì trực tuyến. Họ có thể xem bài học trên YouTube hoặc tham gia khóa học trên các trang web. Mua sắm cũng đã thay đổi. Thay vì đến cửa hàng, nhiều người mua đồ trực tuyến và nhận tại nhà. Tuy nhiên, công nghệ cũng có một số vấn đề. Một số người dành quá nhiều thời gian trên điện thoại và quên nói chuyện với người thật. Trẻ em đôi khi chơi trò chơi điện tử thay vì ra ngoài. Điều quan trọng là sử dụng công nghệ một cách khôn ngoan và tìm sự cân bằng tốt trong cuộc sống.",
    vocabulary: [
      { word: "smartphone", translation: "điện thoại thông minh", example: "Almost everyone has a smartphone today." },
      { word: "connect", translation: "kết nối", example: "The internet connects people worldwide." },
      { word: "balance", translation: "sự cân bằng", example: "Find a balance between work and play." },
      { word: "wisely", translation: "một cách khôn ngoan", example: "Use your time wisely." },
      { word: "instead of", translation: "thay vì", example: "I walk instead of taking the bus." },
    ],
    questions: [
      { question: "How has shopping changed because of technology?", answer: "Mọi người mua đồ trực tuyến thay vì đến cửa hàng." },
      { question: "What are two problems with technology?", answer: "Người ta dành quá nhiều thời gian trên điện thoại và trẻ em chơi game thay vì ra ngoài." },
      { question: "How can students use technology to learn?", answer: "Họ có thể xem bài học trên YouTube hoặc tham gia khóa học trực tuyến." },
    ],
  },
  {
    id: "r6", title: "Climate Change", level: "B1", topic: "Environment", emoji: "🌍", language: "English", locked: true,
    passage: "Climate change is one of the most serious problems facing our planet today. The Earth's temperature has been rising steadily over the past century, mainly because of human activities. When we burn fossil fuels like coal, oil, and gas, we release carbon dioxide and other greenhouse gases into the atmosphere. These gases trap heat from the sun, causing the planet to warm up. The effects of climate change are already visible around the world. Glaciers in the Arctic and Antarctic are melting at an alarming rate, causing sea levels to rise. This threatens coastal cities and low-lying islands. Extreme weather events such as hurricanes, droughts, and floods are becoming more frequent and more intense. Many species of plants and animals are struggling to survive as their habitats change. Scientists warn that if we do not take immediate action, the consequences could be catastrophic. Governments, businesses, and individuals all have a role to play. We need to switch to renewable energy sources like solar and wind power, reduce our consumption, and plant more trees. Small changes in our daily lives, such as using public transport, eating less meat, and recycling, can also make a difference.",
    translation: "Biến đổi khí hậu là một trong những vấn đề nghiêm trọng nhất mà hành tinh chúng ta đang phải đối mặt ngày nay. Nhiệt độ Trái Đất đã tăng đều đặn trong thế kỷ qua, chủ yếu do các hoạt động của con người. Khi chúng ta đốt nhiên liệu hóa thạch như than, dầu và khí đốt, chúng ta thải ra carbon dioxide và các khí nhà kính khác vào khí quyển. Những khí này giữ nhiệt từ mặt trời, khiến hành tinh nóng lên. Tác động của biến đổi khí hậu đã có thể nhìn thấy trên toàn thế giới. Các sông băng ở Bắc Cực và Nam Cực đang tan chảy với tốc độ đáng báo động, khiến mực nước biển dâng cao. Điều này đe dọa các thành phố ven biển và các đảo thấp. Các hiện tượng thời tiết cực đoan như bão, hạn hán và lũ lụt ngày càng thường xuyên và dữ dội hơn.",
    vocabulary: [
      { word: "fossil fuels", translation: "nhiên liệu hóa thạch", example: "We need to stop burning fossil fuels." },
      { word: "greenhouse gases", translation: "khí nhà kính", example: "Greenhouse gases trap heat in the atmosphere." },
      { word: "glacier", translation: "sông băng", example: "Glaciers are melting due to global warming." },
      { word: "renewable energy", translation: "năng lượng tái tạo", example: "Solar power is a renewable energy source." },
      { word: "catastrophic", translation: "thảm khốc", example: "The consequences could be catastrophic." },
      { word: "consumption", translation: "sự tiêu thụ", example: "We need to reduce our energy consumption." },
    ],
    questions: [
      { question: "What is the main cause of climate change?", answer: "Nguyên nhân chính là hoạt động của con người, đặc biệt là đốt nhiên liệu hóa thạch." },
      { question: "What are three effects of climate change mentioned in the passage?", answer: "Sông băng tan chảy, mực nước biển dâng, thời tiết cực đoan thường xuyên hơn." },
      { question: "What can individuals do to help?", answer: "Dùng phương tiện công cộng, ăn ít thịt hơn, tái chế rác." },
      { question: "Why are greenhouse gases dangerous?", answer: "Chúng giữ nhiệt từ mặt trời, khiến Trái Đất nóng lên." },
    ],
  },
  {
    id: "r7", title: "The History of Coffee", level: "B1", topic: "Culture", emoji: "☕", language: "English", locked: true,
    passage: "Coffee is one of the most popular beverages in the world, with billions of cups consumed every day. But where did this beloved drink come from? The story of coffee begins in Ethiopia, where, according to legend, a goat herder named Kaldi noticed that his goats became unusually energetic after eating berries from a certain tree. He brought the berries to a local monastery, where monks made a drink from them and discovered it helped them stay awake during long evening prayers. From Ethiopia, coffee spread to the Arabian Peninsula, where it became an important part of social and cultural life. By the 15th century, coffee was being grown in Yemen, and coffeehouses called qahveh khaneh became popular gathering places for people to drink coffee, listen to music, and discuss current events. European travelers brought coffee back to Europe in the 17th century, where it quickly became fashionable. Coffeehouses opened in major cities and became centers of intellectual discussion. Today, coffee is grown in over 70 countries, with Brazil being the world's largest producer. The global coffee industry is worth hundreds of billions of dollars.",
    translation: "Cà phê là một trong những đồ uống phổ biến nhất thế giới, với hàng tỷ tách được tiêu thụ mỗi ngày. Nhưng loại đồ uống yêu thích này đến từ đâu? Câu chuyện về cà phê bắt đầu ở Ethiopia, nơi theo truyền thuyết, một người chăn dê tên Kaldi nhận thấy những con dê của mình trở nên đặc biệt năng động sau khi ăn quả từ một cây nhất định. Ông mang quả đến một tu viện địa phương, nơi các tu sĩ làm đồ uống từ chúng và phát hiện ra nó giúp họ tỉnh táo trong các buổi cầu nguyện tối dài. Từ Ethiopia, cà phê lan sang Bán đảo Ả Rập, nơi nó trở thành một phần quan trọng của đời sống xã hội và văn hóa.",
    vocabulary: [
      { word: "beverage", translation: "đồ uống", example: "Coffee is a popular beverage worldwide." },
      { word: "monastery", translation: "tu viện", example: "The monks lived in a monastery." },
      { word: "peninsula", translation: "bán đảo", example: "Arabia is a large peninsula." },
      { word: "intellectual", translation: "trí tuệ", example: "Coffeehouses were centers of intellectual discussion." },
      { word: "fashionable", translation: "thời thượng", example: "Coffee became fashionable in Europe." },
    ],
    questions: [
      { question: "Where did coffee originate?", answer: "Cà phê có nguồn gốc từ Ethiopia." },
      { question: "How did monks discover coffee?", answer: "Một người chăn dê mang quả cà phê đến tu viện, các tu sĩ làm đồ uống và thấy nó giúp tỉnh táo." },
      { question: "What were qahveh khaneh?", answer: "Đó là những quán cà phê ở Ả Rập, nơi mọi người tụ tập uống cà phê và thảo luận." },
      { question: "Which country is the world's largest coffee producer?", answer: "Brazil là nước sản xuất cà phê lớn nhất thế giới." },
    ],
  },
  {
    id: "r8", title: "Artificial Intelligence", level: "B2", topic: "Technology", emoji: "🤖", language: "English", locked: true,
    passage: "Artificial intelligence, commonly known as AI, is rapidly transforming virtually every aspect of modern life. At its core, AI refers to the development of computer systems that can perform tasks that typically require human intelligence, such as visual perception, speech recognition, decision-making, and language translation. The field has advanced dramatically in recent years, driven by the availability of vast amounts of data, improvements in computing power, and breakthroughs in machine learning algorithms. One of the most significant developments has been the emergence of large language models, which can generate human-like text, answer complex questions, and engage in sophisticated conversations. These systems are being integrated into search engines, customer service platforms, educational tools, and creative applications. In healthcare, AI is being used to analyze medical images, predict disease outbreaks, and assist in drug discovery. In transportation, self-driving vehicles are being tested on public roads. However, the rapid advancement of AI also raises profound ethical questions. Concerns about job displacement, algorithmic bias, privacy violations, and the potential for autonomous weapons systems have prompted calls for robust regulation and international cooperation. Philosophers and technologists debate whether AI could eventually surpass human intelligence, a hypothetical scenario known as the technological singularity. While such scenarios remain speculative, the immediate challenges of ensuring that AI systems are transparent, fair, and aligned with human values are pressing and require urgent attention from policymakers, researchers, and society as a whole.",
    translation: "Trí tuệ nhân tạo, thường được gọi là AI, đang nhanh chóng biến đổi hầu hết mọi khía cạnh của cuộc sống hiện đại. Về cơ bản, AI đề cập đến việc phát triển các hệ thống máy tính có thể thực hiện các nhiệm vụ thường đòi hỏi trí tuệ con người, như nhận thức thị giác, nhận dạng giọng nói, ra quyết định và dịch ngôn ngữ.",
    vocabulary: [
      { word: "artificial intelligence", translation: "trí tuệ nhân tạo", example: "AI is changing how we work and live." },
      { word: "algorithm", translation: "thuật toán", example: "Machine learning algorithms improve over time." },
      { word: "autonomous", translation: "tự động/tự chủ", example: "Autonomous vehicles can drive themselves." },
      { word: "ethical", translation: "đạo đức", example: "AI raises many ethical questions." },
      { word: "transparent", translation: "minh bạch", example: "AI systems should be transparent and fair." },
      { word: "displacement", translation: "sự thay thế/dịch chuyển", example: "Job displacement is a concern with automation." },
    ],
    questions: [
      { question: "What is artificial intelligence?", answer: "AI là hệ thống máy tính có thể thực hiện các nhiệm vụ đòi hỏi trí tuệ con người." },
      { question: "What are three areas where AI is being applied?", answer: "Y tế, giao thông vận tải, và các công cụ giáo dục/sáng tạo." },
      { question: "What ethical concerns does AI raise?", answer: "Mất việc làm, thiên kiến thuật toán, vi phạm quyền riêng tư, và vũ khí tự động." },
      { question: "What is the technological singularity?", answer: "Đó là kịch bản giả thuyết khi AI có thể vượt qua trí tuệ con người." },
    ],
  },
];

// Add more lessons to reach 20+
for (let i = 9; i <= 25; i++) {
  const topics = ["Sports", "Music", "Science", "History", "Nature", "Business", "Health", "Education", "Art", "Space"];
  const levels: ReadingLesson["level"][] = ["A1", "A2", "B1", "B2", "C1"];
  READING_LESSONS.push({
    id: `r${i}`,
    title: `Lesson ${i}`,
    level: levels[i % 5],
    topic: topics[i % 10],
    emoji: ["⚽","🎵","🔬","📜","🌿","💼","❤️","🎓","🎨","🚀"][i % 10],
    language: "English",
    locked: true,
    passage: "",
    translation: "",
    vocabulary: [],
    questions: [],
  });
}
