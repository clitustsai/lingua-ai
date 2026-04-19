import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 60;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic, targetLanguage, nativeLanguage, level } = await req.json();

    const prompt = `Create a language lesson for: "${topic}"
Student: ${level} level, learning ${targetLanguage}, native language: ${nativeLanguage}

CRITICAL LANGUAGE RULES — follow exactly:
- "title": in ${nativeLanguage}
- "description": in ${nativeLanguage}
- "tags": in ${nativeLanguage}
- "questions[].question": MUST be in ${targetLanguage} (the language being learned)
- "questions[].tip": in ${nativeLanguage}
- "sampleAnswers[].question": in ${targetLanguage}
- "sampleAnswers[].answer": MUST be in ${targetLanguage} — full natural sentences
- "sampleAnswers[].keyPhrases": in ${targetLanguage}
- "vocabulary[].word": in ${targetLanguage}
- "vocabulary[].meaning": in ${nativeLanguage}
- "vocabulary[].example": in ${targetLanguage}
- "grammarTips": in ${nativeLanguage}

Return ONLY valid JSON:
{
  "title": "lesson title in ${nativeLanguage}",
  "description": "brief description in ${nativeLanguage}",
  "tags": ["tag1 in ${nativeLanguage}", "tag2", "tag3"],
  "questions": [
    {"question": "practice question in ${targetLanguage}", "tip": "hint in ${nativeLanguage}"}
  ],
  "sampleAnswers": [
    {
      "question": "the question in ${targetLanguage}",
      "answer": "full sample answer in ${targetLanguage} (2-3 natural sentences)",
      "keyPhrases": ["key phrase in ${targetLanguage}", "phrase 2"]
    }
  ],
  "vocabulary": [
    {"word": "word in ${targetLanguage}", "meaning": "meaning in ${nativeLanguage}", "example": "example sentence in ${targetLanguage}"}
  ],
  "grammarTips": ["grammar tip in ${nativeLanguage}", "tip 2"]
}

Create 4 questions with sample answers. Include 6-8 vocabulary words.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 2500,
    });

    const raw = completion.choices[0].message.content || "{}";
    let result: any = {};
    try { result = JSON.parse(raw); } catch { result = {}; }

    if (!result.questions && !result.vocabulary) {
      return NextResponse.json({ error: "AI không tạo được bài học" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (e: any) {
    console.error("generate-lesson error:", e?.message);
    const msg = String(e?.message ?? "");
    if (msg.includes("429")) return NextResponse.json({ error: "AI đang bận, thử lại sau 1 phút." }, { status: 429 });
    return NextResponse.json({ error: "Không thể tạo bài học. Thử lại nhé!" }, { status: 500 });
  }
}
