import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "generate") {
      return await generateHomework(body);
    } else if (action === "grade") {
      return await gradeHomework(body);
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

async function generateHomework(body: any) {
  const { targetLanguage, nativeLanguage, level, weakAreas, skill, difficulty, count, topic } = body;

  const topicLine = topic ? `Topic focus: ${topic}` : "Topic: general mixed topics";
  const weakLine = weakAreas?.length ? `Student weak areas: ${weakAreas.join(", ")}` : "";

  const systemPrompt = `You are an AI language teacher creating personalized exercises.
Generate exactly ${count} exercises for a ${level} student learning ${targetLanguage} (native: ${nativeLanguage}).
Skill focus: ${skill}. Difficulty: ${difficulty}. ${topicLine}. ${weakLine}

Return JSON:
{
  "title": "lesson title in ${nativeLanguage}",
  "exercises": [
    {
      "id": "1",
      "type": "multiple-choice | fill-blank | translation | short-answer",
      "instruction": "brief instruction in ${nativeLanguage}",
      "question": "the exercise question",
      "answer": "correct answer",
      "hint": "optional hint in ${nativeLanguage}",
      "points": 5,
      "options": ["A","B","C","D"] // only for multiple-choice
    }
  ]
}

Rules:
- Mix exercise types: ~40% multiple-choice, ~30% fill-blank, ~30% translation/short-answer
- Questions must match the skill (${skill}) and topic
- Difficulty ${difficulty}: easy=simple vocab/grammar, medium=sentences, hard=complex structures
- Points: multiple-choice=5, fill-blank=7, translation/short-answer=10
- All instructions in ${nativeLanguage}, questions in ${targetLanguage} or mixed`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: systemPrompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 4000,
  });

  const raw = completion.choices[0].message.content || "{}";
  let result: any = {};
  try { result = JSON.parse(raw); } catch { result = { title: "Bài tập", exercises: [] }; }

  return NextResponse.json({
    title: result.title || "Bài tập hôm nay",
    exercises: Array.isArray(result.exercises) ? result.exercises : [],
  });
}

async function gradeHomework(body: any) {
  const { targetLanguage, nativeLanguage, level, answers, timeSpent } = body;

  const systemPrompt = `You are an AI language teacher grading student exercises.
Student is learning ${targetLanguage} (native: ${nativeLanguage}), level: ${level}.
Time spent: ${timeSpent}s.

Grade each answer and return JSON:
{
  "results": [
    {
      "id": "exercise id",
      "correct": true/false,
      "score": points earned (0 to max points),
      "feedback": "brief feedback in ${nativeLanguage}",
      "correction": "correct answer if wrong, null if correct"
    }
  ],
  "totalScore": 0-100,
  "grade": "A/B/C/D/F",
  "xpEarned": number,
  "overallFeedback": "encouraging overall comment in ${nativeLanguage}",
  "nextFocus": "what to study next in ${nativeLanguage}"
}

Answers to grade:
${JSON.stringify(answers, null, 2)}

Be lenient with minor spelling/accent errors. Focus on meaning and structure.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: systemPrompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 3000,
  });

  const raw = completion.choices[0].message.content || "{}";
  let result: any = {};
  try { result = JSON.parse(raw); } catch { result = {}; }

  const totalScore = result.totalScore ?? 0;
  const grade = result.grade ?? (totalScore >= 90 ? "A" : totalScore >= 75 ? "B" : totalScore >= 60 ? "C" : totalScore >= 50 ? "D" : "F");

  return NextResponse.json({
    results: Array.isArray(result.results) ? result.results : [],
    totalScore,
    grade,
    xpEarned: result.xpEarned ?? Math.floor(totalScore / 2),
    overallFeedback: result.overallFeedback ?? "",
    nextFocus: result.nextFocus ?? "",
  });
}
