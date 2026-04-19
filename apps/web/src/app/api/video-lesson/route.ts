import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 60;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { videoId, title, topic, targetLanguage, nativeLanguage, level, videoLanguage } = await req.json();

    const lessonLang = videoLanguage || targetLanguage;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `Create a language lesson for a video titled "${title}" about "${topic}".
The video teaches ${lessonLang}. Learner level: ${level}. Native language: ${nativeLanguage}.

RULES:
- script, keyPhrases, vocabulary.word, vocabulary.example, grammar.examples → in ${lessonLang}
- scriptTranslation, vocabulary.definition, grammar.explanation, grammar.tip, quiz questions/options/explanation → in ${nativeLanguage}

Return JSON (keep it concise):
{
  "script": "2-3 paragraph ${lessonLang} script teaching the topic",
  "scriptTranslation": "translation in ${nativeLanguage}",
  "keyPhrases": ["phrase1 in ${lessonLang}", "phrase2", "phrase3", "phrase4"],
  "quiz": [
    {"question": "question in ${nativeLanguage}", "options": ["A in ${lessonLang}","B","C","D"], "correct": 0, "explanation": "why in ${nativeLanguage}"}
  ],
  "vocabulary": [
    {"word": "${lessonLang} word", "pronunciation": "IPA or romanization", "partOfSpeech": "noun", "definition": "meaning in ${nativeLanguage}", "example": "sentence in ${lessonLang}"}
  ],
  "grammar": [
    {"point": "Grammar Point", "explanation": "in ${nativeLanguage}", "examples": ["${lessonLang} ex1", "ex2"], "tip": "tip in ${nativeLanguage}"}
  ],
  "fillBlanks": [
    {"sentence": "${lessonLang} sentence with ___ blank", "answer": "word", "options": ["opt1","opt2","opt3","opt4"]}
  ]
}`
      }],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 2000,
    });

    const raw = completion.choices[0].message.content || "{}";
    let result: any = {};
    try { result = JSON.parse(raw); } catch { result = {}; }

    // Validate result has content
    if (!result.script && !result.vocabulary) {
      return NextResponse.json({ error: "AI không tạo được nội dung. Thử lại nhé!" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (e: any) {
    console.error("[video-lesson]", e?.message);
    const msg = String(e?.message ?? "");
    if (msg.includes("429")) return NextResponse.json({ error: "AI đang bận, thử lại sau 1 phút." }, { status: 429 });
    return NextResponse.json({ error: "Không thể tải nội dung bài học. Thử lại nhé!" }, { status: 500 });
  }
}
