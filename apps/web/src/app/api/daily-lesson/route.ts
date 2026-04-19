import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 60;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { theme, focus, targetLanguage, nativeLanguage, level, goal } = await req.json();

    const isNonLatin = ["Chinese", "Japanese", "Korean", "Arabic", "Thai", "Hindi"].some(l => targetLanguage.includes(l));

    const systemMsg = `You are a ${targetLanguage} language teacher for ${nativeLanguage} speakers.
ABSOLUTE RULES — never break these:
1. All ${targetLanguage} content (vocabulary words, example sentences, listening text, quiz options, grammar examples) MUST be written in ${targetLanguage} only — correct, natural ${targetLanguage}.
2. All explanations, translations, tips, instructions MUST be in ${nativeLanguage} only — correct, natural ${nativeLanguage}.
3. NEVER mix languages within a single field.
4. NEVER write fake or nonsense text. Every sentence must be grammatically correct.
5. listeningText MUST be a real, natural ${targetLanguage} paragraph — NOT ${nativeLanguage}.
6. speakingPrompt is an instruction in ${nativeLanguage} telling the user what to say in ${targetLanguage}.`;

    const userMsg = `Generate a ${targetLanguage} lesson. Level: ${level}. Theme: "${theme}". Focus: ${focus}. Goal: ${goal}.
${isNonLatin ? `IMPORTANT: vocabulary "word" field must use ${targetLanguage} script (e.g. 你好, こんにちは, 안녕하세요). Put romanization separately.` : ""}

Return JSON with these exact fields:
{
  "warmup": "short motivational message in ${nativeLanguage}",
  "vocabulary": [{"word":"${targetLanguage} word","romanization":"${isNonLatin ? "romanization" : ""}","translation":"${nativeLanguage} meaning","example":"${targetLanguage} sentence","tip":"${nativeLanguage} memory tip"}],
  "grammarPoint": {"rule":"rule name","explanation":"${nativeLanguage} explanation","examples":["${targetLanguage} sentence 1","${targetLanguage} sentence 2"]},
  "speakingPrompt": "${nativeLanguage} instruction telling user what to say in ${targetLanguage}",
  "listeningText": "2-3 sentence ${targetLanguage} paragraph",
  "listeningTranslation": "${nativeLanguage} translation of the paragraph",
  "quiz": [{"question":"${nativeLanguage} question about ${targetLanguage}","options":["${targetLanguage} A","${targetLanguage} B","${targetLanguage} C","${targetLanguage} D"],"correct":0,"explanation":"${nativeLanguage} why"}],
  "dailyChallenge": "${nativeLanguage} description of a fun ${targetLanguage} challenge"
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 1500,
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
