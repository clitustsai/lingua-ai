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

CRITICAL LANGUAGE RULES:
- warmup → in ${nativeLanguage}
- vocabulary.word → in ${targetLanguage} (the language being learned)
- vocabulary.romanization → romanization/pinyin/furigana if non-Latin script
- vocabulary.translation → in ${nativeLanguage}
- vocabulary.example → MUST be in ${targetLanguage}
- vocabulary.tip → in ${nativeLanguage}
- grammarPoint.rule → name of the grammar rule (English ok)
- grammarPoint.explanation → in ${nativeLanguage}
- grammarPoint.examples → MUST be in ${targetLanguage} (real example sentences)
- speakingPrompt → in ${nativeLanguage} (instruction for user)
- listeningText → MUST be in ${targetLanguage} (the text to listen to)
- listeningTranslation → in ${nativeLanguage}
- quiz.question → in ${nativeLanguage} (asking about ${targetLanguage} content)
- quiz.options → MUST be in ${targetLanguage} (the answer choices are ${targetLanguage} words/phrases)
- quiz.explanation → in ${nativeLanguage}
- dailyChallenge → in ${nativeLanguage}

Return JSON:
{
  "warmup": "motivational quote in ${nativeLanguage}",
  "vocabulary": [
    {
      "word": "${isNonLatin ? "native script ONLY" : "the word in " + targetLanguage}",
      "romanization": "${isNonLatin ? "pinyin/furigana/romanization" : "null"}",
      "translation": "meaning in ${nativeLanguage}",
      "example": "example sentence in ${targetLanguage}",
      "tip": "memory tip in ${nativeLanguage}"
    }
  ],
  "grammarPoint": {
    "rule": "grammar rule name",
    "explanation": "explanation in ${nativeLanguage}",
    "examples": ["${targetLanguage} example 1", "${targetLanguage} example 2"]
  },
  "speakingPrompt": "speaking task instruction in ${nativeLanguage}",
  "listeningText": "short paragraph in ${targetLanguage} to read/listen",
  "listeningTranslation": "translation in ${nativeLanguage}",
  "quiz": [
    {
      "question": "question in ${nativeLanguage}",
      "options": ["${targetLanguage} option A", "${targetLanguage} option B", "${targetLanguage} option C", "${targetLanguage} option D"],
      "correct": 0,
      "explanation": "explanation in ${nativeLanguage}"
    }
  ],
  "dailyChallenge": "fun challenge description in ${nativeLanguage}"
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
