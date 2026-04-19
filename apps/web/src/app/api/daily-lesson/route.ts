import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 60;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { theme, focus, targetLanguage, nativeLanguage, level, goal } = await req.json();

    const isNonLatin = ["Chinese", "Japanese", "Korean", "Arabic", "Thai", "Hindi"].some(l => targetLanguage.includes(l));

    const vocabInstruction = isNonLatin
      ? `CRITICAL: "word" field MUST contain the native script characters (e.g. 你好 NOT "ni hao", 我叫 NOT "wo jiao", こんにちは NOT "konnichiwa"). Put romanization/pinyin/furigana in "romanization" field.`
      : `"word" field contains the actual word. "romanization" should be null.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `Generate today's ${targetLanguage} lesson for a ${level} learner.
Theme: "${theme}", Focus: ${focus}, Goal: ${goal}

${vocabInstruction}

Return JSON:
{
  "warmup": "fun fact or motivational quote in ${nativeLanguage}",
  "vocabulary": [
    {
      "word": "${isNonLatin ? "native script ONLY e.g. 你好 or こんにちは or 안녕하세요" : "the word itself"}",
      "romanization": "${isNonLatin ? "pinyin/furigana/romanization e.g. ni hao" : null}",
      "translation": "meaning in ${nativeLanguage}",
      "example": "example sentence in ${targetLanguage}",
      "tip": "memory tip in ${nativeLanguage}"
    }
  ],
  "grammarPoint": {"rule":"","explanation":"in ${nativeLanguage}","examples":["",""]},
  "speakingPrompt": "conversation prompt in ${nativeLanguage}",
  "listeningText": "short text in ${targetLanguage}",
  "listeningTranslation": "translation in ${nativeLanguage}",
  "quiz": [
    {"question":"","options":["","","",""],"correct":0,"explanation":"in ${nativeLanguage}"}
  ],
  "dailyChallenge": "one fun challenge in ${nativeLanguage}"
}`
      }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[daily-lesson]", error?.message);
    const msg = String(error?.message ?? "");
    if (msg.includes("429")) return NextResponse.json({ error: "AI đang bận, thử lại sau 1 phút." }, { status: 429 });
    return NextResponse.json({ error: "Không thể tải bài học. Thử lại nhé!" }, { status: 500 });
  }
}
