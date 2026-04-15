import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { action, targetLanguage, nativeLanguage, level, weakAreas, answers } = await req.json();

    if (action === "generate") {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `Create today's homework for a ${level} ${targetLanguage} learner (native: ${nativeLanguage}).
Weak areas to focus on: ${weakAreas?.join(", ") || "general"}.

Return JSON:
{
  "title": "Today's Homework",
  "estimatedMinutes": 10,
  "exercises": [
    {
      "id": "ex1",
      "type": "translate|fill-blank|reorder|multiple-choice|write",
      "instruction": "instruction in ${nativeLanguage}",
      "question": "the exercise question",
      "answer": "correct answer",
      "hint": "optional hint in ${nativeLanguage}",
      "points": 10,
      "options": ["for multiple-choice only"]
    }
  ],
  "totalPoints": 50,
  "focusSkill": "grammar|vocabulary|speaking|writing"
}`
        }],
        response_format: { type: "json_object" },
      });
      return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
    }

    if (action === "grade") {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{
          role: "user",
          content: `Grade these ${targetLanguage} homework answers for a ${level} learner (native: ${nativeLanguage}).

Answers: ${JSON.stringify(answers)}

Return JSON:
{
  "totalScore": 0-100,
  "grade": "A/B/C/D/F",
  "results": [
    {
      "id": "exercise id",
      "correct": true/false,
      "score": 0-10,
      "feedback": "specific feedback in ${nativeLanguage}",
      "correction": "correct answer if wrong"
    }
  ],
  "overallFeedback": "encouraging overall feedback in ${nativeLanguage}",
  "nextFocus": "what to study next in ${nativeLanguage}",
  "xpEarned": 10-50
}`
        }],
        response_format: { type: "json_object" },
      });
      return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
