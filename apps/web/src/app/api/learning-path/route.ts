import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 30;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { goal, level, targetLanguage, nativeLanguage, daysPerWeek } = await req.json();

    const prompt = `Create a ${daysPerWeek}-day ${targetLanguage} learning path for a ${level} student (native: ${nativeLanguage}).
Goal: ${goal}

Return ONLY valid JSON:
{
  "pathTitle": "path title in ${nativeLanguage}",
  "description": "short description in ${nativeLanguage}",
  "estimatedWeeks": 4,
  "dailyMinutes": 20,
  "days": [
    { "day": 1, "theme": "lesson theme in ${nativeLanguage}", "focus": "vocabulary/grammar/speaking/listening/mixed" }
  ],
  "milestones": [
    { "week": 1, "goal": "milestone description in ${nativeLanguage}" }
  ]
}

Create exactly ${daysPerWeek} days. Each day has a different theme related to the goal.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const raw = completion.choices[0].message.content || "{}";
    let result: any = {};
    try { result = JSON.parse(raw); } catch { result = {}; }

    return NextResponse.json({
      pathTitle: result.pathTitle || `Lộ trình ${targetLanguage}`,
      description: result.description || "",
      estimatedWeeks: result.estimatedWeeks || 4,
      dailyMinutes: result.dailyMinutes || 20,
      days: Array.isArray(result.days) ? result.days : [],
      milestones: Array.isArray(result.milestones) ? result.milestones : [],
    });
  } catch (e: any) {
    console.error("learning-path error:", e?.message);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
