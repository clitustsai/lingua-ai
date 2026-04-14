import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { flashcards } = await req.json();
  if (!flashcards || flashcards.length < 2) {
    return NextResponse.json({ error: "Need at least 2 flashcards" }, { status: 400 });
  }

  // Shuffle and pick up to 10 cards for quiz
  const shuffled = [...flashcards].sort(() => Math.random() - 0.5).slice(0, 10);

  const questions = shuffled.map((card: any) => {
    // Pick 3 wrong answers from other cards
    const others = flashcards.filter((f: any) => f.id !== card.id);
    const wrong = others.sort(() => Math.random() - 0.5).slice(0, 3).map((f: any) => f.translation);
    const options = [...wrong, card.translation].sort(() => Math.random() - 0.5);
    return {
      id: card.id,
      word: card.word,
      correct: card.translation,
      options,
    };
  });

  return NextResponse.json({ questions });
}
