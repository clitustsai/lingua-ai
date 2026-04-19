import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 30;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    if (action === "generate") return await generateHomework(body);
    if (action === "grade") return await gradeHomework(body);
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    console.error("homework error:", e?.message ?? e);
    const msg = String(e?.message ?? e ?? "");
    if (msg.includes("429") || msg.includes("rate")) {
      return NextResponse.json({ error: "AI đang bận, thử lại sau 1 phút." }, { status: 429 });
    }
    if (msg.includes("timeout")) {
      return NextResponse.json({ error: "AI phản hồi quá chậm. Thử lại nhé." }, { status: 504 });
    }
    return NextResponse.json({ error: String(e?.message ?? "Không thể tạo bài tập. Thử lại.") }, { status: 500 });
  }
}

async function generateHomework(body: any) {
  const { targetLanguage, nativeLanguage, level, skill, difficulty, count, topic } = body;

  const safeCount = Math.min(count ?? 5, 8);
  const topicLine = topic ? `Topic: ${topic}` : "";

  const systemPrompt = `You generate ${targetLanguage} language learning exercises for Vietnamese students.

STRICT PEDAGOGICAL RULES (Vietnamese curriculum standards):
1. Questions and answer options MUST be written in ${targetLanguage} only
2. Only "instruction" and "hint" fields can be in ${nativeLanguage}
3. Grammar rules must follow standard ${targetLanguage} (British English for Vietnamese curriculum)
4. Vocabulary must be appropriate for the student's level — no slang, no informal contractions at A1/A2
5. Multiple choice options must have exactly ONE correct answer — no ambiguity
6. Fill-in-the-blank: the blank must have a single clear correct answer
7. Sentences must be grammatically perfect — double-check tense, subject-verb agreement, articles
8. For Vietnamese students: avoid culturally unfamiliar references; use familiar contexts (school, family, food, travel)
9. Level ${level}: ${level === "A1" ? "very simple present/past tense, basic vocabulary" : level === "A2" ? "simple tenses, common vocabulary" : level === "B1" ? "intermediate grammar, varied vocabulary" : "advanced grammar, academic vocabulary"}`;

  const userPrompt = `Generate ${safeCount} exercises. Student level: ${level}. Skill: ${skill}. Difficulty: ${difficulty}. ${topicLine}

Return JSON exactly like this (no extra text):
{"title":"lesson title in ${nativeLanguage}","exercises":[{"id":"1","type":"multiple-choice","instruction":"Chọn đáp án đúng","question":"${targetLanguage} sentence here","answer":"correct option","points":5,"options":["A","B","C","D"]},{"id":"2","type":"fill-blank","instruction":"Điền vào chỗ trống","question":"${targetLanguage} sentence with ___ blank","answer":"missing word","points":7,"hint":"gợi ý tiếng Việt"}]}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 2500,
  });

  const raw = completion.choices[0].message.content || "{}";
  let result: any = {};
  try { result = JSON.parse(raw); } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) try { result = JSON.parse(match[0]); } catch { /* ignore */ }
  }

  const exercises = (Array.isArray(result.exercises) ? result.exercises : [])
    .map((ex: any, i: number) => ({
      id: ex.id ?? String(i + 1),
      type: ex.type ?? "multiple-choice",
      instruction: ex.instruction ?? "Answer the question",
      question: ex.question ?? "",
      answer: ex.answer ?? "",
      hint: ex.hint ?? null,
      points: Number(ex.points) || 5,
      options: Array.isArray(ex.options) && ex.options.length ? ex.options : undefined,
    }))
    .filter((ex: any) => ex.question?.trim());

  return NextResponse.json({
    title: result.title || "Today's Exercises",
    exercises,
  });
}

async function gradeHomework(body: any) {
  const { targetLanguage, nativeLanguage, level, answers } = body;

  const prompt = `Grade these ${targetLanguage} exercises for a ${level} student (native: ${nativeLanguage}).
Answers: ${JSON.stringify(answers)}
Return JSON: {"results":[{"id":"1","correct":true,"score":5,"feedback":"feedback in ${nativeLanguage}","correction":null}],"totalScore":85,"grade":"B","xpEarned":42,"overallFeedback":"comment in ${nativeLanguage}","nextFocus":"tip in ${nativeLanguage}"}
Be lenient with minor errors. Grades: A≥90, B≥75, C≥60, D≥50, F<50.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 1500,
  });

  const raw = completion.choices[0].message.content || "{}";
  let result: any = {};
  try { result = JSON.parse(raw); } catch { /* ignore */ }

  const totalScore = Number(result.totalScore) || 0;
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
