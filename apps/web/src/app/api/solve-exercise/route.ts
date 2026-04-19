import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 30;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { question, grade, level, type, nativeLanguage } = await req.json();

    const prompt = `You are an expert English teacher specializing in the Vietnamese national curriculum (Bộ Giáo dục và Đào tạo).
Student: ${grade} (CEFR level: ${level}), exercise type: ${type}.
Explain everything in ${nativeLanguage} (Vietnamese).

IMPORTANT RULES for Vietnamese curriculum:
- Use British English spelling (colour, favourite, programme) as per Vietnam's textbooks
- Grammar explanations must match Vietnam's English textbooks (Tiếng Anh ${grade})
- Be precise: if the answer is a specific word/phrase, state it clearly
- For multiple choice: identify the correct option letter AND explain why others are wrong
- For fill-in-the-blank: give the exact word(s) needed
- Tense rules must follow standard grammar as taught in Vietnamese schools

Exercise:
${question}

Return ONLY valid JSON:
{
  "answer": "the correct answer(s) clearly stated — include option letter for MCQ",
  "steps": ["step 1 in ${nativeLanguage}", "step 2...", "step 3..."],
  "rule": "grammar rule as taught in Vietnamese ${grade} textbook, in ${nativeLanguage} (null if not applicable)",
  "explanation": "detailed explanation in ${nativeLanguage} — why correct, why others wrong",
  "tips": ["memory tip 1 in ${nativeLanguage}", "tip 2"]
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const raw = completion.choices[0].message.content || "{}";
    let result: any = {};
    try { result = JSON.parse(raw); } catch { result = { answer: raw }; }

    return NextResponse.json({
      answer: result.answer || "Không thể giải bài này",
      steps: Array.isArray(result.steps) ? result.steps : [],
      rule: result.rule || null,
      explanation: result.explanation || null,
      tips: Array.isArray(result.tips) ? result.tips : [],
    });
  } catch (e: any) {
    console.error("solve-exercise error:", e?.message);
    const msg = String(e?.message ?? "");
    if (msg.includes("429")) return NextResponse.json({ error: "AI đang bận, thử lại sau 1 phút." }, { status: 429 });
    return NextResponse.json({ error: "Không thể giải bài. Thử lại nhé!" }, { status: 500 });
  }
}
