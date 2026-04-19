import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 30;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { question, grade, level, type, nativeLanguage } = await req.json();

    const prompt = `You are an English teacher helping a Vietnamese student solve English exercises.
Student grade: ${grade} (level: ${level}), exercise type: ${type}.
Explain everything in ${nativeLanguage}.

Exercise:
${question}

Return ONLY valid JSON:
{
  "answer": "the correct answer(s) clearly stated",
  "steps": ["step 1 explanation in ${nativeLanguage}", "step 2...", "step 3..."],
  "rule": "grammar rule or key concept in ${nativeLanguage} (null if not applicable)",
  "explanation": "detailed explanation in ${nativeLanguage} why this answer is correct",
  "tips": ["memory tip 1 in ${nativeLanguage}", "tip 2"]
}

Rules:
- Answer must be clear and direct
- Steps should be simple for ${grade} student
- Use ${nativeLanguage} for all explanations
- If multiple questions, answer all of them`;

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
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
