import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 60;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic, targetLanguage, nativeLanguage, level } = await req.json();

    const systemMsg = `You are a ${targetLanguage} language teacher for ${nativeLanguage} speakers.
ABSOLUTE RULES:
1. questions[].question → MUST be in ${targetLanguage} only (real, correct ${targetLanguage})
2. sampleAnswers[].answer → MUST be in ${targetLanguage} only (natural, fluent ${targetLanguage})
3. sampleAnswers[].keyPhrases → in ${targetLanguage} only
4. vocabulary[].word → in ${targetLanguage} only
5. vocabulary[].example → in ${targetLanguage} only
6. title, description, tags, questions[].tip, vocabulary[].meaning, grammarTips → in ${nativeLanguage} only
7. NEVER write nonsense or mix languages within a field.`;

    const prompt = `Create a ${targetLanguage} lesson for topic: "${topic}". Level: ${level}.

Return JSON:
{
  "title": "${nativeLanguage} lesson title",
  "description": "${nativeLanguage} description",
  "tags": ["${nativeLanguage} tag1", "tag2"],
  "questions": [{"question": "${targetLanguage} question", "tip": "${nativeLanguage} hint"}],
  "sampleAnswers": [{"question": "${targetLanguage} question", "answer": "${targetLanguage} 2-3 sentence answer", "keyPhrases": ["${targetLanguage} phrase"]}],
  "vocabulary": [{"word": "${targetLanguage} word", "meaning": "${nativeLanguage} meaning", "example": "${targetLanguage} sentence"}],
  "grammarTips": ["${nativeLanguage} grammar tip"]
}
4 questions, 6-8 vocabulary words.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 2000,
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
