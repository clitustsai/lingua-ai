import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 60;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { level, section, answers } = await req.json();

  const prompt = `You are an English language examiner. Grade this ${level} level exam section: "${section}".

Student answers: ${JSON.stringify(answers)}

Return JSON only:
{
  "score": <0-100>,
  "grade": "<A/B/C/D/F>",
  "passed": <true if score >= 60>,
  "feedback": "<2-3 sentences of specific feedback in Vietnamese>",
  "corrections": [{"question": "...", "studentAnswer": "...", "correct": "...", "explanation": "..."}]
}`;

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const data = JSON.parse(res.choices[0].message.content || "{}");
  return NextResponse.json(data);
}
