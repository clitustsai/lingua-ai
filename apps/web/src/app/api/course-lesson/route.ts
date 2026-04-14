import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { lessonTitle, lessonType, courseTitle, targetLanguage, nativeLanguage, level } = await req.json();

    const typeInstructions: Record<string, string> = {
      vocabulary: `Create a vocabulary lesson with 8-10 words. Return JSON: { "intro": "brief intro in ${nativeLanguage}", "items": [{"word":"","translation":"","example":"","tip":""}], "exercises": [{"type":"match","question":"","answer":""}] }`,
      grammar: `Create a grammar lesson. Return JSON: { "rule": "grammar rule name", "explanation": "in ${nativeLanguage}", "examples": [{"sentence":"","translation":""}], "exercises": [{"question":"fill in blank","answer":"","hint":""}] }`,
      listening: `Create a listening comprehension exercise. Return JSON: { "intro": "in ${nativeLanguage}", "script": "short dialogue/monologue in ${targetLanguage}", "translation": "in ${nativeLanguage}", "questions": [{"question":"in ${nativeLanguage}","answer":""}] }`,
      reading: `Create a reading passage. Return JSON: { "passage": "text in ${targetLanguage}", "translation": "in ${nativeLanguage}", "vocabulary": [{"word":"","translation":""}], "questions": [{"question":"in ${nativeLanguage}","answer":""}] }`,
      speaking: `Create a speaking practice lesson. Return JSON: { "scenario": "scenario description in ${nativeLanguage}", "usefulPhrases": [{"phrase":"","translation":"","usage":""}], "dialogue": [{"speaker":"A","text":"","translation":""},{"speaker":"B","text":"","translation":""}], "tasks": ["speaking task 1 in ${nativeLanguage}","task 2"] }`,
      quiz: `Create a review quiz with 5 questions. Return JSON: { "questions": [{"question":"","options":["","","",""],"correct":0,"explanation":"in ${nativeLanguage}"}] }`,
    };

    const prompt = `You are creating content for the course "${courseTitle}", lesson "${lessonTitle}" for a ${level} level ${targetLanguage} learner (native: ${nativeLanguage}).

${typeInstructions[lessonType] || typeInstructions.vocabulary}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json({ ...result, lessonType });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate lesson" }, { status: 500 });
  }
}
