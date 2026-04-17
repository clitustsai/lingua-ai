import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 30;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { videoId, title, topic, targetLanguage, nativeLanguage, level, videoLanguage } = await req.json();

    // videoLanguage = ngôn ngữ của video (Chinese, Japanese, English...)
    // targetLanguage = ngôn ngữ user đang học (từ settings)
    // nativeLanguage = tiếng mẹ đẻ của user
    const lessonLang = videoLanguage || targetLanguage;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Create a complete language lesson for a video titled "${title}" about "${topic}".
The video teaches ${lessonLang}. The learner's level is ${level} and their native language is ${nativeLanguage}.

IMPORTANT RULES:
- "script", "keyPhrases", "vocabulary.word", "vocabulary.example", "grammar.examples" MUST be in ${lessonLang} (the language being taught)
- "scriptTranslation", "vocabulary.definition", "grammar.explanation", "grammar.tip", "quiz.question", "quiz.options", "quiz.explanation" should be in ${nativeLanguage} to help the learner understand
- Quiz questions should test comprehension of the ${lessonLang} content
- fillBlanks sentences must use ${lessonLang} words/characters

Return JSON:
{
  "script": "natural ${lessonLang} script 3-4 paragraphs teaching the topic clearly",
  "scriptTranslation": "full translation in ${nativeLanguage}",
  "quiz": [
    { "question": "question in ${nativeLanguage} testing ${lessonLang} content", "options": ["option A in ${lessonLang}","option B","option C","option D"], "correct": 0, "explanation": "brief explanation in ${nativeLanguage}" }
  ],
  "vocabulary": [
    { "word": "${lessonLang} word", "pronunciation": "[pronunciation/pinyin/romaji]", "partOfSpeech": "noun/verb/adj", "definition": "meaning in ${nativeLanguage}", "example": "example sentence in ${lessonLang}", "level": "A1/A2/B1/B2/C1" }
  ],
  "grammar": [
    { "point": "Grammar Point Name", "explanation": "explanation in ${nativeLanguage}", "examples": ["${lessonLang} example 1", "${lessonLang} example 2"], "tip": "memory tip in ${nativeLanguage}" }
  ],
  "fillBlanks": [
    { "sentence": "sentence with ___ blank in ${lessonLang}", "answer": "correct word in ${lessonLang}", "options": ["opt1","opt2","opt3","opt4"] }
  ],
  "keyPhrases": ["useful ${lessonLang} phrase 1", "useful ${lessonLang} phrase 2", "useful ${lessonLang} phrase 3", "useful ${lessonLang} phrase 4"]
}`
      }],
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
