import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    if (action === "generate") return await generateHomework(body);
    if (action === "grade") return await gradeHomework(body);
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

async function generateHomework(body: any) {
  const { targetLanguage, nativeLanguage, level, weakAreas, skill, difficulty, count, topic } = body;

  // Limit count to avoid token overflow
  const safeCount = Math.min(count ?? 10, 10);
  const topicLine = topic ? `Topic: ${topic}` : "Topic: general";
  const weakLine = weakAreas?.length ? `Weak areas: ${weakAreas.slice(0, 3).join(", ")}` : "";

  const prompt = `Create ${safeCount} ${targetLanguage} language exercises for a ${level} student (native language: ${nativeLanguage}).
Skill: ${skill}. Difficulty: ${difficulty}. ${topicLine}. ${weakLine}

IMPORTANT RULES:
- All questions and answer options MUST be in ${targetLanguage} (the language being learned)
- Instructions and hints may be in ${nativeLanguage} to help the student understand
- The title should be in ${nativeLanguage}
- Students are LEARNING ${targetLanguage}, so test them IN ${targetLanguage}

Return ONLY valid JSON in this exact format:
{
  "title": "short lesson title in ${nativeLanguage}",
  "exercises": [
    {
      "id": "1",
      "type": "multiple-choice",
      "instruction": "brief instruction in ${nativeLanguage}",
      "question": "question in ${targetLanguage}",
      "answer": "correct answer in ${targetLanguage}",
      "hint": "optional hint in ${nativeLanguage}",
      "points": 5,
      "options": ["option in ${targetLanguage}", "option B", "option C", "option D"]
    }
  ]
}

Mix types: ~60% multiple-choice, ~40% fill-blank.
For fill-blank: question has a blank (___), answer is the missing ${targetLanguage} word/phrase, no options field.
Return exactly ${safeCount} exercises.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.6,
    max_tokens: 3000,
  });

  const raw = completion.choices[0].message.content || "{}";
  let result: any = {};
  try {
    result = JSON.parse(raw);
  } catch {
    // Try to extract JSON from response
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try { result = JSON.parse(match[0]); } catch { result = {}; }
    }
  }

  const exercises = Array.isArray(result.exercises) ? result.exercises : [];

  // Ensure each exercise has required fields
  const cleaned = exercises.map((ex: any, i: number) => ({
    id: ex.id ?? String(i + 1),
    type: ex.type ?? "multiple-choice",
    instruction: ex.instruction ?? "Trả lời câu hỏi",
    question: ex.question ?? "",
    answer: ex.answer ?? "",
    hint: ex.hint ?? null,
    points: ex.points ?? 5,
    options: Array.isArray(ex.options) ? ex.options : undefined,
  })).filter((ex: any) => ex.question);

  return NextResponse.json({
    title: result.title || "Bài tập hôm nay",
    exercises: cleaned,
  });
}

async function gradeHomework(body: any) {
  const { targetLanguage, nativeLanguage, level, answers, timeSpent } = body;

  const prompt = `Grade these ${targetLanguage} language exercises for a ${level} student (native: ${nativeLanguage}).

Answers:
${JSON.stringify(answers, null, 2)}

Return ONLY valid JSON:
{
  "results": [
    {
      "id": "exercise id",
      "correct": true,
      "score": 5,
      "feedback": "brief feedback in ${nativeLanguage}",
      "correction": null
    }
  ],
  "totalScore": 85,
  "grade": "B",
  "xpEarned": 42,
  "overallFeedback": "encouraging comment in ${nativeLanguage}",
  "nextFocus": "what to study next in ${nativeLanguage}"
}

Be lenient with minor spelling errors. grade: A(90+), B(75+), C(60+), D(50+), F(<50).`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 2000,
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
    overallFeedback: result.overallFeedback ?? "Làm tốt lắm!",
    nextFocus: result.nextFocus ?? "",
  });
}
