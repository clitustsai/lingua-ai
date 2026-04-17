import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { videoId, title, topic, targetLanguage, nativeLanguage, level } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Create a complete English language lesson for a video titled "${title}" about "${topic}" for a ${level} learner whose native language is ${nativeLanguage}.

IMPORTANT RULES:
- "script", "keyPhrases", "vocabulary.word", "vocabulary.example", "grammar.examples" MUST be in ${targetLanguage} (English)
- "scriptTranslation", "vocabulary.definition", "grammar.explanation", "grammar.tip", "quiz.question", "quiz.options", "quiz.explanation" should be in ${nativeLanguage} to help the learner understand
- Quiz questions should test comprehension of the English content

Return JSON:
{
  "script": "natural English script 3-4 paragraphs teaching the topic clearly",
  "scriptTranslation": "full translation in ${nativeLanguage}",
  "quiz": [
    { "question": "English comprehension question (e.g. 'Which tense do we use for habits?')", "options": ["option A in English","option B","option C","option D"], "correct": 0, "explanation": "brief explanation in ${nativeLanguage}" }
  ],
  "vocabulary": [
    { "word": "English word", "pronunciation": "[IPA]", "partOfSpeech": "noun/verb/adj", "definition": "meaning in ${nativeLanguage}", "example": "example sentence in English", "level": "A1/A2/B1/B2/C1" }
  ],
  "grammar": [
    { "point": "Grammar Point Name in English", "explanation": "explanation in ${nativeLanguage}", "examples": ["English example 1", "English example 2"], "tip": "memory tip in ${nativeLanguage}" }
  ],
  "fillBlanks": [
    { "sentence": "Hi, my name ___ Sarah.", "answer": "is", "options": ["is","are","am","be"] },
    { "sentence": "They ___ happy, too.", "answer": "are", "options": ["is","are","am","was"] }
  ],
  "keyPhrases": ["useful English phrase 1", "useful English phrase 2", "useful English phrase 3", "useful English phrase 4"]
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
