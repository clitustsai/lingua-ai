import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 60;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { level, section, answers, generateQuestions } = await req.json();

  // Generate real exam questions via AI
  if (generateQuestions) {
    const prompt = `Generate a real ${level} level English exam for the "${section}" section.

Return JSON only:
{
  "questions": [
    ${section === "listening" ? `{"id":"l1","audio":"short English sentence to read aloud","question":"comprehension question in English","options":["A","B","C","D"],"answer":"correct option"}` : ""}
    ${section === "reading" ? `{"id":"r1","text":"short English passage 2-3 sentences","question":"comprehension question","options":["A","B","C","D"],"answer":"correct option"}` : ""}
    ${section === "grammar" ? `{"id":"g1","question":"Fill in: She ___ a teacher.","options":["am","is","are","be"],"answer":"is"}` : ""}
    ${section === "writing" ? `{"id":"w1","prompt":"writing task instruction in Vietnamese","minWords":15}` : ""}
    ${section === "speaking" ? `{"id":"s1","prompt":"speaking task instruction in Vietnamese"}` : ""}
  ]
}

Generate exactly ${section === "grammar" ? 5 : section === "writing" || section === "speaking" ? 2 : 3} questions appropriate for ${level} level.
All questions must be real, educational, and appropriate for ${level}.`;

    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });
    const data = JSON.parse(res.choices[0].message.content || "{}");
    return NextResponse.json(data);
  }

  // Grade submitted answers
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
