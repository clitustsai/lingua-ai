import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 60;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { level, section, answers, generateQuestions } = await req.json();

  if (generateQuestions) {
    let prompt = "";

    if (section === "Nghe") {
      prompt = `Generate 3 English listening comprehension questions for ${level} level.
Each question has a short audio script (1-2 sentences) that the student listens to, then answers a multiple choice question.

Return JSON:
{
  "questions": [
    {
      "id": "l1",
      "audio": "Hello! My name is Sarah. I am from London, England.",
      "question": "Where is Sarah from?",
      "options": ["France", "England", "America", "Australia"],
      "answer": "England"
    }
  ]
}

Rules:
- audio: a short natural English sentence/dialogue (1-2 sentences) appropriate for ${level}
- question: a comprehension question about the audio
- options: exactly 4 choices, one is correct
- answer: must exactly match one of the options
- All content in English
- Make questions appropriate for ${level} level`;
    }

    else if (section === "Đọc") {
      prompt = `Generate 3 English reading comprehension questions for ${level} level.
Each question has a short passage (2-3 sentences) and a multiple choice question.

Return JSON:
{
  "questions": [
    {
      "id": "r1",
      "text": "Anna is a student. She studies English every day. She likes reading books very much.",
      "question": "What does Anna like to do?",
      "options": ["Play sports", "Read books", "Watch TV", "Cook food"],
      "answer": "Read books"
    }
  ]
}

Rules:
- text: a short readable passage (2-3 sentences) appropriate for ${level}
- question: a comprehension question about the passage
- options: exactly 4 choices, one is correct
- answer: must exactly match one of the options
- All content in English
- Make passages and questions appropriate for ${level} level`;
    }

    else if (section === "Ngữ pháp") {
      prompt = `Generate 5 English grammar multiple choice questions for ${level} level.

Return JSON:
{
  "questions": [
    {
      "id": "g1",
      "question": "She ___ a teacher at the local school.",
      "options": ["am", "is", "are", "be"],
      "answer": "is"
    }
  ]
}

Rules:
- question: a fill-in-the-blank or grammar choice question
- options: exactly 4 choices, one is correct
- answer: must exactly match one of the options
- All content in English
- Make questions appropriate for ${level} level grammar`;
    }

    else if (section === "Viết") {
      prompt = `Generate 2 English writing tasks for ${level} level.

Return JSON:
{
  "questions": [
    {
      "id": "w1",
      "prompt": "Write 2-3 sentences about yourself. Include your name, age, and what you like to do.",
      "minWords": 10,
      "example": "My name is Anna. I am 20 years old. I like reading books and listening to music."
    }
  ]
}

Rules:
- prompt: clear writing instruction in English
- minWords: minimum word count (10-20 for A1-A2, 30-50 for B1-B2)
- example: a sample answer showing what a good response looks like
- Make tasks appropriate for ${level} level`;
    }

    else if (section === "Nói") {
      prompt = `Generate 2 English speaking tasks for ${level} level.

Return JSON:
{
  "questions": [
    {
      "id": "s1",
      "prompt": "Introduce yourself. Say your name, where you are from, and one thing you like.",
      "example": "My name is John. I am from Vietnam. I like playing football.",
      "tips": "Speak clearly and use simple sentences."
    }
  ]
}

Rules:
- prompt: clear speaking instruction in English
- example: a sample spoken answer
- tips: a helpful tip for the student
- Make tasks appropriate for ${level} level`;
    }

    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const data = JSON.parse(res.choices[0].message.content || "{}");
    return NextResponse.json(data);
  }

  // Grade submitted answers
  const prompt = `You are an English language examiner. Grade this ${level} level exam section: "${section}".

Student answers: ${JSON.stringify(answers)}

Return JSON only:
{
  "score": <0-100 integer>,
  "grade": "<A if 90+, B if 75+, C if 60+, D if 45+, F if below 45>",
  "passed": <true if score >= 60>,
  "feedback": "<2-3 sentences of specific, encouraging feedback in Vietnamese>",
  "corrections": [{"question": "...", "studentAnswer": "...", "correct": "...", "explanation": "..."}]
}

Be fair and encouraging. For writing/speaking, grade based on communication effectiveness, not perfection.`;

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const data = JSON.parse(res.choices[0].message.content || "{}");
  return NextResponse.json(data);
}
