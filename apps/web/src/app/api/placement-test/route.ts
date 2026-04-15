import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { answers, targetLanguage, nativeLanguage } = await req.json();

    // answers: [{question, userAnswer, correctAnswer, type}]
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Analyze these ${targetLanguage} placement test answers from a learner (native: ${nativeLanguage}):

${answers.map((a: any, i: number) => `Q${i+1}: ${a.question}\nUser: ${a.userAnswer}\nCorrect: ${a.correctAnswer}`).join("\n\n")}

Determine their level and create a personalized roadmap. Return JSON:
{
  "level": "A1|A2|B1|B2|C1|C2",
  "score": 0-100,
  "strengths": ["strength 1 in ${nativeLanguage}", "strength 2"],
  "weaknesses": ["weakness 1 in ${nativeLanguage}", "weakness 2"],
  "roadmap": [
    {
      "week": 1,
      "focus": "main focus area",
      "goals": ["goal 1 in ${nativeLanguage}", "goal 2"],
      "activities": ["activity 1", "activity 2", "activity 3"],
      "estimatedHours": 5
    }
  ],
  "recommendedCourses": ["course name 1", "course name 2"],
  "dailyPlan": {
    "morning": "5-min morning activity in ${nativeLanguage}",
    "afternoon": "10-min afternoon activity",
    "evening": "15-min evening activity"
  },
  "motivationalMessage": "personalized message in ${nativeLanguage}"
}`
      }],
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
