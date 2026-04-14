import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { goal, level, targetLanguage, nativeLanguage, daysPerWeek } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Create a personalized 7-day ${targetLanguage} learning path for a ${level} learner.
Goal: ${goal}
Native language: ${nativeLanguage}
Study days per week: ${daysPerWeek}

Return JSON:
{
  "pathTitle": "catchy title for this learning path",
  "description": "brief description in ${nativeLanguage}",
  "estimatedWeeks": 8,
  "dailyMinutes": 20,
  "days": [
    {
      "day": 1,
      "theme": "day theme",
      "focus": "vocabulary/grammar/speaking/listening",
      "vocabulary": [
        {"word": "", "translation": "", "example": ""}
      ],
      "grammarTip": "one grammar tip in ${nativeLanguage}",
      "speakingTask": "speaking task description in ${nativeLanguage}",
      "miniQuiz": [
        {"question": "", "options": ["","","",""], "correct": 0}
      ]
    }
  ],
  "milestones": [
    {"week": 2, "goal": "milestone description in ${nativeLanguage}"},
    {"week": 4, "goal": "milestone description"},
    {"week": 8, "goal": "final milestone"}
  ]
}`
      }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate path" }, { status: 500 });
  }
}
